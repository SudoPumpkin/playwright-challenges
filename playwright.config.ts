import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config';

// Helper function to safely parse integers with fallback
function parseIntSafe(value: string | undefined, defaultValue: number): number {
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

// Environment variables with fallback defaults
// Derive BASE_URL from PORT to keep them in sync when PORT is customized
const PORT = process.env.PORT || '3000';
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
const DEFAULT_TIMEOUT = parseIntSafe(process.env.DEFAULT_TIMEOUT, 120000);
const NAVIGATION_TIMEOUT = parseIntSafe(process.env.NAVIGATION_TIMEOUT, 15000);

// Validate TRACE against allowed values with runtime type checking
const ALLOWED_TRACE_VALUES: TraceMode[] = ['on', 'off', 'retain-on-failure', 'on-first-retry'];
type TraceMode = 'on' | 'off' | 'retain-on-failure' | 'on-first-retry';
const TRACE_ENV = process.env.TRACE || 'retain-on-failure';
const TRACE: TraceMode = ALLOWED_TRACE_VALUES.includes(TRACE_ENV as TraceMode)
  ? (TRACE_ENV as TraceMode)
  : 'retain-on-failure';

const HEADLESS = process.env.HEADLESS === 'true';
const SLOW_MO = parseIntSafe(process.env.SLOW_MO, 0);

// Check if BASE_URL points to localhost (to determine if we should start local server)
const isLocalhost = BASE_URL.includes('localhost') || BASE_URL.includes('127.0.0.1');

export default defineConfig({
  testDir: './e2e/tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 3 : 1,
  reporter: [['html', { open: 'never' }], ['dot']],
  timeout: DEFAULT_TIMEOUT,
  expect: {
    timeout: 5 * 1000,
  },
  use: {
    ignoreHTTPSErrors: true,
    acceptDownloads: true,
    testIdAttribute: 'data-testid',
    baseURL: BASE_URL,
    trace: TRACE,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 5 * 1000,
    navigationTimeout: NAVIGATION_TIMEOUT,
  },

  projects: [
    {
      name: 'chromium',
      use: {
        viewport: null,
        launchOptions: {
          args: ['--disable-web-security', '--start-maximized'],
          slowMo: SLOW_MO,
          headless: HEADLESS,
        },
      },
    },

    {
      name: 'chromiumheadless',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1600, height: 1000 },
        launchOptions: {
          args: ['--disable-web-security'],
          slowMo: SLOW_MO,
          headless: true,
        },
      },
    },
  ],

  /**
   * Run your local dev server before starting the tests.
   * Only starts the server if BASE_URL points to localhost.
   * For remote testing (e.g., BASE_URL=https://example.com), this is skipped.
   * See https://playwright.dev/docs/test-webserver#configuring-a-web-server
   */
  webServer: isLocalhost
    ? {
        command: 'npm start', // Start the UI server
        url: BASE_URL,
        ignoreHTTPSErrors: true,
        timeout: 2 * 60 * 1000,
        reuseExistingServer: true,
        stdout: 'pipe',
        stderr: 'pipe',
      }
    : undefined,
});
