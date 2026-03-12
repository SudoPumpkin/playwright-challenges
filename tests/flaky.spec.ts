import { test } from '@playwright/test';
import { Challenge1Helpers, Challenge2Helpers, Challenge3Helpers, Challenge4Helpers } from './helpers/page-helpers';

// Challenge 1: Test logging in 3 times in a row without page refresh
// Each login should display a success message, then the form should reset automatically
test('Login multiple times successfully @c1', async ({ page }) => {
  const helper = new Challenge1Helpers(page);
  await helper.navigate();

  // Loop through 3 login attempts to verify the form can handle multiple submissions
  for (let i = 1; i <= 3; i++) {
    await helper.login(`test${i}@example.com`, `password${i}`);
    await helper.verifySuccessMessage(`test${i}@example.com`, `password${i}`);
    // Wait for the success message to disappear and form to reset before next login
    await helper.waitForFormReset();
  }
});

// Challenge 2: Test a form with an animated submit button and delayed menu initialization
// The submit button has a 7-second slide animation before it can be clicked
// After login, the menu button takes 1 second to initialize before it's clickable
test('Login animated form and logout successfully @c2', async ({ page }) => {
  const helper = new Challenge2Helpers(page);
  await helper.navigate();

  await helper.fillLoginForm('test1@example.com', 'password1');

  // Wait for the submit button's slide animation to finish
  // The button slides from left to right over 7 seconds and is only clickable after animation completes
  await helper.waitForButtonAnimation();
  await helper.submitForm();

  // Wait for the menu button to become fully initialized and clickable
  // After successful login, there's a 1-second delay before the menu button is ready
  // We check for the data-initialized="true" attribute which signals it's safe to click
  await helper.waitForMenuButtonReady();

  await helper.logout();

  // Verify the user is logged out by checking the login form is visible again
  await helper.verifyLogoutSuccess();
});

// Challenge 3: Test the forgot password flow with form transitions
// The form changes from "Login" to "Reset Password" when clicking the forgot password link
test('Forgot password @c3', async ({ page }) => {
  const helper = new Challenge3Helpers(page);
  await helper.navigate();

  await helper.clickForgotPassword();

  // Wait for the form to transition from the login form to the password reset form
  // The heading changes from "Login" to "Reset Password" during this transition
  await helper.waitForResetPasswordForm();

  // Fill in the email field in the password reset form and submit it
  await helper.fillEmailAndSubmit('test@example.com');

  // Verify the success page appears with confirmation message
  await helper.verifySuccessMessage('test@example.com');
});

// Challenge 4: Test login when the app uses dynamic script loading
// jQuery is loaded with a defer attribute and takes 500ms to initialize
// The form submission handlers are only attached after isAppReady becomes true
test('Login and logout @c4', async ({ page }) => {
  const helper = new Challenge4Helpers(page);
  await helper.navigate();

  // Wait for the jQuery library to load and the app to finish initialization
  // We check the global window.isAppReady variable which becomes true after 500ms
  // Also verify the email input is enabled before proceeding
  await helper.waitForAppReady();

  // Type the email and password with a small delay between keystrokes
  // This gives the form handlers time to fully attach after initialization
  await helper.login('test@example.com', 'password');

  // Verify the login was successful by checking the user profile is now visible
  await helper.verifyLoginSuccess();

  await helper.logout();

  // Verify the logout worked by checking the login form is visible again
  await helper.verifyLogoutSuccess();
});
