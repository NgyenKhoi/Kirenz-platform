import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { getRoleLandingPath } from '../utils/roleNavigation';

interface PublicRouteProps {
  children: ReactNode;
  allowUnverified?: boolean;
}

export default function PublicRoute({ children, allowUnverified = false }: PublicRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (isAuthenticated && !(allowUnverified && user && !user.emailVerified)) {
    return <Navigate to={getRoleLandingPath(user?.role)} replace />;
  }

  return <>{children}</>;
}
