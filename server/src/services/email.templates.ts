// server/src/services/email.templates.ts
// Templates HTML pour les emails

import { config } from '../config/environment.js';

const STYLES = {
  base: `
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f3f4f6; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
    .header { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 30px 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; }
    .content { padding: 30px; }
    .button { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white !important; text-decoration: none; border-radius: 8px; font-weight: 600; }
    .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; background: #f9fafb; border-top: 1px solid #e5e7eb; }
  `,
  success: `background: #059669;`,
  error: `background: #dc2626;`,
};

export interface InvitationData {
  email: string;
  token: string;
  organizationName: string;
  inviterName: string;
  roleLabel: string;
}

export function getInvitationTemplate(data: InvitationData): string {
  const acceptUrl = `${config.frontendUrl}/auth/accept-invitation?token=${data.token}`;
  return `
    <!DOCTYPE html>
    <html><head><meta charset="utf-8"><style>${STYLES.base}</style></head>
    <body>
      <div class="container">
        <div class="header"><h1>CGI 242</h1></div>
        <div class="content">
          <h2>Invitation à rejoindre ${data.organizationName}</h2>
          <p>Bonjour,</p>
          <p>${data.inviterName} vous invite à rejoindre <strong>${data.organizationName}</strong> sur CGI 242 en tant que <strong>${data.roleLabel}</strong>.</p>
          <p>CGI 242 est une plateforme d'IA spécialisée dans le Code Général des Impôts du Congo.</p>
          <p style="text-align: center;"><a href="${acceptUrl}" class="button">Accepter l'invitation</a></p>
          <p style="font-size: 12px; color: #666;">Cette invitation expire dans 7 jours.</p>
        </div>
        <div class="footer"><p>© ${new Date().getFullYear()} CGI 242. Tous droits réservés.</p></div>
      </div>
    </body>
    </html>
  `;
}

export interface PasswordResetData {
  token: string;
  greeting: string;
}

export function getPasswordResetTemplate(data: PasswordResetData): string {
  const resetUrl = `${config.frontendUrl}/auth/reset-password?token=${data.token}`;
  return `
    <!DOCTYPE html>
    <html><head><meta charset="utf-8"><style>${STYLES.base}</style></head>
    <body>
      <div class="container">
        <div class="header"><h1>CGI 242</h1></div>
        <div class="content">
          <h2>Réinitialisation de mot de passe</h2>
          <p>${data.greeting},</p>
          <p>Vous avez demandé la réinitialisation de votre mot de passe CGI Engine.</p>
          <p>Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
          <p style="text-align: center;"><a href="${resetUrl}" class="button">Réinitialiser mon mot de passe</a></p>
          <p style="font-size: 12px; color: #666;">Ce lien expire dans 1 heure.</p>
          <p style="font-size: 12px; color: #666;">Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
        </div>
        <div class="footer"><p>© ${new Date().getFullYear()} CGI 242. Tous droits réservés.</p></div>
      </div>
    </body>
    </html>
  `;
}

export interface VerificationData {
  token: string;
  greeting: string;
}

