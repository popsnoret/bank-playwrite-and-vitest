import { defineConfig } from "@playwright/test";

const frontendURL = process.env.FRONTEND_URL || "http://127.0.0.1:3002";

export default defineConfig({
  testDir: ".",
  testMatch: "**/*.spec.js",
  testIgnore: "**/*.test.js",
  fullyParallel: false,
  timeout: 30_000,
  expect: {
    timeout: 10_000,
  },
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  use: {
    baseURL: frontendURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
});
