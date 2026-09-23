// Jest config para Expo SDK 55 + React Native + TypeScript.
// Usa o preset jest-expo que configura transform, haste e mocks do RN.
//
// Documentacao:
// - jest-expo: https://docs.expo.dev/guides/testing-with-jest/
// - RNTL: https://callstack.github.io/react-native-testing-library/

module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEach: undefined,
  setupFiles: ['<rootDir>/jest.setup.js'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg))',
  ],
  testMatch: ['**/__tests__/**/*.test.{ts,tsx}'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.expo/',
  ],
  // Mock do expo-router (substitui por spies)
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
