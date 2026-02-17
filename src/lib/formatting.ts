import { format, formatDistanceToNow, parseISO, isToday, isTomorrow, isYesterday } from 'date-fns';

export function formatTime(isoString: string): string {
  return format(parseISO(isoString), 'h:mm a');
}

export function formatDate(isoString: string): string {
  const date = parseISO(isoString);
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'EEE, MMM d');
}

export function formatDateFull(isoString: string): string {
  return format(parseISO(isoString), 'EEEE, MMMM d, yyyy');
}

export function formatTimeRange(start?: string, end?: string): string {
  if (!start) return '';
  const s = start; // HH:mm format
  const formattedStart = formatHHmm(s);
  if (!end) return formattedStart;
  return `${formattedStart} - ${formatHHmm(end)}`;
}

function formatHHmm(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${period}`;
}

export function formatRelative(isoString: string): string {
  return formatDistanceToNow(parseISO(isoString), { addSuffix: true });
}

export function formatHoursDecimal(hours: number): string {
  return `${hours.toFixed(1)}h`;
}

export function formatDuration(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function formatPhone(phone: string): string {
  // Return as-is — the data should already be formatted
  return phone;
}

export function formatAddress(address: { street: string; city: string; state: string; zip: string }): string {
  return `${address.street}, ${address.city}, ${address.state} ${address.zip}`;
}

export function getJobStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    assigned: 'Assigned',
    en_route: 'En Route',
    on_site: 'On Site',
    in_progress: 'In Progress',
    complete: 'Complete',
  };
  return labels[status] ?? status;
}
