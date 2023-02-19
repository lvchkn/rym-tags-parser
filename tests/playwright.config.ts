import { defineConfig } from "@playwright/test";

export default defineConfig({
  reporter: "html",
  use: {
    baseURL: process.env.SERVICE_URL,
    trace: "on",
  },
});
