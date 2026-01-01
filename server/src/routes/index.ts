import { Router } from 'express';
import authRoutes from './auth.routes.js';
import organizationRoutes from './organization.routes.js';
import chatRoutes from './chat.routes.js';
import statsRoutes from './stats.routes.js';
import articlesRoutes from './articles.routes.js';

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

export default router;
