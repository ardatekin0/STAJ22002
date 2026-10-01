import type { StatusEnum, UserRole } from './common.types';

export interface LoginRequest {
  kullaniciAdi: string;
  sifre: string;
}

export interface RegisterRequest {
  kullaniciAdi: string;
  ePosta: string;
  sifre: string;
  rol?: string;
}

export interface AuthResponse {
  token: string;
  message: string;
}

export interface JwtPayload {
  sub: string;
  id: string;
  roller: UserRole[];
  iat: number;
  exp: number;
}

export interface User {
  id: string;
  kullaniciAdi: string;
  ePosta?: string;
  eposta?: string;
  status?: StatusEnum;
  roller: UserRole[];
}

export interface Role {
  id: string;
  ad: string;
  aciklama: string;
}

export interface RoleDto {
  ad: string;
  aciklama: string;
}
