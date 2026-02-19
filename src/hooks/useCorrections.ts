import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { correctionsApi } from '@/api/endpoints/corrections';

export function usePendingCorrections() {
  return useQuery({
    queryKey: ['corrections', 'pending'],
    queryFn: () => correctionsApi.listPending(),
  });
}

export function useApproveCorrection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reviewNote }: { id: number; reviewNote?: string }) =>
      correctionsApi.approve(id, reviewNote),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['corrections'] });
    },
  });
}

export function useDenyCorrection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reviewNote }: { id: number; reviewNote?: string }) =>
      correctionsApi.deny(id, reviewNote),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['corrections'] });
    },
  });
}
