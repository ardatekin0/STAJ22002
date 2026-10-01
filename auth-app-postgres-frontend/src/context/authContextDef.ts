import { createContext } from 'react';
import type { UserRole } from '../types';

export interface AuthUser {
  id: number;
  kullaniciAdi: string;
  roller: UserRole[];
  exp?: number;
}

export interface AuthContextType {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isTelekom: boolean;
  isCallCenter: boolean;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  login: (token: string) => void;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);