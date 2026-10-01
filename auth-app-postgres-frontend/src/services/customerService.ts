import { apiClient } from '../api/client';
import type { Customer, CustomerDto, StatusEnum } from '../types';

export const customerService = {
  getAll: async (sortBy?: string, sortDirection?: 'asc' | 'desc'): Promise<Customer[]> => {
    const params = new URLSearchParams();
    if (sortBy) params.append('sortBy', sortBy);
    if (sortDirection) params.append('sortDirection', sortDirection);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return apiClient<Customer[]>(`/api/customer/all${queryString}`, {
      method: 'GET',
    });
  },

  getById: async (customerId: number): Promise<Customer> => {
    return apiClient<Customer>(`/api/customer/id/${customerId}`, {
      method: 'GET',
    });
  },

  getByTckn: async (tckn: string): Promise<Customer> => {
    return apiClient<Customer>(`/api/customer/tckn/${encodeURIComponent(tckn)}`, {
      method: 'GET',
    });
  },

  getByVkn: async (vkn: string): Promise<Customer> => {
    return apiClient<Customer>(`/api/customer/vkn/${encodeURIComponent(vkn)}`, {
      method: 'GET',
    });
  },

  getByStatus: async (status: StatusEnum): Promise<Customer[]> => {
    return apiClient<Customer[]>(`/api/customer/status/${status}`, {
      method: 'GET',
    });
  },

  search: async (
    searchTerm: string,
    sortBy?: string,
    sortDirection?: 'asc' | 'desc'
  ): Promise<Customer[]> => {
    const params = new URLSearchParams({ search: searchTerm.trim() });
    if (sortBy) params.append('sortBy', sortBy);
    if (sortDirection) params.append('sortDirection', sortDirection);
    return apiClient<Customer[]>(`/api/customer/search?${params.toString()}`, {
      method: 'GET',
    });
  },

  create: async (customerDto: CustomerDto): Promise<string> => {
    return apiClient<string>('/api/customer/create', {
      method: 'POST',
      body: customerDto,
    });
  },

  updateStatus: async (customerId: number, status: StatusEnum): Promise<string> => {
    return apiClient<string>(`/api/customer/update/${customerId}`, {
      method: 'PUT',
      body: status,
    });
  },
};
