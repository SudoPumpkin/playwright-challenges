# Project Architecture

## Overview

This project demonstrates two test organization patterns: **Helper Classes** (recommended) and **Page Objects** (optional). Both patterns keep tests clean and maintainable.

## Folder Structure

```
playwright-challenges/
├── e2e/                        # End-to-end tests
│   ├── pages/                  # Page Object classes (optional pattern)
│   │   ├── base.page.ts       # Base class with common functionality
│   │   ├── challenge1.page.ts # Challenge 1 page object
│   │   ├── challenge2.page.ts # Challenge 2 page object
│   │   ├── challenge3.page.ts # Challenge 3 page object
│   │   ├── challenge4.page.ts # Challenge 4 page object
│   │   └── index.ts           # Centralized exports
│   └── tests/
│       ├── flaky.spec.ts      # Main test suite
│       ├── global.d.ts        # TypeScript global type declarations
│       └── helpers/
│           ├── page-helpers.ts # Test helper classes (recommended pattern)
│           └── selectors.ts    # Centralized element selectors
├── public/                     # Challenge HTML pages
│   ├── index.html             # Homepage
│   ├── challenge1.html        # Challenge 1 page
│   ├── challenge2.html        # Challenge 2 page
│   ├── challenge3.html        # Challenge 3 page
│   └── challenge4.html        # Challenge 4 page
├── docs/                       # Documentation
│   ├── SETUP.md               # Setup and configuration guide
│   ├── CHALLENGES.md          # Challenge descriptions and solutions
│   ├── ARCHITECTURE.md        # This file
│   └── CI_CD.md               # CI/CD documentation
├── .github/workflows/         # CI/CD configuration
│   └── playwright.yml         # GitHub Actions workflow
├── playwright.config.ts       # Playwright configuration
├── tsconfig.json              # TypeScript configuration
├── package.json               # Dependencies and scripts
└── server.js                  # Express server
```

## Design Patterns

### Pattern 1: Helper Classes (Recommended)

**Location:** `e2e/tests/helpers/page-helpers.ts`

**Purpose:** Encapsulate business logic and test workflows.

**Structure:**
```typescript
export class Challenge1Helpers {
  constructor(private page: Page) {}
  
  async navigate() { /* ... */ }
  async login(email: string, password: string) { /* ... */ }
  async verifySuccessMessage(email: string, password: string) { /* ... */ }
  async waitForFormReset() { /* ... */ }
}
```

**Usage in Tests:**
```typescript
test('login multiple times', async ({ page }) => {
  const helpers = new Challenge1Helpers(page);
  
  await helpers.navigate();
  await helpers.login('user1@test.com', 'password123');
  await helpers.verifySuccessMessage('user1@test.com', 'password123');
  await helpers.waitForFormReset();
  
  await helpers.login('user2@test.com', 'password456');
  await helpers.verifySuccessMessage('user2@test.com', 'password456');
});
```

**Benefits:**
- Clean, readable tests
- Business logic separate from test structure
- Reusable across test files
- Easy to understand for new team members

---

### Pattern 2: Page Objects (Optional)

**Location:** `e2e/pages/`

**Purpose:** Represent pages with their elements and low-level actions.

**Structure:**
```typescript
export class Challenge1Page extends BasePage {
  // Locators
  private get emailInput(): Locator { return this.page.getByLabel('Email'); }
  private get submitButton(): Locator { return this.page.getByRole('button', { name: 'Sign In' }); }
  
  // Actions
  async goto() { /* ... */ }
  async fillEmail(email: string) { /* ... */ }
  async clickSubmit() { /* ... */ }
  
  // Verifications
  async expectEmailVisible() { /* ... */ }
}
```

**Usage in Tests:**
```typescript
test('login', async ({ page }) => {
  const challenge1 = new Challenge1Page(page);
  
  await challenge1.goto();
  await challenge1.fillEmail('test@example.com');
  await challenge1.fillPassword('password123');
  await challenge1.clickSubmit();
  await challenge1.expectSuccessMessageVisible();
});
```

**Benefits:**
- Clear separation: "What CAN I do?" vs "What SHOULD I do?"
- Atomic, reusable actions
- Good for complex applications with many pages

