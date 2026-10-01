import { apiClient } from '../api/client';
import type { Product, StatusEnum } from '../types';

export const productService = {
  getAll: async (sortBy?: string, sortDirection?: 'asc' | 'desc'): Promise<Product[]> => {
    const params = new URLSearchParams();
    if (sortBy) params.append('sortBy', sortBy);
    if (sortDirection) params.append('sortDirection', sortDirection);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return apiClient<Product[]>(`/api/product/all${queryString}`, {
      method: 'GET',
    });
  },

  getById: async (productId: number): Promise<Product> => {
    return apiClient<Product>(`/api/product/${productId}`, {
      method: 'GET',
    });
  },

  getByAccount: async (accountId: number): Promise<Product[]> => {
    return apiClient<Product[]>(`/api/product/account/${accountId}`, {
      method: 'GET',
    });
  },

  getByStatus: async (status: StatusEnum): Promise<Product[]> => {
    return apiClient<Product[]>(`/api/product/status/${status}`, {
      method: 'GET',
    });
  },

  search: async (
    searchTerm: string,
    sortBy?: string,
    sortDirection?: 'asc' | 'desc'
  ): Promise<Product[]> => {
    const params = new URLSearchParams({ search: searchTerm.trim() });
    if (sortBy) params.append('sortBy', sortBy);
    if (sortDirection) params.append('sortDirection', sortDirection);
    return apiClient<Product[]>(`/api/product/search?${params.toString()}`, {
      method: 'GET',
    });
  },

  create: async (accountId: number): Promise<string> => {
    return apiClient<string>(`/api/product/create/${accountId}`, {
      method: 'POST',
    });
  },

  updateStatus: async (productId: number, status: StatusEnum): Promise<string> => {
    return apiClient<string>(`/api/product/update/${productId}`, {
      method: 'PUT',
      body: status,
    });
  },
};
