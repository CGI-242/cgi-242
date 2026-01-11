import { Router } from 'express';
import * as analyticsController from '../controllers/analytics.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { tenantMiddleware } from '../middleware/tenant.middleware.js';
import { requireAdmin } from '../middleware/orgRole.middleware.js';

const router = Router();

// Toutes les routes nécessitent une authentification
router.use(authMiddleware);
router.use(tenantMiddleware);

// GET /api/analytics/dashboard - Dashboard stats
router.get('/dashboard', analyticsController.getDashboard);

// GET /api/analytics/timeseries/:metric - Time series data for charts
router.get('/timeseries/:metric', analyticsController.getTimeSeries);

// GET /api/analytics/members - Member stats (admin only in org context)
router.get('/members', requireAdmin, analyticsController.getMemberStats);

// GET /api/analytics/export - Export analytics data
router.get('/export', analyticsController.exportAnalytics);

export default router;
