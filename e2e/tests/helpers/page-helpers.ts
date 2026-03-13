import { Page, expect } from '@playwright/test';
import { selectors } from './selectors';

/**
 * Helper functions for Challenge 1 - Login multiple times
 * Why: Encapsulating all Challenge 1 actions in a class keeps the test file clean
 * and makes the test logic reusable across multiple test files if needed
 */
export class Challenge1Helpers {
  constructor(private page: Page) {}

  /**
   * Navigate to Challenge 1 page
   * @returns Promise that resolves when navigation is complete
   */
  async navigate() {
    // Why: Navigate to the homepage first, then click the specific challenge link
    // This ensures we start from a known state and mimics real user behavior
    await this.page.goto('/');
    await this.page.getByRole('link', { name: selectors.nav.challenge1 }).click();
  }

  /**
   * Fill login form and submit
   * @param email - User email address
   * @param password - User password
   * @returns Promise that resolves when form is submitted
   */
  async login(email: string, password: string) {
    // Why: Fill form fields and click submit - standard login flow
    // Using .fill() is fast enough here because there are no timing issues in Challenge 1
    await this.page.locator(selectors.challenge1.email).fill(email);
    await this.page.locator(selectors.challenge1.password).fill(password);
    await this.page.locator(selectors.challenge1.submitButton).click();
  }

  /**
   * Verify the success message appears with correct user data
   * @param email - Expected email in success message
   * @param password - Expected password in success message
   * @returns Promise that resolves when all assertions pass
   */
  async verifySuccessMessage(email: string, password: string) {
    // Why: Multiple assertions ensure the success message contains all expected data
    // We verify: 1) message is visible, 2) contains success text, 3) shows correct email, 4) shows correct password
    const successMessage = this.page.locator(selectors.challenge1.successMessage);
    await expect(successMessage).toBeVisible();
    await expect(successMessage).toContainText('Successfully submitted!');
    await expect(successMessage).toContainText(`Email: ${email}`);
    await expect(successMessage).toContainText(`Password: ${password}`);
  }

  /**
   * Wait for the form to reset before next login attempt
   * @returns Promise that resolves when form is cleared and ready for next input
   */
  async waitForFormReset() {
    // Why: Challenge 1 auto-resets the form after each submission
    // We must wait for the success message to disappear and form to clear before the next login
    // Without this wait, subsequent logins would fail because the form isn't ready
    const successMessage = this.page.locator(selectors.challenge1.successMessage);
    const emailInput = this.page.locator(selectors.challenge1.email);
    await expect(successMessage).toBeHidden();
    await expect(emailInput).toHaveValue('');
  }
}

/**
 * Helper functions for Challenge 2 - Animated form
 * Why: Challenge 2 has TWO timing challenges: a 7-second button animation and 1-second menu initialization
 * We need specialized methods to handle both animations without using static waits
 */
export class Challenge2Helpers {
  constructor(private page: Page) {}

  async navigate() {
    // Why: Same navigation pattern as Challenge 1 for consistency
    await this.page.goto('/');
    await this.page.getByRole('link', { name: selectors.nav.challenge2 }).click();
  }

  async fillLoginForm(email: string, password: string) {
    // Why: Separated from submission because we need to wait for animation AFTER filling but BEFORE clicking
    // This separation gives us control over the timing of each step
    await this.page.locator(selectors.challenge2.email).fill(email);
    await this.page.locator(selectors.challenge2.password).fill(password);
  }

  async waitForButtonAnimation() {
    // Why: The submit button has a 7-second CSS animation that slides it across the screen
    // We use evaluate() to access the browser's Animation API to detect when animation completes
    // This is better than a static wait because it's precise and returns immediately when animation ends
    // Note: We can't rely on Playwright's built-in actionability checks here because the button
    // is visible and attached to DOM during animation, but not in the correct position to click.
    // Using the animationend event is the most reliable way to wait for CSS animations.
    const submitButton = this.page.locator(selectors.challenge2.submitButton);
    // eslint-disable-next-line playwright/no-eval
    await submitButton.evaluate(button => {
      return new Promise<void>(resolve => {
        if (button.getAnimations().length === 0) {
          // Why: If no animations are running, resolve immediately (already animated)
          resolve();
        } else {
          // Why: Listen for the 'animationend' event to know precisely when animation finishes
          // 'once: true' ensures the listener is removed after firing to prevent memory leaks
          button.addEventListener('animationend', () => resolve(), { once: true });
        }
      });
    });
  }

  async submitForm() {
    // Why: Click happens AFTER animation completes to ensure button is in correct position and clickable
    await this.page.locator(selectors.challenge2.submitButton).click();
  }

  async waitForMenuButtonReady() {
    // Why: After successful login, the menu button appears but takes 1 second to initialize
    // We check for both visibility AND the data-initialized="true" attribute
    // The attribute is set by JavaScript after the 1-second delay, indicating it's safe to click
    const menuButton = this.page.locator(selectors.challenge2.menuButton);
    await expect(menuButton).toBeVisible();
    await this.page.locator(selectors.challenge2.menuButtonInitialized).waitFor({ state: 'attached' });
  }

  async logout() {
    // Why: Click menu button to open dropdown, verify logout option appears, then click it
    // The visibility check prevents clicking before the dropdown is fully rendered
    await this.page.locator(selectors.challenge2.menuButton).click();
    const logoutOption = this.page.locator(selectors.challenge2.logoutOption);
    await expect(logoutOption).toBeVisible();
    await logoutOption.click();
  }

