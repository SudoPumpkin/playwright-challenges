import { Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Challenge 2 Page Object - Animated form with delayed initialization
 * Why: Challenge 2 has TWO timing challenges that need special handling:
 * 1. 7-second CSS animation on submit button
 * 2. 1-second menu button initialization after login
 */
export class Challenge2Page extends BasePage {
  // Locators
  private get challengeLink(): Locator {
    return this.page.getByRole('link', { name: 'Try Challenge 2' });
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

  private get menuButton(): Locator {
    return this.page.locator('#menuButton');
  }

  private get menuButtonInitialized(): Locator {
    return this.page.locator('#menuButton[data-initialized="true"]');
  }

  private get logoutOption(): Locator {
    return this.page.locator('#logoutOption');
  }

  // Navigation
  async goto() {
    await this.goToHomepage();
    await this.challengeLink.click();
    await this.waitForPageLoad();
  }

  // Actions
  async fillEmail(email: string) {
    await this.emailInput.fill(email);
  }

  async fillPassword(password: string) {
    await this.passwordInput.fill(password);
  }

  async fillLoginForm(email: string, password: string) {
    await this.fillEmail(email);
    await this.fillPassword(password);
  }

  /**
   * Wait for the submit button's CSS animation to complete
   *
   * Why locator.evaluate() instead of Playwright's Animation API:
   * - Challenge 2's button uses CSS transform animation (translateX)
   * - Playwright's page.waitForLoadState('networkidle') can't detect CSS animations
   * - We need the browser's native getAnimations() API to detect transform animations
   * - This ensures we only click when the button is truly ready (stable position)
   *
   * Technical details:
   * - The button slides across screen for 7 seconds (CSS @keyframes animation)
   * - getAnimations() correctly detects CSS transform/opacity animations
   * - Animation.finished is a Promise that resolves when animation completes
   * - If no animations are running, Promise.all([]) resolves immediately (idempotent)
   *
   * Alternative considered: page.waitForTimeout(7000)
   * - Rejected: Fragile, breaks if animation duration changes
   * - This approach is self-documenting and robust
   */
  async waitForButtonAnimation() {
    // eslint-disable-next-line playwright/no-eval
    await this.submitButton.evaluate(button => {
      const animations = button.getAnimations();
      return Promise.all(animations.map(animation => animation.finished));
    });
  }

  async clickSubmit() {
    await this.submitButton.click();
  }

  async submitForm() {
    await this.clickSubmit();
  }

  /**
   * Wait for menu button to be fully initialized after login
   * Why: After successful login, the menu button takes 1 second to initialize
   * We check for the data-initialized="true" attribute set by JavaScript
   */
  async waitForMenuButtonReady() {
    await expect(this.menuButton).toBeVisible();
    await this.menuButtonInitialized.waitFor({ state: 'attached' });
  }

  async clickMenuButton() {
    await this.menuButton.click();
  }

  async clickLogout() {
    await this.logoutOption.click();
  }

  async logout() {
    await this.clickMenuButton();
    await expect(this.logoutOption).toBeVisible();
    await this.clickLogout();
  }

  // Verifications
  async expectEmailVisible() {
    await expect(this.emailInput).toBeVisible();
  }

  async expectMenuButtonHidden() {
    await expect(this.menuButton).toBeHidden();
  }

  async verifyLogoutSuccess() {
    await this.expectEmailVisible();
    await this.expectMenuButtonHidden();
  }
}
