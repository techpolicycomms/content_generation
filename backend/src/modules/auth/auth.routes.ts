import { Router } from 'express';
import { AuthController } from './auth.controller';
import { authGuard } from '../../middleware/auth-guard';

const router = Router();
const controller = new AuthController();

// Local auth
router.post('/signup', controller.signup);
router.post('/login', controller.login);
router.get('/me', authGuard, controller.me);

// Google OAuth
router.get('/google', (_req, res) => {
  // Redirect to Google consent screen
  // In production, construct the full OAuth URL with client_id, redirect_uri, scope
  res.redirect('/api/auth/google/callback');
});
router.get('/google/callback', controller.googleCallback);

// Apple OAuth
router.post('/apple/callback', controller.appleCallback);

export default router;
