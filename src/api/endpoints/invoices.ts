import { apiClient } from '@/api/client';
import type { Invoice, CreateInvoiceData, InvoiceStatus } from '@/types/invoice';

interface PayloadListResponse {
  docs: Invoice[];
  totalDocs: number;
  totalPages: number;
  page: number;
  hasNextPage: boolean;
}

export const invoicesApi = {
  list: (params?: { status?: InvoiceStatus; page?: number }) => {
    const queryParams: Record<string, string> = {
      sort: '-createdAt',
      depth: '1',
    };
    if (params?.status) queryParams['where[status][equals]'] = params.status;
    if (params?.page) queryParams.page = String(params.page);
    return apiClient.get<PayloadListResponse>('/api/invoices', queryParams);
  },

  get: (id: number) => apiClient.get<Invoice>(`/api/invoices/${id}`, { depth: '1' }),

  create: (data: CreateInvoiceData) =>
    apiClient.post<{ doc: Invoice }>('/api/invoices', data),

  update: (id: number, data: Partial<CreateInvoiceData & { status: InvoiceStatus }>) =>
    apiClient.patch<{ doc: Invoice }>(`/api/invoices/${id}`, data),

  delete: (id: number) => apiClient.delete(`/api/invoices/${id}`),

  send: (id: number) =>
    apiClient.patch<{ doc: Invoice }>(`/api/invoices/${id}`, { status: 'sent' }),

  markPaid: (id: number) =>
    apiClient.patch<{ doc: Invoice }>(`/api/invoices/${id}`, {
      status: 'paid',
      paidAt: new Date().toISOString(),
    }),
};
