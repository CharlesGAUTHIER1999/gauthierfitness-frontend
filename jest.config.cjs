// Jest config for the frontend test suite (unit + component tests).
// Vite is used for dev/build; Jest is only for tests.
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.cjs'],
  moduleNameMapper: {
    // CSS / asset imports → identity proxy (no real CSS in JSDOM)
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(png|jpg|jpeg|gif|webp|svg)$': '<rootDir>/__mocks__/fileMock.cjs',
  },
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  testMatch: [
    '<rootDir>/src/**/*.test.{js,jsx}',
    '<rootDir>/tests/**/*.test.{js,jsx}',
  ],
  // import.meta.env shim for axios.js (which reads VITE_API_URL)
  globals: {
    'import.meta': { env: { VITE_API_URL: '', VITE_STRIPE_PUBLIC_KEY: 'pk_test_dummy' } },
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/main.jsx',
    '!src/**/*.test.{js,jsx}',
  ],
};