export function getVerificationTemplate(data: VerificationData): string {
  const verifyUrl = `${config.frontendUrl}/auth/verify-email?token=${data.token}`;
  return `
    <!DOCTYPE html>
    <html lang="fr"><head><meta charset="utf-8"><style>${STYLES.base}
      .warning-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 0 8px 8px 0; margin: 20px 0; }
      .warning-box p { margin: 0; color: #92400e; font-size: 14px; }
      .features { background: #f0f9ff; border-radius: 8px; padding: 20px; margin: 20px 0; }
      .features h3 { margin-top: 0; color: #1e40af; font-size: 16px; }
      .features ul { margin: 0; padding-left: 20px; }
      .features li { margin: 8px 0; color: #374151; }
    </style></head>
    <body>
      <div class="container">
        <div class="header"><h1>CGI 242</h1><p style="opacity: 0.9;">Votre assistant fiscal intelligent</p></div>
        <div class="content">
          <h2 style="color: #1e40af;">Bienvenue sur CGI 242 !</h2>
          <p>${data.greeting},</p>
          <p>Nous sommes ravis de vous accueillir sur <strong>CGI 242</strong>, votre plateforme d'IA dédiée au Code Général des Impôts du Congo-Brazzaville.</p>
          <p>Pour finaliser votre inscription, veuillez confirmer votre adresse email :</p>
          <p style="text-align: center;"><a href="${verifyUrl}" class="button">Confirmer mon email</a></p>
          <div class="warning-box"><p><strong>Important :</strong> Ce lien expire dans <strong>30 minutes</strong>.</p></div>
          <div class="features">
            <h3>Ce qui vous attend :</h3>
            <ul>
              <li>Consultation intelligente du CGI 2025</li>
              <li>Réponses instantanées à vos questions fiscales</li>
              <li>Simulateurs ITS, IS et autres impôts</li>
              <li>Recherche avancée dans les articles du code</li>
            </ul>
          </div>
          <p>Si le bouton ne fonctionne pas, copiez ce lien :</p>
          <p style="word-break: break-all; font-size: 12px; color: #6b7280; background: #f3f4f6; padding: 10px; border-radius: 4px;">${verifyUrl}</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} CGI 242 - NormX AI. Tous droits réservés.</p>
          <p>Brazzaville, République du Congo</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export interface PaymentConfirmationData {
  greeting: string;
  plan: string;
  amount: number;
  transactionId: string;
}

export function getPaymentConfirmationTemplate(data: PaymentConfirmationData): string {
  return `
    <!DOCTYPE html>
    <html><head><meta charset="utf-8"><style>${STYLES.base}
      .header { ${STYLES.success} }
      .details { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
    </style></head>
    <body>
      <div class="container">
        <div class="header"><h1>Paiement confirmé</h1></div>
        <div class="content">
          <p>${data.greeting},</p>
          <p>Votre paiement a été traité avec succès !</p>
          <div class="details">
            <p><strong>Plan:</strong> ${data.plan}</p>
            <p><strong>Montant:</strong> ${data.amount.toLocaleString('fr-FR')} FCFA</p>
            <p><strong>Transaction:</strong> ${data.transactionId}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
          </div>
          <p>Votre abonnement est maintenant actif. Profitez de CGI 242 !</p>
        </div>
        <div class="footer"><p>© ${new Date().getFullYear()} CGI 242. Tous droits réservés.</p></div>
      </div>
    </body>
    </html>
  `;
}

export interface InvoiceEmailData {
  greeting: string;
  invoiceNumber: string;
  plan: string;
  amountTTC: number;
  amountHT: number;
  tvaAmount: number;
}

export function getInvoiceTemplate(data: InvoiceEmailData): string {
  return `
    <!DOCTYPE html>
    <html><head><meta charset="utf-8"><style>${STYLES.base}
      .invoice-box { background: white; padding: 20px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #1e40af; }
      .amount { font-size: 24px; color: #1e40af; font-weight: bold; }
      .legal { background: #f3f4f6; padding: 15px; border-radius: 6px; font-size: 11px; color: #6b7280; margin-top: 15px; }
    </style></head>
    <body>
      <div class="container">
        <div class="header"><h1>Votre facture CGI 242</h1></div>
        <div class="content">
          <p>${data.greeting},</p>
          <p>Veuillez trouver ci-joint votre facture pour votre abonnement CGI 242.</p>
          <div class="invoice-box">
            <p style="margin: 0; color: #6b7280; font-size: 12px;">Facture N°</p>
            <p style="margin: 5px 0; font-size: 18px; font-weight: bold;">${data.invoiceNumber}</p>
            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
              <p><strong>Abonnement:</strong> ${data.plan}</p>
              <p style="color: #6b7280; font-size: 14px;">Montant HT: ${data.amountHT.toLocaleString('fr-FR')} XAF</p>
              <p style="color: #6b7280; font-size: 14px;">TVA (18%): ${data.tvaAmount.toLocaleString('fr-FR')} XAF</p>
              <p class="amount">Total TTC: ${data.amountTTC.toLocaleString('fr-FR')} XAF</p>
            </div>
          </div>
          <p>La facture PDF est jointe. Vous pouvez également la télécharger depuis votre espace client.</p>
          <div class="legal">
            <p style="margin: 0;"><strong>Conservation des documents</strong></p>
            <p style="margin: 5px 0 0 0;">Conformément à la législation fiscale, conservez cette facture pendant au moins 10 ans.</p>
          </div>
        </div>
        <div class="footer">
          <p>NORMX AI SAS - Brazzaville, République du Congo</p>
          <p>© ${new Date().getFullYear()} CGI 242. Tous droits réservés.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export interface PaymentFailedData {
  greeting: string;
  plan: string;
  reason?: string;
}

export function getPaymentFailedTemplate(data: PaymentFailedData): string {
  const retryUrl = `${config.frontendUrl}/pricing`;
  return `
    <!DOCTYPE html>
    <html><head><meta charset="utf-8"><style>${STYLES.base}.header { ${STYLES.error} }</style></head>
    <body>
      <div class="container">
        <div class="header"><h1>Échec du paiement</h1></div>
        <div class="content">
          <p>${data.greeting},</p>
          <p>Votre paiement pour l'abonnement <strong>${data.plan}</strong> n'a pas pu être traité.</p>
          ${data.reason ? `<p>Raison: ${data.reason}</p>` : ''}
          <p>Veuillez réessayer ou contacter notre support si le problème persiste.</p>
          <p style="text-align: center;"><a href="${retryUrl}" class="button">Réessayer le paiement</a></p>
        </div>
        <div class="footer"><p>© ${new Date().getFullYear()} CGI 242. Tous droits réservés.</p></div>
      </div>
    </body>
    </html>
  `;
}

export interface AdminNotificationData {
  type: 'QUOTA_RESET_SUCCESS' | 'QUOTA_RESET_FAILED' | 'CRITICAL_ERROR';
  message: string;
  details?: Record<string, unknown>;
}

export function getAdminNotificationTemplate(data: AdminNotificationData): { html: string; label: string } {
  const types = {
    QUOTA_RESET_SUCCESS: { label: 'Reset quotas réussi', color: '#059669' },
    QUOTA_RESET_FAILED: { label: 'Échec reset quotas', color: '#dc2626' },
    CRITICAL_ERROR: { label: 'Erreur critique', color: '#dc2626' },
  };
  const { label, color } = types[data.type];
  const html = `
    <!DOCTYPE html>
    <html><head><meta charset="utf-8"><style>
      body { font-family: monospace; line-height: 1.6; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background: ${color}; color: white; padding: 20px; text-align: center; }
      .content { padding: 20px; background: #f9fafb; }
      .details { background: #1f2937; color: #10b981; padding: 15px; border-radius: 8px; overflow-x: auto; }
    </style></head>
    <body>
      <div class="container">
        <div class="header"><h1>[CGI-ENGINE] ${label}</h1></div>
        <div class="content">
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          <p><strong>Message:</strong> ${data.message}</p>
          ${data.details ? `<div class="details"><pre>${JSON.stringify(data.details, null, 2)}</pre></div>` : ''}
        </div>
      </div>
    </body>
    </html>
  `;
  return { html, label };
}
