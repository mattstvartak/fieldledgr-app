import { apiClient } from '@/api/client';

export interface TimeCorrection {
  id: number;
  timeEntry: number | {
    id: number;
    clockIn: string;
    clockOut?: string;
    user: number | { id: number; firstName: string; lastName: string };
  };
  requestedBy: number | { id: number; firstName: string; lastName: string };
  reason: string;
  requestedClockIn?: string;
  requestedClockOut?: string;
  status: 'pending' | 'approved' | 'denied';
  reviewedBy?: number | { id: number; firstName: string; lastName: string };
  reviewedAt?: string;
  reviewNote?: string;
  createdAt: string;
  updatedAt: string;
}

interface PayloadListResponse {
  docs: TimeCorrection[];
  totalDocs: number;
}

export const correctionsApi = {
  listPending: () =>
    apiClient.get<PayloadListResponse>('/api/time-corrections', {
      'where[status][equals]': 'pending',
      sort: '-createdAt',
      depth: '2',
    }),

  approve: (id: number, reviewNote?: string) =>
    apiClient.patch<{ doc: TimeCorrection }>(`/api/time-corrections/${id}`, {
      status: 'approved',
      reviewNote,
    }),

  deny: (id: number, reviewNote?: string) =>
    apiClient.patch<{ doc: TimeCorrection }>(`/api/time-corrections/${id}`, {
      status: 'denied',
      reviewNote,
    }),
};
