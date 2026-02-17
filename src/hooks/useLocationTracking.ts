import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useAppSettingsStore } from '@/stores/appSettingsStore';
import { requestLocationPermission, getCurrentLocation } from '@/lib/location';
import { locationLogsApi } from '@/api/endpoints/location-logs';

const TRACKING_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

export function useLocationTracking() {
  const user = useAuthStore((s) => s.user);
  const useMockData = useAppSettingsStore((s) => s.useMockData);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    async function sendPing() {
      try {
        const coords = await getCurrentLocation();
        if (!coords || cancelled) return;

        if (useMockData) {
          console.log('[GPS Tracking] Mock ping:', coords);
          return;
        }

        await locationLogsApi.submit(coords);
      } catch {
        // Best-effort — silently swallow errors
      }
    }

    async function start() {
      const granted = await requestLocationPermission();
      if (!granted || cancelled) return;

      // Immediate first ping
      sendPing();

      intervalRef.current = setInterval(sendPing, TRACKING_INTERVAL_MS);
    }

    start();

    return () => {
      cancelled = true;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [user, useMockData]);
}
