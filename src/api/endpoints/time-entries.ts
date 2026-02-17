import { apiClient } from '@/api/client';
import type { TimeEntry, TimesheetDay, CorrectionRequest, GpsCoords } from '@/types/time-entry';

interface PayloadListResponse<T> {
  docs: T[];
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export const timeEntriesApi = {
  clockIn: (userId: number, gpsCoords?: GpsCoords | null, jobId?: number) =>
    apiClient.post<TimeEntry>('/api/time-entries', {
      user: userId,
      type: 'clock-in',
      timestamp: new Date().toISOString(),
      gpsCoords: gpsCoords ? { lat: gpsCoords.lat, lng: gpsCoords.lng } : undefined,
      job: jobId,
    }),

  clockOut: (userId: number, gpsCoords?: GpsCoords | null) =>
    apiClient.post<TimeEntry>('/api/time-entries', {
      user: userId,
      type: 'clock-out',
      timestamp: new Date().toISOString(),
      gpsCoords: gpsCoords ? { lat: gpsCoords.lat, lng: gpsCoords.lng } : undefined,
    }),

  startBreak: (userId: number) =>
    apiClient.post<TimeEntry>('/api/time-entries', {
      user: userId,
      type: 'break-start',
      timestamp: new Date().toISOString(),
    }),

  endBreak: (userId: number) =>
    apiClient.post<TimeEntry>('/api/time-entries', {
      user: userId,
      type: 'break-end',
      timestamp: new Date().toISOString(),
    }),

  getEntriesForDate: (userId: number, date: string) =>
    apiClient.get<PayloadListResponse<TimeEntry>>('/api/time-entries', {
      'where[user][equals]': String(userId),
      'where[timestamp][greater_than_equal]': `${date}T00:00:00Z`,
      'where[timestamp][less_than]': `${date}T23:59:59Z`,
      sort: 'timestamp',
    }),

  getTimesheetForWeek: (userId: number, weekStart: string) =>
    apiClient.get<{ days: TimesheetDay[] }>('/api/time-entries/timesheet', {
      userId: String(userId),
      weekStart,
    }),

  requestCorrection: (correction: {
    user: number;
    date: string;
    originalEntry?: number;
    requestedTime: string;
    requestedType: string;
    reason: string;
  }) => apiClient.post<CorrectionRequest>('/api/correction-requests', correction),
};
