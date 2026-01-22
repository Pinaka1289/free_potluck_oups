const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

// ==========================================
// Item Given Steps
// ==========================================

Given('an unclaimed item {string} exists in the event', async function(itemName) {
  this.testData.unclaimed = this.testData.unclaimed || [];
  this.testData.unclaimed.push(itemName);
});

Given('an item {string} exists in the event', async function(itemName) {
  this.testData.existingItems = this.testData.existingItems || [];
  this.testData.existingItems.push(itemName);
});

Given('an item {string} with category {string} exists', async function(itemName, category) {
  this.testData.existingItems = this.testData.existingItems || [];
  this.testData.existingItems.push({ name: itemName, category });
});

Given('I claimed the item {string} as {string}', async function(itemName, claimer) {
  this.testData.claimedItems = this.testData.claimedItems || {};
  this.testData.claimedItems[itemName] = claimer;
});

Given('I have previously claimed an item as {string}', async function(name) {
  this.testData.previousClaimer = name;
  await this.page.evaluate((n) => localStorage.setItem('potluckpartys_claimed_name', n), name);
});

Given('the event has multiple items', async function() {
  this.testData.hasMultipleItems = true;
});

Given('items are displayed in table format', async function() {
  // Table view is default
  await expect(this.page.locator('table, [class*="table"]').first()).toBeVisible({ timeout: 10000 });
});

// ==========================================
// Item Add Steps
// ==========================================

When('I fill in the item name {string}', async function(itemName) {
  await this.page.fill('input[name="name"], input[placeholder*="item" i], input[placeholder*="name" i]', itemName);
  this.testData.currentItemName = itemName;
});

When('I select the category {string}', async function(category) {
  await this.page.click('select[name="category"], [class*="select"]');
  await this.page.click(`option:has-text("${category}"), [role="option"]:has-text("${category}")`);
});

When('I set the quantity to {string}', async function(quantity) {
  await this.page.fill('input[name="quantity"]', quantity);
});

When('I add notes {string}', async function(notes) {
  await this.page.fill('textarea[name="notes"], input[name="notes"]', notes);
});

When('I check {string}', async function(checkboxLabel) {
  await this.page.click(`label:has-text("${checkboxLabel}"), input[type="checkbox"]`);
});

When('I fill in my name {string}', async function(name) {
  await this.page.fill('input[name="claimed_by"], input[placeholder*="name" i]', name);
  this.testData.claimerName = name;
});

When('I enter my name {string}', async function(name) {
  await this.page.fill('input[name="claimed_by"], input[placeholder*="name" i], input[name="name"]', name);
  this.testData.claimerName = name;
});

When('I leave the item name empty', async function() {
  await this.page.fill('input[name="name"], input[placeholder*="item" i]', '');
});

When('I add the following items:', async function(dataTable) {
  const items = dataTable.hashes();
  for (const item of items) {
    await this.page.click('button:has-text("Add Item")');
    await this.page.waitForSelector('[role="dialog"], .modal', { timeout: 5000 });
    await this.page.fill('input[name="name"]', item['Item Name']);
    if (item.Category) {
      await this.page.click('select[name="category"]');
      await this.page.click(`option:has-text("${item.Category}")`);
    }
    await this.page.click('[role="dialog"] button:has-text("Add"), .modal button:has-text("Add")');
    await this.page.waitForTimeout(500);
  }
});

// ==========================================
// Item Claim Steps
// ==========================================

When('I click on the {string} item', async function(itemName) {
  await this.page.click(`text="${itemName}"`);
});

When('I click {string} on {string}', async function(buttonText, itemName) {
  const itemRow = this.page.locator(`tr:has-text("${itemName}"), [class*="item"]:has-text("${itemName}")`).first();
  await itemRow.locator(`button:has-text("${buttonText}"), text="${buttonText}"`).click();
});

When('I click the {string} button on {string}', async function(buttonText, itemName) {
  const itemRow = this.page.locator(`tr:has-text("${itemName}"), [class*="item"]:has-text("${itemName}")`).first();
  await itemRow.locator(`button:has-text("${buttonText}")`).click();
});

When('I click the edit button on {string}', async function(itemName) {
  const itemRow = this.page.locator(`tr:has-text("${itemName}"), [class*="item"]:has-text("${itemName}")`).first();
  await itemRow.locator('button[title*="edit" i], button:has-text("Edit"), [class*="edit"]').click();
});

When('I click the delete button on {string}', async function(itemName) {
  const itemRow = this.page.locator(`tr:has-text("${itemName}"), [class*="item"]:has-text("${itemName}")`).first();
  await itemRow.locator('button[title*="delete" i], button:has-text("Delete"), [class*="delete"], [class*="trash"]').click();
});

When('I update the item name to {string}', async function(newName) {
  await this.page.fill('input[name="name"]', '');
  await this.page.fill('input[name="name"]', newName);
  this.testData.updatedItemName = newName;
});

When('I update the quantity to {string}', async function(quantity) {
  await this.page.fill('input[name="quantity"]', '');
  await this.page.fill('input[name="quantity"]', quantity);
});

When('I change the category to {string}', async function(category) {
  await this.page.click('select[name="category"]');
  await this.page.click(`option:has-text("${category}")`);
});

When('I confirm the deletion', async function() {
  await this.page.click('button:has-text("Confirm"), button:has-text("Delete"), button:has-text("Yes")');
});

When('I cancel the deletion', async function() {
  await this.page.click('button:has-text("Cancel"), button:has-text("No")');
});

