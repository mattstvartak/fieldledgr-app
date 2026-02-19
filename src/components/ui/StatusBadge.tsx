import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { statusColors } from '@/constants/theme';
import { getJobStatusLabel } from '@/lib/formatting';
import type { JobStatus } from '@/types/job';

interface StatusBadgeProps {
  status: JobStatus;
  size?: 'small' | 'medium';
}

const fallbackColors = { bg: '#F5F5F5', text: '#757575', icon: 'help-circle-outline' };

export function StatusBadge({ status, size = 'medium' }: StatusBadgeProps) {
  const colors = statusColors[status] ?? fallbackColors;
  const isSmall = size === 'small';

  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }, isSmall && styles.badgeSmall]}>
      <Text
        style={[styles.text, { color: colors.text }, isSmall && styles.textSmall]}
        variant={isSmall ? 'labelSmall' : 'labelMedium'}
      >
        {getJobStatusLabel(status)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  badgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  text: {
    fontWeight: '600',
    fontSize: 13,
  },
  textSmall: {
    fontSize: 11,
  },
});
