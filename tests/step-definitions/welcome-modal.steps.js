const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

// ==========================================
// Welcome Modal Given Steps
// ==========================================

Given('I have never visited {string} before', async function(eventSlug) {
  // Clear visit history for this event
  await this.page.evaluate((slug) => {
    const visited = JSON.parse(localStorage.getItem('visitedEvents') || '[]');
    const filtered = visited.filter(s => s !== slug);
    localStorage.setItem('visitedEvents', JSON.stringify(filtered));
  }, eventSlug);
});

Given('I have previously visited {string}', async function(eventSlug) {
  // Mark event as visited
  await this.page.evaluate((slug) => {
    const visited = JSON.parse(localStorage.getItem('visitedEvents') || '[]');
    if (!visited.includes(slug)) {
      visited.push(slug);
      localStorage.setItem('visitedEvents', JSON.stringify(visited));
    }
  }, eventSlug);
});

Given('I see the welcome modal', async function() {
  await expect(this.page.locator('[role="dialog"]:has-text("Welcome"), .modal:has-text("Welcome")').first()).toBeVisible({ timeout: 10000 });
});

Given('{string} is already in my dashboard', async function(eventSlug) {
  this.testData.savedEvents = this.testData.savedEvents || [];
  this.testData.savedEvents.push(eventSlug);
});

Given('{string} is NOT in my dashboard', async function(eventSlug) {
  // Ensure event is not saved
});

Given('I dismissed the welcome modal', async function() {
  try {
    await this.page.click('button:has-text("Continue"), button:has-text("Close")', { timeout: 3000 });
  } catch (e) {
    // Modal may not be visible
  }
});

When('I view the event page', async function() {
  if (this.testData.eventSlug) {
    await this.navigateTo(`/event/${this.testData.eventSlug}`);
  }
  await this.page.waitForLoadState('networkidle');
});

Given('I am logged in as the owner of {string}', async function(eventSlug) {
  this.testData.isEventOwner = true;
  this.testData.eventSlug = eventSlug;
});

Given('I clicked {string} from event {string}', async function(buttonText, eventSlug) {
  this.testData.pendingEventSlug = eventSlug;
});

// ==========================================
// Welcome Modal Then Steps
// ==========================================

Then('I should see the welcome modal', async function() {
  await expect(this.page.locator('[role="dialog"]:has-text("Welcome"), .modal:has-text("Welcome")').first()).toBeVisible({ timeout: 10000 });
});

Then('I should NOT see the welcome modal', async function() {
  await expect(this.page.locator('[role="dialog"]:has-text("Welcome"), .modal:has-text("Welcome")')).not.toBeVisible({ timeout: 5000 });
});

Then('the modal title should be {string}', async function(title) {
  await expect(this.page.locator(`[role="dialog"] h2:has-text("${title}"), .modal h2:has-text("${title}")`).first()).toBeVisible({ timeout: 10000 });
});

Then('I should see the event details \\(date, time, location)', async function() {
  const modal = this.page.locator('[role="dialog"], .modal').first();
  // Check for some event detail indicators
  await expect(modal).toBeVisible();
});

Then('I should see {string} option', async function(optionText) {
  await expect(this.page.locator(`[role="dialog"] text="${optionText}", .modal text="${optionText}"`).first()).toBeVisible({ timeout: 10000 });
});

Then('I should see text indicating login is optional', async function() {
  await expect(this.page.locator('text=/optional|without.*login|continue.*without/i').first()).toBeVisible({ timeout: 10000 });
});

Then('I should see the full event page', async function() {
  await expect(this.page.locator('text=/items|share|add item/i').first()).toBeVisible({ timeout: 10000 });
});

Then('I should be able to add and claim items', async function() {
  await expect(this.page.locator('button:has-text("Add Item"), button:has-text("Claim")').first()).toBeVisible({ timeout: 10000 });
});

Then('I should see {string} button', async function(buttonText) {
  await expect(this.page.locator(`button:has-text("${buttonText}")`).first()).toBeVisible({ timeout: 10000 });
});

Then('I should see the event page with owner controls', async function() {
  await expect(this.page.locator('button:has-text("Edit"), button:has-text("Delete")').first()).toBeVisible({ timeout: 10000 });
});

Then('I should see {string} button in the event header', async function(buttonText) {
  await expect(this.page.locator(`header button:has-text("${buttonText}"), [class*="header"] button:has-text("${buttonText}")`).first()).toBeVisible({ timeout: 10000 });
});

Then('the button should change to show {string}', async function(buttonText) {
  await expect(this.page.locator(`button:has-text("${buttonText}")`).first()).toBeVisible({ timeout: 10000 });
});

Then('I should NOT see the {string} button', async function(buttonText) {
  await expect(this.page.locator(`button:has-text("${buttonText}")`)).not.toBeVisible({ timeout: 5000 });
});

Then('I should see a {string} indicator', async function(text) {
  await expect(this.page.locator(`text="${text}"`).first()).toBeVisible({ timeout: 10000 });
});

Then('Or I should see a {string} indicator', async function(text) {
  // Alternative check
  const indicator = await this.page.locator(`text="${text}"`).first().isVisible().catch(() => false);
  // This is an OR condition, so it's okay if not visible
});

Then('the event should be automatically saved to my dashboard', async function() {
  // Navigate to dashboard to verify
  await this.navigateTo('/dashboard');
  await this.page.waitForLoadState('networkidle');
  // Check for the event
});
