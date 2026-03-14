# Playwright Testing Challenges

A practical repository for learning how to handle tricky UI testing scenarios with Playwright. Each challenge focuses on real-world timing issues and requires fixing flaky tests to make them robust and reliable.

## 🚀 Quick Start

```bash
# Clone and install
git clone https://github.com/SudoPumpkin/playwright-challenges.git
cd playwright-challenges
npm install

# Run tests
npm test
```

**Prerequisites:** Node.js v18 or higher

## 📚 Documentation

- **[Setup Guide](docs/SETUP.md)** - Environment configuration, scripts, and customization
- **[Challenges](docs/CHALLENGES.md)** - Detailed challenge descriptions and solutions
- **[Architecture](docs/ARCHITECTURE.md)** - Project structure and design patterns
- **[CI/CD](docs/CI_CD.md)** - GitHub Actions setup and deployment

## 🎯 The Challenges

| Challenge | Focus Area | Key Learning |
|-----------|-----------|-------------|
| **Challenge 1** | Form Reset Timing | Waiting for dynamic content to reset |
| **Challenge 2** | Animations | Handling CSS animations without static waits |
| **Challenge 3** | Form Transitions | Managing DOM state changes |
| **Challenge 4** | Script Loading | Dealing with deferred scripts and event handlers |

## 🧪 Running Tests

```bash
# Run all tests
npx playwright test

# Run specific challenge
npx playwright test --grep "@c1"  # Challenge 1
npx playwright test --grep "@c2"  # Challenge 2

# Headless mode (faster)
npm run test:chromium-headless

# Headed mode (see browser)
npm test
```

## 🏗️ Project Structure

```
playwright-challenges/
├── e2e/
│   ├── pages/          # Page Object classes (optional pattern)
│   └── tests/
│       ├── flaky.spec.ts      # Main test suite
│       └── helpers/           # Test helper classes
├── public/             # Challenge HTML pages
├── docs/               # Detailed documentation
├── playwright.config.ts
└── server.js
```

## 💡 Key Learnings

This project demonstrates:
- ✅ **No static waits** - Smart waiting strategies instead of `page.waitForTimeout()`
- ✅ **Animation handling** - Using browser APIs to detect animation completion
- ✅ **State management** - Checking global variables and element attributes
- ✅ **Hybrid locators** - Semantic selectors for accessibility + IDs for containers
- ✅ **Helper classes** - Keeping tests clean and maintainable
- ✅ **CI/CD ready** - Reliable execution in containerized environments


## 📄 License

MIT License - feel free to use this for learning and practice.

---

**Need more detail?** Check out the [full documentation](docs/SETUP.md) in the `docs/` folder.
