/**
 * Mock for Winston logger
 */

export const createLogger = jest.fn(() => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
}));

export const httpLogger = {
  write: jest.fn(),
};

export const getLogStats = jest.fn(() => ({
  totalLogs: 0,
  errorCount: 0,
  warnCount: 0,
}));
