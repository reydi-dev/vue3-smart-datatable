import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  use: {
    baseURL: 'http://127.0.0.1:4183/vue3-smart-datatable/',
    launchOptions: {
      executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
    },
  },
  projects: [
    {
      name: 'chromium',
      testIgnore: 'public-demo.spec.ts',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'public-demo',
      testMatch: 'public-demo.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://127.0.0.1:4184/vue3-smart-datatable/',
      },
    },
  ],
  webServer: [
    {
      command: 'npm run dev -- --host 127.0.0.1 --port 4183 --strictPort',
      url: 'http://127.0.0.1:4183/vue3-smart-datatable/',
      reuseExistingServer: !process.env.CI,
    },
    {
      command:
        'npm run preview:demo -- --host 127.0.0.1 --port 4184 --strictPort',
      url: 'http://127.0.0.1:4184/vue3-smart-datatable/',
      reuseExistingServer: !process.env.CI,
    },
  ],
})
