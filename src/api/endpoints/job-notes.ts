import { apiClient } from '@/api/client';
import type { JobNote } from '@/types/job';

interface PayloadListResponse<T> {
  docs: T[];
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export const jobNotesApi = {
  addNote: (jobId: string, text: string) =>
    apiClient.post<JobNote>('/api/job-notes', {
      job: Number(jobId),
      text,
    }),

  getNotes: (jobId: string) =>
    apiClient.get<PayloadListResponse<JobNote>>('/api/job-notes', {
      'where[job][equals]': jobId,
      sort: '-createdAt',
    }),
};
