import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 120000,
  use: {
    baseURL: 'http://127.0.0.1:3000',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run build && npm run start -- --hostname 127.0.0.1 --port 3000',
    reuseExistingServer: !process.env.CI,
    timeout: 240000,
    url: 'http://127.0.0.1:3000',
  },
});
