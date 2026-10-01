import { apiClient } from '../api/client';
import type { AuthResponse, LoginRequest, RegisterRequest, User } from '../types';

export const authService = {
  login: async (data: LoginRequest, recaptchaToken?: string): Promise<AuthResponse> => {
    return apiClient<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: data,
      headers: recaptchaToken
        ? { 'X-Recaptcha-Token': recaptchaToken }
        : undefined,
    });
  },

  register: async (data: RegisterRequest): Promise<string> => {
    return apiClient<string>('/api/auth/register', {
      method: 'POST',
      body: {
        kullaniciAdi: data.kullaniciAdi.trim(),
        ePosta: data.ePosta.trim(),
        eposta: data.ePosta.trim(),
        sifre: data.sifre,
        ...(data.rol && data.rol.trim() ? { rol: data.rol.trim() } : {}),
      },
    });
  },

  logout: async (): Promise<string> => {
    return apiClient<string>('/api/auth/logout', {
      method: 'POST',
    });
  },

  getProfile: async (): Promise<string> => {
    return apiClient<string>('/api/auth/profil', {
      method: 'GET',
    });
  },

  getAdminPage: async (): Promise<string> => {
    return apiClient<string>('/api/auth/admin', {
      method: 'GET',
    });
  },

  getCallCenterUsers: async (
    sortBy?: string,
    sortDirection?: 'asc' | 'desc'
  ): Promise<User[]> => {
    const params = new URLSearchParams();
    if (sortBy) params.append('sortBy', sortBy);
    if (sortDirection) params.append('sortDirection', sortDirection);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return apiClient<User[]>(`/api/auth/cagri-merkezi${queryString}`, {
      method: 'GET',
    });
  },

  updateUserRole: async (kullaniciAdi: string, yeniRol: string): Promise<string> => {
    const encodedUser = encodeURIComponent(kullaniciAdi.trim());
    const encodedRole = encodeURIComponent(yeniRol.trim());
    return apiClient<string>(
      `/api/auth/${encodedUser}/rol?yeniRol=${encodedRole}`,
      {
        method: 'PUT',
      }
    );
  },

  search: async (
    searchTerm: string,
    sortBy?: string,
    sortDirection?: 'asc' | 'desc'
  ): Promise<User[]> => {
    const params = new URLSearchParams({ search: searchTerm.trim() });
    if (sortBy) params.append('sortBy', sortBy);
    if (sortDirection) params.append('sortDirection', sortDirection);
    return apiClient<User[]>(`/api/auth/search?${params.toString()}`, {
      method: 'GET',
    });
  },

  deleteUser: async (kullaniciAdi: string): Promise<string> => {
    const encodedUser = encodeURIComponent(kullaniciAdi.trim());
    return apiClient<string>(`/api/auth/${encodedUser}`, {
      method: 'DELETE',
    });
  },
};
