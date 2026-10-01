import { apiClient } from '../api/client';
import type { Account, StatusEnum } from '../types';

export const accountService = {
  getAll: async (sortBy?: string, sortDirection?: 'asc' | 'desc'): Promise<Account[]> => {
    const params = new URLSearchParams();
    if (sortBy) params.append('sortBy', sortBy);
    if (sortDirection) params.append('sortDirection', sortDirection);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return apiClient<Account[]>(`/api/account/all${queryString}`, {
      method: 'GET',
    });
  },

  getById: async (accountId: number): Promise<Account> => {
    return apiClient<Account>(`/api/account/${accountId}`, {
      method: 'GET',
    });
  },

  getByCustomer: async (customerId: number): Promise<Account[]> => {
    return apiClient<Account[]>(`/api/account/customer/${customerId}`, {
      method: 'GET',
    });
  },

  getByStatus: async (status: StatusEnum): Promise<Account[]> => {
    return apiClient<Account[]>(`/api/account/status/${status}`, {
      method: 'GET',
    });
  },

  search: async (
    searchTerm: string,
    sortBy?: string,
    sortDirection?: 'asc' | 'desc'
  ): Promise<Account[]> => {
    const params = new URLSearchParams({ search: searchTerm.trim() });
    if (sortBy) params.append('sortBy', sortBy);
    if (sortDirection) params.append('sortDirection', sortDirection);
    return apiClient<Account[]>(`/api/account/search?${params.toString()}`, {
      method: 'GET',
    });
  },

  create: async (customerId: number): Promise<string> => {
    return apiClient<string>(`/api/account/create/${customerId}`, {
      method: 'POST',
    });
  },

  updateStatus: async (accountId: number, status: StatusEnum): Promise<string> => {
    return apiClient<string>(`/api/account/update/${accountId}`, {
      method: 'PUT',
      body: status,
    });
  },
};