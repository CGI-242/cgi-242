import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import { authValidators } from '../utils/validators.js';
import { authRateLimiter } from '../middleware/rateLimit.middleware.js';

const router = Router();

// Routes publiques
router.post(
  '/register',
  authRateLimiter,
  authValidators.register,
  validate,
  authController.register
);

router.post(
  '/login',
  authRateLimiter,
  authValidators.login,
  validate,
  authController.login
);

router.post(
  '/forgot-password',
  authRateLimiter,
  authValidators.forgotPassword,
  validate,
  authController.forgotPassword
);

router.post(
  '/reset-password',
  authValidators.resetPassword,
  validate,
  authController.resetPassword
);

router.get('/verify-email', authController.verifyEmail);

// Routes authentifiées
router.get('/me', authMiddleware, authController.me);

router.post(
  '/resend-verification',
  authMiddleware,
  authController.resendVerification
);

router.post(
  '/change-password',
  authMiddleware,
  authController.changePassword
);

export default router;
