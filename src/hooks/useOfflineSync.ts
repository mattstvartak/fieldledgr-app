import { useEffect, useState } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { useOfflineQueueStore } from '@/stores/offlineQueueStore';
import { processOfflineQueue } from '@/lib/offline-queue';
import { config } from '@/constants/config';

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(true);
  const queue = useOfflineQueueStore((s) => s.queue);
  const failedItems = useOfflineQueueStore((s) => s.failedItems);
  const isSyncing = useOfflineQueueStore((s) => s.isSyncing);
  const loadQueue = useOfflineQueueStore((s) => s.loadQueue);

  // Load persisted queue on mount
  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  // Subscribe to connectivity changes
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const online = !!state.isConnected;
      setIsOnline(online);
      if (online && queue.length > 0) {
        processOfflineQueue();
      }
    });
    return unsubscribe;
  }, [queue.length]);

  // Periodic sync when online
  useEffect(() => {
    if (!isOnline || queue.length === 0) return;

    const interval = setInterval(() => {
      processOfflineQueue();
    }, config.syncIntervalMs);

    return () => clearInterval(interval);
  }, [isOnline, queue.length]);

  return {
    isOnline,
    pendingSyncCount: queue.length,
    failedCount: failedItems.length,
    isSyncing,
  };
}
