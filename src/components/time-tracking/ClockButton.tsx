import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { LargeButton } from '@/components/ui/LargeButton';
import { useTimeTracking, type ClockState } from '@/hooks/useTimeTracking';
import { formatDuration } from '@/lib/formatting';
import { clockedInColor, touchTargets } from '@/constants/theme';

interface ClockButtonProps {
  compact?: boolean;
  jobId?: string;
}

export function ClockButton({ compact = false, jobId }: ClockButtonProps) {
  const { clockState, elapsedSeconds, clockIn, clockOut, startBreak, endBreak } =
    useTimeTracking();
  const theme = useTheme();

  if (compact) {
    return (
      <CompactClockButton
        clockState={clockState}
        elapsedSeconds={elapsedSeconds}
        onClockIn={() => clockIn(jobId)}
        onClockOut={clockOut}
      />
    );
  }

  return (
    <View style={styles.container}>
      {clockState === 'clocked_in' && (
        <View style={[styles.timerBanner, { backgroundColor: clockedInColor }]}>
          <Text style={styles.timerText}>{formatDuration(elapsedSeconds)}</Text>
          <Text style={styles.timerLabel}>Clocked In</Text>
        </View>
      )}

      {clockState === 'on_break' && (
        <View style={[styles.timerBanner, { backgroundColor: theme.colors.secondary }]}>
          <Text style={styles.timerText}>{formatDuration(elapsedSeconds)}</Text>
          <Text style={styles.timerLabel}>On Break</Text>
        </View>
      )}

      <View style={styles.buttons}>
        {clockState === 'clocked_out' && (
          <LargeButton
            label="Clock In"
            icon="login"
            onPress={() => clockIn(jobId)}
            buttonColor={theme.colors.primary}
          />
        )}

        {clockState === 'clocked_in' && (
          <>
            <LargeButton
              label="Start Break"
              icon="coffee"
              onPress={startBreak}
              mode="outlined"
              style={styles.halfButton}
            />
            <LargeButton
              label="Clock Out"
              icon="logout"
              onPress={clockOut}
              buttonColor={theme.colors.error}
              style={styles.halfButton}
            />
          </>
        )}

        {clockState === 'on_break' && (
          <LargeButton label="End Break" icon="coffee-off" onPress={endBreak} />
        )}
      </View>
    </View>
  );
}

function CompactClockButton({
  clockState,
  elapsedSeconds,
  onClockIn,
  onClockOut,
}: {
  clockState: ClockState;
  elapsedSeconds: number;
  onClockIn: () => void;
  onClockOut: () => void;
}) {
  const theme = useTheme();

  if (clockState === 'clocked_out') {
    return (
      <LargeButton
        label="Clock In"
        icon="login"
        onPress={onClockIn}
        buttonColor={theme.colors.primary}
      />
    );
  }

  return (
    <View style={styles.compactRow}>
      <View style={[styles.compactTimer, { backgroundColor: clockedInColor }]}>
        <Text style={styles.compactTimerText}>{formatDuration(elapsedSeconds)}</Text>
      </View>
      <LargeButton
        label="Clock Out"
        icon="logout"
        onPress={onClockOut}
        buttonColor={theme.colors.error}
        compact
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  timerBanner: {
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  timerText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
  },
  timerLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    marginTop: 2,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
  },
  halfButton: {
    flex: 1,
  },
  compactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  compactTimer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minHeight: touchTargets.minimum,
    justifyContent: 'center',
  },
  compactTimerText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
  },
});
