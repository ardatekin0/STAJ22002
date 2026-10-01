import { apiClient } from '../api/client';
import type { BatchJob, Invoice } from '../types';

export const invoiceService = {
  getAll: async (sortBy?: string, sortDirection?: 'asc' | 'desc'): Promise<Invoice[]> => {
    const params = new URLSearchParams();
    if (sortBy) params.append('sortBy', sortBy);
    if (sortDirection) params.append('sortDirection', sortDirection);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return apiClient<Invoice[]>(`/api/invoice/all${queryString}`, {
      method: 'GET',
    });
  },

  getById: async (invoiceId: number): Promise<Invoice> => {
    return apiClient<Invoice>(`/api/invoice/${invoiceId}`, {
      method: 'GET',
    });
  },

  getByAccount: async (accountId: number): Promise<Invoice[]> => {
    return apiClient<Invoice[]>(`/api/invoice/account/${accountId}`, {
      method: 'GET',
    });
  },

  getByBillingPeriod: async (billingPeriod: number): Promise<Invoice[]> => {
    return apiClient<Invoice[]>(`/api/invoice/billing-period/${billingPeriod}`, {
      method: 'GET',
    });
  },

  search: async (
    searchTerm: string,
    sortBy?: string,
    sortDirection?: 'asc' | 'desc'
  ): Promise<Invoice[]> => {
    const params = new URLSearchParams({ search: searchTerm.trim() });
    if (sortBy) params.append('sortBy', sortBy);
    if (sortDirection) params.append('sortDirection', sortDirection);
    return apiClient<Invoice[]>(`/api/invoice/search?${params.toString()}`, {
      method: 'GET',
    });
  },

  createInvoiceBatch: async (): Promise<string> => {
    return apiClient<string>('/api/invoice/create', {
      method: 'POST',
    });
  },

  getInvoiceJob: async (jobId: number): Promise<BatchJob> => {
    return apiClient<BatchJob>(`/api/invoice/job/${jobId}`, {
      method: 'GET',
    });
  },
};
