import { apiClient } from '../api/client';
import type { Discount, DiscountCreateRequest, DiscountUpdateRequest, StatusEnum } from '../types';

export const discountService = {
  getAll: async (sortBy?: string, sortDirection?: 'asc' | 'desc'): Promise<Discount[]> => {
    const params = new URLSearchParams();
    if (sortBy) params.append('sortBy', sortBy);
    if (sortDirection) params.append('sortDirection', sortDirection);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return apiClient<Discount[]>(`/api/discount/all${queryString}`, {
      method: 'GET',
    });
  },

  getById: async (discountId: number): Promise<Discount> => {
    return apiClient<Discount>(`/api/discount/${discountId}`, {
      method: 'GET',
    });
  },

  getByStatus: async (status: StatusEnum): Promise<Discount[]> => {
    return apiClient<Discount[]>(`/api/discount/status/${status}`, {
      method: 'GET',
    });
  },

  search: async (
    searchTerm: string,
    sortBy?: string,
    sortDirection?: 'asc' | 'desc'
  ): Promise<Discount[]> => {
    const params = new URLSearchParams({ search: searchTerm.trim() });
    if (sortBy) params.append('sortBy', sortBy);
    if (sortDirection) params.append('sortDirection', sortDirection);
    return apiClient<Discount[]>(`/api/discount/search?${params.toString()}`, {
      method: 'GET',
    });
  },

  create: async (data: DiscountCreateRequest): Promise<string> => {
    return apiClient<string>('/api/discount/create', {
      method: 'POST',
      body: data,
    });
  },

  update: async (discountId: number, data: DiscountUpdateRequest): Promise<string> => {
    return apiClient<string>(`/api/discount/update/${discountId}`, {
      method: 'PUT',
      body: data,
    });
  },

  delete: async (discountId: number): Promise<string> => {
    return apiClient<string>(`/api/discount/${discountId}`, {
      method: 'DELETE',
    });
  },
};
