module.exports = {
  setupFilesAfterEnv: ["<rootDir>/src/tests/setupJest.ts"],
  roots: ["<rootDir>/src"],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  watchPathIgnorePatterns: ["<rootDir>/src/tests/fake.style.ts"],
  coverageThreshold: {
    global: {
      statements: 100,
    },
  },
};
