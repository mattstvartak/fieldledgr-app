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

  getJob: (id: string) =>
    apiClient.get<PayloadJob>(`/api/jobs/${id}`, { depth: '1' }),

  updateJobStatus: (id: string, status: JobStatus) =>
    apiClient.patch<PayloadJob>(`/api/jobs/${id}`, { status }),
};
