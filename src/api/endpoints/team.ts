import { apiClient } from '@/api/client';
import type { User } from '@/types/user';
import type { Invitation, CreateInvitationData } from '@/types/invitation';

interface PayloadListResponse<T> {
  docs: T[];
  totalDocs: number;
}

export const teamApi = {
  listMembers: () =>
    apiClient.get<PayloadListResponse<User>>('/api/users', {
      sort: 'lastName',
      depth: '1',
      limit: '100',
    }),

  listInvitations: () =>
    apiClient.get<PayloadListResponse<Invitation>>('/api/invitations', {
      'where[status][equals]': 'pending',
      sort: '-createdAt',
      depth: '1',
    }),

  invite: (data: CreateInvitationData) =>
    apiClient.post<{ doc: Invitation }>('/api/invitations', data),

  cancelInvitation: (id: number) => apiClient.delete(`/api/invitations/${id}`),

  resendInvite: (id: number) =>
    apiClient.post<{ success: boolean }>(`/api/invitations/${id}/resend`),

  deactivateUser: (id: number) =>
    apiClient.patch<{ doc: User }>(`/api/users/${id}`, { isActive: false }),

  reactivateUser: (id: number) =>
    apiClient.patch<{ doc: User }>(`/api/users/${id}`, { isActive: true }),
};
