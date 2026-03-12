/**
 * Centralized selectors for all challenge pages
 * This makes tests more maintainable and reduces duplication
 */

export const selectors = {
  // Navigation
  nav: {
    challenge1: 'Challenge 1',
    challenge2: 'Challenge 2',
    challenge3: 'Challenge 3',
    challenge4: 'Challenge 4',
  },

  // Challenge 1 - Login multiple times
  challenge1: {
    email: '#email',
    password: '#password',
    submitButton: '#submitButton',
    successMessage: '#successMessage',
  },

  // Challenge 2 - Animated form
  challenge2: {
    email: '#email',
    password: '#password',
    submitButton: '#submitButton',
    menuButton: '#menuButton',
    menuButtonInitialized: '#menuButton[data-initialized="true"]',
    logoutOption: '#logoutOption',
  },

  // Challenge 3 - Forgot password
  challenge3: {
    email: '#email',
    forgotPasswordButton: 'Forgot Password?',
    resetPasswordButton: 'Reset Password',
    resetPasswordHeading: 'Reset Password',
    successHeading: 'Success!',
    mainContent: '#mainContent',
  },

  // Challenge 4 - Global ready state
  challenge4: {
    email: '#email',
    password: '#password',
    submitButton: '#submitButton',
    userProfile: '#userProfile',
    profileButton: '#profileButton',
    loginForm: '#loginForm',
    logoutButton: 'Logout',
  },
};
