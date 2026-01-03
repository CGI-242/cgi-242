/**
 * Integration tests for Health endpoints
 * Tests /health, /health/live, /health/ready, /health/startup, /health/ping
 */

import request from 'supertest';
import { createApp } from '../../app';
import type { Express } from 'express';

describe('Health Endpoints', () => {
  let app: Express;

  beforeAll(() => {
    app = createApp();
  });

  describe('GET /health/ping', () => {
    it('should return pong', async () => {
      const response = await request(app)
        .get('/health/ping')
        .expect(200);

      expect(response.text).toBe('pong');
    });
  });

  describe('GET /health/live', () => {
    it('should return liveness check', async () => {
      const response = await request(app)
        .get('/health/live')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('uptime');
      expect(typeof response.body.uptime).toBe('number');
    });
  });

  describe('GET /health/ready', () => {
    it('should return readiness check', async () => {
      const response = await request(app).get('/health/ready');

      // May return 200 or 503 depending on DB connection
      expect([200, 503]).toContain(response.status);
      expect(response.body).toHaveProperty('ready');
      expect(response.body).toHaveProperty('checks');
      expect(response.body.checks).toHaveProperty('database');
      expect(response.body.checks).toHaveProperty('redis');
    });
  });

  describe('GET /health/startup', () => {
    it('should return startup check', async () => {
      const response = await request(app).get('/health/startup');

      // May return 200 or 503 depending on DB connection
      expect([200, 503]).toContain(response.status);
      expect(response.body).toHaveProperty('started');
      expect(response.body).toHaveProperty('duration');
    });
  });

  describe('GET /health', () => {
    it('should return full health report', async () => {
      const response = await request(app).get('/health');

      // May return 200 or 503 depending on services
      expect([200, 503]).toContain(response.status);
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('checks');
      expect(response.body).toHaveProperty('system');
      expect(response.body).toHaveProperty('services');

      // Check system info structure
      expect(response.body.system).toHaveProperty('memory');
      expect(response.body.system).toHaveProperty('cpu');

      // Check services structure
      expect(response.body.services).toHaveProperty('logging');
      expect(response.body.services).toHaveProperty('metrics');
      expect(response.body.services).toHaveProperty('sentry');
    });
  });
});
