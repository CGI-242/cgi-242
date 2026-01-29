import { Router } from 'express';
import authRoutes from './auth.routes.js';
import mfaRoutes from './mfa.routes.js';
import organizationRoutes from './organization.routes.js';
import chatRoutes from './chat.routes.js';
import statsRoutes from './stats.routes.js';
import articlesRoutes from './articles.routes.js';
import auditRoutes from './audit.routes.js';
import subscriptionRoutes from './subscription.routes.js';
import permissionRoutes from './permission.routes.js';
import analyticsRoutes from './analytics.routes.js';
import invoiceRoutes from './invoice.routes.js';
import stripeRoutes from './stripe.routes.js';
import alertesFiscalesRoutes from './alertes-fiscales.routes.js';

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
router.use('/mfa', mfaRoutes);
router.use('/organizations', organizationRoutes);
router.use('/chat', chatRoutes);
router.use('/stats', statsRoutes);
router.use('/articles', articlesRoutes);
router.use('/subscription', subscriptionRoutes);
router.use('/permissions', permissionRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/stripe', stripeRoutes);
router.use('/alertes-fiscales', alertesFiscalesRoutes);

// Routes d'audit (montées à la racine car incluent /organizations/:orgId/audit et /audit/*)
router.use(auditRoutes);

export default router;
