import { apiClient } from '@/api/client';

export interface AppNotification {
  id: number;
  type:
    | 'job_assigned'
    | 'schedule_change'
    | 'message'
    | 'reminder'
    | 'correction_approved'
    | 'correction_denied';
  title: string;
  body: string;
  read: boolean;
  job?: number | null;
  createdAt: string;
}

interface PayloadListResponse<T> {
  docs: T[];
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export const notificationsApi = {
  getNotifications: (userId: number, unreadOnly = false) => {
    const params: Record<string, string> = {
      'where[user][equals]': String(userId),
      sort: '-createdAt',
      limit: '50',
    };
    if (unreadOnly) {
      params['where[read][equals]'] = 'false';
    }
    return apiClient.get<PayloadListResponse<AppNotification>>('/api/notifications', params);
  },

  markAsRead: (id: number) =>
    apiClient.patch<AppNotification>(`/api/notifications/${id}`, { read: true }),

  markAllAsRead: () => apiClient.post<{ updated: number }>('/api/notifications/mark-all-read'),

  getUnreadCount: () => apiClient.get<{ count: number }>('/api/notifications/unread-count'),
};
