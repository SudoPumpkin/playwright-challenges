import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config';

// Environment variables with fallback defaults
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const DEFAULT_TIMEOUT = parseInt(process.env.DEFAULT_TIMEOUT || '120000', 10);
const NAVIGATION_TIMEOUT = parseInt(process.env.NAVIGATION_TIMEOUT || '15000', 10);
const TRACE = (process.env.TRACE || 'retain-on-failure') as 'on' | 'off' | 'retain-on-failure' | 'on-first-retry';
const HEADLESS = process.env.HEADLESS === 'true';
const SLOW_MO = parseInt(process.env.SLOW_MO || '0', 10);

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
   * If the tests are being run on localhost, this configuration starts a web server.
   * See https://playwright.dev/docs/test-webserver#configuring-a-web-server
   */
  webServer: {
    command: 'npm start', // Start the UI server
    url: BASE_URL,
    ignoreHTTPSErrors: true,
    timeout: 2 * 60 * 1000,
    reuseExistingServer: true,
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
