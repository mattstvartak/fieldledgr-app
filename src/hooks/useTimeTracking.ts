import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { timeEntriesApi } from '@/api/endpoints/time-entries';
import { useAuthStore } from '@/stores/authStore';
import { useAppSettingsStore } from '@/stores/appSettingsStore';
import { useOfflineQueueStore } from '@/stores/offlineQueueStore';
import { getCurrentLocation } from '@/lib/location';
import { mockTimeEntries, mockTimesheetDays } from '@/mocks/time-entries';

export type ClockState = 'clocked_out' | 'clocked_in' | 'on_break';

export function useTimeTracking() {
  const userId = useAuthStore((s) => s.user?.id) ?? 0;
  const numericUserId = typeof userId === 'string' ? Number(userId) : userId;
  const useMockData = useAppSettingsStore((s) => s.useMockData);
  const enqueue = useOfflineQueueStore((s) => s.enqueue);
  const queryClient = useQueryClient();

  const [clockState, setClockState] = useState<ClockState>('clocked_out');
  const [clockInTime, setClockInTime] = useState<Date | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Timer tick
  useEffect(() => {
    if (clockState === 'clocked_in' && clockInTime) {
      intervalRef.current = setInterval(() => {
        setElapsedSeconds(Math.floor((Date.now() - clockInTime.getTime()) / 1000));
      }, 1000);
    } else if (clockState === 'clocked_out') {
      setElapsedSeconds(0);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [clockState, clockInTime]);

  // Today's entries
  const today = new Date().toISOString().split('T')[0];
  const entriesQuery = useQuery({
    queryKey: ['time-entries', numericUserId, today],
    queryFn: async () => {
      if (useMockData) return mockTimeEntries;
      const result = await timeEntriesApi.getEntriesForDate(numericUserId, today);
      return result.docs;
    },
  });

  // Derive clock state from entries
  useEffect(() => {
    if (!entriesQuery.data) return;
    const entries = entriesQuery.data;
    if (entries.length === 0) {
      setClockState('clocked_out');
      return;
    }
    const last = entries[entries.length - 1];
    switch (last.type) {
      case 'clock-in':
      case 'break-end':
        setClockState('clocked_in');
        // Find the original clock-in time
        const clockIn = entries.find((e) => e.type === 'clock-in');
        if (clockIn) setClockInTime(new Date(clockIn.timestamp));
        break;
      case 'break-start':
        setClockState('on_break');
        break;
      case 'clock-out':
        setClockState('clocked_out');
        break;
    }
  }, [entriesQuery.data]);

  const performAction = useCallback(
    async (type: 'clock-in' | 'clock-out' | 'break-start' | 'break-end', jobId?: string) => {
      const gpsCoords = await getCurrentLocation();

      if (useMockData) {
        // Simulate locally
        if (type === 'clock-in') {
          setClockState('clocked_in');
          setClockInTime(new Date());
        } else if (type === 'clock-out') {
          setClockState('clocked_out');
          setClockInTime(null);
        } else if (type === 'break-start') {
          setClockState('on_break');
        } else if (type === 'break-end') {
          setClockState('clocked_in');
        }
        return;
      }

      try {
        switch (type) {
          case 'clock-in':
            await timeEntriesApi.clockIn(numericUserId, gpsCoords, jobId ? Number(jobId) : undefined);
            setClockState('clocked_in');
            setClockInTime(new Date());
            break;
          case 'clock-out':
            await timeEntriesApi.clockOut(numericUserId, gpsCoords);
            setClockState('clocked_out');
            setClockInTime(null);
            break;
          case 'break-start':
            await timeEntriesApi.startBreak(numericUserId);
            setClockState('on_break');
            break;
          case 'break-end':
            await timeEntriesApi.endBreak(numericUserId);
            setClockState('clocked_in');
            break;
        }
        queryClient.invalidateQueries({ queryKey: ['time-entries'] });
      } catch {
        // Queue offline
        await enqueue(type, { userId: numericUserId, jobId }, gpsCoords);
        // Optimistically update local state
        if (type === 'clock-in') {
          setClockState('clocked_in');
          setClockInTime(new Date());
        } else if (type === 'clock-out') {
          setClockState('clocked_out');
          setClockInTime(null);
        } else if (type === 'break-start') {
          setClockState('on_break');
        } else if (type === 'break-end') {
          setClockState('clocked_in');
        }
      }
    },
    [numericUserId, useMockData, enqueue, queryClient]
  );

  return {
    clockState,
    clockInTime,
    elapsedSeconds,
    clockIn: (jobId?: string) => performAction('clock-in', jobId),
    clockOut: () => performAction('clock-out'),
    startBreak: () => performAction('break-start'),
    endBreak: () => performAction('break-end'),
    entries: entriesQuery.data ?? [],
    isLoadingEntries: entriesQuery.isLoading,
  };
}

export function useTimesheet() {
  const userId = useAuthStore((s) => s.user?.id) ?? 0;
  const numericId = typeof userId === 'string' ? Number(userId) : userId;
  const useMockData = useAppSettingsStore((s) => s.useMockData);

  return useQuery({
    queryKey: ['timesheet', numericId],
    queryFn: async () => {
      if (useMockData) return mockTimesheetDays;
      const weekStart = getWeekStart(new Date());
      const result = await timeEntriesApi.getTimesheetForWeek(numericId, weekStart);
      return result.days;
    },
  });
}

function getWeekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
  d.setDate(diff);
  return d.toISOString().split('T')[0];
}
