/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.[jt]sx?$": "babel-jest",
  },
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "<rootDir>/src/__mocks__/fileMock.cjs",
  },
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.js"],
  testPathIgnorePatterns: ["/node_modules/", "/cypress/", "/e2e/"],
};
