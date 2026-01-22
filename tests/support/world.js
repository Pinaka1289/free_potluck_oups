const { setWorldConstructor, World, Before, After, setDefaultTimeout } = require('@cucumber/cucumber');
const { chromium } = require('playwright');

// Set timeout to 60 seconds for all steps
setDefaultTimeout(60 * 1000);

class CustomWorld extends World {
  constructor(options) {
    super(options);
    this.baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    this.browser = null;
    this.context = null;
    this.page = null;
    this.testData = {};
  }

  async init() {
    this.browser = await chromium.launch({
      headless: process.env.HEADLESS !== 'false',
      slowMo: process.env.SLOW_MO ? parseInt(process.env.SLOW_MO) : 0
    });
    this.context = await this.browser.newContext({
      viewport: { width: 1280, height: 720 },
      ignoreHTTPSErrors: true
    });
    this.page = await this.context.newPage();
  }

  async cleanup() {
    if (this.page) await this.page.close();
    if (this.context) await this.context.close();
    if (this.browser) await this.browser.close();
  }

  async navigateTo(path) {
    const url = path.startsWith('http') ? path : `${this.baseUrl}${path}`;
    await this.page.goto(url, { waitUntil: 'networkidle' });
  }

  async waitForSelector(selector, options = {}) {
    return await this.page.waitForSelector(selector, { timeout: 10000, ...options });
  }

  async click(selector) {
    await this.page.click(selector);
  }

  async fill(selector, value) {
    await this.page.fill(selector, value);
  }

  async getText(selector) {
    const element = await this.page.$(selector);
    return element ? await element.textContent() : null;
  }

  async isVisible(selector) {
    try {
      await this.page.waitForSelector(selector, { timeout: 5000, state: 'visible' });
      return true;
    } catch {
      return false;
    }
  }

  async takeScreenshot(name) {
    const screenshotPath = `tests/reports/screenshots/${name}-${Date.now()}.png`;
    await this.page.screenshot({ path: screenshotPath, fullPage: true });
    return screenshotPath;
  }
}

setWorldConstructor(CustomWorld);

Before(async function() {
  await this.init();
});

After(async function(scenario) {
  if (scenario.result.status === 'FAILED') {
    // Take screenshot on failure
    try {
      const screenshot = await this.page.screenshot();
      this.attach(screenshot, 'image/png');
    } catch (e) {
      console.error('Failed to take screenshot:', e);
    }
  }
  await this.cleanup();
});

module.exports = { CustomWorld };
