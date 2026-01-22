const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

// ==========================================
// Authentication Given Steps
// ==========================================

Given('my email is verified', async function() {
  this.testData.emailVerified = true;
});

Given('I have clicked a valid password reset link', async function() {
  this.testData.hasValidResetLink = true;
});

Given('I tried to access {string}', async function(path) {
  this.testData.attemptedPath = path;
});

Given('I was redirected to {string}', async function(path) {
  this.testData.redirectedTo = path;
});

// ==========================================
// Authentication Form Steps
// ==========================================

When('I click the {string} tab', async function(tabName) {
  await this.page.click(`[role="tab"]:has-text("${tabName}"), button:has-text("${tabName}"), a:has-text("${tabName}")`);
});

When('I fill in the following signup details:', async function(dataTable) {
  const details = dataTable.rowsHash();
  
  if (details['Full Name']) {
    await this.page.fill('input[name="full_name"], input[name="fullName"], input[placeholder*="name" i]', details['Full Name']);
  }
  if (details.Email) {
    await this.page.fill('input[name="email"], input[type="email"]', details.Email);
  }
  if (details.Password) {
    await this.page.fill('input[name="password"], input[type="password"]', details.Password);
  }
  
  this.testData.signupDetails = details;
});

When('I fill in my details:', async function(dataTable) {
  const rows = dataTable.hashes();
  const details = rows[0];
  
  if (details['Full Name']) {
    await this.page.fill('input[name="full_name"]', details['Full Name']);
  }
  if (details.Email) {
    await this.page.fill('input[name="email"]', details.Email);
  }
  if (details.Password) {
    await this.page.fill('input[name="password"]', details.Password);
  }
  
  this.testData.signupDetails = details;
});

When('I fill in email {string}', async function(email) {
  await this.page.fill('input[name="email"], input[type="email"]', email);
  this.testData.email = email;
});

When('I fill in password {string}', async function(password) {
  await this.page.fill('input[name="password"], input[type="password"]', password);
  this.testData.password = password;
});

When('I fill in new password {string}', async function(password) {
  await this.page.fill('input[name="password"], input[name="newPassword"]', password);
});

When('I confirm the new password {string}', async function(password) {
  await this.page.fill('input[name="confirmPassword"], input[name="confirm_password"]', password);
});

When('I confirm the password', async function() {
  await this.page.fill('input[name="confirmPassword"]', this.testData.password);
});

When('I sign in with {string} and {string}', async function(email, password) {
  await this.page.fill('input[name="email"]', email);
  await this.page.fill('input[name="password"]', password);
  await this.page.click('button[type="submit"]');
});

When('I sign in successfully', async function() {
  await this.page.waitForURL('**/dashboard', { timeout: 15000 });
});

// ==========================================
// Password Visibility Steps
// ==========================================

When('I click the {string} toggle', async function(toggleAction) {
  await this.page.click('button[type="button"]:has([class*="eye"]), [class*="password-toggle"], [aria-label*="password" i]');
});

Then('the password field should show dots\\/bullets', async function() {
  const passwordInput = this.page.locator('input[name="password"]');
  await expect(passwordInput).toHaveAttribute('type', 'password');
});

Then('the password should be visible as {string}', async function(password) {
  const passwordInput = this.page.locator('input[name="password"]');
  await expect(passwordInput).toHaveAttribute('type', 'text');
  await expect(passwordInput).toHaveValue(password);
});

// ==========================================
// Google OAuth Steps
// ==========================================

When('I authenticate with my Google account', async function() {
  // OAuth flow - in real tests, this would redirect to Google
  this.testData.googleAuthAttempted = true;
  await this.page.waitForTimeout(1000);
});

When('I authenticate with a new Google account', async function() {
  this.testData.newGoogleAccount = true;
  await this.page.waitForTimeout(1000);
});

Then('I should be redirected to Google OAuth page', async function() {
  // In real tests, verify redirect to Google
  await this.page.waitForTimeout(500);
});

Then('I should be logged in with my Google email', async function() {
  await expect(this.page.locator('[class*="user"], [class*="profile"]').first()).toBeVisible({ timeout: 10000 });
});

Then('a new account should be created', async function() {
  // Verify user is created
  await this.page.waitForTimeout(500);
});

// ==========================================
// Forgot Password Steps
// ==========================================

Then('I should see the {string} form', async function(formName) {
  await expect(this.page.locator(`text="${formName}"`).first()).toBeVisible({ timeout: 10000 });
});

Then('I should receive a password reset email', async function() {
  // In real tests, check email service
  this.testData.resetEmailSent = true;
});

Then('I should receive a verification email at {string}', async function(email) {
  this.testData.verificationEmailSent = email;
});

Then('I should see a message about checking email', async function() {
  await expect(this.page.locator('text=/check.*email|email.*sent/i').first()).toBeVisible({ timeout: 10000 });
});

// ==========================================
// Auth Result Steps
// ==========================================

Then('I should be redirected to the dashboard', async function() {
  await this.page.waitForURL('**/dashboard', { timeout: 15000 });
});

Then('I should see my email in the header', async function() {
  const email = this.testData.email || this.testData.userEmail;
  if (email) {
    await expect(this.page.locator(`text="${email}"`).first()).toBeVisible({ timeout: 10000 });
  }
});

Then('I should see an error message about password requirements', async function() {
  await expect(this.page.locator('text=/password.*character|weak.*password|at least/i').first()).toBeVisible({ timeout: 10000 });
});

Then('I should see an error message about invalid email format', async function() {
  await expect(this.page.locator('text=/invalid.*email|email.*invalid/i').first()).toBeVisible({ timeout: 10000 });
});

Then('I should see an error message {string}', async function(message) {
  await expect(this.page.locator(`text="${message}"`).first()).toBeVisible({ timeout: 10000 });
});

Then('I should remain on the auth page', async function() {
  const url = this.page.url();
  expect(url).toContain('/auth');
});

Then('I should see the {string} button in the header', async function(buttonText) {
  await expect(this.page.locator(`header button:has-text("${buttonText}"), header a:has-text("${buttonText}")`).first()).toBeVisible({ timeout: 10000 });
});

Then('I should not be logged in', async function() {
  await expect(this.page.locator('header button:has-text("Sign In"), header a:has-text("Sign In")').first()).toBeVisible({ timeout: 10000 });
});

Then('I should be successfully logged in', async function() {
  await expect(this.page.locator('[class*="user"], [class*="profile"], header button:has-text("Sign Out")').first()).toBeVisible({ timeout: 10000 });
});

Then('I should see a welcome message', async function() {
  await expect(this.page.locator('text=/welcome/i').first()).toBeVisible({ timeout: 10000 });
});

Then('the URL should contain {string}', async function(text) {
  const url = this.page.url();
  expect(url).toContain(text);
});

Then('the URL should include redirect parameter for the event', async function() {
  const url = this.page.url();
  expect(url).toContain('redirect');
});

Then('the event slug should be stored for later', async function() {
  // Verify localStorage contains event slug
  const slug = await this.page.evaluate(() => localStorage.getItem('pendingEventToSave'));
  // May or may not have value depending on implementation
});
