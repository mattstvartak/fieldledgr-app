import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import MaterialIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTimeTracking } from '@/hooks/useTimeTracking';
import { formatDuration } from '@/lib/formatting';
import { clockedInColor } from '@/constants/theme';

export function TimerBanner() {
  const { clockState, elapsedSeconds } = useTimeTracking();

  if (clockState === 'clocked_out') return null;

  const isBreak = clockState === 'on_break';

  return (
    <View style={[styles.banner, { backgroundColor: isBreak ? '#F5A623' : clockedInColor }]}>
      <MaterialIcons
        name={isBreak ? 'coffee' : 'clock-outline'}
        size={20}
        color="#FFFFFF"
      />
      <Text style={styles.text}>
        {isBreak ? 'On Break' : 'Clocked In'} — {formatDuration(elapsedSeconds)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 8,
  },
  text: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
    fontVariant: ['tabular-nums'],
  },
});
