import { apiClient } from '../api/client';
import type {
  ProductDiscount,
  ProductDiscountCreateRequest,
  ProductDiscountUpdateRequest,
  StatusEnum,
} from '../types';

export const productDiscountService = {
  getAll: async (sortBy?: string, sortDirection?: 'asc' | 'desc'): Promise<ProductDiscount[]> => {
    const params = new URLSearchParams();
    if (sortBy) params.append('sortBy', sortBy);
    if (sortDirection) params.append('sortDirection', sortDirection);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return apiClient<ProductDiscount[]>(`/api/product-discount/all${queryString}`, {
      method: 'GET',
    });
  },

  getById: async (productDiscountId: number): Promise<ProductDiscount> => {
    return apiClient<ProductDiscount>(`/api/product-discount/${productDiscountId}`, {
      method: 'GET',
    });
  },

  getByProduct: async (productId: number): Promise<ProductDiscount[]> => {
    return apiClient<ProductDiscount[]>(`/api/product-discount/product/${productId}`, {
      method: 'GET',
    });
  },

  getByStatus: async (status: StatusEnum): Promise<ProductDiscount[]> => {
    return apiClient<ProductDiscount[]>(`/api/product-discount/status/${status}`, {
      method: 'GET',
    });
  },

  search: async (
    searchTerm: string,
    sortBy?: string,
    sortDirection?: 'asc' | 'desc'
  ): Promise<ProductDiscount[]> => {
    const params = new URLSearchParams({ search: searchTerm.trim() });
    if (sortBy) params.append('sortBy', sortBy);
    if (sortDirection) params.append('sortDirection', sortDirection);
    return apiClient<ProductDiscount[]>(`/api/product-discount/search?${params.toString()}`, {
      method: 'GET',
    });
  },

  create: async (data: ProductDiscountCreateRequest): Promise<string> => {
    return apiClient<string>('/api/product-discount/create', {
      method: 'POST',
      body: data,
    });
  },

  update: async (productDiscountId: number, data: ProductDiscountUpdateRequest): Promise<string> => {
    return apiClient<string>(`/api/product-discount/update/${productDiscountId}`, {
      method: 'PUT',
      body: data,
    });
  },
};
