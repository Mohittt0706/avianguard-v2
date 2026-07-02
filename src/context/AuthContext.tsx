import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User, LoginCredentials, AuthState, UserRole } from '@/types/auth';
import { ROLE_PERMISSIONS } from '@/types/auth';
import { authApi } from '@/services/authApi';

const TOKEN_KEY = 'accessToken';
const REFRESH_KEY = 'refreshToken';
const USER_KEY = 'user';

interface AuthContextValue extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  hasPermission: (resource: string, action: string) => boolean;
  hasRole: (roles: UserRole[]) => boolean;
  clearSession: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function loadFromStorage(): AuthState {
  try {
    const token = localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
    const refreshToken = localStorage.getItem(REFRESH_KEY) || sessionStorage.getItem(REFRESH_KEY);
    const userStr = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
    if (token && userStr) {
      const user = JSON.parse(userStr) as User;
      return { user, token, refreshToken, isAuthenticated: true, isLoading: false };
    }
  } catch { /* ignore */ }
  return { user: null, token: null, refreshToken: null, isAuthenticated: false, isLoading: true };
}

function saveToStorage(user: User, token: string, refreshToken: string, remember: boolean) {
  const storage = remember ? localStorage : sessionStorage;
  storage.setItem(TOKEN_KEY, token);
  storage.setItem(REFRESH_KEY, refreshToken);
  storage.setItem(USER_KEY, JSON.stringify(user));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(loadFromStorage);

  useEffect(() => {
    if (state.isLoading) {
      const loaded = loadFromStorage();
      setState(prev => ({ ...prev, ...loaded }));
    }
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_KEY);
    sessionStorage.removeItem(USER_KEY);
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    clearSession();
    const response = await authApi.login(credentials);
    const user: User = {
      ...response.user,
      permissions: ROLE_PERMISSIONS[response.user.role] || [],
    };
    saveToStorage(user, response.token, response.refreshToken, credentials.rememberMe);
    setState({ user, token: response.token, refreshToken: response.refreshToken, isAuthenticated: true, isLoading: false });
  }, [clearSession]);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Clear locally even if server call fails
    }
    clearSession();
    setState({ user: null, token: null, refreshToken: null, isAuthenticated: false, isLoading: false });
  }, [clearSession]);

  const refreshSession = useCallback(async () => {
    try {
      const response = await authApi.refreshSession();
      const storage = localStorage.getItem(TOKEN_KEY) ? localStorage : sessionStorage;
      storage.setItem(TOKEN_KEY, response.token);
      storage.setItem(REFRESH_KEY, response.refreshToken);
      storage.setItem(USER_KEY, JSON.stringify(response.user));
      setState({
        user: { ...response.user, permissions: ROLE_PERMISSIONS[response.user.role] || [] },
        token: response.token,
        refreshToken: response.refreshToken,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch {
      clearSession();
      setState({ user: null, token: null, refreshToken: null, isAuthenticated: false, isLoading: false });
    }
  }, [clearSession]);

  const hasPermission = useCallback((resource: string, action: string) => {
    if (!state.user) return false;
    if (state.user.role === 'SUPER_ADMIN') return true;
    return state.user.permissions.includes(`${resource}:${action}`);
  }, [state.user]);

  const hasRole = useCallback((roles: UserRole[]) => {
    if (!state.user) return false;
    return roles.includes(state.user.role);
  }, [state.user]);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, refreshSession, hasPermission, hasRole, clearSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
