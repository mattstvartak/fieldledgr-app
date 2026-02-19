import { useQuery } from '@tanstack/react-query';
import { rolesApi } from '@/api/endpoints/roles';

export function useRoles() {
  return useQuery({
    queryKey: ['roles'],
    queryFn: () => rolesApi.list(),
    select: (data) => data.docs,
  });
}
