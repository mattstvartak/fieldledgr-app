import { useState, useCallback } from 'react';
import { getCurrentLocation, requestLocationPermission } from '@/lib/location';
import type { GpsCoords } from '@/types/time-entry';

export function useLocation() {
  const [coords, setCoords] = useState<GpsCoords | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const requestPermission = useCallback(async () => {
    const granted = await requestLocationPermission();
    setHasPermission(granted);
    return granted;
  }, []);

  const fetchLocation = useCallback(async () => {
    setIsLoading(true);
    try {
      const location = await getCurrentLocation();
      setCoords(location);
      return location;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    coords,
    isLoading,
    hasPermission,
    requestPermission,
    fetchLocation,
  };
}
