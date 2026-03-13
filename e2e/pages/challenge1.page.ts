import { Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Challenge 1 Page Object
 * Represents the Challenge 1 login page and its elements/actions
 * Why: Encapsulates all page-specific locators and low-level interactions
 *
 * Key differences from Helper class:
 * - Page class = "What CAN I do on this page?" (actions)
 * - Helper class = "What SHOULD I do for this test scenario?" (business logic)
 */
export class Challenge1Page extends BasePage {
  // Locators - defined as getters for lazy evaluation
  // Why: Getters ensure locators are fresh on each access, avoiding stale element issues

  private get challengeLink(): Locator {
    return this.page.getByRole('link', { name: 'Try Challenge 1' });
  }

  private get emailInput(): Locator {
    return this.page.locator('#email');
  }

  private get passwordInput(): Locator {
    return this.page.locator('#password');
  }

  private get submitButton(): Locator {
    return this.page.locator('#submitButton');
  }

  private get successMessage(): Locator {
    return this.page.locator('#successMessage');
  }

  // Navigation methods

  /**
   * Navigate to Challenge 1 page from homepage
   * Why: Provides clean entry point to the challenge
   */
  async goto() {
    await this.goToHomepage();
    await this.challengeLink.click();
    await this.waitForPageLoad();
  }

  // Action methods - what you can DO on the page

  /**
   * Fill the email field
   * @param email - Email address to enter
   */
  async fillEmail(email: string) {
    await this.emailInput.fill(email);
  }

  /**
   * Fill the password field
   * @param password - Password to enter
   */
  async fillPassword(password: string) {
    await this.passwordInput.fill(password);
  }

  /**
   * Click the submit button
   */
  async clickSubmit() {
    await this.submitButton.click();
  }

  /**
   * Complete login action (fill form and submit)
   * Why: Combines common actions for convenience, but keeps individual actions available
   * @param email - User email address
   * @param password - User password
   */
  async login(email: string, password: string) {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.clickSubmit();
  }

  // Verification methods - what you can CHECK on the page

  /**
   * Verify success message is visible
   */
  async expectSuccessMessageVisible() {
    await expect(this.successMessage).toBeVisible();
  }

  /**
   * Verify success message contains expected text
   * @param text - Text to verify in success message
   */
  async expectSuccessMessageContains(text: string) {
    await expect(this.successMessage).toContainText(text);
  }

  /**
   * Verify email input has specific value
   * @param value - Expected value
   */
  async expectEmailValue(value: string) {
    await expect(this.emailInput).toHaveValue(value);
  }

  /**
   * Verify success message is hidden
   */
  async expectSuccessMessageHidden() {
    await expect(this.successMessage).toBeHidden();
  }

  // State checking methods - query the current state

  /**
   * Get the current email input value
   * @returns Current email value
   */
  async getEmailValue(): Promise<string> {
    return await this.emailInput.inputValue();
  }

  /**
   * Check if success message is visible
   * @returns true if visible, false otherwise
   */
  async isSuccessMessageVisible(): Promise<boolean> {
    return await this.successMessage.isVisible();
  }

  /**
   * Wait for form to reset after submission
   * Why: Challenge 1 auto-resets the form - we need to wait for this before next login
   */
  async waitForFormReset() {
    await this.expectSuccessMessageHidden();
    await this.expectEmailValue('');
  }
}
