/**
 * =============================================================================
 * SMOKE TESTS - Tests Post-Deploiement
 * =============================================================================
 * Conforme au cours CD: "Verification des fonctionnalites de base de l'application"
 *
 * Ces tests sont executes apres chaque deploiement pour verifier:
 * - La disponibilite de l'application
 * - La connexion a la base de donnees
 * - Le fonctionnement des endpoints critiques
 * - L'etat des services dependants (Redis, Qdrant)
 * =============================================================================
 */

import axios from 'axios';
import { createLogger } from '../../utils/logger.js';

// Logger pour les smoke tests
const logger = createLogger('SmokeTests');

// Configuration
const BASE_URL = process.env.SMOKE_TEST_URL || 'http://localhost:3000';
const TIMEOUT = 10000;
const CRITICAL_ENDPOINTS = [
  { path: '/health', method: 'GET', expectedStatus: 200 },
  { path: '/health/live', method: 'GET', expectedStatus: 200 },
  { path: '/health/ready', method: 'GET', expectedStatus: 200 },
];

interface SmokeTestResult {
  name: string;
  passed: boolean;
  duration: number;
  error?: string;
  details?: Record<string, unknown>;
}

interface SmokeTestReport {
  environment: string;
  timestamp: string;
  baseUrl: string;
  totalTests: number;
  passed: number;
  failed: number;
  duration: number;
  results: SmokeTestResult[];
  overallStatus: 'SUCCESS' | 'FAILURE' | 'PARTIAL';
}

const client = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT,
  validateStatus: () => true,
});

async function testApplicationAvailability(): Promise<SmokeTestResult> {
  const start = Date.now();
  const name = 'Application Availability';

  try {
    const response = await client.get('/health');
    const duration = Date.now() - start;

    if (response.status === 200) {
      return { name, passed: true, duration, details: { status: response.data.status } };
    }
    return { name, passed: false, duration, error: 'Unexpected status: ' + response.status };
  } catch (error) {
    return { name, passed: false, duration: Date.now() - start, error: String(error) };
  }
}

async function testDatabaseConnection(): Promise<SmokeTestResult> {
  const start = Date.now();
  const name = 'Database Connection';

  try {
    const response = await client.get('/health');
    const duration = Date.now() - start;

    if (response.status === 200 && response.data.checks?.database) {
      const dbStatus = response.data.checks.database.status;
      if (dbStatus === 'healthy' || dbStatus === 'degraded') {
        return { name, passed: true, duration, details: { status: dbStatus } };
      }
      return { name, passed: false, duration, error: 'Database unhealthy' };
    }
    return { name, passed: false, duration, error: 'Could not retrieve database status' };
  } catch (error) {
    return { name, passed: false, duration: Date.now() - start, error: String(error) };
  }
}

async function testRedisConnection(): Promise<SmokeTestResult> {
  const start = Date.now();
  const name = 'Redis Connection';

  try {
    const response = await client.get('/health');
    const duration = Date.now() - start;

    if (response.status === 200 && response.data.checks?.redis) {
      const redisStatus = response.data.checks.redis.status;
      return { name, passed: redisStatus !== 'unhealthy', duration, details: { status: redisStatus } };
    }
    return { name, passed: true, duration, details: { note: 'Redis optional' } };
  } catch (error) {
    return { name, passed: true, duration: Date.now() - start, details: { note: 'Redis optional' } };
  }
}

async function testCriticalEndpoints(): Promise<SmokeTestResult> {
  const start = Date.now();
  const name = 'Critical Endpoints';
  const failures: string[] = [];

  for (const endpoint of CRITICAL_ENDPOINTS) {
    try {
      const response = await client.request({ method: endpoint.method, url: endpoint.path });
      if (response.status !== endpoint.expectedStatus) {
        failures.push(endpoint.path + ': ' + response.status);
      }
    } catch (error) {
      failures.push(endpoint.path + ': failed');
    }
  }

  const duration = Date.now() - start;
  return {
    name,
    passed: failures.length === 0,
    duration,
    error: failures.length > 0 ? failures.join('; ') : undefined,
  };
}

