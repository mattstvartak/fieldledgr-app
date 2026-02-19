import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { format } from 'date-fns';
import { LargeButton } from '@/components/ui/LargeButton';
import { useTimeTracking, type ClockState } from '@/hooks/useTimeTracking';
import { clockedInColor, touchTargets } from '@/constants/theme';

interface ClockButtonProps {
  compact?: boolean;
  jobId?: string;
}

function formatClockInTime(date: Date | null): string {
  if (!date) return '';
  return format(date, 'h:mm a');
}

export function ClockButton({ compact = false, jobId }: ClockButtonProps) {
  const { clockState, clockInTime, clockIn, clockOut, startBreak, endBreak } = useTimeTracking();
  const theme = useTheme();

  if (compact) {
    return (
      <CompactClockButton
        clockState={clockState}
        clockInTime={clockInTime}
        onClockIn={() => clockIn(jobId)}
        onClockOut={clockOut}
      />
    );
  }

  return (
    <View style={styles.container}>
      {clockState === 'clocked_in' && (
        <View style={[styles.statusBanner, { backgroundColor: clockedInColor }]}>
          <Text style={styles.statusLabel}>Clocked In</Text>
          <Text style={styles.statusTime}>since {formatClockInTime(clockInTime)}</Text>
        </View>
      )}

      {clockState === 'on_break' && (
        <View style={[styles.statusBanner, { backgroundColor: theme.colors.secondary }]}>
          <Text style={styles.statusLabel}>On Break</Text>
          <Text style={styles.statusTime}>clocked in at {formatClockInTime(clockInTime)}</Text>
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
  clockInTime,
  onClockIn,
  onClockOut,
}: {
  clockState: ClockState;
  clockInTime: Date | null;
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
      <View style={[styles.compactStatus, { backgroundColor: clockedInColor }]}>
        <Text style={styles.compactStatusText}>In at {formatClockInTime(clockInTime)}</Text>
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
  statusBanner: {
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  statusLabel: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statusTime: {
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
  compactStatus: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minHeight: touchTargets.minimum,
    justifyContent: 'center',
  },
  compactStatusText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
