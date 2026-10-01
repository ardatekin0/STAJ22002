import { apiClient } from '../api/client';
import type {
  ProductTariff,
  ProductTariffCreateRequest,
  ProductTariffUpdateRequest,
  StatusEnum,
} from '../types';

export const productTariffService = {
  getAll: async (sortBy?: string, sortDirection?: 'asc' | 'desc'): Promise<ProductTariff[]> => {
    const params = new URLSearchParams();
    if (sortBy) params.append('sortBy', sortBy);
    if (sortDirection) params.append('sortDirection', sortDirection);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return apiClient<ProductTariff[]>(`/api/product-tariff/all${queryString}`, {
      method: 'GET',
    });
  },

  getById: async (productTariffId: number): Promise<ProductTariff> => {
    return apiClient<ProductTariff>(`/api/product-tariff/${productTariffId}`, {
      method: 'GET',
    });
  },

  getByProduct: async (productId: number): Promise<ProductTariff[]> => {
    return apiClient<ProductTariff[]>(`/api/product-tariff/product/${productId}`, {
      method: 'GET',
    });
  },

  getByStatus: async (status: StatusEnum): Promise<ProductTariff[]> => {
    return apiClient<ProductTariff[]>(`/api/product-tariff/status/${status}`, {
      method: 'GET',
    });
  },

  search: async (
    searchTerm: string,
    sortBy?: string,
    sortDirection?: 'asc' | 'desc'
  ): Promise<ProductTariff[]> => {
    const params = new URLSearchParams({ search: searchTerm.trim() });
    if (sortBy) params.append('sortBy', sortBy);
    if (sortDirection) params.append('sortDirection', sortDirection);
    return apiClient<ProductTariff[]>(`/api/product-tariff/search?${params.toString()}`, {
      method: 'GET',
    });
  },

  create: async (data: ProductTariffCreateRequest): Promise<string> => {
    return apiClient<string>('/api/product-tariff/create', {
      method: 'POST',
      body: data,
    });
  },

  update: async (productTariffId: number, data: ProductTariffUpdateRequest): Promise<string> => {
    return apiClient<string>(`/api/product-tariff/update/${productTariffId}`, {
      method: 'PUT',
      body: data,
    });
  },
};
