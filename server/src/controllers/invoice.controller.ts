// server/src/controllers/invoice.controller.ts
import { Request, Response } from 'express';
import { InvoiceService } from '../services/invoice.service.js';
import { createLogger } from '../utils/logger.js';
import { sendError, sendSuccess } from '../utils/helpers.js';

const logger = createLogger('InvoiceController');

/**
 * Récupérer les factures de l'utilisateur connecté
 */
export async function getUserInvoices(req: Request, res: Response): Promise<void> {
  try {
    const user = req.user!;
    const limit = parseInt(req.query.limit as string) || 20;

    const invoices = await InvoiceService.getUserInvoices(user.id, limit);

    sendSuccess(res, {
      invoices: invoices.map(inv => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        plan: inv.plan,
        amountTTC: Number(inv.amountTTC),
        amountHT: Number(inv.amountHT),
        tvaAmount: Number(inv.tvaAmount),
        currency: inv.currency,
        status: inv.status,
        createdAt: inv.createdAt,
        paidAt: inv.paidAt,
      })),
    });

  } catch (error) {
    logger.error('Erreur récupération factures:', error);
    sendError(res, 'Échec de récupération des factures', 500);
  }
}

/**
 * Télécharger une facture en PDF
 */
export async function downloadInvoice(req: Request, res: Response): Promise<void> {
  try {
    const { invoiceId } = req.params;
    const user = req.user!;

    // Récupérer la facture
    const invoice = await InvoiceService.getInvoice(invoiceId);

    if (!invoice) {
      sendError(res, 'Facture non trouvée', 404);
      return;
    }

    // Vérifier que la facture appartient à l'utilisateur
    if (invoice.payment?.subscription?.userId !== user.id) {
      sendError(res, 'Non autorisé', 403);
      return;
    }

    // Récupérer le PDF
    const pdfBuffer = await InvoiceService.getInvoicePDF(invoiceId);

    if (!pdfBuffer) {
      sendError(res, 'Fichier PDF non trouvé', 404);
      return;
    }

    // Envoyer le PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${invoice.invoiceNumber}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.send(pdfBuffer);

  } catch (error) {
    logger.error('Erreur téléchargement facture:', error);
    sendError(res, 'Échec du téléchargement', 500);
  }
}

/**
 * Récupérer les détails d'une facture
 */
export async function getInvoiceDetails(req: Request, res: Response): Promise<void> {
  try {
    const { invoiceId } = req.params;
    const user = req.user!;

    const invoice = await InvoiceService.getInvoice(invoiceId);

    if (!invoice) {
      sendError(res, 'Facture non trouvée', 404);
      return;
    }

    // Vérifier que la facture appartient à l'utilisateur
    if (invoice.payment?.subscription?.userId !== user.id) {
      sendError(res, 'Non autorisé', 403);
      return;
    }

    sendSuccess(res, {
      invoice: {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        customerName: invoice.customerName,
        customerEmail: invoice.customerEmail,
        description: invoice.description,
        plan: invoice.plan,
        amountHT: Number(invoice.amountHT),
        tvaRate: Number(invoice.tvaRate),
        tvaAmount: Number(invoice.tvaAmount),
        amountTTC: Number(invoice.amountTTC),
        currency: invoice.currency,
        status: invoice.status,
        paidAt: invoice.paidAt,
        periodStart: invoice.periodStart,
        periodEnd: invoice.periodEnd,
        createdAt: invoice.createdAt,
      },
    });

  } catch (error) {
    logger.error('Erreur récupération détails facture:', error);
    sendError(res, 'Échec de récupération des détails', 500);
  }
}
