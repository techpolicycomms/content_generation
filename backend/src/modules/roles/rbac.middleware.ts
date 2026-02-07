import { Request, Response, NextFunction } from 'express';
import { RoleService } from './role.service';
import { Role } from './role.entity';

const roleService = new RoleService();

/**
 * Middleware factory that checks whether the authenticated user
 * has the required permission for the requested action.
 */
export function requirePermission(permission: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const roles = await roleService.getUserRoles(userId);
      if (!roleService.hasPermission(roles, permission)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
