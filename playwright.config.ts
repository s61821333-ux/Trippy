import { defineConfig, devices } from '@playwright/test';

// fast_test  → npm run test:fast   (auto-runs after every Claude session)
// deep_test  → npm run test:deep   (manual only — full 360° audit)
// Both share the same base config; the CLI selects the file at invocation time.

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: 1,
  reporter: [['json', { outputFile: `test-results/results-${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}.json` }], ['list']],
  timeout: 120_000,
  use: {
    baseURL: 'http://localhost:3000',
    actionTimeout: 15_000,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  projects: [
    {
      name: 'iPhone 17 Chrome',
      use: {
        ...devices['iPhone 15'],
        viewport: { width: 393, height: 852 },
      },
    },
    {
      name: 'Desktop Chrome',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 120_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
