import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teamApi } from '@/api/endpoints/team';
import type { CreateInvitationData } from '@/types/invitation';

export function useTeamMembers() {
  return useQuery({
    queryKey: ['team-members'],
    queryFn: () => teamApi.listMembers(),
  });
}

export function usePendingInvites() {
  return useQuery({
    queryKey: ['pending-invites'],
    queryFn: () => teamApi.listInvitations(),
  });
}

export function useInviteMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateInvitationData) => teamApi.invite(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-invites'] });
    },
  });
}

export function useCancelInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => teamApi.cancelInvitation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-invites'] });
    },
  });
}

export function useResendInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => teamApi.resendInvite(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-invites'] });
    },
  });
}

export function useDeactivateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => teamApi.deactivateUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
    },
  });
}

export function useReactivateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => teamApi.reactivateUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
    },
  });
}
