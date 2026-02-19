import type {
  Job,
  PayloadJob,
  PayloadCustomer,
  Client,
  Address,
  JobNote,
  JobPhoto,
} from '@/types/job';

function toClient(customer: number | PayloadCustomer): Client {
  if (typeof customer === 'number') {
    return {
      id: String(customer),
      name: 'Unknown Customer',
      address: { street: '', city: '', state: '', zip: '' },
    };
  }

  return {
    id: String(customer.id),
    name: `${customer.firstName} ${customer.lastName}`.trim(),
    phone: customer.phone ?? undefined,
    email: customer.email ?? undefined,
    address: toAddress(customer.address),
  };
}

function toAddress(
  addr?: { street?: string | null; city?: string | null; state?: string | null; zip?: string | null } | null,
): Address {
  return {
    street: addr?.street ?? '',
    city: addr?.city ?? '',
    state: addr?.state ?? '',
    zip: addr?.zip ?? '',
  };
}

function getAssignedTo(
  assignedTo?: number | { id: number } | null,
): string[] {
  if (assignedTo == null) return [];
  if (typeof assignedTo === 'number') return [String(assignedTo)];
  return [String(assignedTo.id)];
}

/** Transform a single Payload job with optional notes/photos into the mobile view model */
export function transformJob(
  raw: PayloadJob,
  notes: JobNote[] = [],
  photos: JobPhoto[] = [],
): Job {
  // Transform photos to include uri from populated media
  const transformedPhotos: JobPhoto[] = photos.map((p) => {
    let uri = '';
    if ('uri' in p && p.uri) {
      uri = p.uri;
    } else if (p.photo && typeof p.photo === 'object' && 'url' in p.photo) {
      uri = p.photo.url;
    }
    return { ...p, uri };
  });

  const client = toClient(raw.customer);

  // Prefer the job's own address (job site) over the customer's address
  const jobAddress = raw.address;
  const hasJobAddress = jobAddress && (jobAddress.street || jobAddress.city || jobAddress.state || jobAddress.zip);
  if (hasJobAddress) {
    client.address = toAddress(jobAddress);
  }

  return {
    id: String(raw.id),
    title: raw.title,
    description: raw.description ?? undefined,
    status: raw.status,
    jobNumber: raw.jobNumber ?? undefined,
    client,
    scheduledDate: raw.scheduledDate ?? new Date().toISOString().split('T')[0],
    scheduledStartTime: raw.scheduledStartTime ?? undefined,
    scheduledEndTime: raw.scheduledEndTime ?? undefined,
    assignedTo: getAssignedTo(raw.assignedTo),
    lineItems: [],
    notes,
    photos: transformedPhotos,
    statusHistory: raw.statusHistory ?? [],
    ownerNotes: raw.internalNotes ?? undefined,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

/** Lightweight transform for list views (no notes/photos needed) */
export function transformJobList(docs: PayloadJob[]): Job[] {
  return docs.map((raw) => transformJob(raw));
}
