// server/src/routes/invoice.routes.ts
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import {
  getUserInvoices,
  downloadInvoice,
  getInvoiceDetails,
} from '../controllers/invoice.controller.js';

const router = Router();

// Toutes les routes nécessitent une authentification
router.use(authMiddleware);

/**
 * @route GET /api/invoices
 * @desc Récupérer les factures de l'utilisateur
 * @access Private
 */
router.get('/', getUserInvoices);

/**
 * @route GET /api/invoices/:invoiceId
 * @desc Récupérer les détails d'une facture
 * @access Private
 */
router.get('/:invoiceId', getInvoiceDetails);

/**
 * @route GET /api/invoices/:invoiceId/download
 * @desc Télécharger une facture en PDF
 * @access Private
 */
router.get('/:invoiceId/download', downloadInvoice);

export default router;
