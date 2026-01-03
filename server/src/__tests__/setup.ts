/**
 * Jest setup file for backend tests
 * Configures test environment and mocks
 */

// Set test environment FIRST - before any imports
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-for-testing-only-32chars';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-for-testing-only';
process.env.COOKIE_SECRET = 'test-cookie-secret-32-characters';
process.env.FRONTEND_URL = 'http://localhost:4200';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.SENTRY_DSN = '';
process.env.CSRF_ENABLED = 'false';

// Mock Prisma Client
jest.mock('@prisma/client', () => {
  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    organization: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    subscription: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      upsert: jest.fn(),
    },
    conversation: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    message: {
      findMany: jest.fn(),
      create: jest.fn(),
      deleteMany: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    $connect: jest.fn().mockResolvedValue(undefined),
    $disconnect: jest.fn().mockResolvedValue(undefined),
    $queryRaw: jest.fn().mockResolvedValue([{ '1': 1 }]),
    $transaction: jest.fn().mockImplementation((fn) => {
      if (typeof fn === 'function') {
        return fn(mockPrisma);
      }
      return Promise.all(fn);
    }),
    $use: jest.fn(),
    $on: jest.fn(),
    $extends: jest.fn().mockReturnThis(),
  };

  return {
    PrismaClient: jest.fn(() => mockPrisma),
  };
});

// Mock ioredis
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    ping: jest.fn().mockResolvedValue('PONG'),
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue('OK'),
    del: jest.fn().mockResolvedValue(1),
    exists: jest.fn().mockResolvedValue(0),
    expire: jest.fn().mockResolvedValue(1),
    ttl: jest.fn().mockResolvedValue(-1),
    incr: jest.fn().mockResolvedValue(1),
    call: jest.fn().mockResolvedValue('OK'),
    on: jest.fn(),
    connect: jest.fn().mockResolvedValue(undefined),
    disconnect: jest.fn().mockResolvedValue(undefined),
    quit: jest.fn().mockResolvedValue('OK'),
    status: 'ready',
  }));
});

// Mock Sentry
jest.mock('@sentry/node', () => ({
  init: jest.fn(),
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  setUser: jest.fn(),
  startSpan: jest.fn((_, fn) => fn({ setStatus: jest.fn() })),
  setupExpressErrorHandler: jest.fn(),
}));

// Global test timeout
jest.setTimeout(30000);

// Suppress console during tests (optional - comment out for debugging)
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
//   error: jest.fn(),
// };

// Clean up after all tests
afterAll(async () => {
  // Close any open handles
  await new Promise(resolve => setTimeout(resolve, 100));
});
