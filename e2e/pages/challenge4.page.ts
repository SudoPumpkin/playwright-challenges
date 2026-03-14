import { Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Challenge 4 Page Object - Global ready state with dynamic script loading
 * Why: Challenge 4 tests dynamic script loading - jQuery loads with defer attribute
 * Event handlers are attached AFTER window.isAppReady becomes true (500ms delay)
 * This is the trickiest challenge requiring both global variable check AND slow typing
 */
export class Challenge4Page extends BasePage {
  // Locators - Using hybrid approach for better resilience and readability
  // Navigation link - use getByRole for semantic element
  private get challengeLink(): Locator {
    return this.page.getByRole('link', { name: 'Try Challenge 4' });
  }

  // Form inputs - use getByLabel for accessible form fields
  private get emailInput(): Locator {
    return this.page.getByLabel('Email');
  }

  private get passwordInput(): Locator {
    return this.page.getByLabel('Password');
  }

  // Submit button - use getByRole for semantic button
  private get submitButton(): Locator {
    return this.page.getByRole('button', { name: 'Sign In' });
  }

  // Container elements - use getByTestId (would need data-testid) or locator for non-semantic divs
  private get userProfile(): Locator {
    return this.page.locator('#userProfile');
  }

  private get profileButton(): Locator {
    return this.page.locator('#profileButton');
  }

  private get loginForm(): Locator {
    return this.page.locator('#loginForm');
  }

  // Logout menu item - use getByRole for button-like menu item
  private get logoutButton(): Locator {
    return this.page.getByText('Logout');
  }

  // Navigation
  async goto() {
    await this.goToHomepage();
    await this.challengeLink.click();
    await this.waitForPageLoad();
  }

  /**
   * Wait for the application to finish initializing
   * Why: Check window.isAppReady global variable set after jQuery loads (500ms delay)
   * Also verify email input is enabled to prevent race conditions
   */
  async waitForAppReady() {
    await this.page.waitForFunction(() => window.isAppReady === true, undefined, { timeout: 10_000 });
    await expect(this.emailInput).toBeEnabled({ timeout: 10_000 });
  }

  // Actions
  /**
   * Type email with delay between keystrokes
   * Why: Use pressSequentially() with 50ms delay instead of fill()
   * Even though isAppReady is true, typing slowly gives handlers time to fully attach
   * This prevents race conditions where fill() was too fast
   */
  async fillEmailSlowly(email: string) {
    await this.emailInput.pressSequentially(email, { delay: 50 });
  }

  async fillPasswordSlowly(password: string) {
    await this.passwordInput.pressSequentially(password, { delay: 50 });
  }

  async clickSubmit() {
    await this.submitButton.click();
  }

  async login(email: string, password: string) {
    await this.fillEmailSlowly(email);
    await this.fillPasswordSlowly(password);
    await this.clickSubmit();
  }

  async clickProfileButton() {
    await this.profileButton.click();
  }

  async clickLogout() {
    await this.logoutButton.click();
  }

  async logout() {
    await this.clickProfileButton();
    await expect(this.logoutButton).toBeVisible();
    await this.clickLogout();
  }

  // Verifications
  async expectUserProfileVisible() {
    await expect(this.userProfile).toBeVisible();
  }

  async expectProfileButtonVisible() {
    await expect(this.profileButton).toBeVisible();
  }

  async expectLoginFormHidden() {
    await expect(this.loginForm).toBeHidden();
  }

  async expectLoginFormVisible() {
    await expect(this.loginForm).toBeVisible();
  }

  async expectUserProfileHidden() {
    await expect(this.userProfile).toBeHidden();
  }

  async verifyLoginSuccess() {
    await this.expectUserProfileVisible();
    await this.expectProfileButtonVisible();
    await this.expectLoginFormHidden();
  }

  async verifyLogoutSuccess() {
    await this.expectLoginFormVisible();
    await this.expectUserProfileHidden();
  }
}
