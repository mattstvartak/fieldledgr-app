import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobsApi } from '@/api/endpoints/jobs';
import { jobNotesApi } from '@/api/endpoints/job-notes';
import { jobPhotosApi } from '@/api/endpoints/job-photos';
import { transformJob, transformJobList } from '@/api/transforms/job';
import { useAuthStore } from '@/stores/authStore';
import { useAppSettingsStore } from '@/stores/appSettingsStore';
import { useOfflineQueueStore } from '@/stores/offlineQueueStore';
import { mockJobs } from '@/mocks/jobs';
import type { Job, JobStatus } from '@/types/job';

export function useJobs(filters?: { status?: JobStatus; date?: string }) {
  const userId = useAuthStore((s) => s.user?.id);
  const useMockData = useAppSettingsStore((s) => s.useMockData);

  return useQuery({
    queryKey: ['jobs', userId, filters],
    queryFn: async () => {
      if (useMockData) {
        let filtered = [...mockJobs];
        if (filters?.date) {
          filtered = filtered.filter((j) => j.scheduledDate === filters.date);
        }
        if (filters?.status) {
          filtered = filtered.filter((j) => j.status === filters.status);
        }
        return filtered;
      }
      if (!userId) throw new Error('Not authenticated');
      const result = await jobsApi.getMyJobs(userId, filters);
      return transformJobList(result.docs);
    },
    enabled: !!userId || useMockData,
  });
}

export function useJob(id: string) {
  const useMockData = useAppSettingsStore((s) => s.useMockData);

  return useQuery({
    queryKey: ['job', id],
    queryFn: async () => {
      if (useMockData) {
        const job = mockJobs.find((j) => j.id === id);
        if (!job) throw new Error('Job not found');
        return job;
      }

      // Parallel-fetch job, notes, and photos
      const [raw, notesResult, photosResult] = await Promise.all([
        jobsApi.getJob(id),
        jobNotesApi.getNotes(id),
        jobPhotosApi.getPhotos(id),
      ]);

      return transformJob(raw, notesResult.docs, photosResult.docs);
    },
  });
}

export function useUpdateJobStatus() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);
  const useMockData = useAppSettingsStore((s) => s.useMockData);
  const enqueue = useOfflineQueueStore((s) => s.enqueue);

  return useMutation({
    mutationFn: async ({ jobId, status }: { jobId: string; status: JobStatus }) => {
      if (useMockData) {
        await new Promise((r) => setTimeout(r, 300));
        return { id: jobId, status } as Job;
      }
      try {
        return await jobsApi.updateJobStatus(jobId, status);
      } catch {
        // Queue for offline sync
        await enqueue('status-update', { jobId, status, userId: userId ?? '' });
        throw new Error('Queued for offline sync');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['job'] });
    },
  });
}

export function useTodayJobs() {
  const today = new Date().toISOString().split('T')[0];
  return useJobs({ date: today });
}
