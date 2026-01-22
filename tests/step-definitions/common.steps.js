const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

// ==========================================
// Common Given Steps
// ==========================================

Given('I am on the PotluckPartys website', async function() {
  await this.navigateTo('/');
});

Given('I am not logged in', async function() {
  // Clear any existing session
  await this.context.clearCookies();
  await this.page.evaluate(() => localStorage.clear());
});

Given('I am logged in as {string}', async function(email) {
  await this.navigateTo('/auth');
  await this.page.fill('input[name="email"]', email);
  await this.page.fill('input[name="password"]', 'TestPassword123!');
  await this.page.click('button[type="submit"]');
  await this.page.waitForURL('**/dashboard', { timeout: 10000 });
  this.testData.userEmail = email;
});

Given('a user exists with email {string}', async function(email) {
  this.testData.existingUserEmail = email;
});

Given('a verified user exists with email {string} and password {string}', async function(email, password) {
  this.testData.existingUserEmail = email;
  this.testData.existingUserPassword = password;
});

Given('an event exists with slug {string}', async function(slug) {
  this.testData.eventSlug = slug;
});

Given('an event exists with slug {string} and title {string}', async function(slug, title) {
  this.testData.eventSlug = slug;
  this.testData.eventTitle = title;
});

Given('the event has the following details:', async function(dataTable) {
  this.testData.eventDetails = dataTable.rowsHash();
});

Given('the event has the following items:', async function(dataTable) {
  this.testData.eventItems = dataTable.hashes();
});

Given('I have no events', async function() {
  this.testData.hasNoEvents = true;
});

Given('I have the following events:', async function(dataTable) {
  this.testData.userEvents = dataTable.hashes();
});

Given('the theme is set to light mode', async function() {
  await this.navigateTo('/');
  await this.page.evaluate(() => {
    localStorage.setItem('theme', 'light');
    document.documentElement.classList.remove('dark');
  });
});

Given('the theme is set to dark mode', async function() {
  await this.navigateTo('/');
  await this.page.evaluate(() => {
    localStorage.setItem('theme', 'dark');
    document.documentElement.classList.add('dark');
  });
});

Given('I am on a mobile device', async function() {
  await this.context.close();
  this.context = await this.browser.newContext({
    viewport: { width: 375, height: 667 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)'
  });
  this.page = await this.context.newPage();
});

Given('my screen width is {int}px or more', async function(width) {
  await this.page.setViewportSize({ width, height: 720 });
});

Given('my screen width is less than {int}px', async function(width) {
  await this.page.setViewportSize({ width: width - 1, height: 720 });
});

// ==========================================
// Common When Steps
// ==========================================

When('I navigate to the homepage', async function() {
  await this.navigateTo('/');
});

When('I navigate to the {string} page', async function(pageName) {
  const routes = {
    'Create Event': '/create',
    'Sign In': '/auth',
    'Dashboard': '/dashboard',
    'Home': '/'
  };
  const path = routes[pageName] || `/${pageName.toLowerCase().replace(/\s+/g, '-')}`;
  await this.navigateTo(path);
});

When('I navigate to {string}', async function(path) {
  await this.navigateTo(path);
});

When('I click the {string} button', async function(buttonText) {
  await this.page.click(`button:has-text("${buttonText}"), a:has-text("${buttonText}")`);
});

When('I click {string}', async function(text) {
  await this.page.click(`text="${text}"`);
});

When('I click on {string}', async function(text) {
  await this.page.click(`text="${text}"`);
});

When('I click the {string} link', async function(linkText) {
  await this.page.click(`a:has-text("${linkText}")`);
});

When('I scroll to the {string} section', async function(sectionName) {
  const section = await this.page.$(`section:has-text("${sectionName}"), div:has-text("${sectionName}")`);
  if (section) {
    await section.scrollIntoViewIfNeeded();
  }
});

When('I scroll down the page', async function() {
  await this.page.evaluate(() => window.scrollBy(0, 300));
  await this.page.waitForTimeout(500);
});

When('I close and reopen the browser', async function() {
  // Save theme preference
  const theme = await this.page.evaluate(() => localStorage.getItem('theme'));
  await this.cleanup();
  await this.init();
  // Theme should persist via localStorage
});

// ==========================================
// Common Then Steps
// ==========================================

Then('I should be on the {string} page', async function(pageName) {
  await this.page.waitForLoadState('networkidle');
  const url = this.page.url();
  expect(url).toContain(pageName.toLowerCase().replace(/\s+/g, '-'));
});

Then('I should be redirected to the homepage', async function() {
  await this.page.waitForURL('**/');
});

Then('I should be redirected to {string}', async function(path) {
  await this.page.waitForURL(`**${path}`, { timeout: 10000 });
});

Then('I should see {string}', async function(text) {
  await expect(this.page.locator(`text="${text}"`).first()).toBeVisible({ timeout: 10000 });
});

Then('I should NOT see {string}', async function(text) {
  await expect(this.page.locator(`text="${text}"`)).not.toBeVisible({ timeout: 5000 });
});

Then('I should see a success toast {string}', async function(message) {
  await expect(this.page.locator(`.toast-success, [class*="toast"]:has-text("${message}")`).first()).toBeVisible({ timeout: 10000 });
});

Then('I should see a success toast message {string}', async function(message) {
  await expect(this.page.locator(`[class*="toast"]:has-text("${message}")`).first()).toBeVisible({ timeout: 10000 });
});

Then('I should see an error toast {string}', async function(message) {
  await expect(this.page.locator(`.toast-error, [class*="toast"]:has-text("${message}")`).first()).toBeVisible({ timeout: 10000 });
});

Then('I should see an error toast message {string}', async function(message) {
  await expect(this.page.locator(`[class*="toast"]:has-text("${message}")`).first()).toBeVisible({ timeout: 10000 });
});

Then('I should see an info toast {string}', async function(message) {
  await expect(this.page.locator(`[class*="toast"]:has-text("${message}")`).first()).toBeVisible({ timeout: 10000 });
});

Then('I should see the {string} modal', async function(modalTitle) {
  await expect(this.page.locator(`[role="dialog"]:has-text("${modalTitle}"), .modal:has-text("${modalTitle}")`).first()).toBeVisible({ timeout: 10000 });
});

Then('the modal should close', async function() {
  await expect(this.page.locator('[role="dialog"], .modal')).not.toBeVisible({ timeout: 5000 });
});

Then('I should remain on the {string} page', async function(pageName) {
  const url = this.page.url();
  expect(url).toContain(pageName.toLowerCase().replace(/\s+/g, '-'));
});
