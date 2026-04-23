import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:5173",
    specPattern: "e2e/**/*.cy.js",
    supportFile: false,
    defaultCommandTimeout: 10000,
    env: {
      API_URL: "http://localhost:8000",
    },
  },
});
