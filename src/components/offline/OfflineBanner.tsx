import React, { useState } from 'react';
import { StyleSheet, Pressable, View } from 'react-native';
import { Text } from 'react-native-paper';
import MaterialIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { FailedSyncSheet } from '@/components/offline/FailedSyncSheet';

export function OfflineBanner() {
  const { isOnline, pendingSyncCount, failedCount, isSyncing } = useOfflineSync();
  const [showFailed, setShowFailed] = useState(false);

  if (isOnline && pendingSyncCount === 0 && failedCount === 0) return null;

  // Show failed items indicator
  if (failedCount > 0 && isOnline && pendingSyncCount === 0) {
    return (
      <>
        <Pressable
          style={[styles.banner, styles.failed]}
          onPress={() => setShowFailed(true)}
        >
          <MaterialIcons name="alert-circle" size={18} color="#FFFFFF" />
          <Text style={styles.text}>
            {failedCount} failed — tap to review
          </Text>
        </Pressable>
        <FailedSyncSheet visible={showFailed} onDismiss={() => setShowFailed(false)} />
      </>
    );
  }

  if (!isOnline) {
    return (
      <View style={[styles.banner, styles.offline]}>
        <MaterialIcons name="wifi-off" size={18} color="#FFFFFF" />
        <Text style={styles.text}>
          Offline{pendingSyncCount > 0 ? ` — ${pendingSyncCount} pending` : ''}
        </Text>
      </View>
    );
  }

  // Online but has pending items
  return (
    <>
      <Pressable
        style={[styles.banner, styles.syncing]}
        onPress={failedCount > 0 ? () => setShowFailed(true) : undefined}
      >
        <MaterialIcons name="sync" size={18} color="#FFFFFF" />
        <Text style={styles.text}>
          {isSyncing ? 'Syncing...' : `${pendingSyncCount} pending`}
          {failedCount > 0 ? ` — ${failedCount} failed` : ''}
        </Text>
      </Pressable>
      <FailedSyncSheet visible={showFailed} onDismiss={() => setShowFailed(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 16,
    gap: 8,
  },
  offline: {
    backgroundColor: '#B00020',
  },
  syncing: {
    backgroundColor: '#E65100',
  },
  failed: {
    backgroundColor: '#B00020',
  },
  text: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
});
