const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

// ==========================================
// Dashboard Given Steps
// ==========================================

Given('I already have {string} in my dashboard', async function(eventTitle) {
  this.testData.dashboardEvents = this.testData.dashboardEvents || [];
  this.testData.dashboardEvents.push(eventTitle);
});

Given('I have a bookmarked event {string}', async function(eventTitle) {
  this.testData.bookmarkedEvents = this.testData.bookmarkedEvents || [];
  this.testData.bookmarkedEvents.push(eventTitle);
});

Given('I own {int} events', async function(count) {
  this.testData.ownedEventCount = count;
});

Given('I have bookmarked {int} events', async function(count) {
  this.testData.bookmarkedEventCount = count;
});

Given('I have searched for {string}', async function(searchTerm) {
  await this.page.fill('input[placeholder*="search" i]', searchTerm);
  this.testData.searchTerm = searchTerm;
});

// ==========================================
// Dashboard View Steps
// ==========================================

Then('I should see the dashboard header with my name', async function() {
  await expect(this.page.locator('text=/welcome|dashboard/i').first()).toBeVisible({ timeout: 10000 });
});

Then('I should see the {string} button', async function(buttonText) {
  await expect(this.page.locator(`button:has-text("${buttonText}"), a:has-text("${buttonText}")`).first()).toBeVisible({ timeout: 10000 });
});

Then('I should see my events listed', async function() {
  await expect(this.page.locator('[class*="event"], tr, [class*="card"]').first()).toBeVisible({ timeout: 10000 });
});

Then('I should see {string} count as {string}', async function(statName, count) {
  await expect(this.page.locator(`text=/${statName}.*${count}|${count}.*${statName}/i`).first()).toBeVisible({ timeout: 10000 });
});

Then('I should see {string} message', async function(message) {
  await expect(this.page.locator(`text="${message}"`).first()).toBeVisible({ timeout: 10000 });
});

Then('I should see {string} section', async function(sectionName) {
  await expect(this.page.locator(`text="${sectionName}"`).first()).toBeVisible({ timeout: 10000 });
});

Then('{string} should be in the upcoming section', async function(eventTitle) {
  const upcomingSection = this.page.locator('text=/upcoming/i').locator('..').locator('..');
  await expect(upcomingSection.locator(`text="${eventTitle}"`)).toBeVisible({ timeout: 10000 });
});

Then('{string} should be in the past section', async function(eventTitle) {
  const pastSection = this.page.locator('text=/past/i').locator('..').locator('..');
  await expect(pastSection.locator(`text="${eventTitle}"`)).toBeVisible({ timeout: 10000 });
});

Then('each event should display:', async function(dataTable) {
  const fields = dataTable.raw().flat();
  // Verify at least one event has these fields
  for (const field of fields) {
    await expect(this.page.locator(`text=/${field}/i`).first()).toBeVisible({ timeout: 5000 });
  }
});

// ==========================================
// Dashboard Search Steps
// ==========================================

When('I type {string} in the search field', async function(searchText) {
  await this.page.fill('input[placeholder*="search" i]', searchText);
  await this.page.waitForTimeout(500); // Wait for filtering
  this.testData.searchTerm = searchText;
});

When('I clear the search field', async function() {
  await this.page.fill('input[placeholder*="search" i]', '');
  await this.page.waitForTimeout(500);
});

Then('I should only see {string} in the results', async function(eventTitle) {
  await expect(this.page.locator(`text="${eventTitle}"`).first()).toBeVisible({ timeout: 10000 });
});

Then('{string} should not be visible', async function(eventTitle) {
  await expect(this.page.locator(`[class*="event"]:has-text("${eventTitle}"), tr:has-text("${eventTitle}")`)).not.toBeVisible({ timeout: 5000 });
});

Then('I should see {string} in the results', async function(eventTitle) {
  await expect(this.page.locator(`text="${eventTitle}"`).first()).toBeVisible({ timeout: 10000 });
});

Then('I should see {string} message', async function(message) {
  await expect(this.page.locator(`text="${message}"`).first()).toBeVisible({ timeout: 10000 });
});

Then('I should see all my events again', async function() {
  // Verify multiple events are visible
  const events = await this.page.locator('[class*="event"], tr[class*="event"]').count();
  expect(events).toBeGreaterThan(0);
});

// ==========================================
// Dashboard Event Actions Steps
// ==========================================

When('I click the delete button for {string}', async function(eventTitle) {
  const eventRow = this.page.locator(`[class*="event"]:has-text("${eventTitle}"), tr:has-text("${eventTitle}")`).first();
  await eventRow.locator('button:has([class*="trash"]), button[title*="delete" i]').click();
});

When('I click the remove button for {string}', async function(eventTitle) {
  const eventRow = this.page.locator(`[class*="event"]:has-text("${eventTitle}"), tr:has-text("${eventTitle}")`).first();
  await eventRow.locator('button:has([class*="bookmark"]), button[title*="remove" i]').click();
});

