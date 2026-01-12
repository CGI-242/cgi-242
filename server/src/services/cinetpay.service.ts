// server/src/services/cinetpay.service.ts
import axios from 'axios';
import crypto from 'crypto';
import { config } from '../config/environment.js';
import { createLogger } from '../utils/logger.js';
import { prisma } from '../config/database.js';
import { SUBSCRIPTION_PLANS } from '../config/plans.js';
import EmailService from './email.service.js';
import { InvoiceService } from './invoice.service.js';
import fs from 'fs';

const logger = createLogger('CinetPayService');
const emailService = new EmailService();

// Configuration CinetPay
const CINETPAY_API_URL = 'https://api-checkout.cinetpay.com/v2';
const CINETPAY_SITE_ID = process.env.CINETPAY_SITE_ID || '';
const CINETPAY_API_KEY = process.env.CINETPAY_API_KEY || '';
const CINETPAY_SECRET_KEY = process.env.CINETPAY_SECRET_KEY || '';

/**
 * Modes de paiement CinetPay disponibles au Congo
 */
export enum CinetPayPaymentMethod {
  MOBILE_MONEY = 'MOBILE_MONEY', // Airtel Money, MTN Mobile Money
  CARD = 'CARD',                   // Cartes bancaires Visa/Mastercard
  FLOOZ = 'FLOOZ',                 // Moov Money (Flooz)
  ALL = 'ALL'                      // Tous les moyens
}

/**
 * Statuts de transaction CinetPay
 */
export enum CinetPayStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REFUSED = 'REFUSED',
  CANCELLED = 'CANCELLED'
}

interface CinetPayPaymentLink {
  code: string;
  message: string;
  data: {
    payment_url: string;
    payment_token: string;
  };
}

interface CinetPayTransactionData {
  cpm_trans_id: string;
  cpm_trans_date: string;
  cpm_amount: number;
  cpm_currency: string;
  cpm_payid: string;
  cpm_payment_date: string;
  cpm_payment_time: string;
  cpm_error_message: string;
  payment_method: string;
  cpm_phone_prefixe: string;
  cel_phone_num: string;
  cpm_ipn_ack: string;
  created_at: string;
  updated_at: string;
  cpm_result: string;
  cpm_trans_status: string;
  cpm_custom: string;
  buyer_name: string;
}

interface CinetPayTransactionCheck {
  code: string;
  message: string;
  data: CinetPayTransactionData;
}

// Type pour les données du webhook
interface CinetPayWebhookData {
  cpm_trans_id: string;
  cpm_trans_status: string;
  cpm_amount: number;
  [key: string]: string | number | boolean;
}

export class CinetPayService {
  /**
   * Créer un lien de paiement pour un abonnement
   */
  static async createPaymentLink(params: {
    userId: string;
    userEmail: string;
    userName: string;
    plan: string;
    amount: number;
    description: string;
  }): Promise<CinetPayPaymentLink> {
    try {
      const transactionId = `SUB_${params.userId}_${Date.now()}`;
      const notifyUrl = `${config.backendUrl}/api/webhooks/cinetpay`;
      const returnUrl = `${config.frontendUrl}/dashboard?payment=success`;

      const payload = {
        apikey: CINETPAY_API_KEY,
        site_id: CINETPAY_SITE_ID,
        transaction_id: transactionId,
        amount: params.amount,
        currency: 'XAF', // Franc CFA (Congo, Cameroun, Gabon, etc.)
        description: params.description,
        customer_name: params.userName,
        customer_surname: params.userName,
        customer_email: params.userEmail,
        customer_phone_number: '', // Optionnel
        customer_address: 'Congo-Brazzaville',
        customer_city: 'Brazzaville',
        customer_country: 'CG', // Code pays Congo
        customer_state: 'CG',
        customer_zip_code: '',
        notify_url: notifyUrl,
        return_url: returnUrl,
        channels: 'ALL', // Accepter tous les moyens de paiement
        metadata: JSON.stringify({
          userId: params.userId,
          plan: params.plan,
          type: 'subscription'
        }),
        lang: 'fr',
        invoice_data: {
          Subscription: params.plan,
          'Période': 'Mensuel',
          'Prix': `${params.amount} XAF`
        }
      };

      logger.info(`Création lien paiement CinetPay pour ${params.userEmail}:`, {
        transactionId,
        plan: params.plan,
        amount: params.amount
      });

      const response = await axios.post<CinetPayPaymentLink>(
        `${CINETPAY_API_URL}/payment`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.code !== '201') {
        throw new Error(`CinetPay error: ${response.data.message}`);
      }

      // Sauvegarder la transaction en pending
      await prisma.payment.create({
        data: {
          subscriptionId: '', // Sera mis à jour après succès
          amount: params.amount,
          currency: 'XAF',
          status: 'pending',
          paymentMethod: 'CinetPay',
          metadata: {
            transactionId,
            paymentToken: response.data.data.payment_token,
            plan: params.plan,
            userId: params.userId
          }
        }
      });

      logger.info(`Lien de paiement créé avec succès: ${response.data.data.payment_url}`);

      return response.data;

    } catch (error) {
      logger.error('Erreur création lien paiement CinetPay:', error);
      throw new Error('Échec de création du lien de paiement');
    }
  }

