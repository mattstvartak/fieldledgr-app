export type EstimateStatus = 'draft' | 'sent' | 'accepted' | 'declined' | 'expired';

export interface EstimateLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Estimate {
  id: number;
  estimateNumber?: string;
  customer: number | { id: number; firstName: string; lastName: string; company?: string | null };
  job?: number | null;
  status: EstimateStatus;
  lineItems?: EstimateLineItem[] | null;
  subtotal: number;
  taxRate?: number;
  taxAmount?: number;
  total: number;
  notes?: string | null;
  validUntil?: string | null;
  sentAt?: string | null;
  acceptedAt?: string | null;
  signatureUrl?: string | null;
  signedByName?: string | null;
  signedByIp?: string | null;
  business: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEstimateData {
  customer: number;
  job?: number;
  lineItems: Omit<EstimateLineItem, 'total'>[];
  taxRate?: number;
  notes?: string;
  validUntil?: string;
}
