#!/usr/bin/env node
/**
 * Stop server script that reads PORT from .env file
 * This ensures we stop the server on the correct port, even if PORT is customized
 */
require('dotenv').config();
const { execSync } = require('child_process');

const port = process.env.PORT || 3000;

try {
  execSync(`lsof -t -i :${port} | xargs kill -9`, { stdio: 'inherit' });
  console.log(`✅ Server on port ${port} stopped successfully`);
} catch (error) {
  console.log(`ℹ️  No server running on port ${port}`);
  process.exit(0);
}
