// server/src/services/invoice.service.ts
// Service de gestion des factures

import { prisma } from '../config/database.js';
import { createLogger } from '../utils/logger.js';
import fs from 'fs';
import path from 'path';
import {
  generateInvoicePDF,
  calculatePriceBreakdown,
  CustomerInfo,
} from './invoice.pdf-generator.js';

const logger = createLogger('InvoiceService');

export { CustomerInfo };

export interface InvoiceData {
  paymentId: string;
  userId: string;
  plan: string;
  planName: string;
  amountTTC: number;
  currency: string;
  transactionId: string;
  paymentDate: Date;
  periodStart: Date;
  periodEnd: Date;
}

export class InvoiceService {
  /**
   * Générer le prochain numéro de facture
   * Format: FAC-YYYY-NNNNNN
   */
  static async getNextInvoiceNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const key = `invoice_sequence_${year}`;

    const result = await prisma.$transaction(async (tx) => {
      const configRecord = await tx.systemConfig.findUnique({
        where: { key },
      });

      let sequence = 1;
      if (configRecord) {
        sequence = parseInt(configRecord.value, 10) + 1;
        await tx.systemConfig.update({
          where: { key },
          data: { value: sequence.toString() },
        });
      } else {
        await tx.systemConfig.create({
          data: { key, value: '1' },
        });
      }

      return sequence;
    });

    return `FAC-${year}-${result.toString().padStart(6, '0')}`;
  }

  /**
   * Créer une facture et générer le PDF
   */
  static async createInvoice(
    data: InvoiceData,
    customer: CustomerInfo
  ): Promise<{ invoiceId: string; invoiceNumber: string; pdfPath: string }> {
    const invoiceNumber = await this.getNextInvoiceNumber();
    const { amountHT, tvaAmount, tvaRate } = calculatePriceBreakdown(data.amountTTC);

    logger.info(`Création facture ${invoiceNumber} pour ${customer.email}`);

    const invoicesDir = path.join(process.cwd(), 'data', 'invoices', new Date().getFullYear().toString());
    if (!fs.existsSync(invoicesDir)) {
      fs.mkdirSync(invoicesDir, { recursive: true });
    }

    const pdfFileName = `${invoiceNumber}.pdf`;
    const pdfPath = path.join(invoicesDir, pdfFileName);

    await generateInvoicePDF({
      invoiceNumber,
      customer,
      plan: data.plan,
      planName: data.planName,
      amountHT,
      tvaAmount,
      tvaRate,
      amountTTC: data.amountTTC,
      currency: data.currency,
      transactionId: data.transactionId,
      paymentDate: data.paymentDate,
      periodStart: data.periodStart,
      periodEnd: data.periodEnd,
      pdfPath,
    });

    const invoice = await prisma.invoice.create({
      data: {
        paymentId: data.paymentId,
        invoiceNumber,
        customerName: customer.name,
        customerEmail: customer.email,
        customerAddress: customer.address,
        customerPhone: customer.phone,
        description: `Abonnement ${data.planName} - CGI 242`,
        plan: data.plan,
        amountHT,
        tvaRate,
        tvaAmount,
        amountTTC: data.amountTTC,
        currency: data.currency,
        pdfPath,
        status: 'PAID',
        paidAt: data.paymentDate,
        periodStart: data.periodStart,
        periodEnd: data.periodEnd,
      },
    });

    logger.info(`Facture ${invoiceNumber} créée avec succès`);

    return {
      invoiceId: invoice.id,
      invoiceNumber,
      pdfPath,
    };
  }

  /**
   * Récupérer une facture par ID
   */
  static async getInvoice(invoiceId: string) {
    return prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        payment: {
          include: {
            subscription: true,
          },
        },
      },
    });
  }

  /**
   * Récupérer les factures d'un utilisateur
   */
  static async getUserInvoices(userId: string, limit = 20) {
    return prisma.invoice.findMany({
      where: {
        payment: {
          subscription: {
            userId,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Marquer une facture comme envoyée
   */
  static async markAsSent(invoiceId: string) {
    return prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        status: 'SENT',
        sentAt: new Date(),
      },
    });
  }

  /**
   * Lire le fichier PDF d'une facture
   */
  static async getInvoicePDF(invoiceId: string): Promise<Buffer | null> {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      select: { pdfPath: true },
    });

    if (!invoice?.pdfPath || !fs.existsSync(invoice.pdfPath)) {
      return null;
    }

    return fs.readFileSync(invoice.pdfPath);
  }

  /**
   * Calculer les montants
   */
  static calculatePriceBreakdown = calculatePriceBreakdown;
}

export default InvoiceService;
