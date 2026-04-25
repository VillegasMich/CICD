import { defineConfig } from "cypress";
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const rootEnvPath = resolve(dirname(fileURLToPath(import.meta.url)), "../.env");

function loadDotenv(path) {
  if (!existsSync(path)) return {};
  return Object.fromEntries(
    readFileSync(path, "utf8")
      .split("\n")
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const [key, ...rest] = line.split("=");
        return [
          key.trim(),
          rest
            .join("=")
            .trim()
            .replace(/^["']|["']$/g, ""),
        ];
      })
  );
}

const rootEnv = loadDotenv(rootEnvPath);

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:5173",
    specPattern: "e2e/**/*.cy.js",
    supportFile: false,
    defaultCommandTimeout: 10000,
    env: {
      API_URL: "http://localhost:8000",
      ADMIN_EMAIL: rootEnv.ADMIN_EMAIL,
      ADMIN_PASSWORD: rootEnv.ADMIN_PASSWORD,
    },
  },
});
