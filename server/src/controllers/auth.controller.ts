import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service.js';
import { asyncHandler } from '../middleware/error.middleware.js';
import { sendSuccess } from '../utils/helpers.js';
import { SUCCESS_MESSAGES } from '../utils/constants.js';

const authService = new AuthService();

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

  sendSuccess(res, null, 'Mot de passe modifié avec succès');
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, { user: req.user });
});
