import { Router } from 'express';
import authRoutes from './auth.routes.js';
import organizationRoutes from './organization.routes.js';
import chatRoutes from './chat.routes.js';
import statsRoutes from './stats.routes.js';
import articlesRoutes from './articles.routes.js';
import cinetpayRoutes from './cinetpay.routes.js';
import webhookRoutes from './webhook.routes.js';
import auditRoutes from './audit.routes.js';
import subscriptionRoutes from './subscription.routes.js';

const router = Router();

// Health check
router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
  });
});

// Routes API
router.use('/auth', authRoutes);
router.use('/organizations', organizationRoutes);
router.use('/chat', chatRoutes);
router.use('/stats', statsRoutes);
router.use('/articles', articlesRoutes);
router.use('/cinetpay', cinetpayRoutes);
router.use('/webhooks', webhookRoutes);
router.use('/subscription', subscriptionRoutes);

// Routes d'audit (montées à la racine car incluent /organizations/:orgId/audit et /audit/*)
router.use(auditRoutes);

export default router;