---

## Helper Classes vs Page Objects

| Aspect | Helper Classes | Page Objects |
|--------|---------------|--------------|
| **Purpose** | Business workflows | Page representations |
| **Focus** | "What should I do for this test?" | "What can I do on this page?" |
| **Abstraction Level** | High (test scenarios) | Low (page actions) |
| **Best For** | Test-focused projects | Complex multi-page apps |
| **Maintenance** | Test-centric | Page-centric |

**This project uses Helper Classes** as the primary pattern because it's more suitable for focused testing challenges.

---

## Locator Strategy: Hybrid Approach

We use a **hybrid locator strategy** that balances resilience, readability, and accessibility:

### 1. Semantic Elements → `getByRole()`
Use for buttons, links, headings with clear ARIA roles.

```typescript
private get submitButton(): Locator {
  return this.page.getByRole('button', { name: 'Sign In' });
}

private get challengeLink(): Locator {
  return this.page.getByRole('link', { name: 'Try Challenge 1' });
}
```

### 2. Form Inputs → `getByLabel()`
Use for form fields with associated `<label>` elements.

```typescript
private get emailInput(): Locator {
  return this.page.getByLabel('Email');
}

private get passwordInput(): Locator {
  return this.page.getByLabel('Password');
}
```

### 3. Text-Based Elements → `getByText()`
Use for menu items or elements identified by text content.

```typescript
private get logoutOption(): Locator {
  return this.page.getByText('Logout');
}
```

### 4. Non-Semantic Elements → `locator()`
Use for container `<div>` elements or attribute selectors.

```typescript
private get userProfile(): Locator {
  return this.page.locator('#userProfile');
}

private get menuButtonInitialized(): Locator {
  return this.page.locator('#menuButton[data-initialized="true"]');
}
```

### Benefits of Hybrid Approach
- **Resilience**: Semantic selectors survive DOM changes
- **Readability**: Clear intent (`getByRole('button', { name: 'Sign In' })`)
- **Accessibility**: Ensures proper ARIA roles and labels
- **User-Centric**: Tests interact like users and assistive tech do

---

## TypeScript Configuration

### Global Type Declarations

**File:** `e2e/tests/global.d.ts`

Extends the `Window` interface for custom properties:

```typescript
declare global {
  interface Window {
    isAppReady: boolean;
  }
}

export {};
```

**Why It Works:**
- Make sure it's included via `tsconfig.json` (for example: `include: ["e2e/**/*.ts", "e2e/tests/global.d.ts"]`)
- No explicit imports needed
- Prevents TypeScript errors when accessing `window.isAppReady`

### Path Aliases

**Configuration:** `tsconfig.json`

```json
"paths": {
  "@pages/*": ["e2e/pages/*"],
  "@testdata/*": ["e2e/tests/testdata/*"],
  "@fixturesetup": ["e2e/tests/fixtures/testFixtures"],
  "@pagesetup": ["test-setup/page-setup"],
  "@playwright-config": ["playwright.config"]
}
```

**Usage:**
```typescript
import { Challenge1Page } from '@pages/challenge1.page';
```

---

## Best Practices Implemented

1. **Lazy Locators**: Defined as getters for fresh evaluation on each access
   ```typescript
   private get emailInput(): Locator {
     return this.page.getByLabel('Email'); // Fresh on every call
   }
   ```

2. **Centralized Selectors**: All selectors in `helpers/selectors.ts` for easy updates

3. **Type Safety**: Global type declarations for custom Window properties

4. **Detailed Comments**: Every method explains WHY, not just WHAT

5. **Multiple Assertions**: Verify multiple aspects of success
   ```typescript
   await expect(successMessage).toBeVisible();
   await expect(successMessage).toContainText('Success!');
   await expect(successMessage).toContainText(`Email: ${email}`);
   ```

6. **No Static Waits**: Smart waits (`waitForFunction`, `toBeVisible`, Animation API)

7. **Separation of Concerns**: Business logic (helpers) separate from page structure (page objects)

---

[← Back to Main README](../README.md) | [← Previous: Challenges](CHALLENGES.md) | [Next: CI/CD →](CI_CD.md)
