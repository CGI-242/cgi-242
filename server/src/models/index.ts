// Re-export des types Prisma pour faciliter l'import
export {
  User,
  Organization,
  OrganizationMember,
  OrganizationRole,
  Invitation,
  InvitationStatus,
  Subscription,
  SubscriptionPlan,
  SubscriptionStatus,
  SubscriptionType,
  Conversation,
  ConversationVisibility,
  ConversationAccess,
  Message,
  MessageRole,
  Article,
  ArticleReference,
  Payment,
  SearchHistory,
  UsageStats,
  SystemConfig,
  AlerteFiscale,
  AlerteType,
  AlerteCategorie,
} from '@prisma/client';

// Re-export du client Prisma
export { prisma } from '../config/database.js';
