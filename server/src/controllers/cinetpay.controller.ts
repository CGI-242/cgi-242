// server/src/controllers/cinetpay.controller.ts
import { Request, Response } from 'express';
import { CinetPayService, CinetPayStatus } from '../services/cinetpay.service.js';
import { createLogger } from '../utils/logger.js';
import { sendError, sendSuccess } from '../utils/helpers.js';

const logger = createLogger('CinetPayController');

/**
 * Webhook CinetPay - Reçoit les notifications de paiement
 * IMPORTANT: Cette route doit être accessible sans authentification
 */
export async function handleCinetPayWebhook(req: Request, res: Response): Promise<void> {
  try {
    const webhookData = req.body;

    logger.info('Webhook CinetPay reçu:', {
      transactionId: webhookData.cpm_trans_id,
      status: webhookData.cpm_trans_status,
      amount: webhookData.cpm_amount
    });

    // Valider la signature (optionnel mais recommandé)
    const signature = req.headers['x-cinetpay-signature'] as string;
    if (signature && !CinetPayService.validateWebhookSignature(webhookData, signature)) {
      logger.error('Signature webhook invalide');
      sendError(res, 'Invalid signature', 401);
      return;
    }

    // Vérifier le statut de la transaction auprès de CinetPay
    const transactionCheck = await CinetPayService.checkTransactionStatus(
      webhookData.cpm_trans_id
    );

    if (transactionCheck.code !== '00') {
      logger.error('Transaction non trouvée ou invalide:', transactionCheck.message);
      sendError(res, 'Transaction not found', 404);
      return;
    }

    const transactionData = transactionCheck.data;

    // Traiter selon le statut
    switch (transactionData.cpm_trans_status) {
      case CinetPayStatus.ACCEPTED:
        logger.info('Paiement accepté:', transactionData.cpm_trans_id);
        await CinetPayService.handleSuccessfulPayment(transactionData);
        break;

      case CinetPayStatus.REFUSED:
      case CinetPayStatus.CANCELLED:
        logger.warn('Paiement refusé/annulé:', transactionData.cpm_trans_id);
        await CinetPayService.handleFailedPayment(transactionData);
        break;

      case CinetPayStatus.PENDING:
        logger.info('Paiement en attente:', transactionData.cpm_trans_id);
        // Ne rien faire, attendre la confirmation finale
        break;

      default:
        logger.warn('Statut de transaction inconnu:', transactionData.cpm_trans_status);
    }

    // Toujours répondre 200 OK à CinetPay
    sendSuccess(res, { received: true });

  } catch (error) {
    logger.error('Erreur traitement webhook CinetPay:', error);
    // Répondre 200 même en cas d'erreur pour que CinetPay ne retente pas
    sendSuccess(res, { received: true, error: 'Processing failed' });
  }
}

/**
 * Créer un lien de paiement pour un abonnement
 */
export async function createSubscriptionPayment(req: Request, res: Response): Promise<void> {
  try {
    const { plan } = req.body;
    const user = req.user!; // Garanti par authMiddleware

    // Importer SUBSCRIPTION_PLANS
    const { SUBSCRIPTION_PLANS } = await import('../config/plans.js');

    // Valider le plan
    if (!SUBSCRIPTION_PLANS[plan as keyof typeof SUBSCRIPTION_PLANS]) {
      sendError(res, 'Plan invalide', 400);
      return;
    }

    const planConfig = SUBSCRIPTION_PLANS[plan as keyof typeof SUBSCRIPTION_PLANS];

    // Vérifier que c'est un plan payant
    if (!planConfig.price || planConfig.price === 0) {
      sendError(res, 'Le plan FREE ne nécessite pas de paiement', 400);
      return;
    }

    // Créer le lien de paiement
    const paymentLink = await CinetPayService.createPaymentLink({
      userId: user.id,
      userEmail: user.email,
      userName: `${user.firstName} ${user.lastName}`,
      plan,
      amount: planConfig.price,
      description: `Abonnement ${plan} - CGI 242`
    });

    logger.info(`Lien de paiement créé pour ${user.email}, plan ${plan}`);

    sendSuccess(res, {
      paymentUrl: paymentLink.data.payment_url,
      paymentToken: paymentLink.data.payment_token
    });

  } catch (error) {
    logger.error('Erreur création lien paiement:', error);
    sendError(res, 'Échec de création du lien de paiement', 500);
  }
}

/**
 * Vérifier le statut d'un paiement
 */
export async function checkPaymentStatus(req: Request, res: Response): Promise<void> {
  try {
    const { transactionId } = req.params;
    const user = req.user!;

    const transactionCheck = await CinetPayService.checkTransactionStatus(transactionId);

    if (transactionCheck.code !== '00') {
      sendError(res, 'Transaction non trouvée', 404);
      return;
    }

    // Vérifier que la transaction appartient à l'utilisateur
    const metadata = JSON.parse(transactionCheck.data.cpm_custom || '{}');
    if (metadata.userId !== user.id) {
      sendError(res, 'Non autorisé', 403);
      return;
    }

    sendSuccess(res, {
      status: transactionCheck.data.cpm_trans_status,
      amount: transactionCheck.data.cpm_amount,
      currency: transactionCheck.data.cpm_currency,
      paymentDate: transactionCheck.data.cpm_payment_date,
      paymentMethod: transactionCheck.data.payment_method
    });

  } catch (error) {
    logger.error('Erreur vérification statut paiement:', error);
    sendError(res, 'Échec de vérification du paiement', 500);
  }
}

/**
 * Obtenir l'historique des paiements de l'utilisateur
 */
export async function getPaymentHistory(req: Request, res: Response): Promise<void> {
  try {
    const user = req.user!;
    const limit = parseInt(req.query.limit as string) || 10;

    const payments = await CinetPayService.getUserPayments(user.id, limit);

    sendSuccess(res, { payments });

  } catch (error) {
    logger.error('Erreur récupération historique paiements:', error);
    sendError(res, 'Échec de récupération de l\'historique', 500);
  }
}
