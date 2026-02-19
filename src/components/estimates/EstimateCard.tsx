import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import type { Estimate } from '@/types/estimate';

const statusColors: Record<string, { bg: string; text: string }> = {
  draft: { bg: '#F5F5F5', text: '#757575' },
  sent: { bg: '#E3F2FD', text: '#1565C0' },
  accepted: { bg: '#E8F5E9', text: '#2E7D32' },
  declined: { bg: '#FFEBEE', text: '#C62828' },
  expired: { bg: '#FFF3E0', text: '#E65100' },
};

const fallbackColors = { bg: '#F5F5F5', text: '#757575' };

interface EstimateCardProps {
  estimate: Estimate;
  onPress: (estimate: Estimate) => void;
}

export function EstimateCard({ estimate, onPress }: EstimateCardProps) {
  const theme = useTheme();
  const customerName =
    typeof estimate.customer === 'object'
      ? [estimate.customer.firstName, estimate.customer.lastName].join(' ')
      : `Customer #${estimate.customer}`;

  const colors = statusColors[estimate.status] ?? fallbackColors;
  const statusLabel = estimate.status.charAt(0).toUpperCase() + estimate.status.slice(1);

  return (
    <Pressable
      onPress={() => onPress(estimate)}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.colors.surface },
        pressed && { opacity: 0.7 },
      ]}
    >
      <View style={styles.left}>
        <Text variant="titleMedium" style={styles.customerName}>
          {customerName}
        </Text>
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
          {estimate.estimateNumber ?? `EST-${estimate.id}`}
        </Text>
      </View>
      <View style={styles.right}>
        <Text variant="titleMedium" style={styles.total}>
          ${estimate.total.toFixed(2)}
        </Text>
        <View style={[styles.statusPill, { backgroundColor: colors.bg }]}>
          <Text style={[styles.statusText, { color: colors.text }]}>{statusLabel}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginVertical: 4,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
  },
  left: {
    flex: 1,
    gap: 2,
  },
  customerName: {
    fontWeight: '600',
  },
  right: {
    alignItems: 'flex-end',
    gap: 6,
  },
  total: {
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
