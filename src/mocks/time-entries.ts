import type { TimeEntry, TimesheetDay } from '@/types/time-entry';

const today = new Date().toISOString().split('T')[0];
const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

export const mockTimeEntries: TimeEntry[] = [
  // Yesterday — full day
  {
    id: 1,
    user: 1,
    type: 'clock-in',
    timestamp: `${yesterday}T07:55:00Z`,
    job: 4,
    gpsCoords: { lat: 39.772, lng: -89.638 },
    createdAt: `${yesterday}T07:55:00Z`,
    updatedAt: `${yesterday}T07:55:00Z`,
  },
  {
    id: 2,
    user: 1,
    type: 'break-start',
    timestamp: `${yesterday}T12:00:00Z`,
    createdAt: `${yesterday}T12:00:00Z`,
    updatedAt: `${yesterday}T12:00:00Z`,
  },
  {
    id: 3,
    user: 1,
    type: 'break-end',
    timestamp: `${yesterday}T12:30:00Z`,
    createdAt: `${yesterday}T12:30:00Z`,
    updatedAt: `${yesterday}T12:30:00Z`,
  },
  {
    id: 4,
    user: 1,
    type: 'clock-out',
    timestamp: `${yesterday}T16:05:00Z`,
    gpsCoords: { lat: 39.772, lng: -89.638 },
    createdAt: `${yesterday}T16:05:00Z`,
    updatedAt: `${yesterday}T16:05:00Z`,
  },
];

export const mockTimesheetDays: TimesheetDay[] = [
  {
    date: yesterday,
    entries: mockTimeEntries.map((e) => ({ id: e.id, type: e.type, timestamp: e.timestamp })),
    totalHours: 8.17,
    breakHours: 0.5,
    netHours: 7.67,
  },
  {
    date: today,
    entries: [],
    totalHours: 0,
    breakHours: 0,
    netHours: 0,
  },
];
