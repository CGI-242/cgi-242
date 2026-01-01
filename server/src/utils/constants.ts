// Durées en millisecondes
export const TIME = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
} as const;

// Durée de validité des invitations (7 jours)
export const INVITATION_EXPIRY_DAYS = 7;

// Durée de validité du token de réinitialisation de mot de passe (1 heure)
export const PASSWORD_RESET_EXPIRY_HOURS = 1;

// Durée de validité du token de vérification email (24 heures)
export const EMAIL_VERIFY_EXPIRY_HOURS = 24;

// Headers HTTP personnalisés
export const CUSTOM_HEADERS = {
  ORGANIZATION_ID: 'x-organization-id',
  TENANT_TYPE: 'x-tenant-type',
  REQUEST_ID: 'x-request-id',
} as const;

// Messages d'erreur standardisés
export const ERROR_MESSAGES = {
  // Auth
  UNAUTHORIZED: 'Non authentifié',
  INVALID_CREDENTIALS: 'Email ou mot de passe incorrect',
  EMAIL_NOT_VERIFIED: 'Veuillez vérifier votre email',
  TOKEN_EXPIRED: 'Token expiré',
  TOKEN_INVALID: 'Token invalide',

  // Permissions
  FORBIDDEN: 'Accès non autorisé',
  INSUFFICIENT_ROLE: 'Rôle insuffisant pour cette action',
  NOT_ORG_MEMBER: 'Vous n\'êtes pas membre de cette organisation',

  // Resources
  NOT_FOUND: 'Ressource non trouvée',
  USER_NOT_FOUND: 'Utilisateur non trouvé',
  ORG_NOT_FOUND: 'Organisation non trouvée',
  CONVERSATION_NOT_FOUND: 'Conversation non trouvée',
  INVITATION_NOT_FOUND: 'Invitation non trouvée',

  // Validation
  VALIDATION_ERROR: 'Erreur de validation',
  EMAIL_ALREADY_EXISTS: 'Cet email est déjà utilisé',
  SLUG_ALREADY_EXISTS: 'Ce slug est déjà utilisé',
  ALREADY_MEMBER: 'Cet utilisateur est déjà membre de l\'organisation',

  // Subscription
  QUOTA_EXCEEDED: 'Quota de questions atteint',
  MEMBER_LIMIT_REACHED: 'Limite de membres atteinte',
  SUBSCRIPTION_REQUIRED: 'Abonnement requis',
  UPGRADE_REQUIRED: 'Passez à un plan supérieur',

  // Organization
  CANNOT_REMOVE_OWNER: 'Impossible de retirer le propriétaire',
  CANNOT_DEMOTE_OWNER: 'Impossible de rétrograder le propriétaire',
  ONLY_OWNER_CAN_TRANSFER: 'Seul le propriétaire peut transférer la propriété',

  // Server
  INTERNAL_ERROR: 'Erreur interne du serveur',
  SERVICE_UNAVAILABLE: 'Service temporairement indisponible',
} as const;

// Messages de succès
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Connexion réussie',
  LOGOUT_SUCCESS: 'Déconnexion réussie',
  REGISTER_SUCCESS: 'Inscription réussie',
  PASSWORD_RESET_EMAIL_SENT: 'Email de réinitialisation envoyé',
  PASSWORD_RESET_SUCCESS: 'Mot de passe réinitialisé avec succès',
  EMAIL_VERIFIED: 'Email vérifié avec succès',
  INVITATION_SENT: 'Invitation envoyée',
  INVITATION_ACCEPTED: 'Invitation acceptée',
  MEMBER_REMOVED: 'Membre retiré avec succès',
  ORG_CREATED: 'Organisation créée avec succès',
  ORG_UPDATED: 'Organisation mise à jour',
  ORG_DELETED: 'Organisation supprimée',
} as const;

// Professions disponibles pour les utilisateurs
export const PROFESSIONS = [
  'Fiscaliste',
  'Expert-comptable',
  'Avocat fiscaliste',
  'Commissaire aux comptes',
  'Directeur Administratif et Financier',
  'Comptable',
  'Chef comptable',
  'Responsable fiscal',
  'Consultant fiscal',
  'Notaire',
  'Autre',
] as const;

export type Profession = (typeof PROFESSIONS)[number];
