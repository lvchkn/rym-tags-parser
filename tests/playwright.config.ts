import { defineConfig } from "@playwright/test";

export default defineConfig({
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: process.env.SERVICE_URL,
    trace: "on",
  },
});
