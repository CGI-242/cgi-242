// server/src/routes/stats.routes.ts
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { tenantMiddleware } from '../middleware/tenant.middleware.js';
import * as statsController from '../controllers/stats.controller.js';

const router = Router();

router.use(authMiddleware);
router.use(tenantMiddleware);

router.get('/usage', statsController.getUsageStats);

export default router;
