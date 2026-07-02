import { useAuth } from '@/context/AuthContext';
import type { UserRole } from '@/types/auth';
import type { ReactNode } from 'react';

interface RoleGuardProps {
  roles: UserRole[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function RoleGuard({ roles, children, fallback }: RoleGuardProps) {
  const { hasRole } = useAuth();

  if (hasRole(roles)) {
    return <>{children}</>;
  }

  return fallback ? <>{fallback}</> : null;
}

interface PermissionGuardProps {
  resource: string;
  action: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export function PermissionGuard({ resource, action, children, fallback }: PermissionGuardProps) {
  const { hasPermission } = useAuth();

  if (hasPermission(resource, action)) {
    return <>{children}</>;
  }

  return fallback ? <>{fallback}</> : null;
}
