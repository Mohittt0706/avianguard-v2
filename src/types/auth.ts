export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'OPERATOR' | 'VIEWER';
export type AccountStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  district: string | null;
  taluka: string | null;
  assignedWetland: string | null;
  phone: string | null;
  employeeId: string | null;
  department: string | null;
  designation: string | null;
  address: string | null;
  avatar: string | null;
  accountStatus: AccountStatus;
  permissions: Record<string, string[]> | null;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LoginHistory {
  id: string;
  userId: string;
  device: string | null;
  browser: string | null;
  ipAddress: string | null;
  location: string | null;
  success: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  target: string | null;
  details: Record<string, unknown> | null;
  createdAt: string;
}

export interface UserWithDetails extends User {
  loginHistory: LoginHistory[];
  auditLogs: AuditLog[];
  stats: {
    alertsAssigned: number;
    reportsGenerated: number;
    citizenNotificationsSent: number;
  };
}

export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  suspended: number;
  pending: number;
  roles: Record<string, number>;
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

export type PermissionCheck = {
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'approve' | 'reject';
};

export const ROLE_PERMISSIONS: Record<UserRole, Record<string, string[]>> = {
  SUPER_ADMIN: {
    dashboard: ['read'],
    sensors: ['read', 'create', 'update', 'delete', 'export'],
    alerts: ['read', 'create', 'update', 'delete'],
    reports: ['read', 'create', 'update', 'delete', 'export'],
    citizens: ['read', 'create', 'update', 'delete'],
    maps: ['read', 'update'],
    settings: ['read', 'update'],
    ai: ['read'],
    users: ['read', 'create', 'update', 'delete'],
  },
  ADMIN: {
    dashboard: ['read'],
    sensors: ['read', 'update'],
    alerts: ['read', 'update'],
    reports: ['read', 'create', 'export'],
    citizens: ['read', 'update'],
    maps: ['read'],
    settings: ['read'],
    ai: ['read'],
    users: ['read'],
  },
  OPERATOR: {
    dashboard: ['read'],
    sensors: ['read', 'update'],
    alerts: ['read'],
    reports: ['read'],
    citizens: ['read'],
    maps: ['read'],
    settings: [],
    ai: [],
    users: [],
  },
  VIEWER: {
    dashboard: ['read'],
    sensors: ['read'],
    alerts: ['read'],
    reports: ['read'],
    citizens: [],
    maps: ['read'],
    settings: [],
    ai: [],
    users: [],
  },
};
