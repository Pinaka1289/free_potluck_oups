# PotluckPartys - BDD Test Cases

This directory contains Behavior-Driven Development (BDD) test cases written in Gherkin syntax for the PotluckPartys application.

## 📁 Feature Files Structure

```
tests/
├── features/
│   ├── event-creation.feature      # Creating potluck events
│   ├── event-management.feature    # Viewing, editing, deleting events
│   ├── item-management.feature     # Adding, claiming, editing items
│   ├── authentication.feature      # Sign up, sign in, password reset
│   ├── dashboard.feature           # User dashboard functionality
│   ├── welcome-modal.feature       # First-time visitor experience
│   ├── qr-code.feature            # QR code generation and sharing
│   ├── theme-and-navigation.feature # Light/dark mode, navigation
│   ├── homepage.feature           # Landing page content
│   └── e2e-scenarios.feature      # End-to-end user journeys
└── README.md
```

## 📋 Feature Coverage Summary

| Feature File | Scenarios | Description |
|--------------|-----------|-------------|
| `event-creation.feature` | 5 | Creating events as guest or logged-in user |
| `event-management.feature` | 10 | Viewing, editing, sharing events |
| `item-management.feature` | 22 | Full item lifecycle management |
| `authentication.feature` | 18 | Complete auth flow including OAuth |
| `dashboard.feature` | 24 | Dashboard features and event management |
| `welcome-modal.feature` | 14 | First-time visitor experience |
| `qr-code.feature` | 12 | QR code generation and scanning |
| `theme-and-navigation.feature` | 18 | UI/UX and navigation |
| `homepage.feature` | 14 | Landing page sections |
| `e2e-scenarios.feature` | 7 | Complete user journeys |

**Total: ~144 Scenarios**

## 🏷️ Tags Reference

### Feature Tags
- `@guest` - Tests for non-authenticated users
- `@authenticated` - Tests requiring login
- `@auth` - Authentication-related tests
- `@event-creation` - Event creation tests
- `@event-edit` - Event editing tests
- `@item-*` - Item management tests
- `@dashboard` - Dashboard functionality
- `@qr-code` - QR code features
- `@theme` - Light/dark mode tests
- `@navigation` - Navigation tests
- `@responsive` - Responsive design tests
- `@e2e` - End-to-end scenarios

### Test Type Tags
- `@happy-path` - Main success scenarios
- `@validation` - Input validation tests
- `@error` - Error handling tests
- `@realtime` - Real-time update tests

## 🚀 Running Tests

### Prerequisites
Install a BDD testing framework. Recommended options:

**For JavaScript/TypeScript:**
```bash
npm install --save-dev @cucumber/cucumber playwright
```

**For Python:**
```bash
pip install behave selenium
```

### Running with Cucumber.js
```bash
# Run all tests
npx cucumber-js tests/features/**/*.feature

# Run specific feature
npx cucumber-js tests/features/authentication.feature

# Run by tag
npx cucumber-js --tags "@happy-path"
npx cucumber-js --tags "@auth and @signin"
npx cucumber-js --tags "not @e2e"
```

## 📝 Step Definitions

Step definitions need to be implemented for each Given/When/Then statement. Here's an example structure:

```javascript
// tests/step-definitions/auth.steps.js
const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

Given('I am on the PotluckPartys website', async function() {
  await this.page.goto('http://localhost:3000');
});

When('I navigate to the {string} page', async function(pagePath) {
  await this.page.goto(`http://localhost:3000${pagePath}`);
});

When('I fill in email {string}', async function(email) {
  await this.page.fill('input[name="email"]', email);
});

Then('I should see a success toast {string}', async function(message) {
  const toast = await this.page.locator('.toast-success');
  await expect(toast).toContainText(message);
});
```

## 📊 Test Categories

### 1. Event Creation (`event-creation.feature`)
- Guest creates event without signing up
- Guest creates event with minimal info
- Logged-in user creates event
- Validation errors (empty title)

### 2. Event Management (`event-management.feature`)
- View event via shareable link
- View event statistics
- Edit event details
- Copy event link
- Handle non-existent events

### 3. Item Management (`item-management.feature`)
- Add items (with/without claiming)
- Claim/unclaim items
- Edit items
- Delete items
- Toggle view modes (table/card)
- Real-time updates

### 4. Authentication (`authentication.feature`)
- Email sign up/sign in
- Google OAuth
- Password visibility toggle
- Forgot password flow
- Protected routes

### 5. Dashboard (`dashboard.feature`)
- View events
- Search events
- Copy links
- Delete events
- QR code features
- Add event by link
- Manage bookmarked events

### 6. Welcome Modal (`welcome-modal.feature`)
- First-time visitor experience
- Sign in to save event
- Continue without login
- Repeat visit behavior

### 7. QR Code (`qr-code.feature`)
- Auto-display on event page
- Download QR code
- Scan QR code flow
- Dashboard QR codes

### 8. Theme & Navigation (`theme-and-navigation.feature`)
- Light/dark mode toggle
- Header navigation
- Mobile navigation
- Responsive design

### 9. Homepage (`homepage.feature`)
- Hero section
- Features section
- How it works
- Call to action

### 10. E2E Scenarios (`e2e-scenarios.feature`)
- Complete guest journey
- Guest joins via link
- Registered user journey
- Multi-user collaboration
- QR sharing flow
- Password recovery

## 🔧 Configuration Example

### cucumber.js
```javascript
module.exports = {
  default: {
    paths: ['tests/features/**/*.feature'],
    require: ['tests/step-definitions/**/*.js'],
    format: ['progress', 'html:reports/cucumber-report.html'],
    parallel: 2,
    retry: 1,
    retryTagFilter: '@flaky'
  }
}
```

### playwright.config.js (for browser automation)
```javascript
module.exports = {
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  }
};
```

## 📈 Reporting

Generate test reports:

```bash
# HTML Report
npx cucumber-js --format html:reports/cucumber.html

# JSON Report (for CI/CD)
npx cucumber-js --format json:reports/cucumber.json

# JUnit XML (for Jenkins)
npx cucumber-js --format junit:reports/junit.xml
```

## ✅ Best Practices

1. **Keep scenarios independent** - Each scenario should be able to run in isolation
2. **Use background for common setup** - Avoid repetition across scenarios
3. **One assertion per Then** - Keep Then steps focused
4. **Use tags for organization** - Filter tests by feature, priority, or type
5. **Data tables for complex data** - Use Gherkin tables for multiple values
6. **Scenario outlines for variations** - Test same flow with different data

## 🤝 Contributing

When adding new features:
1. Write Gherkin scenarios first (BDD approach)
2. Implement step definitions
3. Tag appropriately
4. Update this README if adding new feature files




# Run all tests
npm test

# Run specific feature
npm test -- tests/features/event-creation.feature

# Run by tag
npm test -- --tags "@auth"
npm test -- --tags "@happy-path"
npm test -- --tags "@guest and @event-creation"

# Run with visible browser (non-headless)
npm run test:headed

# Generate HTML report
npm run test:report

# Dry run (validate without executing)
npm run test:dry