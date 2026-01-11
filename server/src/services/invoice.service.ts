// server/src/services/invoice.service.ts
import PDFDocument from 'pdfkit';
import { prisma } from '../config/database.js';
import { createLogger } from '../utils/logger.js';
import fs from 'fs';
import path from 'path';

const logger = createLogger('InvoiceService');

// Taux TVA Congo-Brazzaville
const TVA_RATE = 18;

// Informations de l'entreprise (vendeur)
const COMPANY_INFO = {
  name: 'ETS MG ADVISE',
  tradeName: 'NORMX AI', // Marque commerciale
  address: 'Pointe-Noire / Brazzaville, République du Congo',
  phone: '+242 06 XXX XX XX',
  email: 'contact@normx-ai.com',
  website: 'https://normx-ai.com',
  rccm: 'CG-BZV-00-XXXXX', // Registre du Commerce
  nif: 'XXXXXXXXXX', // Numéro d'Identification Fiscale
};

interface InvoiceData {
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

interface CustomerInfo {
  name: string;
  email: string;
  address?: string;
  phone?: string;
}

export class InvoiceService {
  /**
   * Générer le prochain numéro de facture
   * Format: FAC-YYYY-NNNNNN (ex: FAC-2026-000001)
   */
  static async getNextInvoiceNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const key = `invoice_sequence_${year}`;

