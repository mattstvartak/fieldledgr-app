import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LargeButton } from '@/components/ui/LargeButton';
import { useUpdateJobStatus } from '@/hooks/useJobs';
import type { JobStatus } from '@/types/job';

interface JobStatusActionsProps {
  jobId: string;
  currentStatus: JobStatus;
}

const STATUS_FLOW: Record<JobStatus, { next: JobStatus; label: string; icon: string } | null> = {
  assigned: { next: 'en_route', label: 'Mark En Route', icon: 'car' },
  en_route: { next: 'on_site', label: 'Arrived On Site', icon: 'map-marker-check' },
  on_site: { next: 'in_progress', label: 'Start Work', icon: 'hammer-wrench' },
  in_progress: { next: 'complete', label: 'Mark Complete', icon: 'check-circle' },
  complete: null,
};

export function JobStatusActions({ jobId, currentStatus }: JobStatusActionsProps) {
  const updateStatus = useUpdateJobStatus();
  const nextAction = STATUS_FLOW[currentStatus];

  if (!nextAction) return null;

  return (
    <View style={styles.container}>
      <LargeButton
        label={nextAction.label}
        icon={nextAction.icon}
        onPress={() => updateStatus.mutate({ jobId, status: nextAction.next })}
        loading={updateStatus.isPending}
        disabled={updateStatus.isPending}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
});
