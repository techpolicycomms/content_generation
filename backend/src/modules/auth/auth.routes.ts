import { Router } from 'express';
import { AuthController } from './auth.controller';
import { authGuard } from '../../middleware/auth-guard';
import { getGoogleAuthUrl } from './oauth-google';
import { getAppleAuthUrl } from './oauth-apple';

const router = Router();
const controller = new AuthController();

// Local auth
router.post('/signup', controller.signup);
router.post('/login', controller.login);
router.get('/me', authGuard, controller.me);

// Google OAuth
router.get('/google', (_req, res) => {
  res.redirect(getGoogleAuthUrl());
});
router.get('/google/callback', controller.googleCallback);

// Apple OAuth
router.get('/apple', (_req, res) => {
  res.redirect(getAppleAuthUrl());
});
router.post('/apple/callback', controller.appleCallback);

export default router;