    // Transaction pour éviter les doublons
    const result = await prisma.$transaction(async (tx) => {
      // Récupérer ou créer le compteur
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
   * Calculer les montants HT et TVA à partir du TTC
   */
  static calculatePriceBreakdown(amountTTC: number): {
    amountHT: number;
    tvaAmount: number;
    tvaRate: number;
  } {
    // Prix TTC = Prix HT * (1 + TVA/100)
    // Prix HT = Prix TTC / (1 + TVA/100)
    const tvaRate = TVA_RATE;
    const amountHT = Math.round(amountTTC / (1 + tvaRate / 100));
    const tvaAmount = amountTTC - amountHT;

    return {
      amountHT,
      tvaAmount,
      tvaRate,
    };
  }

  /**
   * Créer une facture et générer le PDF
   */
  static async createInvoice(
    data: InvoiceData,
    customer: CustomerInfo
  ): Promise<{ invoiceId: string; invoiceNumber: string; pdfPath: string }> {
    const invoiceNumber = await this.getNextInvoiceNumber();
    const { amountHT, tvaAmount, tvaRate } = this.calculatePriceBreakdown(data.amountTTC);

    logger.info(`Création facture ${invoiceNumber} pour ${customer.email}`);

    // Créer le répertoire des factures si nécessaire
    const invoicesDir = path.join(process.cwd(), 'data', 'invoices', new Date().getFullYear().toString());
    if (!fs.existsSync(invoicesDir)) {
      fs.mkdirSync(invoicesDir, { recursive: true });
    }

    const pdfFileName = `${invoiceNumber}.pdf`;
    const pdfPath = path.join(invoicesDir, pdfFileName);

    // Générer le PDF
    await this.generatePDF({
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

    // Enregistrer en base de données
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

    logger.info(`Facture ${invoiceNumber} créée avec succès, PDF: ${pdfPath}`);

    return {
      invoiceId: invoice.id,
      invoiceNumber,
      pdfPath,
    };
  }

  /**
   * Générer le PDF de la facture
   */
  private static async generatePDF(data: {
    invoiceNumber: string;
    customer: CustomerInfo;
    plan: string;
    planName: string;
    amountHT: number;
    tvaAmount: number;
    tvaRate: number;
    amountTTC: number;
    currency: string;
    transactionId: string;
    paymentDate: Date;
    periodStart: Date;
    periodEnd: Date;
    pdfPath: string;
  }): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margin: 50,
          info: {
            Title: `Facture ${data.invoiceNumber}`,
            Author: COMPANY_INFO.name,
            Subject: `Facture abonnement CGI 242 - ${data.planName}`,
            Creator: 'CGI 242 Invoice System',
          },
        });

        const writeStream = fs.createWriteStream(data.pdfPath);
        doc.pipe(writeStream);

        // === EN-TÊTE ===
        // Logo/Nom entreprise
        doc
          .fontSize(24)
          .fillColor('#1e40af')
          .text(COMPANY_INFO.name, 50, 50);

        doc
          .fontSize(10)
          .fillColor('#666666')
          .text(COMPANY_INFO.address, 50, 80)
          .text(`Tél: ${COMPANY_INFO.phone}`, 50, 95)
          .text(`Email: ${COMPANY_INFO.email}`, 50, 110)
          .text(`RCCM: ${COMPANY_INFO.rccm}`, 50, 125)
          .text(`NIF: ${COMPANY_INFO.nif}`, 50, 140);

        // Titre FACTURE
        doc
          .fontSize(28)
          .fillColor('#111827')
          .text('FACTURE', 400, 50, { align: 'right' });

        // Numéro et date
        doc
          .fontSize(11)
          .fillColor('#374151')
          .text(`N° ${data.invoiceNumber}`, 400, 85, { align: 'right' })
          .text(`Date: ${this.formatDate(data.paymentDate)}`, 400, 100, { align: 'right' })
          .text(`Échéance: Payée`, 400, 115, { align: 'right' });

        // Séparateur
        doc
          .moveTo(50, 170)
          .lineTo(545, 170)
          .strokeColor('#e5e7eb')
          .stroke();

        // === CLIENT ===
        doc
          .fontSize(10)
          .fillColor('#6b7280')
          .text('FACTURÉ À:', 50, 190);

        doc
          .fontSize(12)
          .fillColor('#111827')
          .text(data.customer.name, 50, 208);

        doc
          .fontSize(10)
          .fillColor('#4b5563')
          .text(data.customer.email, 50, 226);

        if (data.customer.address) {
          doc.text(data.customer.address, 50, 244);
        }

        if (data.customer.phone) {
          doc.text(`Tél: ${data.customer.phone}`, 50, 262);
        }

        // === DÉTAILS DE LA COMMANDE ===
        const tableTop = 320;

        // En-tête du tableau
        doc
          .rect(50, tableTop, 495, 25)
          .fillColor('#f3f4f6')
          .fill();

        doc
          .fontSize(10)
          .fillColor('#374151')
          .text('DÉSIGNATION', 60, tableTop + 8)
          .text('PÉRIODE', 250, tableTop + 8)
          .text('MONTANT HT', 380, tableTop + 8)
          .text('TVA', 470, tableTop + 8);

        // Ligne de données
        const lineY = tableTop + 35;

        doc
          .fontSize(10)
          .fillColor('#111827')
          .text(`Abonnement CGI 242 - ${data.planName}`, 60, lineY, { width: 180 })
          .text(`${this.formatDate(data.periodStart)} au ${this.formatDate(data.periodEnd)}`, 250, lineY, { width: 120 })
          .text(`${this.formatAmount(data.amountHT)} ${data.currency}`, 380, lineY)
          .text(`${data.tvaRate}%`, 470, lineY);

        // Sous-description
        doc
          .fontSize(9)
          .fillColor('#6b7280')
          .text('Accès à la plateforme d\'intelligence fiscale', 60, lineY + 18);

        // Ligne de séparation
        doc
          .moveTo(50, lineY + 45)
          .lineTo(545, lineY + 45)
          .strokeColor('#e5e7eb')
          .stroke();

        // === TOTAUX ===
        const totalsY = lineY + 65;

        // Sous-total HT
        doc
          .fontSize(10)
          .fillColor('#4b5563')
          .text('Sous-total HT:', 380, totalsY)
          .fillColor('#111827')
          .text(`${this.formatAmount(data.amountHT)} ${data.currency}`, 470, totalsY);

        // TVA
        doc
          .fillColor('#4b5563')
          .text(`TVA (${data.tvaRate}%):`, 380, totalsY + 20)
          .fillColor('#111827')
          .text(`${this.formatAmount(data.tvaAmount)} ${data.currency}`, 470, totalsY + 20);

        // Séparateur total
        doc
          .moveTo(370, totalsY + 40)
          .lineTo(545, totalsY + 40)
          .strokeColor('#1e40af')
          .lineWidth(2)
          .stroke();

        // Total TTC
        doc
          .fontSize(12)
          .fillColor('#1e40af')
          .text('TOTAL TTC:', 380, totalsY + 50)
          .fontSize(14)
          .text(`${this.formatAmount(data.amountTTC)} ${data.currency}`, 460, totalsY + 48);

        // Statut PAYÉE
        doc
          .rect(380, totalsY + 75, 165, 25)
          .fillColor('#dcfce7')
          .fill();

        doc
          .fontSize(12)
          .fillColor('#166534')
          .text('PAYÉE', 380, totalsY + 82, { width: 165, align: 'center' });

        // === INFORMATIONS DE PAIEMENT ===
        const paymentY = totalsY + 130;

        doc
          .fontSize(10)
          .fillColor('#6b7280')
          .text('INFORMATIONS DE PAIEMENT', 50, paymentY);

        doc
          .fontSize(9)
          .fillColor('#4b5563')
          .text(`Référence transaction: ${data.transactionId}`, 50, paymentY + 18)
          .text(`Mode de paiement: CinetPay (Mobile Money / Carte)`, 50, paymentY + 33)
          .text(`Date de paiement: ${this.formatDate(data.paymentDate)}`, 50, paymentY + 48);

        // === MENTIONS LÉGALES ===
        const legalY = 680;

        doc
          .rect(50, legalY, 495, 100)
          .fillColor('#f9fafb')
          .fill();

        doc
          .fontSize(8)
          .fillColor('#6b7280')
          .text('MENTIONS LÉGALES', 60, legalY + 10);

        doc
          .fontSize(7)
          .fillColor('#9ca3af')
          .text(
            `${COMPANY_INFO.name} - ${COMPANY_INFO.address}\n` +
            `RCCM: ${COMPANY_INFO.rccm} - NIF: ${COMPANY_INFO.nif}\n` +
            `\n` +
            `Cette facture est émise conformément à la législation fiscale de la République du Congo.\n` +
            `TVA appliquée au taux de ${TVA_RATE}% conformément au Code Général des Impôts.\n` +
            `\n` +
            `En cas de litige, les tribunaux de Brazzaville sont seuls compétents.\n` +
            `Conservez ce document, il constitue une pièce comptable officielle.`,
            60, legalY + 25,
            { width: 475, lineGap: 2 }
          );

        // === PIED DE PAGE ===
        doc
          .fontSize(8)
          .fillColor('#9ca3af')
          .text(
            `${COMPANY_INFO.website} | ${COMPANY_INFO.email}`,
            50, 800,
            { align: 'center', width: 495 }
          );

        doc.end();

        writeStream.on('finish', () => {
          logger.info(`PDF généré: ${data.pdfPath}`);
          resolve();
        });

        writeStream.on('error', (err) => {
          logger.error('Erreur génération PDF:', err);
          reject(err);
        });

      } catch (error) {
        logger.error('Erreur création PDF:', error);
        reject(error);
      }
    });
  }

  /**
   * Formater une date en français
   */
  private static formatDate(date: Date): string {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  }

  /**
   * Formater un montant
   */
  private static formatAmount(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
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
      orderBy: {
        createdAt: 'desc',
      },
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
}

export default InvoiceService;
