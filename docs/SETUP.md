# Setup Guide

## Environment Configuration

### Using Environment Variables (Optional)

This project uses [`dotenv`](https://www.npmjs.com/package/dotenv) to load environment variables from a `.env` file. This allows you to customize server and test configuration for local development.

**Setup:**

1. Copy the `.env.example` template to create your own `.env` file:

   ```bash
   cp .env.example .env
   ```

2. Edit `.env` to customize your local configuration (the file is already in `.gitignore`)

### Available Environment Variables

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

### Example Configurations

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

### How It Works

- Both `server.js` and `playwright.config.ts` automatically load environment variables from `.env`
- Variables are accessible via `process.env.VARIABLE_NAME`
- **`BASE_URL` automatically derives from `PORT`** when not explicitly set, keeping them in sync
- The `webServer` configuration only starts when `BASE_URL` hostname is `localhost`, `127.0.0.1`, or `::1` (IPv6)
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

## Running Tests Locally Like CI

To run tests in the same environment as GitHub Actions:

```bash
# Pull the official Playwright Docker image
docker pull mcr.microsoft.com/playwright:v1.58.2-jammy

# Run tests in the container
docker run --rm --network host -v $(pwd):/work -w /work -it mcr.microsoft.com/playwright:v1.58.2-jammy /bin/bash -c "npm ci && npx playwright test"
```

---

[← Back to Main README](../README.md) | [Next: CI_CD →](CI_CD.md)