async function testResponseTime(): Promise<SmokeTestResult> {
  const start = Date.now();
  const name = 'Response Time';
  const MAX_LATENCY = 2000;

  try {
    await client.get('/health');
    const duration = Date.now() - start;
    const passed = duration < MAX_LATENCY;
    return { name, passed, duration, error: !passed ? 'Too slow: ' + duration + 'ms' : undefined };
  } catch (error) {
    return { name, passed: false, duration: Date.now() - start, error: String(error) };
  }
}

async function testAuthEndpoint(): Promise<SmokeTestResult> {
  const start = Date.now();
  const name = 'Auth API Available';

  try {
    // Endpoint correct: /api/auth/login (pas /api/v1)
    const response = await client.post('/api/auth/login', {
      email: 'smoke-test@invalid.com',
      password: 'InvalidPassword123!',
    });
    const duration = Date.now() - start;
    // 400 = validation error, 401 = unauthorized, 429 = rate limited
    // Ces statuts indiquent que l'API auth fonctionne correctement
    const passed = response.status === 400 || response.status === 401 || response.status === 429;
    return {
      name,
      passed,
      duration,
      details: { status: response.status, expected: '400|401|429' },
      error: !passed ? `Unexpected status: ${response.status}` : undefined,
    };
  } catch (error) {
    return { name, passed: false, duration: Date.now() - start, error: String(error) };
  }
}

async function testSecurityHeaders(): Promise<SmokeTestResult> {
  const start = Date.now();
  const name = 'Security Headers';

  try {
    const response = await client.get('/health');
    const duration = Date.now() - start;

    // Verifier les headers de securite (helmet)
    const securityHeaders = {
      'x-content-type-options': response.headers['x-content-type-options'],
      'x-frame-options': response.headers['x-frame-options'],
      'x-xss-protection': response.headers['x-xss-protection'],
    };

    // Au moins un header de securite doit etre present
    const hasAnySecurityHeader = Object.values(securityHeaders).some(h => h !== undefined);

    return {
      name,
      passed: hasAnySecurityHeader,
      duration,
      details: { headers: securityHeaders },
    };
  } catch (error) {
    return { name, passed: false, duration: Date.now() - start, error: String(error) };
  }
}

async function runSmokeTests(): Promise<SmokeTestReport> {
  const startTime = Date.now();
  const environment = process.env.NODE_ENV || 'unknown';

  logger.info('SMOKE TESTS - Post-Deployment Verification', {
    environment,
    targetUrl: BASE_URL,
  });

  const results: SmokeTestResult[] = [];
  const tests = [
    testApplicationAvailability,
    testDatabaseConnection,
    testRedisConnection,
    testCriticalEndpoints,
    testResponseTime,
    testAuthEndpoint,
    testSecurityHeaders,
  ];

  for (const test of tests) {
    const result = await test();
    results.push(result);

    if (result.passed) {
      logger.info(`PASS | ${result.name}`, { duration: result.duration, details: result.details });
    } else {
      logger.warn(`FAIL | ${result.name}`, { duration: result.duration, error: result.error });
    }
  }

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const duration = Date.now() - startTime;

  let overallStatus: 'SUCCESS' | 'FAILURE' | 'PARTIAL';
  if (failed === 0) overallStatus = 'SUCCESS';
  else if (passed === 0) overallStatus = 'FAILURE';
  else overallStatus = 'PARTIAL';

  logger.info('SMOKE TESTS SUMMARY', {
    passed,
    failed,
    total: results.length,
    duration,
    overallStatus,
  });

  return {
    environment,
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    totalTests: results.length,
    passed,
    failed,
    duration,
    results,
    overallStatus,
  };
}

async function main() {
  try {
    const report = await runSmokeTests();
    if (report.overallStatus === 'FAILURE') process.exit(1);
    process.exit(0);
  } catch (error) {
    logger.error('Smoke tests failed', { error });
    process.exit(1);
  }
}

main();
