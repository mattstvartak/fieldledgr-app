/** Backend job statuses — must match Payload Jobs collection */
export type JobStatus =
  | 'lead'
  | 'quoted'
  | 'accepted'
  | 'scheduled'
  | 'en_route'
  | 'on_site'
  | 'in_progress'
  | 'completed'
  | 'paid'
  | 'canceled';

/** Statuses a team member can see/act on in the mobile app */
export type TechnicianJobStatus = 'scheduled' | 'en_route' | 'on_site' | 'in_progress' | 'completed';

/** Payload Customer as returned with depth=1 */
export interface PayloadCustomer {
  id: number;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  address?: {
    street?: string | null;
    city?: string | null;
    state?: string | null;
    zip?: string | null;
  };
}

/** Convenience client view model for display */
export interface Client {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address: Address;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
  lat?: number;
  lng?: number;
}

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unit?: string;
  unitPrice?: number;
  total?: number;
}

export interface JobNote {
  id: number | string;
  text: string;
  createdBy: number | string | { id: number; firstName?: string; lastName?: string };
  createdAt: string;
  isVoiceNote?: boolean;
}

export interface JobPhoto {
  id: number | string;
  uri: string;
  photo?: number | { id: number; url: string };
  category: 'before' | 'during' | 'after';
  caption?: string;
  createdAt: string;
  createdBy: number | string | { id: number; firstName?: string; lastName?: string };
}

export interface JobStatusEvent {
  status: string;
  timestamp: string;
  changedBy?: number | string | { id: number; firstName?: string; lastName?: string } | null;
}

/** Raw Payload job response (depth=1) */
export interface PayloadJob {
  id: number;
  title: string;
  description?: string | null;
  status: JobStatus;
  jobNumber?: string | null;
  customer: number | PayloadCustomer;
  assignedTo?: number | { id: number; firstName?: string; lastName?: string } | null;
  address?: {
    street?: string | null;
    city?: string | null;
    state?: string | null;
    zip?: string | null;
  };
  scheduledDate?: string | null;
  scheduledTime?: string | null;
  scheduledStartTime?: string | null;
  scheduledEndTime?: string | null;
  completedAt?: string | null;
  statusHistory?: JobStatusEvent[] | null;
  internalNotes?: string | null;
  photos?: (number | { id: number; url: string })[] | null;
  estimate?: number | null;
  invoice?: number | null;
  createdAt: string;
  updatedAt: string;
}

/** Transformed job for mobile app display */
export interface Job {
  id: string;
  title: string;
  description?: string;
  status: JobStatus;
  jobNumber?: string;
  client: Client;
  scheduledDate: string;
  scheduledStartTime?: string;
  scheduledEndTime?: string;
  assignedTo: string[];
  lineItems: LineItem[];
  notes: JobNote[];
  photos: JobPhoto[];
  statusHistory: JobStatusEvent[];
  ownerNotes?: string;
  createdAt: string;
  updatedAt: string;
}
