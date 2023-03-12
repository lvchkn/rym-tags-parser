import { defineConfig } from "@playwright/test";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

export default defineConfig({
  globalSetup: require.resolve("./global-setup"),
  globalTeardown: require.resolve("./global-teardown"),
  reporter: "html",
  use: {
    trace: "on",
  },
});
