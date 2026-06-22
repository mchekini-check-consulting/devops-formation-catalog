/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
module.exports = {
  testRunner: 'jest',
  jest: {
    configFile: undefined,
    config: {
      testMatch: ['<rootDir>/tests/**/*.test.js'],
      testPathIgnorePatterns: ['tests/integration'],
    },
  },
  mutate: ['src/**/*.js', '!src/config/**'],
  reporters: ['clear-text', 'html', 'json'],
  thresholds: { high: 80, low: 60, break: 60 },
  coverageAnalysis: 'perTest',
  timeoutMS: 30000,
};
