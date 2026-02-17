import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AppSettingsState {
  useMockData: boolean;
  setUseMockData: (value: boolean) => Promise<void>;
  loadSettings: () => Promise<void>;
}

const SETTINGS_KEY = 'fieldledgr_app_settings';

export const useAppSettingsStore = create<AppSettingsState>((set) => ({
  useMockData: __DEV__, // default to mock data in dev

  setUseMockData: async (value) => {
    set({ useMockData: value });
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    const settings = raw ? JSON.parse(raw) : {};
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...settings, useMockData: value }));
  },

  loadSettings: async () => {
    try {
      const raw = await AsyncStorage.getItem(SETTINGS_KEY);
      if (raw) {
        const settings = JSON.parse(raw);
        set({
          useMockData: settings.useMockData ?? __DEV__,
        });
      }
    } catch {
      // Use defaults on error
    }
  },
}));
