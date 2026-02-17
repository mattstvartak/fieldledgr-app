import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import { config } from '@/constants/config';

export type QueuedActionType =
  | 'clock-in'
  | 'clock-out'
  | 'break-start'
  | 'break-end'
  | 'status-update'
  | 'add-note'
  | 'add-photo';

export interface QueuedAction {
  id: string;
  type: QueuedActionType;
  payload: Record<string, unknown>;
  timestamp: string; // ISO string, captured at time of action
  gpsCoords?: { lat: number; lng: number };
  retryCount: number;
  maxRetries: 3;
}

interface OfflineQueueState {
  queue: QueuedAction[];
  failedItems: QueuedAction[];
  isSyncing: boolean;

  enqueue: (
    type: QueuedActionType,
    payload: Record<string, unknown>,
    gpsCoords?: { lat: number; lng: number }
  ) => Promise<void>;
  dequeue: (id: string) => Promise<void>;
  markFailed: (id: string) => Promise<void>;
  retryFailed: (id: string) => Promise<void>;
  discardFailed: (id: string) => Promise<void>;
  loadQueue: () => Promise<void>;
  setSyncing: (syncing: boolean) => void;
  getNextAction: () => QueuedAction | undefined;
  incrementRetry: (id: string) => Promise<void>;
}

async function persistQueue(queue: QueuedAction[], failed: QueuedAction[]) {
  await AsyncStorage.setItem(
    config.offlineQueueStorageKey,
    JSON.stringify({ queue, failed })
  );
}

export const useOfflineQueueStore = create<OfflineQueueState>((set, get) => ({
  queue: [],
  failedItems: [],
  isSyncing: false,

  enqueue: async (type, payload, gpsCoords) => {
    const action: QueuedAction = {
      id: uuidv4(),
      type,
      payload,
      timestamp: new Date().toISOString(),
      gpsCoords,
      retryCount: 0,
      maxRetries: 3,
    };
    const newQueue = [...get().queue, action];
    set({ queue: newQueue });
    await persistQueue(newQueue, get().failedItems);
  },

  dequeue: async (id) => {
    const newQueue = get().queue.filter((a) => a.id !== id);
    set({ queue: newQueue });
    await persistQueue(newQueue, get().failedItems);
  },

  markFailed: async (id) => {
    const action = get().queue.find((a) => a.id === id);
    if (!action) return;
    const newQueue = get().queue.filter((a) => a.id !== id);
    const newFailed = [...get().failedItems, action];
    set({ queue: newQueue, failedItems: newFailed });
    await persistQueue(newQueue, newFailed);
  },

  retryFailed: async (id) => {
    const action = get().failedItems.find((a) => a.id === id);
    if (!action) return;
    const newFailed = get().failedItems.filter((a) => a.id !== id);
    const newQueue = [...get().queue, { ...action, retryCount: 0 }];
    set({ queue: newQueue, failedItems: newFailed });
    await persistQueue(newQueue, newFailed);
  },

  discardFailed: async (id) => {
    const newFailed = get().failedItems.filter((a) => a.id !== id);
    set({ failedItems: newFailed });
    await persistQueue(get().queue, newFailed);
  },

  loadQueue: async () => {
    try {
      const raw = await AsyncStorage.getItem(config.offlineQueueStorageKey);
      if (raw) {
        const { queue, failed } = JSON.parse(raw) as {
          queue: QueuedAction[];
          failed: QueuedAction[];
        };
        set({ queue: queue ?? [], failedItems: failed ?? [] });
      }
    } catch {
      // Start with empty queue on error
    }
  },

  setSyncing: (syncing) => set({ isSyncing: syncing }),

  getNextAction: () => get().queue[0],

  incrementRetry: async (id) => {
    const newQueue = get().queue.map((a) =>
      a.id === id ? { ...a, retryCount: a.retryCount + 1 } : a
    );
    set({ queue: newQueue });
    await persistQueue(newQueue, get().failedItems);
  },
}));
