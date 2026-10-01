import { apiClient } from '../api/client';
import type { StatusEnum, Tariff, TariffCreateRequest, TariffUpdateRequest } from '../types';

export const tariffService = {
  getAll: async (sortBy?: string, sortDirection?: 'asc' | 'desc'): Promise<Tariff[]> => {
    const params = new URLSearchParams();
    if (sortBy) params.append('sortBy', sortBy);
    if (sortDirection) params.append('sortDirection', sortDirection);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return apiClient<Tariff[]>(`/api/tariff/all${queryString}`, {
      method: 'GET',
    });
  },

  getById: async (tariffId: number): Promise<Tariff> => {
    return apiClient<Tariff>(`/api/tariff/${tariffId}`, {
      method: 'GET',
    });
  },

  getByStatus: async (status: StatusEnum): Promise<Tariff[]> => {
    return apiClient<Tariff[]>(`/api/tariff/status/${status}`, {
      method: 'GET',
    });
  },

  search: async (
    searchTerm: string,
    sortBy?: string,
    sortDirection?: 'asc' | 'desc'
  ): Promise<Tariff[]> => {
    const params = new URLSearchParams({ search: searchTerm.trim() });
    if (sortBy) params.append('sortBy', sortBy);
    if (sortDirection) params.append('sortDirection', sortDirection);
    return apiClient<Tariff[]>(`/api/tariff/search?${params.toString()}`, {
      method: 'GET',
    });
  },

  create: async (data: TariffCreateRequest): Promise<string> => {
    return apiClient<string>('/api/tariff/create', {
      method: 'POST',
      body: data,
    });
  },

  update: async (tariffId: number, data: TariffUpdateRequest): Promise<string> => {
    return apiClient<string>(`/api/tariff/update/${tariffId}`, {
      method: 'PUT',
      body: data,
    });
  },

  delete: async (tariffId: number): Promise<string> => {
    return apiClient<string>(`/api/tariff/${tariffId}`, {
      method: 'DELETE',
    });
  },
};
