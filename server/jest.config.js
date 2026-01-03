/**
 * Jest configuration for backend tests
 * @type {import('jest').Config}
 */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/*.spec.ts',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/src/__tests__/setup.ts',
  ],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: '<rootDir>/tsconfig.json',
      isolatedModules: true,
    }],
  },
  moduleNameMapper: {
    // Handle .js extensions in imports (ESM compatibility)
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^@/(.*)$': '<rootDir>/src/$1',
    // Mock modules
    '^.*/utils/logger$': '<rootDir>/src/__mocks__/logger.ts',
    '^.*/utils/logger.js$': '<rootDir>/src/__mocks__/logger.ts',
    '^.*/services/redis.service$': '<rootDir>/src/__mocks__/redis.service.ts',
    '^.*/services/redis.service.js$': '<rootDir>/src/__mocks__/redis.service.ts',
    '^.*/services/health.service$': '<rootDir>/src/__mocks__/health.service.ts',
    '^.*/services/health.service.js$': '<rootDir>/src/__mocks__/health.service.ts',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/tests/**',
    '!src/scripts/**',
    '!src/archive/**',
    '!src/server.ts',
    '!src/__tests__/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  testTimeout: 30000,
  verbose: true,
  // Ignore node_modules except for specific ESM packages
  transformIgnorePatterns: [
    'node_modules/(?!(uuid)/)',
  ],
  // Clear mocks between tests
  clearMocks: true,
  // Detect open handles (async operations not cleaned up)
  detectOpenHandles: true,
};
