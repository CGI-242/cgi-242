import { body, param, query, ValidationChain } from 'express-validator';

// Validateurs communs réutilisables

export const emailValidator = (): ValidationChain =>
  body('email')
    .isEmail()
    .withMessage('Email invalide')
    .normalizeEmail()
    .trim();

export const passwordValidator = (): ValidationChain =>
  body('password')
    .isLength({ min: 8 })
    .withMessage('Le mot de passe doit contenir au moins 8 caractères')
    .matches(/[A-Z]/)
    .withMessage('Le mot de passe doit contenir au moins une majuscule')
    .matches(/[a-z]/)
    .withMessage('Le mot de passe doit contenir au moins une minuscule')
    .matches(/[0-9]/)
    .withMessage('Le mot de passe doit contenir au moins un chiffre');

export const uuidParamValidator = (paramName: string): ValidationChain =>
  param(paramName)
    .isUUID()
    .withMessage(`${paramName} doit être un UUID valide`);

export const paginationValidators = (): ValidationChain[] => [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('page doit être un entier positif')
    .toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('limit doit être un entier entre 1 et 100')
    .toInt(),
];

// Validateurs pour les organisations
export const organizationValidators = {
  create: [
    body('name')
      .trim()
      .notEmpty()
      .withMessage("Le nom de l'organisation est requis")
      .isLength({ min: 2, max: 100 })
      .withMessage("Le nom doit contenir entre 2 et 100 caractères"),
    body('slug')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Le slug doit contenir entre 2 et 50 caractères')
      .matches(/^[a-z0-9-]+$/)
      .withMessage('Le slug ne peut contenir que des lettres minuscules, chiffres et tirets'),
  ],
  update: [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage("Le nom doit contenir entre 2 et 100 caractères"),
    body('website')
      .optional()
      .isURL()
      .withMessage('URL du site web invalide'),
    body('phone')
      .optional()
      .matches(/^[+]?[\d\s-()]+$/)
      .withMessage('Numéro de téléphone invalide'),
  ],
};

// Validateurs pour les invitations
export const invitationValidators = {
  create: [
    body('email')
      .isEmail()
      .withMessage('Email invalide')
      .normalizeEmail(),
    body('role')
      .optional()
      .isIn(['ADMIN', 'MEMBER', 'VIEWER'])
      .withMessage('Rôle invalide. Valeurs acceptées: ADMIN, MEMBER, VIEWER'),
  ],
  accept: [
    body('token')
      .notEmpty()
      .withMessage("Token d'invitation requis")
      .isUUID()
      .withMessage("Token d'invitation invalide"),
  ],
};

// Validateurs pour l'authentification
export const authValidators = {
  register: [
    emailValidator(),
    passwordValidator(),
    body('firstName')
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage('Le prénom ne peut pas dépasser 50 caractères'),
    body('lastName')
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage('Le nom ne peut pas dépasser 50 caractères'),
    body('profession')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('La profession ne peut pas dépasser 100 caractères'),
  ],
  login: [
    body('email')
      .isEmail()
      .withMessage('Email invalide')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('Mot de passe requis'),
  ],
  forgotPassword: [
    body('email')
      .isEmail()
      .withMessage('Email invalide')
      .normalizeEmail(),
  ],
  resetPassword: [
    body('token')
      .notEmpty()
      .withMessage('Token requis'),
    passwordValidator(),
  ],
};

// Validateurs pour le chat
export const chatValidators = {
  createMessage: [
    body('content')
      .trim()
      .notEmpty()
      .withMessage('Le contenu du message est requis')
      .isLength({ max: 10000 })
      .withMessage('Le message ne peut pas dépasser 10000 caractères'),
    body('conversationId')
      .optional()
      .isUUID()
      .withMessage('ID de conversation invalide'),
  ],
  updateConversation: [
    body('title')
      .optional()
      .trim()
      .isLength({ max: 200 })
      .withMessage('Le titre ne peut pas dépasser 200 caractères'),
    body('visibility')
      .optional()
      .isIn(['PRIVATE', 'TEAM', 'RESTRICTED'])
      .withMessage('Visibilité invalide'),
  ],
};
