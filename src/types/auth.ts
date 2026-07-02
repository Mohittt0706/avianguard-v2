export type UserRole = 'SUPER_ADMIN' | 'DISTRICT_OFFICER' | 'OPERATOR' | 'VIEWER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  district: string;
  assignedWetland: string;
  permissions: string[];
  avatar?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

export type PermissionCheck = {
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'approve' | 'reject';
};

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  SUPER_ADMIN: [
    'citizens:create', 'citizens:read', 'citizens:update', 'citizens:delete',
    'citizens:approve', 'citizens:reject',
    'alerts:create', 'alerts:read', 'alerts:update', 'alerts:delete',
    'sensors:create', 'sensors:read', 'sensors:update', 'sensors:delete',
    'users:create', 'users:read', 'users:update', 'users:delete',
    'settings:read', 'settings:update',
    'reports:create', 'reports:read', 'reports:delete',
    'maps:read', 'maps:update',
  ],
  DISTRICT_OFFICER: [
    'citizens:create', 'citizens:read', 'citizens:update',
    'citizens:approve', 'citizens:reject',
    'alerts:read', 'alerts:update',
    'sensors:read',
    'reports:read', 'reports:create',
    'maps:read',
    'settings:read',
  ],
  OPERATOR: [
    'citizens:read',
    'alerts:read',
    'sensors:read',
    'reports:read',
    'maps:read',
  ],
  VIEWER: [
    'citizens:read',
    'alerts:read',
    'reports:read',
    'maps:read',
  ],
};
