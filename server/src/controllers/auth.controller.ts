import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service.js';
import { AuditService } from '../services/audit.service.js';
import { asyncHandler } from '../middleware/error.middleware.js';
import { sendSuccess } from '../utils/helpers.js';
import { SUCCESS_MESSAGES } from '../utils/constants.js';

const authService = new AuthService();

// Helper pour extraire les métadonnées de la requête
const getAuditMetadata = (req: Request) => ({
  ip: req.ip || req.headers['x-forwarded-for'] as string,
  userAgent: req.headers['user-agent'],
});

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, firstName, lastName, profession } = req.body;

  const result = await authService.register({
    email,
    password,
    firstName,
    lastName,
    profession,
  });

  sendSuccess(res, result, SUCCESS_MESSAGES.REGISTER_SUCCESS, 201);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const result = await authService.login({ email, password });

  // Audit trail - succès
  await AuditService.log({
    actorId: result.user.id,
    action: 'LOGIN_SUCCESS',
    entityType: 'User',
    entityId: result.user.id,
    changes: { before: null, after: { email } },
    metadata: getAuditMetadata(req),
  });

  sendSuccess(res, result, SUCCESS_MESSAGES.LOGIN_SUCCESS);
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  await authService.forgotPassword(email);

  sendSuccess(res, null, SUCCESS_MESSAGES.PASSWORD_RESET_EMAIL_SENT);
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, password } = req.body;

  await authService.resetPassword(token, password);

  sendSuccess(res, null, SUCCESS_MESSAGES.PASSWORD_RESET_SUCCESS);
});

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.query;

  // L'audit trail est déjà géré dans authService.verifyEmail
  await authService.verifyEmail(token as string);

  sendSuccess(res, null, SUCCESS_MESSAGES.EMAIL_VERIFIED);
});

export const resendVerification = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;

  await authService.resendVerificationEmail(userId);

  sendSuccess(res, null, 'Email de vérification envoyé');
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { currentPassword, newPassword } = req.body;

  await authService.changePassword(userId, currentPassword, newPassword);

  // Audit trail
  await AuditService.log({
    actorId: userId,
    action: 'PASSWORD_CHANGED',
    entityType: 'User',
    entityId: userId,
    changes: { before: null, after: { passwordChanged: true } },
    metadata: getAuditMetadata(req),
  });

  sendSuccess(res, null, 'Mot de passe modifié avec succès');
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, { user: req.user });
});
