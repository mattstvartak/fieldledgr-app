export type TimeEntryType = 'clock-in' | 'clock-out' | 'break-start' | 'break-end';

export interface GpsCoords {
  lat: number;
  lng: number;
}

export interface TimeEntry {
  id: number;
  user: number;
  type: TimeEntryType;
  timestamp: string; // ISO string
  job?: number | null;
  gpsCoords?: GpsCoords;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TimesheetDay {
  date: string; // YYYY-MM-DD
  entries: Array<{ id: number; type: string; timestamp: string }>;
  totalHours: number;
  breakHours: number;
  netHours: number;
}

export interface TimesheetWeek {
  weekStart: string; // YYYY-MM-DD (Monday)
  weekEnd: string; // YYYY-MM-DD (Sunday)
  days: TimesheetDay[];
  totalHours: number;
  totalBreakHours: number;
  totalNetHours: number;
}

export interface CorrectionRequest {
  id: number;
  user: number;
  date: string;
  originalEntry?: number | null;
  requestedTime: string;
  requestedType: TimeEntryType;
  reason: string;
  status: 'pending' | 'approved' | 'denied';
  createdAt: string;
}
