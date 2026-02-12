import { Router, Request, Response, NextFunction } from 'express';
import { UserService } from './user.service';
import { roleGuard } from '../../middleware/role-guard';

const router = Router();
const userService = new UserService();

// Get current user profile
router.get('/me', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const user = await userService.getUser(userId);
    res.json(user);
  } catch (error) {
    next(error);
  }
});

// List all users (admin only)
router.get('/', roleGuard('admin'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await userService.listUsers(page, limit);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Update user profile
router.patch('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, avatarUrl } = req.body;
    const user = await userService.updateUser(req.params.id, { name, avatarUrl });
    res.json(user);
  } catch (error) {
    next(error);
  }
});

// Delete user (admin only)
router.delete('/:id', roleGuard('admin'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await userService.deleteUser(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
