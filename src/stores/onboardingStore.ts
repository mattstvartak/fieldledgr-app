import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { TradeType } from '@/types/business';

interface OnboardingState {
  currentStep: number;
  businessName: string;
  phone: string;
  email: string;
  tradeType: TradeType | '';
  serviceArea: string;
  logoUri: string;
  taxRate: string;
  defaultEstimateNotes: string;
  defaultInvoiceNotes: string;

  setStep: (step: number) => void;
  setBusinessBasics: (data: { businessName: string; phone: string; email: string }) => void;
  setTrade: (data: { tradeType: TradeType | ''; serviceArea: string }) => void;
  setLogo: (uri: string) => void;
  setDefaults: (data: {
    taxRate: string;
    defaultEstimateNotes: string;
    defaultInvoiceNotes: string;
  }) => void;
  reset: () => void;
}

const initialState = {
  currentStep: 0,
  businessName: '',
  phone: '',
  email: '',
  tradeType: '' as TradeType | '',
  serviceArea: '',
  logoUri: '',
  taxRate: '',
  defaultEstimateNotes: '',
  defaultInvoiceNotes: '',
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      ...initialState,

      setStep: (step) => set({ currentStep: step }),

      setBusinessBasics: (data) =>
        set({
          businessName: data.businessName,
          phone: data.phone,
          email: data.email,
        }),

      setTrade: (data) =>
        set({
          tradeType: data.tradeType,
          serviceArea: data.serviceArea,
        }),

      setLogo: (uri) => set({ logoUri: uri }),

      setDefaults: (data) =>
        set({
          taxRate: data.taxRate,
          defaultEstimateNotes: data.defaultEstimateNotes,
          defaultInvoiceNotes: data.defaultInvoiceNotes,
        }),

      reset: () => set(initialState),
    }),
    {
      name: 'fieldledgr-onboarding',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
