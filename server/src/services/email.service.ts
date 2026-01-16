// server/src/services/email.service.ts
// Service d'envoi d'emails

import nodemailer from 'nodemailer';
import { config } from '../config/environment.js';
import { createLogger } from '../utils/logger.js';
import {
  getInvitationTemplate,
  getPasswordResetTemplate,
  getVerificationTemplate,
  getPaymentConfirmationTemplate,
  getInvoiceTemplate,
  getPaymentFailedTemplate,
  getAdminNotificationTemplate,
} from './email.templates.js';

const logger = createLogger('EmailService');

interface InvitationEmail {
  email: string;
  token: string;
  organization: { name: string };
  invitedBy: { firstName: string | null; lastName: string | null; email: string };
  role: string;
}

interface PasswordResetEmail {
  email: string;
  token: string;
  firstName?: string | null;
}

interface VerificationEmail {
  email: string;
  token: string;
  firstName?: string | null;
  isResend?: boolean;
}

const ROLE_LABELS: Record<string, string> = {
  OWNER: 'Propriétaire',
  ADMIN: 'Administrateur',
  MEMBER: 'Membre',
  VIEWER: 'Lecteur',
};

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.port === 465,
      auth: {
        user: config.email.user,
        pass: config.email.pass,
      },
    });
  }

  private async sendMail(to: string, subject: string, html: string): Promise<void> {
    if (!config.email.host) {
      logger.warn(`Email non envoyé (SMTP non configuré): ${subject} -> ${to}`);
      return;
    }

    try {
      await this.transporter.sendMail({
        from: config.email.from,
        to,
        subject,
        html,
      });
      logger.info(`Email envoyé: ${subject} -> ${to}`);
    } catch (error) {
      logger.error(`Erreur d'envoi email: ${subject} -> ${to}`, error);
      throw error;
    }
  }

  async sendInvitation(invitation: InvitationEmail): Promise<void> {
    const inviterName = invitation.invitedBy.firstName
      ? `${invitation.invitedBy.firstName} ${invitation.invitedBy.lastName || ''}`
      : invitation.invitedBy.email;

    const html = getInvitationTemplate({
      email: invitation.email,
      token: invitation.token,
      organizationName: invitation.organization.name,
      inviterName,
      roleLabel: ROLE_LABELS[invitation.role] || invitation.role,
    });

    await this.sendMail(
      invitation.email,
      `Invitation à rejoindre ${invitation.organization.name} sur CGI 242`,
      html
    );
  }

  async sendPasswordReset(data: PasswordResetEmail): Promise<void> {
    const greeting = data.firstName ? `Bonjour ${data.firstName}` : 'Bonjour';
    const html = getPasswordResetTemplate({ token: data.token, greeting });
    await this.sendMail(data.email, 'Réinitialisation de votre mot de passe CGI Engine', html);
  }

  async sendVerificationEmail(data: VerificationEmail): Promise<void> {
    const greeting = data.firstName ? `Bonjour ${data.firstName}` : 'Bonjour';
    const html = getVerificationTemplate({ token: data.token, greeting });
    const subject = data.isResend
      ? 'Nouveau lien de vérification - CGI 242'
      : 'Confirmez votre inscription sur CGI 242';
    await this.sendMail(data.email, subject, html);
  }

  async sendPaymentConfirmation(data: {
    email: string;
    firstName?: string | null;
    plan: string;
    amount: number;
    transactionId: string;
  }): Promise<void> {
    const greeting = data.firstName ? `Bonjour ${data.firstName}` : 'Bonjour';
    const html = getPaymentConfirmationTemplate({
      greeting,
      plan: data.plan,
      amount: data.amount,
      transactionId: data.transactionId,
    });
    await this.sendMail(data.email, 'Confirmation de paiement - CGI 242', html);
  }

  async sendInvoice(data: {
    email: string;
    firstName?: string | null;
    invoiceNumber: string;
    plan: string;
    amountTTC: number;
    amountHT: number;
    tvaAmount: number;
    pdfBuffer: Buffer;
  }): Promise<void> {
    if (!config.email.host) {
      logger.warn(`Email facture non envoyé (SMTP non configuré): ${data.invoiceNumber} -> ${data.email}`);
      return;
    }

    const greeting = data.firstName ? `Bonjour ${data.firstName}` : 'Bonjour';
    const html = getInvoiceTemplate({
      greeting,
      invoiceNumber: data.invoiceNumber,
      plan: data.plan,
      amountTTC: data.amountTTC,
      amountHT: data.amountHT,
      tvaAmount: data.tvaAmount,
    });

    try {
      await this.transporter.sendMail({
        from: config.email.from,
        to: data.email,
        subject: `Facture ${data.invoiceNumber} - CGI 242`,
        html,
        attachments: [{
          filename: `${data.invoiceNumber}.pdf`,
          content: data.pdfBuffer,
          contentType: 'application/pdf',
        }],
      });
      logger.info(`Facture ${data.invoiceNumber} envoyée à ${data.email}`);
    } catch (error) {
      logger.error(`Erreur envoi facture ${data.invoiceNumber}:`, error);
      throw error;
    }
  }

  async sendPaymentFailed(data: {
    email: string;
    firstName?: string | null;
    plan: string;
    reason?: string;
  }): Promise<void> {
    const greeting = data.firstName ? `Bonjour ${data.firstName}` : 'Bonjour';
    const html = getPaymentFailedTemplate({ greeting, plan: data.plan, reason: data.reason });
    await this.sendMail(data.email, 'Échec du paiement - CGI 242', html);
  }

  async sendAdminNotification(data: {
    type: 'QUOTA_RESET_SUCCESS' | 'QUOTA_RESET_FAILED' | 'CRITICAL_ERROR';
    message: string;
    details?: Record<string, unknown>;
  }): Promise<void> {
    const adminEmail = config.email.adminEmail || config.email.from;
    if (!adminEmail) {
      logger.warn('Pas d\'email admin configuré pour les notifications');
      return;
    }

    const { html, label } = getAdminNotificationTemplate(data);
    await this.sendMail(adminEmail, `[CGI-ENGINE] ${label}`, html);
  }
}

export default EmailService;
