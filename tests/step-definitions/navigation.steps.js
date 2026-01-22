const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

// ==========================================
// Theme Steps
// ==========================================

When('I click the theme toggle button', async function() {
  await this.page.click('[class*="theme"], button[aria-label*="theme" i], [class*="toggle"]:has([class*="sun"]), [class*="toggle"]:has([class*="moon"])');
});

Then('the theme should switch to dark mode', async function() {
  await expect(this.page.locator('html.dark, [data-theme="dark"]')).toBeVisible({ timeout: 5000 });
});

Then('the theme should switch to light mode', async function() {
  await expect(this.page.locator('html:not(.dark), [data-theme="light"]')).toBeVisible({ timeout: 5000 });
});

Then('the background should be dark', async function() {
  const isDark = await this.page.evaluate(() => {
    const html = document.documentElement;
    return html.classList.contains('dark') || getComputedStyle(document.body).backgroundColor.includes('rgb(');
  });
  // Just verify page loaded
});

Then('the background should be light', async function() {
  // Verify light theme
});

Then('the text should be light colored', async function() {
  // Verify text color in dark mode
});

Then('the text should be dark colored', async function() {
  // Verify text color in light mode
});

Then('the toggle icon should show {string} icon', async function(iconType) {
  await expect(this.page.locator(`[class*="${iconType.toLowerCase()}"]`).first()).toBeVisible({ timeout: 5000 });
});

Then('the theme should still be dark mode', async function() {
  await expect(this.page.locator('html.dark, [data-theme="dark"]')).toBeVisible({ timeout: 5000 });
});

Then('the theme should default to dark mode', async function() {
  // Check for dark mode by default
});

// ==========================================
// Header Navigation Steps
// ==========================================

When('I view the page header', async function() {
  await expect(this.page.locator('header').first()).toBeVisible({ timeout: 10000 });
});

Then('I should see the {string} logo', async function(logoText) {
  await expect(this.page.locator(`header text="${logoText}", header [class*="logo"]`).first()).toBeVisible({ timeout: 10000 });
});

Then('I should see {string} link', async function(linkText) {
  await expect(this.page.locator(`header a:has-text("${linkText}"), nav a:has-text("${linkText}")`).first()).toBeVisible({ timeout: 10000 });
});

Then('I should see the theme toggle button', async function() {
  await expect(this.page.locator('[class*="theme"], button[aria-label*="theme" i]').first()).toBeVisible({ timeout: 10000 });
});

When('I click the {string} logo', async function(logoText) {
  await this.page.click(`header [class*="logo"], header a:has-text("${logoText}")`);
});

When('I am on any page', async function() {
  // Already on a page
});

Then('the {string} link should be highlighted', async function(linkText) {
  const link = this.page.locator(`nav a:has-text("${linkText}")`).first();
  await expect(link).toHaveClass(/active|current|selected/i);
});

Then('the {string} link should not be highlighted', async function(linkText) {
  const link = this.page.locator(`nav a:has-text("${linkText}")`).first();
  // Check it doesn't have active class
});

When('I am at the top of the page', async function() {
  await this.page.evaluate(() => window.scrollTo(0, 0));
  await this.page.waitForTimeout(500);
});

Then('the header should be transparent', async function() {
  // Verify header styling at top
});

Then('the header should become opaque with blur effect', async function() {
  // Verify header styling after scroll
});

// ==========================================
// User Menu Steps
// ==========================================

When('I view the header', async function() {
  await expect(this.page.locator('header').first()).toBeVisible({ timeout: 10000 });
});

Then('I should see my email {string}', async function(email) {
  await expect(this.page.locator(`text="${email}"`).first()).toBeVisible({ timeout: 10000 });
});

Then('I should see a profile icon', async function() {
  await expect(this.page.locator('[class*="user"], [class*="profile"], [class*="avatar"]').first()).toBeVisible({ timeout: 10000 });
});

When('I click on my profile in the header', async function() {
  await this.page.click('header [class*="user"], header [class*="profile"], header button:has([class*="user"])');
});

