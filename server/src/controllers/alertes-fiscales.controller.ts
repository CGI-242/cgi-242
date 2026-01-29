// server/src/controllers/alertes-fiscales.controller.ts
import { Request, Response } from 'express';
import { AlertesFiscalesService } from '../services/alertes-fiscales.service.js';
import { sendSuccess, sendError } from '../utils/helpers.js';
import { createLogger } from '../utils/logger.js';
import { AlerteType, AlerteCategorie } from '@prisma/client';

const logger = createLogger('AlertesFiscalesController');

/**
 * Liste les alertes fiscales avec filtres optionnels
 * GET /api/alertes-fiscales
 * Query params: type, categorie, version, articleNumero, actif
 */
export async function getAlertes(req: Request, res: Response): Promise<void> {
  try {
    const { type, categorie, version, articleNumero, actif } = req.query;

    const filters = {
      type: type as AlerteType | undefined,
      categorie: categorie as AlerteCategorie | undefined,
      version: version as string | undefined,
      articleNumero: articleNumero as string | undefined,
      actif: actif !== undefined ? actif === 'true' : undefined,
    };

    const alertes = await AlertesFiscalesService.getAlertes(filters);

    sendSuccess(res, {
      alertes,
      total: alertes.length,
    });
  } catch (error) {
    logger.error('Erreur getAlertes:', error);
    sendError(res, 'Erreur lors de la récupération des alertes fiscales', 500);
  }
}

/**
 * Récupère une alerte par son ID
 * GET /api/alertes-fiscales/:id
 */
export async function getAlerteById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const alerte = await AlertesFiscalesService.getAlerteById(id);

    if (!alerte) {
      sendError(res, 'Alerte non trouvée', 404);
      return;
    }

    sendSuccess(res, alerte);
  } catch (error) {
    logger.error('Erreur getAlerteById:', error);
    sendError(res, 'Erreur lors de la récupération de l\'alerte', 500);
  }
}

/**
 * Récupère les alertes d'un article par son numéro
 * GET /api/alertes-fiscales/article/:numero
 */
export async function getAlertesForArticle(req: Request, res: Response): Promise<void> {
  try {
    const { numero } = req.params;

    const alertes = await AlertesFiscalesService.getAlertesForArticle(numero);

    sendSuccess(res, {
      articleNumero: numero,
      alertes,
      total: alertes.length,
    });
  } catch (error) {
    logger.error('Erreur getAlertesForArticle:', error);
    sendError(res, 'Erreur lors de la récupération des alertes pour cet article', 500);
  }
}

/**
 * Récupère les statistiques des alertes par type
 * GET /api/alertes-fiscales/stats/by-type
 */
export async function getStatsByType(req: Request, res: Response): Promise<void> {
  try {
    const { version } = req.query;

    const stats = await AlertesFiscalesService.countByType(version as string | undefined);

    sendSuccess(res, stats);
  } catch (error) {
    logger.error('Erreur getStatsByType:', error);
    sendError(res, 'Erreur lors de la récupération des statistiques par type', 500);
  }
}

/**
 * Récupère les statistiques des alertes par catégorie
 * GET /api/alertes-fiscales/stats/by-categorie
 */
export async function getStatsByCategorie(req: Request, res: Response): Promise<void> {
  try {
    const { version } = req.query;

    const stats = await AlertesFiscalesService.countByCategorie(version as string | undefined);

    sendSuccess(res, stats);
  } catch (error) {
    logger.error('Erreur getStatsByCategorie:', error);
    sendError(res, 'Erreur lors de la récupération des statistiques par catégorie', 500);
  }
}

/**
 * Lance l'extraction et l'ingestion des alertes
 * POST /api/alertes-fiscales/extract
 * Body: { version?: string }
 */
export async function extractAlertes(req: Request, res: Response): Promise<void> {
  try {
    const { version = '2026' } = req.body;

    logger.info(`Lancement de l'extraction des alertes pour la version ${version}`);

    const result = await AlertesFiscalesService.extractAndIngest(version);

    sendSuccess(res, {
      message: 'Extraction terminée avec succès',
      ...result,
    });
  } catch (error) {
    logger.error('Erreur extractAlertes:', error);
    sendError(res, 'Erreur lors de l\'extraction des alertes fiscales', 500);
  }
}
