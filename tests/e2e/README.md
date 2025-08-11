# E2E Testing Infrastructure

## Overview

This directory contains the foundational E2E (End-to-End) testing infrastructure for DocCraft AI, built with Playwright and following MCP compliance standards.

## 🏗️ **Phase 5 Step 1: Integration Testing Foundation**

### **What We've Built**

1. **Playwright Configuration** (`playwright.config.ts`)
   - Multi-browser testing (Chrome, Firefox, Safari, Mobile)
   - Parallel test execution
   - Comprehensive reporting (HTML, JSON, JUnit)
   - Automatic dev server startup
   - Global setup/teardown hooks

2. **Test Utilities** (`utils/test-helpers.ts`)
   - Application readiness detection
   - Navigation helpers
   - Form interaction utilities
   - Screenshot capture
   - Performance monitoring

3. **Critical User Journey Tests** (`critical-user-journey.spec.ts`)
   - Application loading verification
   - Navigation testing
   - User interaction validation
   - Form handling
   - State management

4. **Accessibility Tests** (`accessibility.spec.ts`)
   - WCAG compliance checks
   - Heading structure validation
   - Alt text verification
   - Form labeling
   - Keyboard navigation
   - ARIA implementation

5. **Performance Tests** (`performance.spec.ts`)
   - Load time budgets
   - Interaction responsiveness
   - Memory usage monitoring
   - Network optimization
   - Scroll performance
   - Large dataset handling

## 🚀 **Getting Started**

### **Prerequisites**

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install
```

### **Running Tests**

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI mode (interactive)
npm run test:e2e:ui

# Run in headed mode (visible browser)
npm run test:e2e:headed

# Run in debug mode
npm run test:e2e:debug

# View test report
npm run test:e2e:report
```

### **Test Execution Modes**

- **Headless**: Default mode for CI/CD
- **Headed**: Visible browser for debugging
- **UI Mode**: Interactive Playwright UI
- **Debug Mode**: Step-by-step execution

## 📋 **Test Structure**

### **Test Categories**

1. **Critical User Journey**
   - Core application functionality
   - User workflow validation
   - Error handling scenarios

2. **Accessibility**
   - WCAG 2.1 AA compliance
   - Screen reader compatibility
   - Keyboard navigation
   - Color contrast

3. **Performance**
   - Load time budgets
   - Memory management
   - Network optimization
   - Rendering performance

### **Test Patterns**

```typescript
test.describe('Feature Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Setup for each test
    await navigateToRoute(page, '/');
    await waitForAppReady(page);
  });

  test('should perform expected behavior', async ({ page }) => {
    // Test implementation
    await expect(page.locator('#element')).toBeVisible();
  });
});
```

## 🔧 **Configuration**

### **Environment Variables**

```bash
# Base URL for testing
PLAYWRIGHT_BASE_URL=http://localhost:5173

# CI environment
CI=true
```

### **Browser Configuration**

- **Chromium**: Primary testing browser
- **Firefox**: Cross-browser compatibility
- **WebKit**: Safari compatibility
- **Mobile**: Responsive design testing

### **Performance Budgets**

- **Application Load**: < 3 seconds
- **DOM Ready**: < 1 second
- **Interaction Response**: < 100ms
- **Memory Increase**: < 50MB

## 📊 **Reporting & Artifacts**

### **Test Reports**

- **HTML Report**: Interactive test results
- **JSON Report**: Machine-readable output
- **JUnit Report**: CI/CD integration
- **Screenshots**: Failure captures
- **Videos**: Test execution recording
- **Traces**: Detailed execution logs

### **Artifact Locations**

```
test-results/
├── results.json          # Test results
├── results.xml           # JUnit report
├── screenshots/          # Failure screenshots
├── videos/              # Test recordings
└── traces/              # Execution traces
```

## 🧪 **Writing New Tests**

### **Test Guidelines**

1. **Use MCP Compliance**

   ```typescript
   /**
    * MCP Context Block:
    * role: qa-engineer,
    * tier: Pro,
    * file: "tests/e2e/feature.spec.ts",
    * allowedActions: ["test", "validate", "simulate"],
    * theme: "e2e_testing_infrastructure"
    */
   ```

