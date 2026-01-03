/**
 * Mock for Redis Service
 * Used in integration tests to avoid Redis connections
 */

export const mockRedisService = {
  isAvailable: jest.fn().mockReturnValue(true),
  get: jest.fn().mockResolvedValue(null),
  set: jest.fn().mockResolvedValue('OK'),
  del: jest.fn().mockResolvedValue(1),
  exists: jest.fn().mockResolvedValue(0),
  expire: jest.fn().mockResolvedValue(1),
  ttl: jest.fn().mockResolvedValue(-1),
  incr: jest.fn().mockResolvedValue(1),
  ping: jest.fn().mockResolvedValue('PONG'),
  getClient: jest.fn().mockReturnValue({
    ping: jest.fn().mockResolvedValue('PONG'),
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue('OK'),
    del: jest.fn().mockResolvedValue(1),
    call: jest.fn().mockResolvedValue('OK'),
  }),
};

export const redisService = mockRedisService;
export default mockRedisService;

// Cache prefixes
export const CACHE_PREFIX = {
  EMBEDDING: 'emb:',
  SEARCH: 'search:',
  QUOTA: 'quota:',
  SESSION: 'session:',
};

// Cache TTL
export const CACHE_TTL = {
  EMBEDDING: 60 * 60 * 24 * 7,
  SEARCH_RESULT: 60 * 60,
  QUOTA: 60 * 5,
};
