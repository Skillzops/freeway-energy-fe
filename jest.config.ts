export default {
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },

  globals: {
    "ts-jest": {
      tsconfig: "./tsconfig.jest.json",
    },
  },

  moduleNameMapper: {
    "\\.(css|less|sass|scss)$": "identity-obj-proxy",
    "^.+\\.svg$": "jest-transformer-svg",
    "^@/(.*)$": "<rootDir>/src/$1",
    "^.+\\.(jpg|jpeg|png|gif|webp)$": "<rootDir>/fileMock.ts",
  },

  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
};
