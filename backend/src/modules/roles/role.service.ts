import prisma from '../../config/db';
import { Role, PERMISSIONS } from './role.entity';

export class RoleService {
  async assignRole(userId: string, role: Role) {
    return prisma.userRole.upsert({
      where: { userId_role: { userId, role } },
      create: { userId, role },
      update: {},
    });
  }

  async removeRole(userId: string, role: Role) {
    return prisma.userRole.delete({
      where: { userId_role: { userId, role } },
    });
  }

  async getUserRoles(userId: string): Promise<Role[]> {
    const roles = await prisma.userRole.findMany({ where: { userId } });
    return roles.map(r => r.role as Role);
  }

  hasPermission(roles: Role[], permission: string): boolean {
    return roles.some(role => {
      const perms = PERMISSIONS[role];
      return perms.includes('*') || perms.includes(permission);
    });
  }
}
