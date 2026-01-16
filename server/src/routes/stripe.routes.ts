// server/src/routes/stripe.routes.ts
// Routes de paiement Stripe

import { Router } from 'express';
import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import {
  createCheckout,
  handleWebhook,
  cancelCurrentSubscription,
  getCustomerPortal,
  getPlans,
} from '../controllers/stripe.controller.js';

const router = Router();

// Route webhook - SANS authentification, AVEC raw body
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  handleWebhook
);

// Routes publiques
router.get('/plans', getPlans);

// Routes authentifiées
router.use(authMiddleware);
router.post('/checkout', createCheckout);
router.post('/cancel', cancelCurrentSubscription);
router.post('/portal', getCustomerPortal);

export default router;
