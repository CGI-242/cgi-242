import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { sendError } from '../utils/helpers.js';
import { ERROR_MESSAGES } from '../utils/constants.js';

/**
 * Middleware de validation
 * À utiliser après les chaînes de validation express-validator
 *
 * Usage:
 * router.post('/create',
 *   [...organizationValidators.create],
 *   validate,
 *   controller.create
 * );
 */
export const validate = (
  req: Request,
  res: Response,
  next: NextFunction
): void | Response => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((error) => ({
      field: 'path' in error ? error.path : 'unknown',
      message: error.msg,
    }));

    return sendError(
      res,
      ERROR_MESSAGES.VALIDATION_ERROR,
      400,
      formattedErrors
    );
  }

  next();
};

type ValidateFunction = (
  req: Request,
  res: Response,
  next: NextFunction
) => void | Response;

type ValidationMiddleware = ValidationChain | ValidateFunction;

/**
 * Factory pour combiner validateurs et middleware de validation
 *
 * Usage:
 * router.post('/create', validateWith(organizationValidators.create), controller.create);
 */
export const validateWith = (
  validators: ValidationChain[]
): ValidationMiddleware[] => {
  return [...validators, validate];
};

/**
 * Middleware de sanitization pour les IDs
 * Vérifie que les IDs dans les params sont des UUIDs valides
 */
export const sanitizeUUID = (paramName: string) => {
  return (req: Request, res: Response, next: NextFunction): void | Response => {
    const value = req.params[paramName];

    if (!value) {
      return next();
    }

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!uuidRegex.test(value)) {
      return sendError(
        res,
        `${paramName} doit être un UUID valide`,
        400
      );
    }

    next();
  };
};

/**
 * Middleware pour nettoyer les entrées
 * Supprime les espaces en début/fin des chaînes
 */
export const sanitizeInputs = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const sanitize = (obj: Record<string, unknown>): Record<string, unknown> => {
    const sanitized: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        sanitized[key] = value.trim();
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        sanitized[key] = sanitize(value as Record<string, unknown>);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  };

  if (req.body && typeof req.body === 'object') {
    req.body = sanitize(req.body);
  }

  next();
};

export default validate;
