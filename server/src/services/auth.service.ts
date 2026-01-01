import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { addHours } from 'date-fns';
import { prisma } from '../config/database.js';
import { config } from '../config/environment.js';
import { generateToken, generateRefreshToken } from '../middleware/auth.middleware.js';
import { createLogger } from '../utils/logger.js';
import { ERROR_MESSAGES, PASSWORD_RESET_EXPIRY_HOURS } from '../utils/constants.js';
import { AppError } from '../middleware/error.middleware.js';
import { EmailService } from './email.service.js';

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
  };
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  private emailService: EmailService;

  constructor() {
    this.emailService = new EmailService();
  }

  /**
   * Inscription d'un nouvel utilisateur
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existingUser) {
      throw new AppError(ERROR_MESSAGES.EMAIL_ALREADY_EXISTS, 409);
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(data.password, config.bcryptRounds);

    // Générer le token de vérification email
    const emailVerifyToken = uuidv4();

    // Créer l'utilisateur avec un abonnement FREE
    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        profession: data.profession,
        emailVerifyToken,
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

    // Envoyer l'email de vérification
    try {
      await this.emailService.sendVerificationEmail({
        email: user.email,
        token: emailVerifyToken,
        firstName: user.firstName,
      });
    } catch (error) {
      logger.error("Erreur d'envoi de l'email de vérification:", error);
    }

    // Générer les tokens
    const accessToken = generateToken(user.id, user.email);
    const refreshToken = generateRefreshToken(user.id);

    logger.info(`Nouvel utilisateur inscrit: ${user.email}`);

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  /**
   * Connexion d'un utilisateur
   */
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
      },
    });

    if (!user) {
      throw new AppError(ERROR_MESSAGES.INVALID_CREDENTIALS, 401);
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(data.password, user.password);

    if (!isPasswordValid) {
      throw new AppError(ERROR_MESSAGES.INVALID_CREDENTIALS, 401);
    }

    // Mettre à jour la date de dernière connexion
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Générer les tokens
    const accessToken = generateToken(user.id, user.email);
    const refreshToken = generateRefreshToken(user.id);

    logger.info(`Utilisateur connecté: ${user.email}`);

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

  /**
   * Demander la réinitialisation du mot de passe
   */
  async forgotPassword(email: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Ne pas révéler si l'email existe ou non
    if (!user) {
      return;
    }

    const resetToken = uuidv4();
    const resetExpires = addHours(new Date(), PASSWORD_RESET_EXPIRY_HOURS);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetExpires,
      },
    });

    try {
      await this.emailService.sendPasswordReset({
        email: user.email,
        token: resetToken,
        firstName: user.firstName,
      });
    } catch (error) {
      logger.error("Erreur d'envoi de l'email de réinitialisation:", error);
    }

    logger.info(`Demande de réinitialisation de mot de passe: ${email}`);
  }

  /**
   * Réinitialiser le mot de passe
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new AppError(ERROR_MESSAGES.TOKEN_INVALID, 400);
    }

    const hashedPassword = await bcrypt.hash(newPassword, config.bcryptRounds);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    logger.info(`Mot de passe réinitialisé: ${user.email}`);
  }

  /**
   * Vérifier l'email
   */
  async verifyEmail(token: string): Promise<void> {
    const user = await prisma.user.findFirst({
      where: { emailVerifyToken: token },
    });

    if (!user) {
      throw new AppError(ERROR_MESSAGES.TOKEN_INVALID, 400);
    }

    if (user.isEmailVerified) {
      return; // Déjà vérifié
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerifyToken: null,
      },
    });

    logger.info(`Email vérifié: ${user.email}`);
  }

  /**
   * Renvoyer l'email de vérification
   */
  async resendVerificationEmail(userId: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, 404);
    }

    if (user.isEmailVerified) {
      throw new AppError('Email déjà vérifié', 400);
    }

    const emailVerifyToken = uuidv4();

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerifyToken },
    });

    try {
      await this.emailService.sendVerificationEmail({
        email: user.email,
        token: emailVerifyToken,
        firstName: user.firstName,
      });
    } catch (error) {
      logger.error("Erreur d'envoi de l'email de vérification:", error);
      throw new AppError("Erreur lors de l'envoi de l'email", 500);
    }

    logger.info(`Email de vérification renvoyé: ${user.email}`);
  }

  /**
   * Changer le mot de passe (utilisateur connecté)
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, 404);
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      throw new AppError('Mot de passe actuel incorrect', 400);
    }

    const hashedPassword = await bcrypt.hash(newPassword, config.bcryptRounds);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    logger.info(`Mot de passe changé: ${user.email}`);
  }
}

export default AuthService;
