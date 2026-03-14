# CI/CD with GitHub Actions

## Overview

This project uses GitHub Actions to automatically run Playwright tests on every push and pull request, ensuring code quality and catching regressions early.

## Workflow Configuration

**File:** `.github/workflows/playwright.yml`

### Key Features

- **Docker Container**: Uses Playwright's official image (`mcr.microsoft.com/playwright:v1.58.2-jammy`)
- **Automatic Server Startup**: Starts Express server before running tests
- **Health Checks**: Waits for server readiness using `wait-on`
- **Test Reports**: Uploads HTML reports on failures (retained for 30 days)
- **Debug Traces**: Uploads traces on failures for troubleshooting
- **Caching**: Uses npm caching for faster builds

### Triggers

The workflow runs on:
- Push to `main` or `master` branches
- Pull requests to `main` or `master` branches
- Manual workflow dispatch (Actions tab → "Run workflow")

## Workflow Steps

### 1. Checkout Code
```yaml
- uses: actions/checkout@v4
```

### 2. Setup Node.js
```yaml
- uses: actions/setup-node@v4
  with:
    node-version: lts/*
    cache: 'npm'
```

### 3. Install Dependencies
```yaml
- name: Install dependencies
  run: npm ci
```

### 4. Start Server
```yaml
- name: Start server
  run: npm start &
```
Starts the Express server in the background.

### 5. Wait for Server
```yaml
- name: Wait for server to be ready
  run: npx wait-on http://localhost:3000 --timeout 30000
```
Ensures the server is fully started before running tests.

### 6. Run Tests
```yaml
- name: Run Playwright tests
  run: npx playwright test --project=chromiumheadless
```
Runs tests in headless mode for faster execution.

### 7. Upload Artifacts
```yaml
- uses: actions/upload-artifact@v4
  if: ${{ !cancelled() }}
  with:
    name: playwright-report
    path: playwright-report/
    retention-days: 30
```
Uploads test reports and traces on failure.

## How CI Handles the Local Server

Since tests require a running server at `http://localhost:3000`:

1. **Starts server** in background with `npm start &`
2. **Waits for readiness** using `wait-on` (30-second timeout)
3. **Runs tests** in headless mode
4. **Auto-shutdown** when job completes

The server uses `PORT=3000` by default (from environment or fallback).

## Viewing CI Results

### GitHub Actions Tab

1. Navigate to **Actions** tab in your repository
2. Click on the latest workflow run
3. View test results in the summary
4. Download artifacts (reports/traces) if tests failed

### Test Report Structure

```
playwright-report/
├── index.html        # Main report page
├── data/            # Test execution data
└── trace/           # Debug traces (on failure)
```

### Downloading Artifacts

1. Go to failed workflow run
2. Scroll to **Artifacts** section
3. Click `playwright-report` to download
4. Extract and open `index.html` in browser

## Running Tests Locally Like CI

To replicate the CI environment locally:

### Option 1: Using Docker

```bash
# Pull Playwright Docker image
docker pull mcr.microsoft.com/playwright:v1.58.2-jammy

# Run tests in container
docker run --rm --network host \
  -v $(pwd):/work \
  -w /work \
  -it mcr.microsoft.com/playwright:v1.58.2-jammy \
  /bin/bash -c "npm ci && npx playwright test"
```

### Option 2: Manual Steps

```bash
# Install dependencies
npm ci

# Start server in background
npm start &

# Wait for server
npx wait-on http://localhost:3000 --timeout 30000

# Run tests
npx playwright test --project=chromiumheadless

# Kill server when done
pkill -f "node.*server.js"
```

## Environment Variables in CI

### Setting Secrets

For sensitive data (API keys, credentials):

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add secret name and value
4. Reference in workflow:

```yaml
env:
  TEST_USER_EMAIL: ${{ secrets.TEST_USER_EMAIL }}
  TEST_USER_PASSWORD: ${{ secrets.TEST_USER_PASSWORD }}
```

### Setting Variables

For non-sensitive configuration:

1. Go to **Settings** → **Secrets and variables** → **Actions** → **Variables** tab
2. Click **New repository variable**
3. Add variable name and value

## Debugging Failed CI Tests

### 1. Check Workflow Logs

Click on failed step to view detailed logs:
- Server startup logs
- Test execution output
- Error messages and stack traces

### 2. Download Trace Files

1. Download `playwright-report` artifact
2. Open trace viewer:
   ```bash
   npx playwright show-trace path/to/trace.zip
   ```
3. Inspect:
   - Network requests
   - Console logs
   - Screenshots
   - Timeline of actions

### 3. Run Locally in Docker

Replicate the exact CI environment:
```bash
docker run --rm --network host \
  -v $(pwd):/work -w /work -it \
  mcr.microsoft.com/playwright:v1.58.2-jammy \
  /bin/bash
```

Then inside the container:
```bash
npm ci
npm start &
npx wait-on http://localhost:3000
npx playwright test --project=chromiumheadless
```

## Best Practices

### ✅ Do's

- **Use headless mode** in CI for faster execution
- **Upload artifacts** for failed tests only (saves storage)
- **Set appropriate timeouts** for server startup (30s is good)
- **Use caching** for npm dependencies
- **Pin Docker image versions** for reproducibility

### ❌ Don'ts

- **Don't commit secrets** to `.env` files
- **Don't use headed mode** in CI (no display available)
- **Don't ignore server startup failures** (check logs)
- **Don't skip `wait-on`** (tests will fail if server isn't ready)

## Troubleshooting Common Issues

### Server Fails to Start

**Problem:** Server doesn't start or port is already in use.

**Solution:**
```yaml
- name: Kill any existing server
  run: pkill -f "node.*server.js" || true
  
- name: Start server
  run: npm start &
```

### Tests Timeout Waiting for Server

**Problem:** `wait-on` times out after 30 seconds.

**Solution:**
- Increase timeout: `npx wait-on http://localhost:3000 --timeout 60000`
- Check server logs for startup errors
- Verify PORT environment variable

### Artifacts Not Uploaded

**Problem:** Test reports aren't available after failure.

**Solution:**
```yaml
- uses: actions/upload-artifact@v4
  if: ${{ !cancelled() }}  # Upload even if tests fail
  with:
    name: playwright-report
    path: playwright-report/
```

## Advanced Configuration

### Matrix Testing (Multiple Browsers)

```yaml
strategy:
  matrix:
    browser: [chromium, firefox, webkit]
steps:
  - name: Run Playwright tests
    run: npx playwright test --project=${{ matrix.browser }}
```

### Parallel Execution

```yaml
- name: Run Playwright tests
  run: npx playwright test --workers=4
```

### Conditional Execution

```yaml
- name: Run Playwright tests
  if: github.event_name == 'pull_request'
  run: npx playwright test
```

---

[← Back to Main README](../README.md) | [← Previous: Setup](SETUP.md) | [ Next: Challenges →](CHALLENGES.md)
