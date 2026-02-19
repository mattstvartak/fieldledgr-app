import { apiClient } from '@/api/client';
import type { Role } from '@/types/role';

interface PayloadListResponse<T> {
  docs: T[];
  totalDocs: number;
}

export const rolesApi = {
  list: () =>
    apiClient.get<PayloadListResponse<Role>>('/api/roles', {
      sort: 'name',
      limit: '100',
    }),
};
