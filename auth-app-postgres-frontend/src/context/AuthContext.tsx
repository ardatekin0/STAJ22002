import React, { useState, useCallback } from 'react';
import type { UserRole } from '../types';
import {
  getToken as getStoredToken,
  setToken as saveToken,
  removeToken,
  isTokenExpired,
  setUnauthorizedHandler,
} from '../api/client';
import { AuthContext, type AuthUser } from './authContextDef';
import { authService } from '../services';

interface JwtPayload {
  sub?: string;
  id?: number;
  roller?: string[];
  exp?: number;
}

function parseToken(jwt: string): AuthUser | null {
  try {
    const parts = jwt.split('.');
    if (parts.length !== 3) return null;

    const payloadJson = atob(parts[1]);
    const payload: JwtPayload = JSON.parse(payloadJson);

    if (isTokenExpired(jwt)) {
      removeToken();
      return null;
    }

    const roller: UserRole[] = (payload.roller || []).map((r) => {
      if (r === 'ROLE_TELEKOM' || r === 'ROLE_CALL_CENTER') {
        return r;
      }

      return 'ROLE_CALL_CENTER';
    });

    return {
      id: payload.id || 0,
      kullaniciAdi: payload.sub || '',
      roller,
      exp: payload.exp,
    };
  } catch {
    removeToken();
    return null;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    const stored = getStoredToken();

    if (stored && !isTokenExpired(stored)) {
      return stored;
    }

    return null;
  });

  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = getStoredToken();

    if (stored) {
      return parseToken(stored);
    }

    return null;
  });

  const clearAuth = useCallback(() => {
    removeToken();
    setToken(null);
    setUser(null);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
    } finally {
      clearAuth();
    }
  }, [clearAuth]);

  const login = useCallback(
    (newToken: string) => {
      saveToken(newToken);
      setToken(newToken);

      const parsed = parseToken(newToken);
      setUser(parsed);
    },
    []
  );

  React.useEffect(() => {
    setUnauthorizedHandler(() => {
      clearAuth();
    });
  }, [clearAuth]);

  const hasRole = useCallback(
    (role: UserRole): boolean => {
      if (!user) return false;

      return user.roller.includes(role);
    },
    [user]
  );

  const hasAnyRole = useCallback(
    (roles: UserRole[]): boolean => {
      if (!user) return false;

      return roles.some((role) => user.roller.includes(role));
    },
    [user]
  );

  const isTelekom = user ? user.roller.includes('ROLE_TELEKOM') : false;
  const isCallCenter = user ? user.roller.includes('ROLE_CALL_CENTER') : false;

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: !!token && !!user,
        isLoading: false,
        isTelekom,
        isCallCenter,
        hasRole,
        hasAnyRole,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};