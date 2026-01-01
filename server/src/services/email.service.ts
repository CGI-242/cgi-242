import nodemailer from 'nodemailer';
import { config } from '../config/environment.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('EmailService');

interface InvitationEmail {
  email: string;
  token: string;
  organization: {
    name: string;
  };
  invitedBy: {
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
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
}

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

  /**
   * Envoyer un email
   */
  private async sendMail(
    to: string,
    subject: string,
    html: string
  ): Promise<void> {
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

  /**
   * Envoyer une invitation à rejoindre une organisation
   */
  async sendInvitation(invitation: InvitationEmail): Promise<void> {
    const inviterName = invitation.invitedBy.firstName
      ? `${invitation.invitedBy.firstName} ${invitation.invitedBy.lastName || ''}`
      : invitation.invitedBy.email;

    const acceptUrl = `${config.frontendUrl}/auth/accept-invitation?token=${invitation.token}`;

    const roleLabel = this.getRoleLabel(invitation.role);

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1e40af; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .button { display: inline-block; padding: 12px 24px; background: #1e40af; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>CGI 242</h1>
          </div>
          <div class="content">
            <h2>Invitation à rejoindre ${invitation.organization.name}</h2>
            <p>Bonjour,</p>
            <p>${inviterName} vous invite à rejoindre <strong>${invitation.organization.name}</strong> sur CGI 242 en tant que <strong>${roleLabel}</strong>.</p>
            <p>CGI 242 est une plateforme d'intelligence artificielle spécialisée dans le Code Général des Impôts du Congo-Brazzaville.</p>
            <p style="text-align: center;">
              <a href="${acceptUrl}" class="button">Accepter l'invitation</a>
            </p>
            <p style="font-size: 12px; color: #666;">Cette invitation expire dans 7 jours.</p>
            <p style="font-size: 12px; color: #666;">Si vous n'avez pas de compte, vous pourrez en créer un en cliquant sur le bouton ci-dessus.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} CGI 242. Tous droits réservés.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendMail(
      invitation.email,
      `Invitation à rejoindre ${invitation.organization.name} sur CGI 242`,
      html
    );
  }

  /**
   * Envoyer un email de réinitialisation de mot de passe
   */
  async sendPasswordReset(data: PasswordResetEmail): Promise<void> {
    const resetUrl = `${config.frontendUrl}/auth/reset-password?token=${data.token}`;
    const greeting = data.firstName ? `Bonjour ${data.firstName}` : 'Bonjour';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1e40af; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .button { display: inline-block; padding: 12px 24px; background: #1e40af; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>CGI 242</h1>
          </div>
          <div class="content">
            <h2>Réinitialisation de mot de passe</h2>
            <p>${greeting},</p>
            <p>Vous avez demandé la réinitialisation de votre mot de passe CGI Engine.</p>
            <p>Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
            <p style="text-align: center;">
              <a href="${resetUrl}" class="button">Réinitialiser mon mot de passe</a>
            </p>
            <p style="font-size: 12px; color: #666;">Ce lien expire dans 1 heure.</p>
            <p style="font-size: 12px; color: #666;">Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} CGI 242. Tous droits réservés.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendMail(
      data.email,
      'Réinitialisation de votre mot de passe CGI Engine',
      html
    );
  }

  /**
   * Envoyer un email de vérification
   */
  async sendVerificationEmail(data: VerificationEmail): Promise<void> {
    const verifyUrl = `${config.frontendUrl}/auth/verify-email?token=${data.token}`;
    const greeting = data.firstName
      ? `Bonjour ${data.firstName}`
      : 'Bienvenue';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1e40af; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .button { display: inline-block; padding: 12px 24px; background: #1e40af; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>CGI 242</h1>
          </div>
          <div class="content">
            <h2>Vérification de votre email</h2>
            <p>${greeting},</p>
            <p>Merci de vous être inscrit sur CGI 242 !</p>
            <p>Pour activer votre compte et accéder à toutes les fonctionnalités, veuillez vérifier votre adresse email :</p>
            <p style="text-align: center;">
              <a href="${verifyUrl}" class="button">Vérifier mon email</a>
            </p>
            <p style="font-size: 12px; color: #666;">Ce lien expire dans 24 heures.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} CGI 242. Tous droits réservés.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendMail(data.email, 'Vérifiez votre email CGI Engine', html);
  }

  /**
   * Obtenir le label d'un rôle
   */
  private getRoleLabel(role: string): string {
    const labels: Record<string, string> = {
      OWNER: 'Propriétaire',
      ADMIN: 'Administrateur',
      MEMBER: 'Membre',
      VIEWER: 'Lecteur',
    };
    return labels[role] || role;
  }
}

export default EmailService;
