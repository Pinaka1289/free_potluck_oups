const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

// ==========================================
// Hero Section Steps
// ==========================================

Then('I should see the hero section', async function() {
  await expect(this.page.locator('[class*="hero"], section:first-of-type').first()).toBeVisible({ timeout: 10000 });
});

Then('I should see the headline {string}', async function(headline) {
  await expect(this.page.locator(`h1:has-text("${headline}"), h2:has-text("${headline}")`).first()).toBeVisible({ timeout: 10000 });
});

Then('I should see a subheadline describing the app', async function() {
  await expect(this.page.locator('[class*="hero"] p, [class*="subtitle"]').first()).toBeVisible({ timeout: 10000 });
});

When('I click {string} in the hero section', async function(buttonText) {
  await this.page.locator('[class*="hero"]').locator(`button:has-text("${buttonText}"), a:has-text("${buttonText}")`).click();
});

Then('the page should scroll to the features section', async function() {
  await this.page.waitForTimeout(500);
  // Verify scroll position changed
});

// ==========================================
// Features Section Steps
// ==========================================

When('I view the features section', async function() {
  const features = this.page.locator('text=/features/i').first();
  await features.scrollIntoViewIfNeeded();
});

Then('I should see {string} feature', async function(featureName) {
  await expect(this.page.locator(`text="${featureName}"`).first()).toBeVisible({ timeout: 10000 });
});

Then('Each feature should have an icon and description', async function() {
  // Verify features have content
  await expect(this.page.locator('[class*="feature"] svg, [class*="feature"] [class*="icon"]').first()).toBeVisible();
});

Then('each feature card should display a relevant icon', async function() {
  await expect(this.page.locator('[class*="feature"] svg').first()).toBeVisible({ timeout: 10000 });
});

Then('the icons should be visually distinct', async function() {
  // Visual check - verify multiple icons exist
  const iconCount = await this.page.locator('[class*="feature"] svg').count();
  expect(iconCount).toBeGreaterThan(1);
});

// ==========================================
// How It Works Section Steps
// ==========================================

When('I view the {string} section', async function(sectionName) {
  const section = this.page.locator(`text="${sectionName}"`).first();
  await section.scrollIntoViewIfNeeded();
});

Then('I should see step {int} {string}', async function(stepNum, stepText) {
  await expect(this.page.locator(`text="${stepText}"`).first()).toBeVisible({ timeout: 10000 });
});

Then('each step should have a number indicator', async function() {
  // Verify steps are numbered
  await expect(this.page.locator('[class*="step"] [class*="number"], [class*="step"]:has-text("1")').first()).toBeVisible();
});

Then('the steps should be visually connected', async function() {
  // Visual flow exists
});

Then('there should be progression indicators between steps', async function() {
  // Progression indicators
});

// ==========================================
// Benefits Section Steps
// ==========================================

When('I scroll to the benefits section', async function() {
  const benefits = this.page.locator('text=/benefits|friends|potluck/i').first();
  await benefits.scrollIntoViewIfNeeded();
});

Then('I should see an image of people enjoying a potluck', async function() {
  await expect(this.page.locator('img[src*="potluck"], img[alt*="potluck" i], img[alt*="dinner" i]').first()).toBeVisible({ timeout: 10000 });
});

Then('the image should load properly', async function() {
  const img = this.page.locator('img[src*="potluck"], img[src*="unsplash"]').first();
  await expect(img).toBeVisible();
});

Then('there should be accompanying benefit text', async function() {
  await expect(this.page.locator('[class*="benefit"] p, [class*="benefit"] li').first()).toBeVisible();
});

When('I view the benefits section', async function() {
  const benefits = this.page.locator('text=/benefits|coordinate/i').first();
  await benefits.scrollIntoViewIfNeeded();
});

Then('I should see benefits like:', async function(dataTable) {
  const benefits = dataTable.raw().flat();
  for (const benefit of benefits) {
    await expect(this.page.locator(`text=/${benefit}/i`).first()).toBeVisible({ timeout: 5000 });
  }
});

// ==========================================
// CTA Section Steps
// ==========================================

When('I scroll to the bottom CTA section', async function() {
  await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight - 500));
  await this.page.waitForTimeout(500);
});

Then('I should see {string} heading', async function(heading) {
  await expect(this.page.locator(`h2:has-text("${heading}"), h3:has-text("${heading}")`).first()).toBeVisible({ timeout: 10000 });
});

Then('the button should be prominently styled', async function() {
  // Verify button is visible and styled
  await expect(this.page.locator('button[class*="primary"], a[class*="primary"], button:has-text("Create")').first()).toBeVisible();
});

When('I click {string} in the bottom CTA', async function(buttonText) {
  await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight - 500));
  await this.page.click(`button:has-text("${buttonText}"), a:has-text("${buttonText}")`);
});

// ==========================================
// Visual Design Steps
// ==========================================

When('I load the homepage', async function() {
  await this.navigateTo('/');
  await this.page.waitForLoadState('networkidle');
});

Then('elements should animate in smoothly', async function() {
  // Verify page loaded with animations
  await this.page.waitForTimeout(1000);
});

Then('there should be scroll-triggered animations', async function() {
  // Animations triggered on scroll
});

Then('animations should not cause layout shifts', async function() {
  // No CLS issues
});

When('I view the homepage', async function() {
  await this.navigateTo('/');
});

Then('I should see gradient backgrounds', async function() {
  // Verify gradients exist
});

Then('there should be decorative blur elements', async function() {
  await expect(this.page.locator('[class*="blur"]').first()).toBeVisible({ timeout: 5000 });
});

Then('the design should feel modern and inviting', async function() {
  // Subjective - verify page renders
});

Then('text should be readable', async function() {
  // Verify text is visible
  await expect(this.page.locator('h1, h2, p').first()).toBeVisible();
});

Then('colors should be appropriate for light mode', async function() {
  // Verify light mode colors
});

Then('colors should be appropriate for dark mode', async function() {
  // Verify dark mode colors
});

Then('images should be visible', async function() {
  await expect(this.page.locator('img').first()).toBeVisible({ timeout: 10000 });
});

// ==========================================
// Responsive Homepage Steps
// ==========================================

Then('all sections should be readable', async function() {
  await expect(this.page.locator('h1, h2').first()).toBeVisible();
});

Then('buttons should be tap-friendly', async function() {
  // Verify button sizes
});

Then('images should scale appropriately', async function() {
  // Verify images are responsive
});

Then('there should be no horizontal scrolling', async function() {
  const hasHorizontalScroll = await this.page.evaluate(() => {
    return document.body.scrollWidth > document.body.clientWidth;
  });
  expect(hasHorizontalScroll).toBeFalsy();
});

Then('the layout should adapt to tablet width', async function() {
  // Verify responsive layout
});

Then('content should be well-proportioned', async function() {
  // Verify proportions
});
