// server/src/routes/webhook.routes.ts
import { Router } from 'express';
import * as cinetpayController from '../controllers/cinetpay.controller.js';

const router = Router();

/**
 * POST /api/webhooks/cinetpay
 * Webhook CinetPay pour notifications de paiement
 * IMPORTANT: Pas d'authentification (CinetPay doit pouvoir appeler)
 */
router.post('/cinetpay', cinetpayController.handleCinetPayWebhook);

export default router;
