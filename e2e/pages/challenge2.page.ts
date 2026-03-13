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
   * Why: The button slides across the screen for 7 seconds before it's clickable
   * We use the browser's Animation API to detect precisely when animation ends
   */
  async waitForButtonAnimation() {
    // eslint-disable-next-line playwright/no-eval
    await this.submitButton.evaluate(button => {
      return new Promise<void>(resolve => {
        if (button.getAnimations().length === 0) {
          resolve();
        } else {
          button.addEventListener('animationend', () => resolve(), { once: true });
        }
      });
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
