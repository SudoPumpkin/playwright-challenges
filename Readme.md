## Table of Contents

- [Playwright Testing Challenges](#playwright-testing-challenges)
- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Challenges Overview](#challenges-overview)
- [Tests](#tests)
  - [Test Descriptions](#test-descriptions)
  - [Running Tests](#running-tests)
- [Continuous Integration](#continuous-integration)
- [Key Learnings & Solutions](#key-learnings--solutions)

## Playwright Testing Challenges

This repository contains a series of testing challenges using Playwright to practice handling different UI testing scenarios. Each challenge focuses on specific aspects of web testing and requires fixing existing tests to make them more robust and reliable.

## Prerequisites

Node.js (v18 or higher)

## Setup

```bash
git clone https://github.com/SudoPumpkin/playwright-challenges.git
cd playwright-challenges
```

Install dependencies

```bash
npm install
```

## Challenges Overview

### Challenge 1: Multiple Login Tests (@c1)

- Test multiple successful login attempts
- Verify success messages and user data
- Handle dynamic content
- Practice proper assertions

### Challenge 2: Animated Form (@c2)

- Test login with animated form elements
- Handle delayed loading states
- Test logout functionality
- Work with menu interactions

### Challenge 3: Forgot Password Flow (@c3)

- Test forgot password functionality
- Handle modal dialogs
- Verify success states
- Practice proper assertions

### Challenge 4: Application State (@c4)

- Test login considering application ready state
- Handle global variables
- Test profile interactions
- Verify logout functionality

## Tests

This project includes several tests to ensure the functionality of the animated form. The tests are written using Playwright and can be found in the `flaky.spec.ts` file.

### Test Descriptions

- **Login multiple times successfully**: This test logs in three times with different credentials and verifies successful login messages.
- **Login and logout successfully with animated form and delayed loading**: This test logs in and logs out, handling animated forms and delayed loading.
- **Forgot password**: This test verifies the forgot password functionality and checks for success messages.
- **Login and logout**: This test logs in and logs out, ensuring the app is in a ready state before proceeding.

### Running Tests

To run the tests, use the following command:

```bash
npx playwright test
```

Run specific challenges using tags:

```bash
npx playwright test --grep "@c1"  # Challenge 1 only
npx playwright test --grep "@c2"  # Challenge 2 only
npx playwright test --grep "@c3"  # Challenge 3 only
npx playwright test --grep "@c4"  # Challenge 4 only
```

Run in headed mode to see the browser:

```bash
npm run test  # Opens browser window
```

Run in headless mode (faster, CI-friendly):

```bash
npm run test:chromium-headless
```

## Continuous Integration

This project uses GitHub Actions to run Playwright tests automatically on every push and pull request.

### CI/CD Setup

The workflow (`.github/workflows/playwright.yml`) includes:

- **Docker Container**: Uses Playwright's official Docker image (`mcr.microsoft.com/playwright:v1.58.2-jammy`) with all browsers pre-installed
- **Server Startup**: Automatically starts the Express server before running tests
- **Server Health Check**: Uses `wait-on` to ensure the server is ready before tests begin
- **Triggers**: Runs on push/PR to `main` or `master` branches, plus manual workflow dispatch
- **Test Reports**: Automatically uploads HTML reports for 30 days
- **Traces**: Uploads debug traces on test failures for troubleshooting
- **Node.js 18**: Uses LTS version with npm caching for faster builds

### How CI/CD Handles the Local Server

Since the tests require a running server at `http://localhost:3000`, the workflow:

1. Starts the server in the background with `npm start &`
2. Waits for the server to be ready using `wait-on` (30-second timeout)
3. Runs the Playwright tests
4. The server shuts down automatically when the job completes

### Viewing CI Results

1. Go to the **Actions** tab in your GitHub repository
2. Click on the latest workflow run
3. View test results and download artifacts (reports/traces) if needed

### Running Tests Locally Like CI

To run tests in the same environment as CI:

```bash
# Pull the official Playwright Docker image
docker pull mcr.microsoft.com/playwright:v1.58.2-jammy

# Run tests in the container
docker run --rm --network host -v $(pwd):/work -w /work -it mcr.microsoft.com/playwright:v1.58.2-jammy /bin/bash -c "npm ci && npx playwright test"
```

## Key Learnings & Solutions

### How We Fixed the Flaky Tests

#### Challenge 1: Form Reset Timing
**Problem**: Tests failed when running multiple logins because they didn't wait for the form to reset.
**Solution**: Added `waitForFormReset()` that waits for the success message to disappear AND the email field to clear.

#### Challenge 2: Animation & Initialization Delays
**Problem**: Two timing issues - 7-second button animation and 1-second menu initialization.
**Solution**: 
- Used browser's Animation API with `animationend` event listener (no static waits!)
- Checked for `data-initialized="true"` attribute to confirm menu is ready

#### Challenge 3: Form Transitions
**Problem**: The same form element changes from Login to Reset Password, causing confusion.
**Solution**: Wait for the heading to change to "Reset Password" before interacting with the form.

#### Challenge 4: Dynamic Script Loading (Trickiest!)
**Problem**: jQuery loads with `defer` attribute, event handlers attach after 500ms delay.
**Solution**: 
- Check `window.isAppReady` global variable
- Use `pressSequentially()` with 50ms delay instead of `fill()` to give handlers time to fully attach
- This combination eliminates race conditions

### Best Practices Demonstrated

1. **No Static Waits**: We use smart waits (`waitForFunction`, `toBeVisible`, event listeners) instead of `page.waitForTimeout()`
2. **Page Object Model**: Helper classes keep tests clean and maintainable
3. **Centralized Selectors**: All locators in one file for easy updates
4. **Multiple Assertions**: Verify multiple aspects of success (visibility, content, state changes)
5. **Detailed Comments**: Every method explains WHY, not just WHAT
6. **CI/CD Ready**: Tests run reliably in containerized environments with proper artifact management