  /**
   * Vérifier le statut d'une transaction
   */
  static async checkTransactionStatus(transactionId: string): Promise<CinetPayTransactionCheck> {
    try {
      const payload = {
        apikey: CINETPAY_API_KEY,
        site_id: CINETPAY_SITE_ID,
        transaction_id: transactionId
      };

      const response = await axios.post<CinetPayTransactionCheck>(
        `${CINETPAY_API_URL}/payment/check`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;

    } catch (error) {
      logger.error(`Erreur vérification transaction ${transactionId}:`, error);
      throw new Error('Échec de vérification de la transaction');
    }
  }

  /**
   * Valider la signature du webhook CinetPay
   */
  static validateWebhookSignature(data: CinetPayWebhookData, signature: string): boolean {
    try {
      // CinetPay utilise la clé secrète pour signer
      const expectedSignature = crypto
        .createHmac('sha256', CINETPAY_SECRET_KEY)
        .update(JSON.stringify(data))
        .digest('hex');

      return signature === expectedSignature;

    } catch (error) {
      logger.error('Erreur validation signature webhook:', error);
      return false;
    }
  }

  /**
   * Traiter un paiement réussi
   */
  static async handleSuccessfulPayment(data: CinetPayTransactionCheck['data']): Promise<void> {
    try {
      const metadata = JSON.parse(data.cpm_custom || '{}');
      const { userId, plan } = metadata;

      if (!userId || !plan) {
        throw new Error('Métadonnées manquantes dans la transaction');
      }

      logger.info(`Traitement paiement réussi pour user ${userId}, plan ${plan}`);

      // Vérifier que le plan existe
      const planConfig = SUBSCRIPTION_PLANS[plan as keyof typeof SUBSCRIPTION_PLANS];
      if (!planConfig) {
        throw new Error(`Plan inconnu: ${plan}`);
      }

      // Calculer les dates de période
      const currentPeriodStart = new Date();
      const currentPeriodEnd = new Date();
      currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);

      // Créer ou mettre à jour la subscription dans une transaction
      await prisma.$transaction(async (tx) => {
        // 1. Upsert subscription
        const subscription = await tx.subscription.upsert({
          where: {
            userId: userId,
            type: planConfig.type
          },
          update: {
            plan: plan,
            status: 'ACTIVE',
            questionsPerMonth: planConfig.questionsPerMonth,
            questionsUsed: 0,
            maxMembers: planConfig.maxMembers,
            currentPeriodStart,
            currentPeriodEnd,
            updatedAt: new Date()
          },
          create: {
            userId: userId,
            type: planConfig.type,
            plan: plan,
            status: 'ACTIVE',
            questionsPerMonth: planConfig.questionsPerMonth,
            questionsUsed: 0,
            maxMembers: planConfig.maxMembers,
            currentPeriodStart,
            currentPeriodEnd
          }
        });

        // 2. Créer le payment record
        await tx.payment.create({
          data: {
            subscriptionId: subscription.id,
            amount: data.cpm_amount,
            currency: data.cpm_currency,
            status: 'succeeded',
            paymentMethod: data.payment_method,
            metadata: {
              transactionId: data.cpm_trans_id,
              paymentId: data.cpm_payid,
              transactionDate: data.cpm_trans_date,
              paymentDate: data.cpm_payment_date,
              phone: data.cel_phone_num,
              buyerName: data.buyer_name
            }
          }
        });

        logger.info(`Subscription ${plan} activée pour user ${userId}`);
      });

      // Récupérer les informations utilisateur pour la facture
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          email: true,
          firstName: true,
          lastName: true,
          phone: true
        }
      });

      if (!user) {
        logger.error(`Utilisateur ${userId} non trouvé pour la facture`);
        return;
      }

      // Récupérer le payment créé pour la facture
      const payment = await prisma.payment.findFirst({
        where: {
          metadata: {
            path: ['transactionId'],
            equals: data.cpm_trans_id
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      if (!payment) {
        logger.warn(`Payment non trouvé pour transaction ${data.cpm_trans_id}`);
      }

      // Générer et envoyer la facture
      try {
        const customerName = user.firstName && user.lastName
          ? `${user.firstName} ${user.lastName}`
          : user.firstName || user.email.split('@')[0];

        // Créer la facture
        const invoiceResult = await InvoiceService.createInvoice(
          {
            paymentId: payment?.id || '',
            userId,
            plan,
            planName: planConfig.name,
            amountTTC: data.cpm_amount,
            currency: data.cpm_currency || 'XAF',
            transactionId: data.cpm_trans_id,
            paymentDate: new Date(data.cpm_payment_date || Date.now()),
            periodStart: currentPeriodStart,
            periodEnd: currentPeriodEnd,
          },
          {
            name: customerName,
            email: user.email,
            phone: user.phone || undefined,
          }
        );

        logger.info(`Facture ${invoiceResult.invoiceNumber} créée pour ${user.email}`);

        // Lire le PDF généré
        const pdfBuffer = fs.readFileSync(invoiceResult.pdfPath);

        // Calculer les montants pour l'email
        const { amountHT, tvaAmount } = InvoiceService.calculatePriceBreakdown(data.cpm_amount);

        // Envoyer la facture par email
        await emailService.sendInvoice({
          email: user.email,
          firstName: user.firstName,
          invoiceNumber: invoiceResult.invoiceNumber,
          plan: planConfig.name,
          amountTTC: data.cpm_amount,
          amountHT,
          tvaAmount,
          pdfBuffer,
        });

        // Marquer la facture comme envoyée
        await InvoiceService.markAsSent(invoiceResult.invoiceId);

        logger.info(`Facture ${invoiceResult.invoiceNumber} envoyée à ${user.email}`);

      } catch (invoiceError) {
        logger.error('Erreur génération/envoi facture:', invoiceError);
        // Ne pas bloquer le processus si la facture échoue
        // Envoyer quand même l'email de confirmation simple
        try {
          await emailService.sendPaymentConfirmation({
            email: user.email,
            firstName: user.firstName,
            plan: plan,
            amount: data.cpm_amount,
            transactionId: data.cpm_trans_id
          });
        } catch (emailError) {
          logger.error('Erreur envoi email confirmation paiement:', emailError);
        }
      }

    } catch (error) {
      logger.error('Erreur traitement paiement réussi:', error);
      throw error;
    }
  }

  /**
   * Traiter un paiement échoué
   */
  static async handleFailedPayment(data: CinetPayTransactionCheck['data']): Promise<void> {
    try {
      const metadata = JSON.parse(data.cpm_custom || '{}');
      const { userId } = metadata;

      logger.warn(`Paiement échoué pour user ${userId}:`, {
        reason: data.cpm_error_message,
        transactionId: data.cpm_trans_id
      });

      // Envoyer email d'échec de paiement
      if (userId) {
        try {
          const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { email: true, firstName: true }
          });
          if (user) {
            const metadata = JSON.parse(data.cpm_custom || '{}');
            await emailService.sendPaymentFailed({
              email: user.email,
              firstName: user.firstName,
              plan: metadata.plan || 'Inconnu',
              reason: data.cpm_error_message
            });
          }
        } catch (emailError) {
          logger.error('Erreur envoi email échec paiement:', emailError);
        }
      }

    } catch (error) {
      logger.error('Erreur traitement paiement échoué:', error);
    }
  }

  /**
   * Obtenir les informations de paiement pour un user
   */
  static async getUserPayments(userId: string, limit = 10) {
    return prisma.payment.findMany({
      where: {
        subscription: {
          userId: userId
        }
      },
      include: {
        subscription: {
          select: {
            plan: true,
            type: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });
  }
}
