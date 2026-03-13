## Table of Contents

- [Playwright Testing Challenges](#playwright-testing-challenges)
- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Environment Configuration](#environment-configuration)
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

## Environment Configuration

### Using Environment Variables (Optional)

This project uses [`dotenv`](https://www.npmjs.com/package/dotenv) to load environment variables from a `.env` file. This allows you to customize server and test configuration for local development.

**Setup:**

1. Copy the `.env.example` template to create your own `.env` file:

   ```bash
   cp .env.example .env
   ```

2. Edit `.env` to customize your local configuration (the file is already in `.gitignore`)

**Available Environment Variables:**

| Variable               | Default                                  | Description                                                           | Status      |
| ---------------------- | ---------------------------------------- | --------------------------------------------------------------------- | ----------- |
| `PORT`                 | `3000`                                   | Port for the Express server                                           | ✅ Active   |
| `BASE_URL`             | `http://localhost:${PORT}` (auto-synced) | Base URL for Playwright tests. Auto-syncs with PORT for localhost. Use a remote URL (e.g., `https://staging.example.com`) to test against external servers (skips local webServer startup). | ✅ Active   |
| `HEADLESS`             | `false`                                  | Run browser in headless mode                                          | ✅ Active   |
| `SLOW_MO`              | `0`                                      | Slow down operations by N milliseconds (debugging)                    | ✅ Active   |
| `DEFAULT_TIMEOUT`      | `120000`                                 | Overall test timeout (milliseconds)                                   | ✅ Active   |
| `NAVIGATION_TIMEOUT`   | `15000`                                  | Page navigation timeout (milliseconds)                                | ✅ Active   |
| `TRACE`                | `retain-on-failure`                      | Trace mode: `on`, `off`, `retain-on-failure`, `on-first-retry`       | ✅ Active   |
| `NODE_ENV`             | `development`                            | Environment mode (development/production)                             | 📝 Template |
| `BROWSER`              | `chromium`                               | Browser to use (chromium/firefox/webkit)                              | 📝 Template |
| `DEBUG`                | `false`                                  | Enable debug mode                                                     | 📝 Template |
| `TEST_USER_EMAIL`      | `test@example.com`                       | Test user email (for future authentication scenarios)                 | 📝 Template |
| `TEST_USER_PASSWORD`   | `password123`                            | Test user password (for future authentication scenarios)              | 📝 Template |

**Legend:**
- ✅ **Active**: Currently used by the application
- 📝 **Template**: Available for future use or customization (not currently used)

**Example `.env` file:**

```bash
# Local Development (default)
# Simple: Just change the port - BASE_URL automatically updates!
PORT=3001
# ✅ Result: Server runs on 3001, tests connect to http://localhost:3001

# Remote Testing (e.g., staging environment)
BASE_URL=https://staging.example.com
# ✅ Result: Tests run against remote server, local webServer is NOT started

# Advanced: Override BASE_URL independently (rarely needed)
PORT=3001
BASE_URL=http://localhost:3001
# Note: Only needed if BASE_URL should differ from http://localhost:${PORT}

# Run tests in headless mode
HEADLESS=true

# Slow down test execution for debugging
SLOW_MO=100
```

**Important:**
- `BASE_URL` automatically derives from `PORT` when not explicitly set. You typically only need to set `PORT`!
- When `BASE_URL` points to a remote server (not localhost), the local webServer will **not** be started
- This allows you to test against staging/production environments without starting a local server

**How it works:**

- Both `server.js` and `playwright.config.ts` automatically load environment variables from `.env`
- Variables are accessible via `process.env.VARIABLE_NAME`
- **`BASE_URL` automatically derives from `PORT`** when not explicitly set, keeping them in sync
- The `webServer` configuration only starts when `BASE_URL` hostname is `localhost`, `127.0.0.1`, or `[::1]` (IPv6)
- Fallback defaults are used when variables aren't set

### Security Best Practices

⚠️ **Important**: Never commit `.env` files to version control!

The `.env` file is already included in `.gitignore` to prevent accidental commits. The `.env.example` file serves as a template showing which variables are available.

**For CI/CD pipelines**: Environment variables can be set directly in GitHub Actions (Settings → Secrets and variables → Actions), then referenced in your workflow:

```yaml
# .github/workflows/playwright.yml
env:
  TEST_USER_EMAIL: ${{ secrets.TEST_USER_EMAIL }}
  TEST_USER_PASSWORD: ${{ secrets.TEST_USER_PASSWORD }}
```

This keeps sensitive data encrypted and separate from your codebase.

**Note**: The current tests use hardcoded test data for simplicity since they test a demo app with no real authentication. In a production project with real credentials, you would **never hardcode them** - always use environment variables locally and GitHub Secrets in CI/CD.

### Why Use Environment Variables?

- **Flexibility**: Switch between environments (local, staging, production) without code changes
- **Security**: Keep sensitive data (credentials, API keys) out of source code
- **Team Collaboration**: Each developer can have their own local configuration
- **CI/CD Integration**: Different settings for automated testing pipelines

## Available Scripts

### Development Scripts

```bash
# Start the server (uses PORT from .env, defaults to 3000)
npm start

# Run tests in headed mode with chromium
npm test

# Run tests in headless mode
npm run test:chromium-headless
```

### Code Quality Scripts

```bash
# Run eslint
npm run lint

# Run eslint with auto-fix
npm run lint:fix

# Format code with prettier
npm run format
```

### Utility Scripts

```bash
# Clean install (removes node_modules and reinstalls)
npm run ready
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

This project includes several tests to ensure the functionality of the animated form. The tests are written using Playwright and can be found in the `e2e/tests/flaky.spec.ts` file.

### Test Descriptions

- **Login multiple times successfully**: This test logs in three times with different credentials and verifies successful login messages.
- **Login and logout successfully with animated form and delayed loading**: This test logs in and logs out, handling animated forms and delayed loading.
- **Forgot password**: This test verifies the forgot password functionality and checks for success messages.
- **Login and logout**: This test logs in and logs out, ensuring the app is in a ready state before proceeding.

### Project Structure

This project uses **Helper Classes** (`e2e/tests/helpers/`) to organize test logic:

- Encapsulates business logic and test workflows
- Keeps tests clean and readable
- Reusable across test files

**Optional**: Page Object classes are also available in `e2e/pages/` as an alternative pattern for reference.

#### Folder Structure

```
playwright-challenges/
├── e2e/                        # End-to-end tests
│   ├── pages/                  # Page Object classes (optional pattern)
│   │   ├── base.page.ts       # Base class with common functionality
│   │   ├── challenge*.page.ts # Challenge-specific page objects
│   │   └── index.ts           # Centralized exports
│   └── tests/
│       ├── flaky.spec.ts      # Main test suite
│       ├── global.d.ts        # TypeScript global type declarations
│       └── helpers/
│           ├── page-helpers.ts # Test helper classes
│           └── selectors.ts    # Centralized element selectors
├── public/                     # Challenge HTML pages
│   ├── index.html             # Homepage
│   └── challenge*.html        # Challenge pages
├── .github/workflows/         # CI/CD configuration
├── playwright.config.ts       # Playwright configuration
├── tsconfig.json              # TypeScript configuration
└── server.js                  # Express server
```

### Running Tests

To run all tests in all projects (runs each test twice - once in headed mode, once in headless):

```bash
npx playwright test
```

Run tests in a specific project:

```bash
# Headless mode (faster, recommended for local testing)
npx playwright test --project=chromiumheadless
# or
npm run test:chromium-headless

# Headed mode (opens browser window, useful for debugging)
npx playwright test --project=chromium
# or
npm run test
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
3. Runs the Playwright tests in headless mode (`--project=chromiumheadless`)
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

- Used browser's Animation API with `Animation.finished` promise (no static waits!)
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
4. **Type Safety**: Global type declarations in `e2e/tests/global.d.ts` for custom Window properties
5. **Multiple Assertions**: Verify multiple aspects of success (visibility, content, state changes)
6. **Detailed Comments**: Every method explains WHY, not just WHAT
7. **CI/CD Ready**: Tests run reliably in containerized environments with proper artifact management
8. **Stable Selectors**: Prefer ID-based selectors over text-based for resilience to UI changes