  async verifyLogoutSuccess() {
    // Why: Verify logout worked by checking the UI returned to the initial state
    // Email field visible = back to login form, menu button hidden = user logged out
    await expect(this.page.locator(selectors.challenge2.email)).toBeVisible();
    await expect(this.page.locator(selectors.challenge2.menuButton)).toBeHidden();
  }
}

/**
 * Helper functions for Challenge 3 - Forgot password
 * Why: Challenge 3 tests form transitions - the same form changes from Login to Reset Password
 * We need to wait for DOM changes before interacting with the new form state
 */
export class Challenge3Helpers {
  constructor(private page: Page) {}

  async navigate() {
    // Why: Standard navigation pattern
    await this.page.goto('/');
    await this.page.getByRole('link', { name: selectors.nav.challenge3 }).click();
  }

  async clickForgotPassword() {
    // Why: Clicking the "Forgot Password?" link triggers a form transition
    // We use getByRole('button') because it's the most accessible and reliable selector
    await this.page.getByRole('button', { name: selectors.challenge3.forgotPasswordButton }).click();
  }

  async waitForResetPasswordForm() {
    // Why: The form heading changes from "Login" to "Reset Password" during the transition
    // We wait for the new heading to appear before trying to interact with the form
    // Without this wait, we might try to fill the email field before the form is ready
    await expect(this.page.getByRole('heading', { name: selectors.challenge3.resetPasswordHeading })).toBeVisible();
  }

  async fillEmailAndSubmit(email: string) {
    // Why: Fill the email field in the NEW reset password form (not the original login form)
    // Then click the "Reset Password" button to submit
    await this.page.locator(selectors.challenge3.email).fill(email);
    await this.page.getByRole('button', { name: selectors.challenge3.resetPasswordButton }).click();
  }

  async verifySuccessMessage(email: string) {
    // Why: Verify the success page appears with correct heading and confirmation message
    // We check the heading changed to "Success!" and the email is displayed in the message
    const mainContent = this.page.locator(selectors.challenge3.mainContent);
    await expect(this.page.getByRole('heading', { name: selectors.challenge3.successHeading })).toBeVisible();
    await expect(mainContent).toContainText('Password reset link sent!');
    await expect(mainContent).toContainText(`Email: ${email}`);
  }
}

/**
 * Helper functions for Challenge 4 - Global ready state
 * Why: Challenge 4 tests dynamic script loading - jQuery loads with defer attribute
 * Event handlers are attached AFTER window.isAppReady becomes true (500ms delay)
 * This is the trickiest challenge because we need BOTH checks: global variable AND slow typing
 */
export class Challenge4Helpers {
  constructor(private page: Page) {}

  async navigate() {
    // Why: Standard navigation pattern
    await this.page.goto('/');
    await this.page.getByRole('link', { name: selectors.nav.challenge4 }).click();
  }

  async waitForAppReady() {
    // Why: Check the global window.isAppReady variable that the app sets after jQuery loads
    // The app has a 500ms initialization delay before setting this to true
    // We also verify the email input is enabled to ensure the form is interactive
    // This double-check prevents race conditions where isAppReady is true but handlers aren't attached yet

    // Wait for the global isAppReady flag with increased timeout
    // Increased from default 5s to 10s to handle rare slow script execution in CI/CD
    // This is more reliable than networkidle which can cause long waits in CI environments
    await this.page.waitForFunction(() => window.isAppReady === true, { timeout: 10000 });
    await expect(this.page.locator(selectors.challenge4.email)).toBeEnabled();
  }

  async login(email: string, password: string) {
    // Why: Use pressSequentially() with 50ms delay instead of fill()
    // Even though isAppReady is true, there's a tiny window where input handlers might not be fully attached
    // Typing slowly (like a real user) gives the event handlers time to fully initialize
    // This was discovered through flaky test debugging - fill() was too fast and caused intermittent failures
    // The 50ms delay is the minimum needed for stability without slowing tests significantly
    await this.page.locator(selectors.challenge4.email).pressSequentially(email, { delay: 50 });
    await this.page.locator(selectors.challenge4.password).pressSequentially(password, { delay: 50 });
    await this.page.locator(selectors.challenge4.submitButton).click();
  }

  async verifyLoginSuccess() {
    // Why: Verify login worked by checking three things:
    // 1) User profile section is now visible (was hidden before login)
    // 2) Profile button is visible (contains user email)
    // 3) Login form is hidden (UI switched from login to profile view)
    await expect(this.page.locator(selectors.challenge4.userProfile)).toBeVisible();
    await expect(this.page.locator(selectors.challenge4.profileButton)).toBeVisible();
    await expect(this.page.locator(selectors.challenge4.loginForm)).toBeHidden();
  }

  async logout() {
    // Why: Click profile button to open dropdown, verify logout option appears, then click it
    // The visibility check ensures the dropdown menu is fully rendered before clicking
    await this.page.locator(selectors.challenge4.profileButton).click();
    await expect(this.page.locator(selectors.challenge4.logoutButton)).toBeVisible();
    await this.page.locator(selectors.challenge4.logoutButton).click();
  }

  async verifyLogoutSuccess() {
    // Why: Verify logout worked by checking the UI returned to the initial login state
    // Login form visible = back to login screen, user profile hidden = user logged out
    await expect(this.page.locator(selectors.challenge4.loginForm)).toBeVisible();
    await expect(this.page.locator(selectors.challenge4.userProfile)).toBeHidden();
  }
}
