import type { AppNotification } from '@/api/endpoints/notifications';

export const mockNotifications: AppNotification[] = [
  {
    id: 1,
    type: 'job_assigned',
    title: 'New Job Assigned',
    body: 'You have been assigned to "Kitchen Remodel - Phase 2" scheduled for today.',
    read: false,
    job: 1,
    createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
  },
  {
    id: 2,
    type: 'schedule_change',
    title: 'Schedule Updated',
    body: 'The "Deck Repair" job has been moved to 1:00 PM today.',
    read: false,
    job: 2,
    createdAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
  },
  {
    id: 3,
    type: 'message',
    title: 'Message from Owner',
    body: 'Great work on the fence post job yesterday! Client was very happy.',
    read: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
  },
  {
    id: 4,
    type: 'reminder',
    title: 'Upcoming Job',
    body: 'Reminder: "Bathroom Tile Installation" starts tomorrow at 9:00 AM.',
    read: true,
    job: 3,
    createdAt: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
  },
];
