import { Request, Response, NextFunction } from 'express';
import { RoleService } from '../modules/roles/role.service';
import { Role } from '../modules/roles/role.entity';

const roleService = new RoleService();

/**
 * Middleware factory: restricts access to users with at least one of the specified roles.
 */
export function roleGuard(...allowedRoles: Role[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const userRoles = await roleService.getUserRoles(userId);
      const hasRole = userRoles.some(
        role => role === 'admin' || allowedRoles.includes(role)
      );

      if (!hasRole) {
        return res.status(403).json({ error: 'Insufficient role' });
      }

      (req as any).userRoles = userRoles;
      next();
    } catch (error) {
      next(error);
    }
  };
}
