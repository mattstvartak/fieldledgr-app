import * as Location from 'expo-location';
import type { GpsCoords } from '@/types/time-entry';

export async function requestLocationPermission(): Promise<boolean> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === 'granted';
}

export async function getCurrentLocation(): Promise<GpsCoords | undefined> {
  try {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) return undefined;

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      lat: location.coords.latitude,
      lng: location.coords.longitude,
    };
  } catch {
    return undefined;
  }
}
