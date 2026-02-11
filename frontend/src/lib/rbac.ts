export type Role = 'volunteer' | 'organiser' | 'ops_manager' | 'city_official' | 'admin';

/**
 * Maps each role to the pages/features it can access.
 * Used by the sidebar and route guards to show/hide UI elements.
 */
export const ROLE_ACCESS: Record<Role, string[]> = {
  volunteer: [
    '/app/dashboard',
    '/events',
    '/collection',
  ],
  organiser: [
    '/app/dashboard',
    '/events',
    '/collection',
    '/reports',
  ],
  ops_manager: [
    '/app/dashboard',
    '/events',
    '/collection',
    '/inventory',
    '/orders',
    '/smartbins',
  ],
  city_official: [
    '/app/dashboard',
    '/reports',
  ],
  admin: [
    '/app/dashboard',
    '/events',
    '/collection',
    '/inventory',
    '/orders',
    '/smartbins',
    '/reports',
    '/admin/users',
  ],
};

/**
 * Check if a user with the given roles can access a specific path.
 */
export function canAccess(userRoles: Role[], path: string): boolean {
  return userRoles.some(role => {
    const allowed = ROLE_ACCESS[role];
    return allowed.some(p => path.startsWith(p));
  });
}

/**
 * Get all accessible paths for a set of roles (union).
 */
export function getAccessiblePaths(userRoles: Role[]): string[] {
  const paths = new Set<string>();
  for (const role of userRoles) {
    for (const path of ROLE_ACCESS[role]) {
      paths.add(path);
    }
  }
  return Array.from(paths);
}

/**
 * HOC-style check: returns true if user has at least one of the required roles.
 */
export function hasRole(userRoles: Role[], ...required: Role[]): boolean {
  return userRoles.some(r => r === 'admin' || required.includes(r));
}
