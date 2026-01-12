import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import { authValidators } from '../utils/validators.js';
import { authRateLimiter } from '../middleware/rateLimit.middleware.js';
import { csrfProtection, getCsrfToken } from '../middleware/csrf.middleware.js';

const router = Router();

// Route pour obtenir un token CSRF (doit être appelée avant les mutations)
router.get('/csrf-token', getCsrfToken);

// Routes publiques avec protection CSRF
router.post(
  '/register',
  authRateLimiter,
  csrfProtection,
  authValidators.register,
  validate,
  authController.register
);

router.post(
  '/login',
  authRateLimiter,
  csrfProtection,
  authValidators.login,
  validate,
  authController.login
);

router.post(
  '/forgot-password',
  authRateLimiter,
  csrfProtection,
  authValidators.forgotPassword,
  validate,
  authController.forgotPassword
);

router.post(
  '/reset-password',
  csrfProtection,
  authValidators.resetPassword,
  validate,
  authController.resetPassword
);

router.get('/verify-email', authController.verifyEmail);

// Route de déconnexion
router.post('/logout', authMiddleware, authController.logout);

// Route de déconnexion de toutes les sessions
router.post('/logout-all', authMiddleware, csrfProtection, authController.logoutAll);

// Refresh token
router.post('/refresh-token', authController.refreshToken);

// Routes authentifiées avec protection CSRF
router.get('/me', authMiddleware, authController.me);

router.patch(
  '/profile',
  authMiddleware,
  csrfProtection,
  authController.updateProfile
);

router.post(
  '/resend-verification',
  authMiddleware,
  csrfProtection,
  authController.resendVerification
);

router.post(
  '/change-password',
  authMiddleware,
  csrfProtection,
  authController.changePassword
);

export default router;
