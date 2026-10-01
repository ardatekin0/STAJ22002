import { apiClient } from '../api/client';
import type { Role, RoleDto } from '../types';

export const roleService = {
  getAll: async (sortBy?: string, sortDirection?: 'asc' | 'desc'): Promise<Role[]> => {
    const params = new URLSearchParams();
    if (sortBy) params.append('sortBy', sortBy);
    if (sortDirection) params.append('sortDirection', sortDirection);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return apiClient<Role[]>(`/api/admin/roller/listele${queryString}`, {
      method: 'GET',
    });
  },

  getByName: async (name: string): Promise<Role> => {
    return apiClient<Role>(`/api/admin/roller/rol?ad=${encodeURIComponent(name)}`, {
      method: 'GET',
    });
  },

  search: async (
    searchTerm: string,
    sortBy?: string,
    sortDirection?: 'asc' | 'desc'
  ): Promise<Role[]> => {
    const params = new URLSearchParams({ search: searchTerm.trim() });
    if (sortBy) params.append('sortBy', sortBy);
    if (sortDirection) params.append('sortDirection', sortDirection);
    return apiClient<Role[]>(`/api/admin/roller/ara?${params.toString()}`, {
      method: 'GET',
    });
  },

  addRole: async (data: RoleDto): Promise<string> => {
    return apiClient<string>('/api/admin/roller/ekle', {
      method: 'POST',
      body: data,
    });
  },
};
