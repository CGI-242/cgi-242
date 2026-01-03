/**
 * Routes de Health Checks
 * Compatible Kubernetes (liveness, readiness, startup probes)
 */

import { Router, Request, Response } from 'express';
import {
  getHealthReport,
  getLivenessCheck,
  getReadinessCheck,
  getStartupCheck,
} from '../services/health.service.js';
import { createLogger } from '../utils/logger.js';

const router = Router();
const logger = createLogger('HealthRoutes');

/**
 * GET /health
 * Rapport de santé complet avec tous les services
 */
router.get('/', async (_req: Request, res: Response) => {
  try {
    const report = await getHealthReport();

    const statusCode = report.status === 'ok' ? 200 :
                       report.status === 'degraded' ? 200 : 503;

    res.status(statusCode).json(report);
  } catch (error) {
    logger.error('Health check failed', error);
    res.status(503).json({
      status: 'unhealthy',
      error: 'Health check failed',
    });
  }
});

/**
 * GET /health/live
 * Kubernetes Liveness Probe
 * Vérifie que le processus est vivant
 * Si échoue: Kubernetes redémarre le pod
 */
router.get('/live', (_req: Request, res: Response) => {
  try {
    const check = getLivenessCheck();
    res.status(200).json(check);
  } catch {
    res.status(503).json({ status: 'dead' });
  }
});

/**
 * GET /health/ready
 * Kubernetes Readiness Probe
 * Vérifie que l'application peut recevoir du trafic
 * Si échoue: Kubernetes retire le pod du load balancer
 */
router.get('/ready', async (_req: Request, res: Response) => {
  try {
    const check = await getReadinessCheck();

    if (check.ready) {
      res.status(200).json(check);
    } else {
      res.status(503).json(check);
    }
  } catch (error) {
    logger.error('Readiness check failed', error);
    res.status(503).json({ ready: false, error: 'Check failed' });
  }
});

/**
 * GET /health/startup
 * Kubernetes Startup Probe
 * Vérifie que l'application a démarré correctement
 * Si échoue pendant la période de grâce: Kubernetes redémarre le pod
 */
router.get('/startup', async (_req: Request, res: Response) => {
  try {
    const check = await getStartupCheck();

    if (check.started) {
      res.status(200).json(check);
    } else {
      res.status(503).json(check);
    }
  } catch (error) {
    logger.error('Startup check failed', error);
    res.status(503).json({ started: false, error: 'Check failed' });
  }
});

/**
 * GET /health/ping
 * Simple ping pour load balancers basiques
 */
router.get('/ping', (_req: Request, res: Response) => {
  res.status(200).send('pong');
});

export default router;
