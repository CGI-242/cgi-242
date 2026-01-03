// server/src/routes/cinetpay.routes.ts
import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import * as cinetpayController from '../controllers/cinetpay.controller.js';

const router = Router();

/**
 * POST /api/cinetpay/create-payment
 * Créer un lien de paiement pour un abonnement
 * Authentification requise
 */
router.post(
  '/create-payment',
  authMiddleware,
  [
    body('plan')
      .notEmpty()
      .withMessage('Le plan est requis')
      .isIn(['STARTER', 'PROFESSIONAL', 'TEAM', 'ENTERPRISE'])
      .withMessage('Plan invalide')
  ],
  validate,
  cinetpayController.createSubscriptionPayment
);

/**
 * GET /api/cinetpay/payment/:transactionId
 * Vérifier le statut d'un paiement
 * Authentification requise
 */
router.get(
  '/payment/:transactionId',
  authMiddleware,
  [
    param('transactionId')
      .notEmpty()
      .withMessage('ID de transaction requis')
  ],
  validate,
  cinetpayController.checkPaymentStatus
);

/**
 * GET /api/cinetpay/history
 * Obtenir l'historique des paiements
 * Authentification requise
 */
router.get(
  '/history',
  authMiddleware,
  [
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limite doit être entre 1 et 100')
  ],
  validate,
  cinetpayController.getPaymentHistory
);

export default router;
