import { apiClient } from '@/api/client';
import type { Job, JobNote, JobPhoto, JobStatus } from '@/types/job';

// TODO: sync with Payload types

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
  getMyJobs: (userId: string, filters?: { status?: JobStatus; date?: string }) => {
    const params: Record<string, string> = {
      'where[assignedTo][equals]': userId,
      sort: '-scheduledDate',
    };
    if (filters?.status) {
      params['where[status][equals]'] = filters.status;
    }
    if (filters?.date) {
      params['where[scheduledDate][equals]'] = filters.date;
    }
    return apiClient.get<PayloadListResponse<Job>>('/api/jobs', params);
  },

  getJob: (id: string) => apiClient.get<Job>(`/api/jobs/${id}`),

  updateJobStatus: (id: string, status: JobStatus) =>
    apiClient.patch<Job>(`/api/jobs/${id}`, { status }),

  addNote: (jobId: string, note: Omit<JobNote, 'id' | 'createdAt'>) =>
    apiClient.post<JobNote>(`/api/jobs/${jobId}/notes`, note),

  addPhoto: (jobId: string, photo: Omit<JobPhoto, 'id' | 'createdAt'>) =>
    // TODO: implement multipart upload for photos
    apiClient.post<JobPhoto>(`/api/jobs/${jobId}/photos`, photo),
};
