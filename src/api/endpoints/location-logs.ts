import { apiClient } from '@/api/client';

export const locationLogsApi = {
  submit: (coords: { lat: number; lng: number; accuracy?: number }) =>
    apiClient.post('/api/location-logs', {
      lat: coords.lat,
      lng: coords.lng,
      accuracy: coords.accuracy,
      timestamp: new Date().toISOString(),
    }),
};
