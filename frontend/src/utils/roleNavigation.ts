export const ADMIN_ROLE = 'ADMIN';

export function getRoleLandingPath(role?: string | null): '/admin' | '/home' {
  return role === ADMIN_ROLE ? '/admin' : '/home';
}
