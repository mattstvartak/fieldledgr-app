import NetInfo from '@react-native-community/netinfo';
import { useOfflineQueueStore } from '@/stores/offlineQueueStore';
import { timeEntriesApi } from '@/api/endpoints/time-entries';
import { jobNotesApi } from '@/api/endpoints/job-notes';
import { jobPhotosApi } from '@/api/endpoints/job-photos';
import { jobsApi } from '@/api/endpoints/jobs';
import type { JobStatus } from '@/types/job';

const BACKOFF_BASE_MS = 1000;

function getBackoffDelay(retryCount: number): number {
  return BACKOFF_BASE_MS * Math.pow(2, retryCount);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function processAction(action: ReturnType<typeof useOfflineQueueStore.getState>['queue'][0]) {
  const { type, payload, gpsCoords } = action;

  switch (type) {
    case 'clock-in':
      await timeEntriesApi.clockIn(
        Number(payload.userId),
        gpsCoords,
        payload.jobId ? Number(payload.jobId) : undefined
      );
      break;
    case 'clock-out':
      await timeEntriesApi.clockOut(Number(payload.userId), gpsCoords);
      break;
    case 'break-start':
      await timeEntriesApi.startBreak(Number(payload.userId));
      break;
    case 'break-end':
      await timeEntriesApi.endBreak(Number(payload.userId));
      break;
    case 'status-update':
      await jobsApi.updateJobStatus(
        payload.jobId as string,
        payload.status as JobStatus
      );
      break;
    case 'add-note':
      await jobNotesApi.addNote(payload.jobId as string, payload.text as string);
      break;
    case 'add-photo':
      await jobPhotosApi.addPhoto(
        payload.jobId as string,
        payload.uri as string,
        payload.category as 'before' | 'during' | 'after',
        payload.caption as string | undefined,
      );
      break;
  }
}

export async function processOfflineQueue(): Promise<void> {
  const store = useOfflineQueueStore.getState();

  if (store.isSyncing || store.queue.length === 0) return;

  const netState = await NetInfo.fetch();
  if (!netState.isConnected) return;

  store.setSyncing(true);

  try {
    while (true) {
      const action = useOfflineQueueStore.getState().getNextAction();
      if (!action) break;

      try {
        await processAction(action);
        await useOfflineQueueStore.getState().dequeue(action.id);
      } catch {
        if (action.retryCount >= action.maxRetries) {
          await useOfflineQueueStore.getState().markFailed(action.id);
        } else {
          await useOfflineQueueStore.getState().incrementRetry(action.id);
          await sleep(getBackoffDelay(action.retryCount));
        }
      }
    }
  } finally {
    useOfflineQueueStore.getState().setSyncing(false);
  }
}

export function subscribeToConnectivity(onSync: () => void): () => void {
  const unsubscribe = NetInfo.addEventListener((state) => {
    if (state.isConnected) {
      onSync();
    }
  });
  return unsubscribe;
}
