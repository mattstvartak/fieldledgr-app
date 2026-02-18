import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import MaterialIcons from '@expo/vector-icons/MaterialCommunityIcons';
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
      <MaterialIcons
        name={colors.icon as keyof typeof MaterialIcons.glyphMap}
        size={isSmall ? 14 : 18}
        color={colors.text}
      />
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    alignSelf: 'flex-start',
  },
  badgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  text: {
    fontWeight: '600',
    fontSize: 14,
  },
  textSmall: {
    fontSize: 12,
  },
});