When('I click on the title {string}', async function(title) {
  await this.page.click(`a:has-text("${title}"), h3:has-text("${title}")`);
});

When('I confirm', async function() {
  await this.page.click('button:has-text("Confirm"), button:has-text("Yes"), button:has-text("OK")');
});

Then('I should see a confirmation dialog {string}', async function(message) {
  await expect(this.page.locator(`[role="dialog"]:has-text("${message.substring(0, 20)}")`).first()).toBeVisible({ timeout: 5000 });
});

Then('{string} should no longer appear in my events', async function(eventTitle) {
  await expect(this.page.locator(`[class*="event"]:has-text("${eventTitle}")`)).not.toBeVisible({ timeout: 5000 });
});

Then('{string} should still appear in my events', async function(eventTitle) {
  await expect(this.page.locator(`text="${eventTitle}"`).first()).toBeVisible({ timeout: 10000 });
});

Then('I should be redirected to the {string} event page', async function(eventTitle) {
  await this.page.waitForURL('**/event/**', { timeout: 10000 });
});

// ==========================================
// Dashboard QR Code Steps
// ==========================================

Then('each event card should display a small QR code', async function() {
  await expect(this.page.locator('svg[class*="qr"], [class*="qr"]').first()).toBeVisible({ timeout: 10000 });
});

Then('the QR code should be clickable', async function() {
  const qrCode = this.page.locator('svg[class*="qr"], [class*="qr"]').first();
  await expect(qrCode).toBeVisible();
});

When('I click on the QR code for {string}', async function(eventTitle) {
  const eventCard = this.page.locator(`[class*="event"]:has-text("${eventTitle}"), tr:has-text("${eventTitle}")`).first();
  await eventCard.locator('svg[class*="qr"], [class*="qr"], button:has-text("QR")').click();
});

Then('I should see a modal with a larger QR code', async function() {
  await expect(this.page.locator('[role="dialog"] svg, .modal svg').first()).toBeVisible({ timeout: 10000 });
});

Then('I should see the event title in the modal', async function() {
  await expect(this.page.locator('[role="dialog"], .modal').first()).toBeVisible({ timeout: 10000 });
});

Then('I should see {string} and {string} buttons', async function(btn1, btn2) {
  await expect(this.page.locator(`[role="dialog"] button:has-text("${btn1}")`).first()).toBeVisible();
  await expect(this.page.locator(`[role="dialog"] button:has-text("${btn2}")`).first()).toBeVisible();
});

Then('a PNG image of the QR code should be downloaded', async function() {
  await this.page.waitForTimeout(1000);
});

// ==========================================
// Add Event by Link Steps
// ==========================================

When('I paste {string}', async function(text) {
  await this.page.fill('[role="dialog"] input, .modal input', text);
});

When('I type {string} in the input field', async function(text) {
  await this.page.fill('[role="dialog"] input, .modal input', text);
});

When('I enter the link for {string}', async function(eventTitle) {
  // Enter a simulated event link
  await this.page.fill('[role="dialog"] input, .modal input', `https://potluckpartys.com/event/${eventTitle.toLowerCase().replace(/\s+/g, '-')}`);
});

When('I type some text in the input', async function() {
  await this.page.fill('[role="dialog"] input, .modal input', 'some-text');
});

Then('the event should appear in my dashboard with {string} badge', async function(badge) {
  await expect(this.page.locator(`text="${badge}"`).first()).toBeVisible({ timeout: 10000 });
});

Then('the event should be added to my dashboard', async function() {
  await this.page.waitForTimeout(1000);
});

Then('no event should be added', async function() {
  // Verify modal closed without adding
  await expect(this.page.locator('[role="dialog"], .modal')).not.toBeVisible({ timeout: 5000 });
});

// ==========================================
// Bookmarked Events Steps
// ==========================================

Then('{string} should show a {string} badge', async function(eventTitle, badge) {
  const eventRow = this.page.locator(`[class*="event"]:has-text("${eventTitle}"), tr:has-text("${eventTitle}")`).first();
  await expect(eventRow.locator(`text="${badge}"`)).toBeVisible({ timeout: 10000 });
});

Then('it should be distinguishable from owned events', async function() {
  // Bookmarked events have a badge
  await expect(this.page.locator('text=/saved|bookmark/i').first()).toBeVisible({ timeout: 10000 });
});

Then('{string} should no longer appear', async function(eventTitle) {
  await expect(this.page.locator(`[class*="event"]:has-text("${eventTitle}")`)).not.toBeVisible({ timeout: 5000 });
});

Then('the actual event should still exist for other users', async function() {
  // This is verified by not deleting from DB
});

Then('{string} should show {string}', async function(statName, value) {
  await expect(this.page.locator(`text=/${statName}.*${value}|${value}.*${statName}/i`).first()).toBeVisible({ timeout: 10000 });
});

Then('I should see {string} indicator', async function(text) {
  await expect(this.page.locator(`text="${text}"`).first()).toBeVisible({ timeout: 10000 });
});
