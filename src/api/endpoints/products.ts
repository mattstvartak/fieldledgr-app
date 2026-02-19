import { apiClient } from '@/api/client';
import type { Product, CreateProductData } from '@/types/product';

interface PayloadListResponse {
  docs: Product[];
  totalDocs: number;
  totalPages: number;
  page: number;
  hasNextPage: boolean;
}

export const productsApi = {
  list: (params?: { search?: string; page?: number }) => {
    const queryParams: Record<string, string> = {
      sort: 'name',
      depth: '0',
    };
    if (params?.search) queryParams['where[name][contains]'] = params.search;
    if (params?.page) queryParams.page = String(params.page);
    return apiClient.get<PayloadListResponse>('/api/products', queryParams);
  },

  get: (id: number) => apiClient.get<Product>(`/api/products/${id}`),

  create: (data: CreateProductData) =>
    apiClient.post<{ doc: Product }>('/api/products', data),

  update: (id: number, data: Partial<CreateProductData>) =>
    apiClient.patch<{ doc: Product }>(`/api/products/${id}`, data),

  delete: (id: number) => apiClient.delete(`/api/products/${id}`),
};
