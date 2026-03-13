import { Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Challenge 3 Page Object - Forgot password flow with form transitions
 * Why: Challenge 3 tests form transitions where the same form changes from Login to Reset Password
 * We need to wait for DOM changes before interacting with the new form state
 */
export class Challenge3Page extends BasePage {
  // Locators
  private get challengeLink(): Locator {
    return this.page.getByRole('link', { name: 'Try Challenge 3' });
  }

  private get emailInput(): Locator {
    return this.page.locator('#email');
  }

  private get forgotPasswordButton(): Locator {
    return this.page.getByRole('button', { name: 'Forgot Password?' });
  }

  private get resetPasswordHeading(): Locator {
    return this.page.getByRole('heading', { name: 'Reset Password' });
  }

  private get resetPasswordButton(): Locator {
    return this.page.getByRole('button', { name: 'Reset Password' });
  }

  private get successHeading(): Locator {
    return this.page.getByRole('heading', { name: 'Success!' });
  }

  private get mainContent(): Locator {
    return this.page.locator('#mainContent');
  }

  // Navigation
  async goto() {
    await this.goToHomepage();
    await this.challengeLink.click();
    await this.waitForPageLoad();
  }

  // Actions
  async clickForgotPassword() {
    await this.forgotPasswordButton.click();
  }

  /**
   * Wait for the form to transition from Login to Reset Password
   * Why: The form heading changes and we need to wait for the new state
   */
  async waitForResetPasswordForm() {
    await expect(this.resetPasswordHeading).toBeVisible();
  }

  async fillEmail(email: string) {
    await this.emailInput.fill(email);
  }

  async clickResetPassword() {
    await this.resetPasswordButton.click();
  }

  async fillEmailAndSubmit(email: string) {
    await this.fillEmail(email);
    await this.clickResetPassword();
  }

  // Verifications
  async expectSuccessHeadingVisible() {
    await expect(this.successHeading).toBeVisible();
  }

  async expectMainContentContains(text: string) {
    await expect(this.mainContent).toContainText(text);
  }

  async verifySuccessMessage(email: string) {
    await this.expectSuccessHeadingVisible();
    await this.expectMainContentContains('Password reset link sent!');
    await this.expectMainContentContains(`Email: ${email}`);
  }
}
