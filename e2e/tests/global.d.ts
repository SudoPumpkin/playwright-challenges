/**
 * Global type declarations for the test suite
 * This file extends the Window interface to include custom properties used in the application
 */

declare global {
  interface Window {
    /**
     * Indicates whether the application has finished initializing in Challenge 4
     * Set to true after jQuery loads and event handlers are attached (500ms delay)
     */
    isAppReady: boolean;
  }
}

// This export statement is required to make this file a module
// Without it, the declare global won't work properly
export {};
