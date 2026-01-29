import { Request, Response } from 'express';
import { analyticsService } from '../services/analytics.service.js';
import { asyncHandler } from '../middleware/error.middleware.js';
import { sendSuccess } from '../utils/helpers.js';

/**
 * GET /api/analytics/dashboard
 * Obtenir les statistiques du tableau de bord
 */
export const getDashboard = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const organizationId = req.tenant?.organizationId;

  let dashboard;
  if (organizationId) {
    dashboard = await analyticsService.getOrganizationDashboard(organizationId);
  } else {
    dashboard = await analyticsService.getUserDashboard(userId);
  }

  sendSuccess(res, dashboard);
});

/**
 * GET /api/analytics/timeseries/:metric
 * Obtenir les données temporelles pour un graphique
 */
export const getTimeSeries = asyncHandler(async (req: Request, res: Response) => {
  const { metric } = req.params;
  const { days = '30' } = req.query;
  const userId = req.user!.id;
  const organizationId = req.tenant?.organizationId;

  if (!['questions', 'articles', 'conversations', 'tokens'].includes(metric)) {
    return sendSuccess(res, { error: 'Metric invalide' }, '', 400);
  }

  const data = await analyticsService.getTimeSeries(
    metric as 'questions' | 'articles' | 'conversations' | 'tokens',
    organizationId ? undefined : userId,
    organizationId,
    parseInt(days as string, 10)
  );

  sendSuccess(res, data);
});

/**
 * GET /api/analytics/members
 * Obtenir les statistiques par membre (admin org uniquement)
 */
export const getMemberStats = asyncHandler(async (req: Request, res: Response) => {
  const organizationId = req.tenant?.organizationId;

  if (!organizationId) {
    return sendSuccess(res, { error: 'Contexte organisation requis' }, '', 400);
  }

  const stats = await analyticsService.getMemberStats(organizationId);

  sendSuccess(res, stats);
});

/**
 * GET /api/analytics/export
 * Exporter les données analytics
 */
export const exportAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const { startDate, endDate } = req.query;
  const userId = req.user!.id;
  const organizationId = req.tenant?.organizationId;

  const start = startDate ? new Date(startDate as string) : undefined;
  const end = endDate ? new Date(endDate as string) : undefined;

  const data = await analyticsService.exportAnalytics(
    organizationId ? undefined : userId,
    organizationId,
    start,
    end
  );

  sendSuccess(res, data);
});
