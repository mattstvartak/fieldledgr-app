import { apiClient } from '@/api/client';
import type { Business, CreateBusinessData } from '@/types/business';

interface PayloadDocResponse {
  doc: Business;
}

interface PayloadListResponse {
  docs: Business[];
  totalDocs: number;
}

export const businessesApi = {
  create: (data: CreateBusinessData) =>
    apiClient.post<PayloadDocResponse>('/api/businesses', data),

  get: (id: number) => apiClient.get<Business>(`/api/businesses/${id}`, { depth: '1' }),

  update: (id: number, data: Partial<CreateBusinessData>) =>
    apiClient.patch<PayloadDocResponse>(`/api/businesses/${id}`, data),

  list: () => apiClient.get<PayloadListResponse>('/api/businesses', { limit: '1' }),

  uploadLogo: async (uri: string): Promise<{ doc: { id: number; url: string } }> => {
    return apiClient.postFormData('/api/media', uri, 'logo.jpg');
  },
};
