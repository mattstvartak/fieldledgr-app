import { useMutation } from '@tanstack/react-query';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { useAuthStore } from '@/stores/authStore';
import { businessesApi } from '@/api/endpoints/businesses';
import { authApi } from '@/api/endpoints/auth';
import type { TradeType } from '@/types/business';

export function useCompleteOnboarding() {
  const store = useOnboardingStore();
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: async () => {
      const user = useAuthStore.getState().user;
      const token = useAuthStore.getState().token;
      if (!user || !token) throw new Error('Not authenticated');

      // 1. Create business
      const businessPayload: Record<string, unknown> = {
        name: store.businessName,
        phone: store.phone,
        email: store.email,
      };
      if (store.tradeType) {
        businessPayload.tradeType = store.tradeType;
      }
      if (store.serviceArea) {
        businessPayload.serviceArea = store.serviceArea;
      }
      if (store.taxRate) {
        businessPayload.taxRate = parseFloat(store.taxRate);
      }
      if (store.defaultEstimateNotes) {
        businessPayload.defaultEstimateNotes = store.defaultEstimateNotes;
      }
      if (store.defaultInvoiceNotes) {
        businessPayload.defaultInvoiceNotes = store.defaultInvoiceNotes;
      }

      const { doc: business } = await businessesApi.create(
        businessPayload as { name: string; phone: string; email: string; tradeType?: TradeType },
      );

      // 2. Upload logo if present
      if (store.logoUri) {
        try {
          const { doc: media } = await businessesApi.uploadLogo(store.logoUri);
          await businessesApi.update(business.id, { ...businessPayload, logo: media.id } as never);
        } catch {
          // Logo upload is non-critical; continue
        }
      }

      // 3. Update user with business + onboardingComplete
      await authApi.updateMe(user.id, {
        business: business.id,
        onboardingComplete: true,
      } as never);

      // 4. Refresh auth store with updated user
      const meResponse = await authApi.getMe();
      if (meResponse.user) {
        await setAuth(meResponse.user, meResponse.token || token);
      }

      // 5. Reset onboarding store
      store.reset();

      return business;
    },
  });
}
