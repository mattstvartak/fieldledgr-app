import React from 'react';
import { StyleSheet, Pressable, View } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import MaterialIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatTimeRange, formatAddress } from '@/lib/formatting';
import { touchTargets } from '@/constants/theme';
import type { Job } from '@/types/job';

interface JobCardProps {
  job: Job;
  onPress: (job: Job) => void;
}

export function JobCard({ job, onPress }: JobCardProps) {
  const theme = useTheme();

  return (
    <Pressable onPress={() => onPress(job)} style={{ minHeight: touchTargets.minimum }}>
      <Card style={styles.card} mode="elevated">
        <Card.Content style={styles.content}>
          <View style={styles.header}>
            <Text variant="titleMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
              {job.title}
            </Text>
            <StatusBadge status={job.status} size="small" />
          </View>

          <View style={styles.detail}>
            <MaterialIcons name="account" size={16} color={theme.colors.onSurfaceVariant} />
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              {job.client.name}
            </Text>
          </View>

          {job.scheduledStartTime && (
            <View style={styles.detail}>
              <MaterialIcons name="clock-outline" size={16} color={theme.colors.onSurfaceVariant} />
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                {formatTimeRange(job.scheduledStartTime, job.scheduledEndTime)}
              </Text>
            </View>
          )}

          <View style={styles.detail}>
            <MaterialIcons
              name="map-marker-outline"
              size={16}
              color={theme.colors.onSurfaceVariant}
            />
            <Text
              variant="bodyMedium"
              style={{ color: theme.colors.onSurfaceVariant, flex: 1 }}
              numberOfLines={1}
            >
              {formatAddress(job.client.address)}
            </Text>
          </View>
        </Card.Content>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
  },
  content: {
    gap: 6,
    paddingVertical: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  title: {
    flex: 1,
    fontWeight: '600',
    fontSize: 17,
  },
  detail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
