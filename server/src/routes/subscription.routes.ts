// server/src/routes/subscription.routes.ts
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { upgradePlan, getSubscription } from '../controllers/subscription.controller.js';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// GET /api/subscription - Get current subscription
router.get('/', getSubscription);

// POST /api/subscription/upgrade - Upgrade plan
router.post('/upgrade', upgradePlan);

export default router;
