import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { estimatesApi } from '@/api/endpoints/estimates';
import type { CreateEstimateData, EstimateStatus } from '@/types/estimate';

export function useEstimates(status?: EstimateStatus) {
  return useQuery({
    queryKey: ['estimates', status],
    queryFn: () => estimatesApi.list({ status }),
  });
}

export function useEstimate(id: number) {
  return useQuery({
    queryKey: ['estimate', id],
    queryFn: () => estimatesApi.get(id),
    enabled: !!id,
  });
}

export function useCreateEstimate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEstimateData) => estimatesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estimates'] });
    },
  });
}

export function useUpdateEstimate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Partial<CreateEstimateData & { status: EstimateStatus }>;
    }) => estimatesApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['estimates'] });
      queryClient.invalidateQueries({ queryKey: ['estimate', variables.id] });
    },
  });
}

export function useAcceptEstimate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      signedByName,
      signatureBase64,
    }: {
      id: number;
      signedByName: string;
      signatureBase64?: string;
    }) => estimatesApi.accept(id, signedByName, signatureBase64),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['estimates'] });
      queryClient.invalidateQueries({ queryKey: ['estimate', variables.id] });
    },
  });
}

export function useSendEstimate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => estimatesApi.send(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['estimates'] });
      queryClient.invalidateQueries({ queryKey: ['estimate', id] });
    },
  });
}

export function useDeleteEstimate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => estimatesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estimates'] });
    },
  });
}
