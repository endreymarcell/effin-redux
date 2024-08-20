import { defineConfig, devices } from "@playwright/test";
import { devServerLocation } from "./vite.config";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: devServerLocation.fullUrl,
    trace: "on-first-retry",
  },
  projects: [{ name: "firefox", use: { ...devices["Desktop Firefox"] } }],
  webServer: {
    command: "pnpm run dev",
    url: devServerLocation.fullUrl,
    reuseExistingServer: !process.env.CI,
  },
});
