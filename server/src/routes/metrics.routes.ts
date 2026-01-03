/**
 * Routes pour les métriques Prometheus
 * Endpoint: /metrics
 */

import { Router, Request, Response } from 'express';
import {
  getMetrics,
  getMetricsContentType,
  getMetricsStats,
} from '../services/metrics.service.js';
import { createLogger } from '../utils/logger.js';

const router = Router();
const logger = createLogger('MetricsRoutes');

/**
 * GET /metrics
 * Expose les métriques au format Prometheus
 */
router.get('/', async (_req: Request, res: Response) => {
  try {
    const metrics = await getMetrics();
    res.set('Content-Type', getMetricsContentType());
    res.end(metrics);
  } catch (error) {
    logger.error('Error generating metrics', error);
    res.status(500).json({ error: 'Failed to generate metrics' });
  }
});

/**
 * GET /metrics/stats
 * Statistiques sur les métriques (pour debugging)
 */
router.get('/stats', async (_req: Request, res: Response) => {
  try {
    const stats = await getMetricsStats();
    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error('Error getting metrics stats', error);
    res.status(500).json({ error: 'Failed to get metrics stats' });
  }
});

export default router;
