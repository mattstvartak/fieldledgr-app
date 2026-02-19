import { apiClient } from '@/api/client';
import type { Estimate, CreateEstimateData, EstimateStatus } from '@/types/estimate';

interface PayloadListResponse {
  docs: Estimate[];
  totalDocs: number;
  totalPages: number;
  page: number;
  hasNextPage: boolean;
}

export const estimatesApi = {
  list: (params?: { status?: EstimateStatus; page?: number }) => {
    const queryParams: Record<string, string> = {
      sort: '-createdAt',
      depth: '1',
    };
    if (params?.status) queryParams['where[status][equals]'] = params.status;
    if (params?.page) queryParams.page = String(params.page);
    return apiClient.get<PayloadListResponse>('/api/estimates', queryParams);
  },

  get: (id: number) => apiClient.get<Estimate>(`/api/estimates/${id}`, { depth: '1' }),

  create: (data: CreateEstimateData) =>
    apiClient.post<{ doc: Estimate }>('/api/estimates', data),

  update: (id: number, data: Partial<CreateEstimateData & { status: EstimateStatus }>) =>
    apiClient.patch<{ doc: Estimate }>(`/api/estimates/${id}`, data),

  delete: (id: number) => apiClient.delete(`/api/estimates/${id}`),

  send: (id: number) =>
    apiClient.patch<{ doc: Estimate }>(`/api/estimates/${id}`, { status: 'sent' }),

  accept: (id: number, signedByName: string, signatureBase64?: string) =>
    apiClient.post<{ success: boolean }>('/api/estimates/accept', {
      estimateId: id,
      signedByName,
      ...(signatureBase64 ? { signatureData: signatureBase64 } : {}),
    }),
};
