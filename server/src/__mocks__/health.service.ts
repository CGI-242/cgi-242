/**
 * Mock for Health Service
 * Used in integration tests to avoid database/Redis connections
 */

export const mockHealthService = {
  checkDatabase: jest.fn().mockResolvedValue({
    status: 'healthy',
    latency: 5,
  }),
  checkRedis: jest.fn().mockResolvedValue({
    status: 'healthy',
    latency: 2,
  }),
  checkQdrant: jest.fn().mockResolvedValue({
    status: 'healthy',
    latency: 10,
  }),
  getFullHealth: jest.fn().mockResolvedValue({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: 3600,
    checks: {
      database: { status: 'healthy', latency: 5 },
      redis: { status: 'healthy', latency: 2 },
      qdrant: { status: 'healthy', latency: 10 },
    },
    system: {
      memory: { used: 150000000, total: 500000000, percentage: 30 },
      cpu: { loadAverage: [0.5, 0.6, 0.7] },
    },
    services: {
      logging: 'active',
      metrics: 'active',
      sentry: 'inactive',
    },
  }),
  getLiveness: jest.fn().mockReturnValue({
    status: 'ok',
    uptime: 3600,
  }),
  getReadiness: jest.fn().mockResolvedValue({
    ready: true,
    checks: {
      database: { status: 'healthy', latency: 5 },
      redis: { status: 'healthy', latency: 2 },
    },
  }),
  getStartup: jest.fn().mockReturnValue({
    started: true,
    duration: 1500,
  }),
};

export const healthService = mockHealthService;
export default mockHealthService;
