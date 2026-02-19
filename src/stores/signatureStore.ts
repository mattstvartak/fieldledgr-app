import { create } from 'zustand';

interface SignatureState {
  signatureData: string | null;
  signedByName: string | null;
  setSignature: (data: string, name: string) => void;
  clearSignature: () => void;
}

export const useSignatureStore = create<SignatureState>((set) => ({
  signatureData: null,
  signedByName: null,
  setSignature: (data, name) => set({ signatureData: data, signedByName: name }),
  clearSignature: () => set({ signatureData: null, signedByName: null }),
}));