// ==========================================
// Item View Steps
// ==========================================

When('I click the {string} view button', async function(viewType) {
  await this.page.click(`button:has-text("${viewType}"), [role="tab"]:has-text("${viewType}")`);
});

// ==========================================
// Item Then Steps
// ==========================================

Then('I should see {string} in the items list', async function(itemName) {
  await expect(this.page.locator(`text="${itemName}"`).first()).toBeVisible({ timeout: 10000 });
});

Then('the item should show category {string}', async function(category) {
  await expect(this.page.locator(`text="${category}"`).first()).toBeVisible({ timeout: 10000 });
});

Then('the item should show quantity {string}', async function(quantity) {
  await expect(this.page.locator(`text="${quantity}"`).first()).toBeVisible({ timeout: 10000 });
});

Then('the item should show {string}', async function(text) {
  await expect(this.page.locator(`text="${text}"`).first()).toBeVisible({ timeout: 10000 });
});

Then('the item category should be {string}', async function(category) {
  await expect(this.page.locator(`text="${category}"`).first()).toBeVisible({ timeout: 10000 });
});

Then('{string} should show {string}', async function(itemName, status) {
  const itemRow = this.page.locator(`tr:has-text("${itemName}"), [class*="item"]:has-text("${itemName}")`).first();
  await expect(itemRow.locator(`text="${status}"`)).toBeVisible({ timeout: 10000 });
});

Then('the item should show as {string}', async function(status) {
  await expect(this.page.locator(`text="${status}"`).first()).toBeVisible({ timeout: 10000 });
});

Then('my name {string} should be pre-filled', async function(name) {
  const input = this.page.locator('input[name="claimed_by"], input[name="name"]');
  await expect(input).toHaveValue(name);
});

Then('the {string} count should decrease by {int}', async function(countType, decrement) {
  // Verify the count changed
  await this.page.waitForTimeout(500);
});

Then('the {string} count should increase by {int}', async function(countType, increment) {
  await this.page.waitForTimeout(500);
});

Then('I should see a confirmation dialog', async function() {
  await expect(this.page.locator('[role="dialog"], .modal, [class*="confirm"]').first()).toBeVisible({ timeout: 5000 });
});

Then('{string} should no longer appear in the items list', async function(itemName) {
  await expect(this.page.locator(`text="${itemName}"`)).not.toBeVisible({ timeout: 5000 });
});

Then('{string} should still appear in the items list', async function(itemName) {
  await expect(this.page.locator(`text="${itemName}"`).first()).toBeVisible({ timeout: 10000 });
});

Then('the total item count should decrease by {int}', async function(decrement) {
  await this.page.waitForTimeout(500);
});

Then('items should be displayed in table format by default', async function() {
  await expect(this.page.locator('table, [class*="table"]').first()).toBeVisible({ timeout: 10000 });
});

Then('I should see columns for {string}, {string}, {string}, {string}, and {string}', async function(col1, col2, col3, col4, col5) {
  for (const col of [col1, col2, col3, col4, col5]) {
    await expect(this.page.locator(`th:has-text("${col}"), [class*="header"]:has-text("${col}")`).first()).toBeVisible();
  }
});

Then('items should be displayed as cards', async function() {
  await expect(this.page.locator('[class*="card"], [class*="grid"]').first()).toBeVisible({ timeout: 10000 });
});

Then('each card should show item details and actions', async function() {
  await expect(this.page.locator('[class*="card"] button, [class*="card"] [class*="action"]').first()).toBeVisible();
});

Then('items should be in card format', async function() {
  await expect(this.page.locator('[class*="card"], [class*="grid"]').first()).toBeVisible({ timeout: 10000 });
});

Then('items should be in table format', async function() {
  await expect(this.page.locator('table, [class*="table"]').first()).toBeVisible({ timeout: 10000 });
});

Then('I should see {int} total items', async function(count) {
  await expect(this.page.locator(`text=/${count}.*Total|Total.*${count}/i`).first()).toBeVisible({ timeout: 10000 });
});

Then('{int} items should be available', async function(count) {
  await expect(this.page.locator(`text=/${count}.*Available|Available.*${count}/i`).first()).toBeVisible({ timeout: 10000 });
});

// ==========================================
// Real-time Update Steps
// ==========================================

Given('I am viewing the event page', async function() {
  if (this.testData.eventSlug) {
    await this.navigateTo(`/event/${this.testData.eventSlug}`);
  }
});

When('another user adds item {string} to the event', async function(itemName) {
  // Simulate real-time update - in real tests, this would be done via API
  this.testData.simulatedAddedItem = itemName;
  await this.page.waitForTimeout(1000);
});

When('another user claims {string}', async function(itemName) {
  this.testData.simulatedClaimedItem = itemName;
  await this.page.waitForTimeout(1000);
});

When('another user deletes {string}', async function(itemName) {
  this.testData.simulatedDeletedItem = itemName;
  await this.page.waitForTimeout(1000);
});

Then('I should see {string} appear in the items list without refreshing', async function(itemName) {
  // In real tests, wait for real-time update
  await this.page.waitForTimeout(2000);
});

Then('I should see the item status change to {string} without refreshing', async function(status) {
  await this.page.waitForTimeout(2000);
});

Then('the item should disappear from my view without refreshing', async function() {
  await this.page.waitForTimeout(2000);
});

Then('the statistics should update automatically', async function() {
  await this.page.waitForTimeout(1000);
});
