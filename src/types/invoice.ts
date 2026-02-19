export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'void';

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: number;
  invoiceNumber?: string;
  customer: number | { id: number; firstName: string; lastName: string; company?: string | null };
  job?: number | null;
  estimate?: number | null;
  status: InvoiceStatus;
  items: InvoiceLineItem[];
  subtotal: number;
  taxRate?: number;
  taxAmount?: number;
  total: number;
  notes?: string | null;
  dueDate?: string | null;
  sentAt?: string | null;
  paidAt?: string | null;
  business: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInvoiceData {
  customer: number;
  job?: number;
  estimate?: number;
  items: Omit<InvoiceLineItem, 'total'>[];
  taxRate?: number;
  notes?: string;
  dueDate?: string;
}
