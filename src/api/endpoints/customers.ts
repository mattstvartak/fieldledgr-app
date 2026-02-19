import { apiClient } from '@/api/client';
import type { Customer, CreateCustomerData } from '@/types/customer';

interface PayloadListResponse {
  docs: Customer[];
  totalDocs: number;
  totalPages: number;
  page: number;
  hasNextPage: boolean;
}

export const customersApi = {
  list: (params?: { search?: string; page?: number; limit?: number }) => {
    const queryParams: Record<string, string> = {
      sort: 'lastName',
      depth: '0',
    };
    if (params?.search) {
      queryParams['where[or][0][firstName][contains]'] = params.search;
      queryParams['where[or][1][lastName][contains]'] = params.search;
      queryParams['where[or][2][company][contains]'] = params.search;
    }
    if (params?.page) queryParams.page = String(params.page);
    if (params?.limit) queryParams.limit = String(params.limit);
    return apiClient.get<PayloadListResponse>('/api/customers', queryParams);
  },

  get: (id: number) => apiClient.get<Customer>(`/api/customers/${id}`, { depth: '0' }),

  create: (data: CreateCustomerData) =>
    apiClient.post<{ doc: Customer }>('/api/customers', data),

  update: (id: number, data: Partial<CreateCustomerData>) =>
    apiClient.patch<{ doc: Customer }>(`/api/customers/${id}`, data),

  delete: (id: number) => apiClient.delete(`/api/customers/${id}`),
};
