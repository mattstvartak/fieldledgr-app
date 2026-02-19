import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AppSettingsState {
  loadSettings: () => Promise<void>;
}

const SETTINGS_KEY = 'fieldledgr_app_settings';

export const useAppSettingsStore = create<AppSettingsState>(() => ({
  loadSettings: async () => {
    try {
      // Clear any stale mock data flag from previous versions
      const raw = await AsyncStorage.getItem(SETTINGS_KEY);
      if (raw) {
        const settings = JSON.parse(raw);
        if (settings.useMockData) {
          delete settings.useMockData;
          await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        }
      }
    } catch {
      // Use defaults on error
    }
  },
}));
