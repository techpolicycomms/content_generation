import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';

const authService = new AuthService();

export class AuthController {
  async signup(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, name } = req.body;
      const result = await authService.signup({ email, password, name });
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await authService.login({ email, password });
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const user = await authService.getProfile(userId);
      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  async googleCallback(req: Request, res: Response, next: NextFunction) {
    try {
      const { code } = req.query;
      const result = await authService.handleGoogleCallback(code as string);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async appleCallback(req: Request, res: Response, next: NextFunction) {
    try {
      const { code, id_token } = req.body;
      const result = await authService.handleAppleCallback(code, id_token);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}
