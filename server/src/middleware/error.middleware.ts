import { Request, Response, NextFunction } from 'express';
import { config } from '../config/environment.js';
import { createLogger } from '../utils/logger.js';
import { ERROR_MESSAGES } from '../utils/constants.js';

const logger = createLogger('ErrorMiddleware');

/**
 * Classe d'erreur personnalisée avec code de statut HTTP
 */
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  errors?: Array<{ field: string; message: string }>;

  constructor(
    message: string,
    statusCode = 400,
    errors?: Array<{ field: string; message: string }>
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.errors = errors;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Erreurs prédéfinies
 */
export const Errors = {
  unauthorized: () => new AppError(ERROR_MESSAGES.UNAUTHORIZED, 401),
  forbidden: () => new AppError(ERROR_MESSAGES.FORBIDDEN, 403),
  notFound: (resource = 'Ressource') =>
    new AppError(`${resource} non trouvé(e)`, 404),
  badRequest: (message: string) => new AppError(message, 400),
  conflict: (message: string) => new AppError(message, 409),
  internal: () => new AppError(ERROR_MESSAGES.INTERNAL_ERROR, 500),
  quotaExceeded: () => new AppError(ERROR_MESSAGES.QUOTA_EXCEEDED, 403),
  validation: (errors: Array<{ field: string; message: string }>) =>
    new AppError(ERROR_MESSAGES.VALIDATION_ERROR, 400, errors),
};

/**
 * Gestionnaire d'erreurs 404
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  res.status(404).json({
    success: false,
    error: `Route non trouvée: ${req.method} ${req.originalUrl}`,
  });
};

/**
 * Gestionnaire d'erreurs global
 */
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Log de l'erreur
  if (err instanceof AppError && err.isOperational) {
    logger.warn(`Erreur opérationnelle: ${err.message}`, {
      statusCode: err.statusCode,
      path: req.path,
      method: req.method,
    });
  } else {
    logger.error('Erreur non gérée:', {
      message: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
    });
  }

  // Réponse au client
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
      errors: err.errors,
      ...(config.isDevelopment && { stack: err.stack }),
    });
    return;
  }

  // Erreur non gérée
  res.status(500).json({
    success: false,
    error: config.isProduction
      ? ERROR_MESSAGES.INTERNAL_ERROR
      : err.message,
    ...(config.isDevelopment && { stack: err.stack }),
  });
};

/**
 * Wrapper pour les contrôleurs async
 * Attrape automatiquement les erreurs et les passe au middleware suivant
 */
export const asyncHandler = <T>(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<T>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default errorHandler;
