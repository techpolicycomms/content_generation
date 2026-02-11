/**
 * Role definitions for the GreenLoop RBAC system.
 *
 * Roles:
 * - volunteer:     Can participate in events, submit collection readings
 * - organiser:     Can create/manage events, view event-level reports
 * - ops_manager:   Can manage inventory, batches, orders, smart bins
 * - city_official: Read-only access to impact reports and exports
 * - admin:         Full system access, user management, role assignment
 */

export const ROLES = {
  VOLUNTEER: 'volunteer',
  ORGANISER: 'organiser',
  OPS_MANAGER: 'ops_manager',
  CITY_OFFICIAL: 'city_official',
  ADMIN: 'admin',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

/**
 * Permission matrix: maps roles to allowed actions.
 */
export const PERMISSIONS: Record<Role, string[]> = {
  volunteer: [
    'events:read',
    'events:participate',
    'collection:create',
    'collection:read:own',
  ],
  organiser: [
    'events:read',
    'events:create',
    'events:update:own',
    'events:participate',
    'collection:read',
    'collection:create',
    'reports:read:event',
  ],
  ops_manager: [
    'events:read',
    'collection:read',
    'inventory:read',
    'inventory:create',
    'inventory:update',
    'orders:read',
    'orders:create',
    'orders:update',
    'smartbins:read',
    'smartbins:manage',
  ],
  city_official: [
    'reports:read',
    'reports:export',
    'events:read',
    'collection:read',
  ],
  admin: ['*'],
};
