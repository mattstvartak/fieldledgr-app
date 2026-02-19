export type TradeType =
  | 'plumbing'
  | 'electrical'
  | 'hvac'
  | 'roofing'
  | 'painting'
  | 'landscaping'
  | 'carpentry'
  | 'general_contractor'
  | 'cleaning'
  | 'pest_control'
  | 'locksmith'
  | 'appliance_repair'
  | 'flooring'
  | 'fencing'
  | 'concrete'
  | 'other';

export const tradeTypeLabels: Record<TradeType, string> = {
  plumbing: 'Plumbing',
  electrical: 'Electrical',
  hvac: 'HVAC',
  roofing: 'Roofing',
  painting: 'Painting',
  landscaping: 'Landscaping',
  carpentry: 'Carpentry',
  general_contractor: 'General Contractor',
  cleaning: 'Cleaning',
  pest_control: 'Pest Control',
  locksmith: 'Locksmith',
  appliance_repair: 'Appliance Repair',
  flooring: 'Flooring',
  fencing: 'Fencing',
  concrete: 'Concrete',
  other: 'Other',
};

export interface Business {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  website?: string;
  tradeType?: TradeType;
  serviceArea?: string;
  logo?: number | { id: number; url: string };
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
  taxRate?: number;
  defaultEstimateNotes?: string;
  defaultInvoiceNotes?: string;
  gpsTrackingEnabled?: boolean;
  owner: number | { id: number; firstName: string; lastName: string };
  createdAt: string;
  updatedAt: string;
}

export interface CreateBusinessData {
  name: string;
  phone: string;
  email: string;
  tradeType?: TradeType;
  serviceArea?: string;
  taxRate?: number;
  defaultEstimateNotes?: string;
  defaultInvoiceNotes?: string;
}

export interface OnboardingData {
  currentStep: number;
  businessName: string;
  phone: string;
  email: string;
  tradeType?: TradeType;
  serviceArea?: string;
  logoUri?: string;
  taxRate?: number;
  defaultEstimateNotes?: string;
  defaultInvoiceNotes?: string;
}
