import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { ADMIN_ROLE, getRoleLandingPath } from '../utils/roleNavigation';

export default function AdminRoute({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return <div className="min-h-screen grid place-items-center bg-surface text-on-surface">Loading…</div>;
  }
  if (!isAuthenticated) {
    const returnTo = `${location.pathname}${location.search}`;
    return <Navigate to={`/login?returnTo=${encodeURIComponent(returnTo)}`} replace />;
  }
  if (user?.role !== ADMIN_ROLE) {
    return <Navigate to={getRoleLandingPath(user?.role)} replace />;
  }
  return <>{children}</>;
}