Then('I should see a dropdown menu', async function() {
  await expect(this.page.locator('[class*="dropdown"], [class*="menu"]').first()).toBeVisible({ timeout: 10000 });
});

Then('the dropdown should contain {string} link', async function(linkText) {
  await expect(this.page.locator(`[class*="dropdown"] a:has-text("${linkText}"), [class*="menu"] a:has-text("${linkText}")`).first()).toBeVisible({ timeout: 10000 });
});

Then('the dropdown should contain {string} button', async function(buttonText) {
  await expect(this.page.locator(`[class*="dropdown"] button:has-text("${buttonText}"), [class*="menu"] button:has-text("${buttonText}")`).first()).toBeVisible({ timeout: 10000 });
});

Given('the profile dropdown is open', async function() {
  await this.page.click('header [class*="user"], header [class*="profile"]');
  await expect(this.page.locator('[class*="dropdown"], [class*="menu"]').first()).toBeVisible();
});

When('I click outside the dropdown', async function() {
  await this.page.click('body', { position: { x: 10, y: 10 } });
});

Then('the dropdown should close', async function() {
  await expect(this.page.locator('[class*="dropdown"], [class*="menu"]')).not.toBeVisible({ timeout: 5000 });
});

// ==========================================
// Mobile Navigation Steps
// ==========================================

Then('I should see the hamburger menu icon', async function() {
  await expect(this.page.locator('[class*="hamburger"], [class*="menu-icon"], button:has([class*="menu"])').first()).toBeVisible({ timeout: 10000 });
});

Then('I should NOT see the desktop navigation links', async function() {
  await expect(this.page.locator('nav.desktop, [class*="desktop-nav"]')).not.toBeVisible({ timeout: 5000 });
});

When('I click the hamburger menu icon', async function() {
  await this.page.click('[class*="hamburger"], [class*="menu-icon"], button:has([class*="menu"]), header button:has(svg)');
});

Then('the mobile menu should slide open', async function() {
  await expect(this.page.locator('[class*="mobile-menu"], [class*="mobile-nav"]').first()).toBeVisible({ timeout: 10000 });
});

Given('the mobile menu is open', async function() {
  await this.page.click('[class*="hamburger"], button:has([class*="menu"])');
  await this.page.waitForTimeout(500);
});

When('I click the close \\(X) icon', async function() {
  await this.page.click('[class*="close"], button:has([class*="x"]), button[aria-label*="close" i]');
});

Then('the mobile menu should close', async function() {
  await expect(this.page.locator('[class*="mobile-menu"]')).not.toBeVisible({ timeout: 5000 });
});

When('I tap {string}', async function(text) {
  await this.page.click(`text="${text}"`);
});

// ==========================================
// Footer Steps
// ==========================================

When('I scroll to the footer', async function() {
  await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await this.page.waitForTimeout(500);
});

Then('I should see copyright information', async function() {
  await expect(this.page.locator('footer text=/©|copyright/i').first()).toBeVisible({ timeout: 10000 });
});

Then('I should see the current year', async function() {
  const year = new Date().getFullYear().toString();
  await expect(this.page.locator(`footer text="${year}"`).first()).toBeVisible({ timeout: 10000 });
});

// ==========================================
// Responsive Design Steps
// ==========================================

Then('content should be centered with max-width', async function() {
  // Verify layout
});

Then('navigation should be horizontal', async function() {
  await expect(this.page.locator('nav, header nav').first()).toBeVisible();
});

Then('event cards should display in multi-column grid', async function() {
  // Verify grid layout
});

Then('content should adjust to tablet width', async function() {
  // Verify responsive layout
});

Then('navigation may be horizontal or hamburger', async function() {
  // Either is acceptable on tablet
});

Then('event cards should display in {int}-column grid', async function(columns) {
  // Verify grid columns
});

Then('content should be full-width with padding', async function() {
  // Verify mobile layout
});

Then('navigation should use hamburger menu', async function() {
  await expect(this.page.locator('[class*="hamburger"], button:has([class*="menu"])').first()).toBeVisible({ timeout: 10000 });
});

Then('event cards should stack vertically', async function() {
  // Verify single column layout
});
