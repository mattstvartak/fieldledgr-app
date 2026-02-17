export type JobStatus =
  | 'assigned'
  | 'en_route'
  | 'on_site'
  | 'in_progress'
  | 'complete';

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
}

export interface JobNote {
  id: string;
  text: string;
  createdBy: string;
  createdAt: string;
  isVoiceNote?: boolean;
}

export interface JobPhoto {
  id: string;
  uri: string;
  category: 'before' | 'during' | 'after';
  caption?: string;
  createdAt: string;
  createdBy: string;
}

export interface JobStatusEvent {
  status: JobStatus;
  timestamp: string;
  userId: string;
}

export interface Job {
  id: string;
  title: string;
  description?: string;
  status: JobStatus;
  client: Client;
  scheduledDate: string; // ISO date
  scheduledStartTime?: string; // HH:mm
  scheduledEndTime?: string; // HH:mm
  assignedTo: string[]; // user IDs
  lineItems: LineItem[];
  notes: JobNote[];
  photos: JobPhoto[];
  statusHistory: JobStatusEvent[];
  ownerNotes?: string; // notes from the business owner
  createdAt: string;
  updatedAt: string;
}
