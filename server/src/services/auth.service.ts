// server/src/services/auth.service.ts
// Service d'authentification principal

import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../config/database.js';
import { config } from '../config/environment.js';
import { generateToken, generateRefreshToken } from '../middleware/auth.middleware.js';
import { createLogger } from '../utils/logger.js';
import { ERROR_MESSAGES } from '../utils/constants.js';
import { AppError } from '../middleware/error.middleware.js';
import { EmailService } from './email.service.js';
import { AuditService } from './audit.service.js';
import {
  verifyEmail,
  resendVerificationEmail,
  resendVerificationEmailByEmail,
} from './auth.email.service.js';
import {
  forgotPassword,
  resetPassword,
  changePassword,
} from './auth.password.service.js';

const logger = createLogger('AuthService');

export interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  profession?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    profession: string | null;
    isEmailVerified: boolean;
  } | null;
  accessToken: string;
  refreshToken: string;
  mfaRequired?: boolean;
  mfaToken?: string;
}

export class AuthService {
  private emailService: EmailService;

  constructor() {
    this.emailService = new EmailService();
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existingUser) {
      throw new AppError(ERROR_MESSAGES.EMAIL_ALREADY_EXISTS, 409);
    }

    const hashedPassword = await bcrypt.hash(data.password, config.bcryptRounds);
    const emailVerifyToken = uuidv4();
    const emailVerifyExpires = new Date(Date.now() + 30 * 60 * 1000);

    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        profession: data.profession,
        emailVerifyToken,
        emailVerifyExpires,
        personalSubscription: {
          create: {
            type: 'PERSONAL',
            plan: 'FREE',
            questionsPerMonth: 10,
            maxMembers: 1,
          },
        },
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        profession: true,
        isEmailVerified: true,
      },
    });

    try {
      await this.emailService.sendVerificationEmail({
        email: user.email,
        token: emailVerifyToken,
        firstName: user.firstName,
      });
    } catch (error) {
      logger.error("Erreur d'envoi de l'email de vérification:", error);
    }

    const accessToken = generateToken(user.id, user.email);
    const refreshToken = generateRefreshToken(user.id);

    logger.info(`Nouvel utilisateur inscrit: ${user.email}`);

    return { user, accessToken, refreshToken };
  }

  async login(data: LoginData): Promise<AuthResponse> {
    const user = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
      select: {
        id: true,
        email: true,
        password: true,
        firstName: true,
        lastName: true,
        profession: true,
        isEmailVerified: true,
        mfaEnabled: true,
      },
    });

    if (!user) {
      throw new AppError(ERROR_MESSAGES.INVALID_CREDENTIALS, 401);
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);

    if (!isPasswordValid) {
      throw new AppError(ERROR_MESSAGES.INVALID_CREDENTIALS, 401);
    }

    if (!user.isEmailVerified) {
      throw new AppError('Veuillez valider votre email avant de vous connecter', 403);
    }

    if (user.mfaEnabled) {
      const mfaToken = generateToken(user.id, user.email, '5m');
      return {
        user: null as unknown as AuthResponse['user'],
        accessToken: '',
        refreshToken: '',
        mfaRequired: true,
        mfaToken,
      };
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const accessToken = generateToken(user.id, user.email);
    const refreshToken = generateRefreshToken(user.id);

    logger.info(`Utilisateur connecté: ${user.email}`);

    await AuditService.log({
      actorId: user.id,
      action: 'LOGIN_SUCCESS',
      entityType: 'User',
      entityId: user.id,
      changes: {
        before: null,
        after: { lastLoginAt: new Date().toISOString() },
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profession: user.profession,
        isEmailVerified: user.isEmailVerified,
      },
      accessToken,
      refreshToken,
    };
  }

  // Délégation aux services spécialisés
  async forgotPassword(email: string): Promise<void> {
    return forgotPassword(email, this.emailService);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    return resetPassword(token, newPassword);
  }

  async verifyEmail(token: string): Promise<void> {
    return verifyEmail(token, this.emailService);
  }

  async resendVerificationEmail(userId: string): Promise<void> {
    return resendVerificationEmail(userId, this.emailService);
  }

  async resendVerificationEmailByEmail(email: string): Promise<void> {
    return resendVerificationEmailByEmail(email, this.emailService);
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    return changePassword(userId, currentPassword, newPassword);
  }
}

export default AuthService;
