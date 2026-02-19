import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobsApi } from '@/api/endpoints/jobs';
import type { CreateJobData } from '@/api/endpoints/jobs';
import { jobNotesApi } from '@/api/endpoints/job-notes';
import { jobPhotosApi } from '@/api/endpoints/job-photos';
import { transformJob, transformJobList } from '@/api/transforms/job';
import { useAuthStore } from '@/stores/authStore';
import { useOfflineQueueStore } from '@/stores/offlineQueueStore';
import type { JobStatus } from '@/types/job';

export function useJobs(filters?: { status?: JobStatus; date?: string }) {
  const userId = useAuthStore((s) => s.user?.id);

  return useQuery({
    queryKey: ['jobs', userId, filters],
    queryFn: async () => {
      if (!userId) throw new Error('Not authenticated');
      const result = await jobsApi.getMyJobs(userId, filters);
      return transformJobList(result.docs);
    },
    enabled: !!userId,
  });
}

export function useAllJobs(filters?: { status?: JobStatus; page?: number }) {
  return useQuery({
    queryKey: ['all-jobs', filters],
    queryFn: async () => {
      const result = await jobsApi.getAllJobs(filters);
      return { jobs: transformJobList(result.docs), totalDocs: result.totalDocs, totalPages: result.totalPages, hasNextPage: result.hasNextPage };
    },
  });
}

export function useCreateJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateJobData) => jobsApi.createJob(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['all-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['owner-dashboard'] });
    },
  });
}

export function useUpdateJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateJobData> }) =>
      jobsApi.updateJob(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['all-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['job', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['owner-dashboard'] });
    },
  });
}

export function useDeleteJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => jobsApi.deleteJob(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['all-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['owner-dashboard'] });
    },
  });
}

export function useJob(id: string) {
  return useQuery({
    queryKey: ['job', id],
    queryFn: async () => {
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
  const enqueue = useOfflineQueueStore((s) => s.enqueue);

  return useMutation({
    mutationFn: async ({ jobId, status }: { jobId: string; status: JobStatus }) => {
      try {
        return await jobsApi.updateJobStatus(jobId, status);
      } catch {
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
