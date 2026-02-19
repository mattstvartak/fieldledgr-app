import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { businessesApi } from '@/api/endpoints/businesses';
import { useAuthStore } from '@/stores/authStore';
import type { CreateBusinessData } from '@/types/business';

export function useBusiness() {
  const user = useAuthStore((s) => s.user);
  const businessId =
    typeof user?.business === 'number' ? user.business : user?.business?.id;

  return useQuery({
    queryKey: ['business', businessId],
    queryFn: () => businessesApi.get(businessId!),
    enabled: !!businessId,
  });
}

export function useUpdateBusiness() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const businessId =
    typeof user?.business === 'number' ? user.business : user?.business?.id;

  return useMutation({
    mutationFn: (data: Partial<CreateBusinessData>) =>
      businessesApi.update(businessId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business', businessId] });
    },
  });
}
