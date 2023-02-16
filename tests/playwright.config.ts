import { defineConfig } from "@playwright/test";
import "../config.js";

export default defineConfig({
  use: {
    // All requests we send go to this API endpoint.
    baseURL: process.env.SERVICE_URL,
  },
});