2. **Follow Test Structure**
   - Descriptive test names
   - Proper setup/teardown
   - Meaningful assertions
   - Error handling

3. **Use Helper Functions**
   - `waitForAppReady()` for app readiness
   - `navigateToRoute()` for navigation
   - `clickElement()` for interactions
   - `fillFormField()` for form inputs

### **Example Test**

```typescript
import { test, expect } from '@playwright/test';
import { waitForAppReady, navigateToRoute } from './utils/test-helpers';

test('User can complete workflow', async ({ page }) => {
  // Navigate and wait for readiness
  await navigateToRoute(page, '/workflow');
  await waitForAppReady(page);

  // Perform actions
  await page.click('#start-button');
  await page.fill('#input-field', 'test value');
  await page.click('#submit-button');

  // Verify results
  await expect(page.locator('#success-message')).toBeVisible();
});
```

## 🔍 **Debugging Tests**

### **Common Issues**

1. **Element Not Found**
   - Check selectors
   - Verify element visibility
   - Wait for dynamic content

2. **Timing Issues**
   - Use `waitForAppReady()`
   - Add appropriate timeouts
   - Check for loading states

3. **Flaky Tests**
   - Avoid hardcoded delays
   - Use proper wait conditions
   - Check for race conditions

### **Debug Commands**

```bash
# Run specific test with debugging
npx playwright test --debug --grep "test name"

# Run with headed mode
npx playwright test --headed --grep "test name"

# Generate trace for debugging
npx playwright test --trace on
```

## 📈 **CI/CD Integration**

### **GitHub Actions**

```yaml
- name: Run E2E Tests
  run: npm run test:e2e

- name: Upload Test Results
  uses: actions/upload-artifact@v3
  with:
    name: e2e-results
    path: test-results/
```

### **Test Parallelization**

- **CI Environment**: Single worker for stability
- **Local Development**: Parallel execution for speed
- **Browser Matrix**: Cross-browser testing

## 🎯 **Next Steps (Phase 5)**

### **Week 1: Integration Testing Foundation** ✅

- [x] Playwright setup and configuration
- [x] Critical user journey tests
- [x] Accessibility testing framework
- [x] Performance testing foundation

### **Week 2: Advanced Test Patterns** ✅

- [x] Test Data Management (Fixtures, factories, data seeding)
- [x] API Testing Integration (Backend service testing)
- [x] Visual Regression Testing (UI consistency validation)
- [x] Cross-Browser Compatibility (Enhanced browser-specific test scenarios)
- [x] Test Parallelization (Optimized test execution strategies)
- [x] Advanced Element Interactions (Drag & drop, multi-selection, human-like typing)
- [x] Complex Test Scenarios (User onboarding, collaborative sessions)
- [x] Performance Testing (Page load metrics, memory monitoring, interaction responsiveness)
- [x] Advanced Assertions (Viewport positioning, CSS validation, network monitoring)
- [x] Test Environment Management (Environment variables, CI detection)

### **Week 3: Test Automation**

- [ ] Visual regression testing
- [ ] Cross-browser compatibility
- [ ] Mobile responsiveness
- [ ] Progressive enhancement

### **Week 4: Quality Gates**

- [ ] Performance budgets
- [ ] Accessibility compliance
- [ ] Security testing
- [ ] Load testing foundation

## 📚 **Resources**

- [Playwright Documentation](https://playwright.dev/)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Testing Best Practices](https://playwright.dev/docs/best-practices)
- [MCP Compliance Guide](https://github.com/modelcontextprotocol)

## 🤝 **Contributing**

When adding new tests:

1. Follow MCP compliance standards
2. Use existing helper functions
3. Add appropriate documentation
4. Include accessibility considerations
5. Consider performance implications
6. Test across multiple browsers

---

**Status**: Phase 5 Step 1 Complete ✅  
**Next**: Advanced Test Patterns (Week 2)
