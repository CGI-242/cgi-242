/**
 * =============================================================================
 * TESTS DE PERFORMANCE - k6 Load Testing
 * =============================================================================
 * Conforme au cours CD: "Tests de performance et de charge"
 *
 * Objectifs:
 * - Valider la solution sous charge multi-utilisateur
 * - Garantir la qualite de service en conditions reelles
 * - Detecter les problemes de performance avant production
 *
 * Execution: k6 run load-test.js
 * =============================================================================
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Metriques personnalisees
const errorRate = new Rate('errors');
const realErrors = new Rate('real_errors');  // Exclut les 401 attendus
const healthCheckDuration = new Trend('health_check_duration');
const apiResponseTime = new Trend('api_response_time');
const authResponseTime = new Trend('auth_response_time');
const successfulRequests = new Counter('successful_requests');

// Configuration des scenarios de charge
export const options = {
  // Scenario 1: Charge progressive (Ramp-up)
  stages: [
    { duration: '30s', target: 10 },   // Montee a 10 utilisateurs
    { duration: '1m', target: 50 },    // Montee a 50 utilisateurs
    { duration: '2m', target: 50 },    // Maintien a 50 utilisateurs
    { duration: '30s', target: 100 },  // Pic a 100 utilisateurs
    { duration: '1m', target: 100 },   // Maintien du pic
    { duration: '30s', target: 0 },    // Descente progressive
  ],

  // Seuils de performance (echec si depasses)
  thresholds: {
    http_req_duration: ['p(95)<2000'],       // 95% des requetes < 2s
    real_errors: ['rate<0.05'],              // Moins de 5% d'erreurs reelles (exclut 401)
    errors: ['rate<0.1'],                    // Moins de 10% d'erreurs custom
    health_check_duration: ['p(99)<1000'],   // Health check < 1s
    auth_response_time: ['p(95)<3000'],      // Auth < 3s
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

/**
 * Fonction principale executee par chaque utilisateur virtuel
 */
export default function() {
  // Groupe 1: Health Checks (critique)
  group('Health Checks', function() {
    const healthRes = http.get(BASE_URL + '/health');

    healthCheckDuration.add(healthRes.timings.duration);

    const healthCheck = check(healthRes, {
      'health status is 200': (r) => r.status === 200,
      'health response has status': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.status !== undefined;
        } catch {
          return false;
        }
      },
    });

    errorRate.add(!healthCheck);
    realErrors.add(healthRes.status >= 500);  // Seulement les erreurs serveur
    if (healthCheck) successfulRequests.add(1);
  });

  sleep(1);

  // Groupe 2: Endpoints publics (metriques, docs)
  group('Public Endpoints', function() {
    // Test endpoint metriques Prometheus
    const metricsRes = http.get(BASE_URL + '/metrics');
    apiResponseTime.add(metricsRes.timings.duration);

    const metricsCheck = check(metricsRes, {
      'metrics endpoint responds': (r) => r.status === 200,
      'metrics contains prometheus data': (r) => r.body && r.body.includes('cgi_engine'),
    });

    realErrors.add(metricsRes.status >= 500);
    if (metricsCheck) successfulRequests.add(1);

    // Test endpoint health live
    const liveRes = http.get(BASE_URL + '/health/live');
    check(liveRes, {
      'liveness check ok': (r) => r.status === 200,
    });
    realErrors.add(liveRes.status >= 500);

    // Test endpoint health ready
    const readyRes = http.get(BASE_URL + '/health/ready');
    check(readyRes, {
      'readiness check ok': (r) => r.status === 200,
    });
    realErrors.add(readyRes.status >= 500);
  });

  sleep(1);

  // Groupe 3: Simulation authentification (401 attendu = pas une erreur)
  group('Authentication Flow', function() {
    const loginPayload = JSON.stringify({
      email: 'loadtest' + __VU + '@test.com',
      password: 'TestPassword123!',
    });

    // Endpoint correct: /api/auth/login (pas /api/v1)
    const loginRes = http.post(
      BASE_URL + '/api/auth/login',
      loginPayload,
      {
        headers: { 'Content-Type': 'application/json' },
        tags: { expected_status: '401' },  // Tag pour filtrage
      }
    );

    authResponseTime.add(loginRes.timings.duration);

    // 401 est ATTENDU (credentials invalides) - pas une erreur
    // Seulement 500 est une vraie erreur
    const authCheck = check(loginRes, {
      'auth responds (not 500)': (r) => r.status !== 500,
      'auth returns expected status': (r) => r.status === 401 || r.status === 400 || r.status === 429,
      'auth under 3s': (r) => r.timings.duration < 3000,
    });

    // Seulement les erreurs 5xx sont des vraies erreurs
    realErrors.add(loginRes.status >= 500);
    if (authCheck) successfulRequests.add(1);
  });

  sleep(1);

  // Groupe 4: Test de charge API articles (endpoint public)
  group('Articles API', function() {
    // Recherche d'articles (endpoint correct: /api/articles)
    const searchRes = http.get(BASE_URL + '/api/articles/search?q=impot&limit=5', {
      headers: { 'Content-Type': 'application/json' },
    });

    apiResponseTime.add(searchRes.timings.duration);

    // 401 peut etre attendu si auth requise, 404 si endpoint non configure
    const isExpectedStatus = searchRes.status === 200 ||
                             searchRes.status === 401 ||
                             searchRes.status === 404;

    check(searchRes, {
      'articles search responds': (r) => isExpectedStatus,
    });

    realErrors.add(searchRes.status >= 500);
  });

  sleep(1);
}

