# Challenges & Solutions

## Overview

Each challenge focuses on a specific UI testing scenario that commonly causes flaky tests. The goal is to understand WHY tests fail and implement robust solutions without using static waits.

## Challenge 1: Multiple Login Tests (@c1)

### Scenario
- Test multiple successful login attempts in sequence
- Verify success messages display correct user data
- Handle dynamic form resets

### The Problem
Tests failed when running multiple logins because they didn't wait for the form to reset between submissions.

### The Solution
Added `waitForFormReset()` that waits for:
1. Success message to disappear
2. Email field to clear

**Key Code:**
```typescript
async waitForFormReset() {
  const successMessage = this.page.locator(selectors.challenge1.successMessage);
  const emailInput = this.page.locator(selectors.challenge1.email);
  await expect(successMessage).toBeHidden();
  await expect(emailInput).toHaveValue('');
}
```

### Key Learnings
- Don't assume UI is ready just because an element disappears
- Verify multiple state indicators before proceeding
- Form resets can be asynchronous

---

## Challenge 2: Animated Form (@c2)

### Scenario
- Test login with CSS-animated submit button (7-second slide animation)
- Handle 1-second menu button initialization delay after login
- Test logout functionality through dropdown menu

### The Problems
1. **Animation**: Submit button slides across screen for 7 seconds - clicking during animation fails
2. **Initialization**: Menu button appears but isn't clickable for 1 second

### The Solutions

#### 1. Button Animation
Use browser's native Animation API instead of static waits:

```typescript
async waitForButtonAnimation() {
  const submitButton = this.page.locator(selectors.challenge2.submitButton);
  await submitButton.evaluate(async button => {
    const animations = button.getAnimations();
    await Promise.all(animations.map(animation => animation.finished));
  });
}
```

#### 2. Menu Initialization
Check for `data-initialized="true"` attribute:

```typescript
async waitForMenuButtonReady() {
  const menuButton = this.page.locator(selectors.challenge2.menuButton);
  await expect(menuButton).toBeVisible();
  await this.page.locator(selectors.challenge2.menuButtonInitialized).waitFor({ state: 'attached' });
}
```

### Key Learnings
- Playwright's built-in actionability checks can't detect CSS transform animations
- `Animation.finished` is a Promise that resolves when animations complete
- If no animations are running, `Promise.all([])` resolves immediately (idempotent)
- Check for initialization flags/attributes, not just visibility

---

## Challenge 3: Forgot Password Flow (@c3)

### Scenario
- Test "Forgot Password" link click
- Handle form transition from Login → Reset Password
- Verify success message with correct email

### The Problem
The same form element changes from "Login" to "Reset Password", causing confusion about when to interact with the new form state.

### The Solution
Wait for the heading to change before interacting:

```typescript
async waitForResetPasswordForm() {
  await expect(
    this.page.getByRole('heading', { name: selectors.challenge3.resetPasswordHeading })
  ).toBeVisible();
}
```

### Key Learnings
- DOM elements can transform instead of being replaced
- Use heading/title changes as reliable indicators of state transitions
- Wait for the NEW state to be fully rendered before interacting

---

## Challenge 4: Application State (@c4)

### Scenario
- jQuery loads with `defer` attribute
- Event handlers attach 500ms after script loads
- Test login and logout with profile dropdown

### The Problem
**The trickiest challenge!** jQuery loads dynamically, and event handlers aren't attached immediately. Using `.fill()` was too fast, causing intermittent failures.

### The Solution
**Two-part approach:**

#### 1. Check Global Ready State
```typescript
async waitForAppReady() {
  await this.page.waitForFunction(() => window.isAppReady === true, { timeout: 10000 });
  await expect(this.page.locator(selectors.challenge4.email)).toBeEnabled();
}
```

#### 2. Type Slowly (Like a Real User)
```typescript
async login(email: string, password: string) {
  await this.page.locator(selectors.challenge4.email).pressSequentially(email, { delay: 50 });
  await this.page.locator(selectors.challenge4.password).pressSequentially(password, { delay: 50 });
  await this.page.locator(selectors.challenge4.submitButton).click();
}
```

### Key Learnings
- Even after global state indicates "ready", there can be race conditions
- `pressSequentially()` with 50ms delay mimics real user behavior
- `.fill()` is instant and can outpace event handler attachment
- This was discovered through flaky test debugging - the 50ms delay is the minimum needed for stability

---

## Best Practices Demonstrated

### 1. No Static Waits
❌ **Bad:**
```typescript
await page.waitForTimeout(7000); // Fragile, breaks if timing changes
```

✅ **Good:**
```typescript
await submitButton.evaluate(async button => {
  const animations = button.getAnimations();
  await Promise.all(animations.map(animation => animation.finished));
});
```

### 2. Multiple Verification Points
❌ **Bad:**
```typescript
await expect(successMessage).toBeVisible();
```

✅ **Good:**
```typescript
await expect(successMessage).toBeVisible();
await expect(successMessage).toContainText('Successfully submitted!');
await expect(successMessage).toContainText(`Email: ${email}`);
```

### 3. Attribute-Based State Checks
❌ **Bad:**
```typescript
await page.waitForTimeout(1000); // Hope it's initialized
```

✅ **Good:**
```typescript
await page.locator('#menuButton[data-initialized="true"]').waitFor({ state: 'attached' });
```

### 4. Global State Verification
❌ **Bad:**
```typescript
await page.waitForLoadState('networkidle'); // Doesn't detect script loading
```

✅ **Good:**
```typescript
await page.waitForFunction(() => window.isAppReady === true);
```

---

## Testing Strategies Summary

| Challenge | Key Strategy | Why It Works |
|-----------|-------------|--------------|
| **Challenge 1** | Wait for multiple indicators | Ensures form is truly reset |
| **Challenge 2** | Animation API + attribute checks | Precise timing without static waits |
| **Challenge 3** | Heading-based state verification | Reliable indicator of DOM transition |
| **Challenge 4** | Global state + slow typing | Handles async script loading and event attachment |

---

[← Back to Main README](../README.md) | [← Previous: CI_CD](CI_CD.md) | [Next: Architecture →](ARCHITECTURE.md)
