import { Page } from '@playwright/test';

/**
 * Base Page class - All page objects inherit from this
 * Why: Provides common functionality and enforces consistent patterns across all pages
 */
export class BasePage {
  constructor(protected page: Page) {}

  /**
   * Navigate to the homepage
   * Why: Provides a consistent starting point for all challenges
   */
  async goToHomepage() {
    await this.page.goto('/');
  }

  /**
   * Get the current URL
   * Why: Useful for verifying navigation and current page state
   */
  getCurrentUrl(): string {
    return this.page.url();
  }

  /**
   * Wait for page to be fully loaded
   * Why: Ensures page is ready before interacting with elements
   */
  async waitForPageLoad() {
    await this.page.waitForLoadState('domcontentloaded');
  }
}