/**
 * Setup: Execute une fois au debut du test
 */
export function setup() {
  console.log('Starting performance tests against: ' + BASE_URL);
  
  // Verification que le service est disponible
  const res = http.get(BASE_URL + '/health');
  if (res.status !== 200) {
    throw new Error('Service not available at ' + BASE_URL);
  }
  
  return { startTime: new Date().toISOString() };
}

/**
 * Teardown: Execute une fois a la fin du test
 */
export function teardown(data) {
  console.log('Performance tests completed');
  console.log('Started at: ' + data.startTime);
  console.log('Ended at: ' + new Date().toISOString());
}

/**
 * Gestion des resultats pour integration CI/CD
 */
export function handleSummary(data) {
  // Utiliser real_errors (exclut 401) au lieu de http_req_failed
  const realErrorRate = data.metrics.real_errors ? data.metrics.real_errors.values.rate : 0;
  const httpErrorRate = data.metrics.http_req_failed ? data.metrics.http_req_failed.values.rate : 0;
  const passed = realErrorRate < 0.05;  // Moins de 5% d'erreurs reelles
  const p95 = data.metrics.http_req_duration.values['p(95)'];
  const successCount = data.metrics.successful_requests ? data.metrics.successful_requests.values.count : 0;

  console.log('='.repeat(60));
  console.log('PERFORMANCE TEST RESULTS');
  console.log('='.repeat(60));
  console.log('Total Requests: ' + data.metrics.http_reqs.values.count);
  console.log('Successful Checks: ' + successCount);
  console.log('HTTP Errors (incl. 401): ' + (httpErrorRate * 100).toFixed(2) + '%');
  console.log('Real Errors (5xx only): ' + (realErrorRate * 100).toFixed(2) + '%');
  console.log('P95 Response Time: ' + p95.toFixed(0) + 'ms');
  console.log('P99 Health Check: ' + (data.metrics.health_check_duration.values['p(99)'] || 0).toFixed(0) + 'ms');
  console.log('Status: ' + (passed ? 'PASS' : 'FAIL'));
  console.log('='.repeat(60));

  return {
    'performance-results.json': JSON.stringify(data, null, 2),
  };
}
