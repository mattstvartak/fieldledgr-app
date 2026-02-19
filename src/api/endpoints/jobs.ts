import { apiClient } from '@/api/client';
import type { PayloadJob, JobStatus } from '@/types/job';

interface PayloadListResponse<T> {
  docs: T[];
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface CreateJobData {
  title: string;
  customer: number;
  description?: string;
  assignedTo?: number;
  scheduledDate?: string;
  scheduledStartTime?: string;
  scheduledEndTime?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
  status?: JobStatus;
}

export const jobsApi = {
  getMyJobs: (userId: number, filters?: { status?: JobStatus; date?: string }) => {
    const params: Record<string, string> = {
      'where[assignedTo][equals]': String(userId),
      sort: '-scheduledDate',
      depth: '1',
    };
    if (filters?.status) {
      params['where[status][equals]'] = filters.status;
    }
    if (filters?.date) {
      params['where[scheduledDate][equals]'] = filters.date;
    }
    return apiClient.get<PayloadListResponse<PayloadJob>>('/api/jobs', params);
  },

  getAllJobs: (filters?: { status?: JobStatus; page?: number }) => {
    const params: Record<string, string> = {
      sort: '-scheduledDate',
      depth: '1',
    };
    if (filters?.status) {
      params['where[status][equals]'] = filters.status;
    }
    if (filters?.page) {
      params.page = String(filters.page);
    }
    return apiClient.get<PayloadListResponse<PayloadJob>>('/api/jobs', params);
  },

  getJob: (id: string) =>
    apiClient.get<PayloadJob>(`/api/jobs/${id}`, { depth: '1' }),

  createJob: (data: CreateJobData) =>
    apiClient.post<{ doc: PayloadJob }>('/api/jobs', data),

  updateJob: (id: string, data: Partial<CreateJobData>) =>
    apiClient.patch<PayloadJob>(`/api/jobs/${id}`, data),

  updateJobStatus: (id: string, status: JobStatus) =>
    apiClient.patch<PayloadJob>(`/api/jobs/${id}`, { status }),

  deleteJob: (id: string) => apiClient.delete(`/api/jobs/${id}`),
};
