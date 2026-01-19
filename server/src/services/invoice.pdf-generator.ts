// server/src/services/invoice.pdf-generator.ts
// Génération de PDF pour les factures

import PDFDocument from 'pdfkit';
import fs from 'fs';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('InvoicePDFGenerator');

export const COMPANY_INFO = {
  name: 'ETS MG ADVISE',
  tradeName: 'NORMX AI',
  address: 'Pointe-Noire / Brazzaville, République du Congo',
  phone: '+242 06 XXX XX XX',
  email: 'contact@normx-ai.com',
  website: 'https://normx-ai.com',
  rccm: 'CG-BZV-00-XXXXX',
  nif: 'XXXXXXXXXX',
};

export const TVA_RATE = 18;

export interface CustomerInfo {
  name: string;
  email: string;
  address?: string;
  phone?: string;
}

export interface PDFInvoiceData {
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
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

function formatAmount(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export async function generateInvoicePDF(data: PDFInvoiceData): Promise<void> {
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
      doc.fontSize(24).fillColor('#1e40af').text(COMPANY_INFO.name, 50, 50);
      doc.fontSize(10).fillColor('#666666')
        .text(COMPANY_INFO.address, 50, 80)
        .text(`Tél: ${COMPANY_INFO.phone}`, 50, 95)
        .text(`Email: ${COMPANY_INFO.email}`, 50, 110)
        .text(`RCCM: ${COMPANY_INFO.rccm}`, 50, 125)
        .text(`NIF: ${COMPANY_INFO.nif}`, 50, 140);

      doc.fontSize(28).fillColor('#111827').text('FACTURE', 400, 50, { align: 'right' });
      doc.fontSize(11).fillColor('#374151')
        .text(`N° ${data.invoiceNumber}`, 400, 85, { align: 'right' })
        .text(`Date: ${formatDate(data.paymentDate)}`, 400, 100, { align: 'right' })
        .text(`Échéance: Payée`, 400, 115, { align: 'right' });

      doc.moveTo(50, 170).lineTo(545, 170).strokeColor('#e5e7eb').stroke();

      // === CLIENT ===
      doc.fontSize(10).fillColor('#6b7280').text('FACTURÉ À:', 50, 190);
      doc.fontSize(12).fillColor('#111827').text(data.customer.name, 50, 208);
      doc.fontSize(10).fillColor('#4b5563').text(data.customer.email, 50, 226);

      if (data.customer.address) doc.text(data.customer.address, 50, 244);
      if (data.customer.phone) doc.text(`Tél: ${data.customer.phone}`, 50, 262);

      // === TABLEAU ===
      const tableTop = 320;
      doc.rect(50, tableTop, 495, 25).fillColor('#f3f4f6').fill();
      doc.fontSize(10).fillColor('#374151')
        .text('DÉSIGNATION', 60, tableTop + 8)
        .text('PÉRIODE', 250, tableTop + 8)
        .text('MONTANT HT', 380, tableTop + 8)
        .text('TVA', 470, tableTop + 8);

      const lineY = tableTop + 35;
      doc.fontSize(10).fillColor('#111827')
        .text(`Abonnement CGI 242 - ${data.planName}`, 60, lineY, { width: 180 })
        .text(`${formatDate(data.periodStart)} au ${formatDate(data.periodEnd)}`, 250, lineY, { width: 120 })
        .text(`${formatAmount(data.amountHT)} ${data.currency}`, 380, lineY)
        .text(`${data.tvaRate}%`, 470, lineY);

      doc.fontSize(9).fillColor('#6b7280')
        .text('Accès à la plateforme d\'intelligence fiscale', 60, lineY + 18);
      doc.moveTo(50, lineY + 45).lineTo(545, lineY + 45).strokeColor('#e5e7eb').stroke();

      // === TOTAUX ===
      const totalsY = lineY + 65;
      doc.fontSize(10).fillColor('#4b5563').text('Sous-total HT:', 380, totalsY)
        .fillColor('#111827').text(`${formatAmount(data.amountHT)} ${data.currency}`, 470, totalsY);

      doc.fillColor('#4b5563').text(`TVA (${data.tvaRate}%):`, 380, totalsY + 20)
        .fillColor('#111827').text(`${formatAmount(data.tvaAmount)} ${data.currency}`, 470, totalsY + 20);

      doc.moveTo(370, totalsY + 40).lineTo(545, totalsY + 40).strokeColor('#1e40af').lineWidth(2).stroke();

      doc.fontSize(12).fillColor('#1e40af').text('TOTAL TTC:', 380, totalsY + 50)
        .fontSize(14).text(`${formatAmount(data.amountTTC)} ${data.currency}`, 460, totalsY + 48);

      doc.rect(380, totalsY + 75, 165, 25).fillColor('#dcfce7').fill();
      doc.fontSize(12).fillColor('#166534').text('PAYÉE', 380, totalsY + 82, { width: 165, align: 'center' });

      // === PAIEMENT ===
      const paymentY = totalsY + 130;
      doc.fontSize(10).fillColor('#6b7280').text('INFORMATIONS DE PAIEMENT', 50, paymentY);
      doc.fontSize(9).fillColor('#4b5563')
        .text(`Référence transaction: ${data.transactionId}`, 50, paymentY + 18)
        .text(`Mode de paiement: Paiement en ligne`, 50, paymentY + 33)
        .text(`Date de paiement: ${formatDate(data.paymentDate)}`, 50, paymentY + 48);

      // === MENTIONS LÉGALES ===
      const legalY = 680;
      doc.rect(50, legalY, 495, 100).fillColor('#f9fafb').fill();
      doc.fontSize(8).fillColor('#6b7280').text('MENTIONS LÉGALES', 60, legalY + 10);
      doc.fontSize(7).fillColor('#9ca3af').text(
        `${COMPANY_INFO.name} - ${COMPANY_INFO.address}\n` +
        `RCCM: ${COMPANY_INFO.rccm} - NIF: ${COMPANY_INFO.nif}\n\n` +
        `Cette facture est émise conformément à la législation fiscale de la République du Congo.\n` +
        `TVA appliquée au taux de ${TVA_RATE}% conformément au Code Général des Impôts.\n\n` +
        `En cas de litige, les tribunaux de Brazzaville sont seuls compétents.\n` +
        `Conservez ce document, il constitue une pièce comptable officielle.`,
        60, legalY + 25, { width: 475, lineGap: 2 }
      );

      doc.fontSize(8).fillColor('#9ca3af')
        .text(`${COMPANY_INFO.website} | ${COMPANY_INFO.email}`, 50, 800, { align: 'center', width: 495 });

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

export function calculatePriceBreakdown(amountTTC: number): {
  amountHT: number;
  tvaAmount: number;
  tvaRate: number;
} {
  const tvaRate = TVA_RATE;
  const amountHT = Math.round(amountTTC / (1 + tvaRate / 100));
  const tvaAmount = amountTTC - amountHT;
  return { amountHT, tvaAmount, tvaRate };
}
