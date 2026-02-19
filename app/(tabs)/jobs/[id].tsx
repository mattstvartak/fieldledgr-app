import React, { useCallback, useState } from 'react';
import { StyleSheet, View, ScrollView, Linking, Platform } from 'react-native';
import { Text, Card, Divider, useTheme, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { JobStatusActions } from '@/components/jobs/JobStatusActions';
import { PhotoGallery } from '@/components/jobs/PhotoGallery';
import { PhotoCapture } from '@/components/jobs/PhotoCapture';
import { AddNoteInput } from '@/components/jobs/AddNoteInput';
import { VoiceNoteButton } from '@/components/jobs/VoiceNoteButton';
import { ClockButton } from '@/components/time-tracking/ClockButton';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { useJob } from '@/hooks/useJobs';
import { useAuthStore } from '@/stores/authStore';
import { isOwner as checkIsOwner } from '@/lib/roles';
import {
  formatTimeRange,
  formatAddress,
  formatDateFull,
  formatRelative,
  getJobStatusLabel,
} from '@/lib/formatting';
import { touchTargets } from '@/constants/theme';
import type { JobPhoto, JobNote } from '@/types/job';

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const router = useRouter();
  const role = useAuthStore((s) => s.user?.role);
  const isOwner = checkIsOwner(role);
  const { data: job, isLoading } = useJob(id);

  // Local state for optimistic photo/note additions
  const [localPhotos, setLocalPhotos] = useState<JobPhoto[]>([]);
  const [localNotes, setLocalNotes] = useState<JobNote[]>([]);

  const openMaps = () => {
    if (!job) return;
    const addr = formatAddress(job.client.address);
    const url = Platform.select({
      ios: `maps:?daddr=${encodeURIComponent(addr)}`,
      android: `google.navigation:q=${encodeURIComponent(addr)}`,
      default: `https://maps.google.com/?q=${encodeURIComponent(addr)}`,
    });
    Linking.openURL(url);
  };

  const callClient = () => {
    if (!job?.client.phone) return;
    Linking.openURL(`tel:${job.client.phone}`);
  };

  const handlePhotoAdded = useCallback((photo: JobPhoto) => {
    setLocalPhotos((prev) => [...prev, photo]);
  }, []);

  const handleNoteAdded = useCallback((note: JobNote) => {
    setLocalNotes((prev) => [...prev, note]);
  }, []);

  const handleVoiceTranscript = useCallback(
    (text: string) => {
      // Create a note from the voice transcript
      const voiceNote: JobNote = {
        id: `vnote_${Date.now()}`,
        text,
        createdBy: 'user_001',
        createdAt: new Date().toISOString(),
        isVoiceNote: true,
      };
      setLocalNotes((prev) => [...prev, voiceNote]);
    },
    []
  );

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
        <Stack.Screen options={{ title: 'Loading...' }} />
        <View style={styles.loadingContainer}>
          <SkeletonLoader width="80%" height={28} />
          <SkeletonLoader width="50%" height={20} style={{ marginTop: 12 }} />
          <SkeletonLoader width="100%" height={100} style={{ marginTop: 16 }} />
          <SkeletonLoader width="100%" height={100} style={{ marginTop: 12 }} />
        </View>
      </SafeAreaView>
    );
  }

  if (!job) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
        <Stack.Screen options={{ title: 'Not Found' }} />
        <View style={styles.empty}>
          <Text variant="bodyLarge">Job not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const allPhotos = [...job.photos, ...localPhotos];
  const allNotes = [...job.notes, ...localNotes];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen
        options={{
          title: job.title,
          headerBackTitle: 'Jobs',
          headerRight: isOwner
            ? () => (
                <IconButton
                  icon="pencil"
                  size={20}
                  style={{ margin: 0 }}
                  onPress={() => router.push(`/(tabs)/jobs/edit?id=${id}` as never)}
                />
              )
            : undefined,
        }}
      />
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Status & Title */}
        <View style={styles.section}>
          <StatusBadge status={job.status} />
          <Text variant="headlineSmall" style={[styles.jobTitle, { color: theme.colors.onBackground }]}>
            {job.title}
          </Text>
          {job.description && (
            <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
              {job.description}
            </Text>
          )}
        </View>

        {/* Date & Time */}
        <Card style={styles.card} mode="outlined">
          <Card.Content style={styles.cardContent}>
            <View style={styles.row}>
              <MaterialIcons name="calendar" size={20} color={theme.colors.onSurfaceVariant} />
              <Text variant="bodyLarge">{formatDateFull(job.scheduledDate)}</Text>
            </View>
            {job.scheduledStartTime && (
              <View style={styles.row}>
                <MaterialIcons name="clock-outline" size={20} color={theme.colors.onSurfaceVariant} />
                <Text variant="bodyLarge">
                  {formatTimeRange(job.scheduledStartTime, job.scheduledEndTime)}
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Client Info */}
        <Card style={styles.card} mode="outlined">
          <Card.Content style={styles.cardContent}>
            <Text variant="titleMedium" style={styles.cardTitle}>Client</Text>
            <Text variant="bodyLarge" style={{ fontWeight: '600' }}>{job.client.name}</Text>

            {job.client.phone && (
              <View style={styles.actionRow}>
                <View style={[styles.row, { flex: 1 }]}>
                  <MaterialIcons name="phone" size={20} color={theme.colors.primary} />
                  <Text variant="bodyLarge" style={{ color: theme.colors.primary }}>
                    {job.client.phone}
                  </Text>
                </View>
                <IconButton
                  icon="phone"
                  mode="contained"
                  size={24}
                  onPress={callClient}
                  accessibilityLabel="Call client"
                  style={{ minWidth: touchTargets.minimum, minHeight: touchTargets.minimum }}
                />
              </View>
            )}

            <View style={styles.actionRow}>
              <View style={[styles.row, { flex: 1 }]}>
                <MaterialIcons name="map-marker" size={20} color={theme.colors.primary} />
                <Text variant="bodyMedium" style={{ color: theme.colors.primary, flex: 1 }}>
                  {formatAddress(job.client.address)}
                </Text>
              </View>
              <IconButton
                icon="navigation"
                mode="contained"
                size={24}
                onPress={openMaps}
                accessibilityLabel="Navigate to address"
                style={{ minWidth: touchTargets.minimum, minHeight: touchTargets.minimum }}
              />
            </View>
          </Card.Content>
        </Card>

        {/* Scope of Work */}
        {job.lineItems.length > 0 && (
          <Card style={styles.card} mode="outlined">
            <Card.Content style={styles.cardContent}>
              <Text variant="titleMedium" style={styles.cardTitle}>Scope of Work</Text>
              {job.lineItems.map((item) => (
                <View key={item.id} style={styles.lineItem}>
                  <Text variant="bodyLarge" style={{ flex: 1 }}>{item.description}</Text>
                  <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                    {item.quantity} {item.unit ?? ''}
                  </Text>
                </View>
              ))}
            </Card.Content>
          </Card>
        )}

        {/* Owner Notes */}
        {job.ownerNotes && (
          <Card style={[styles.card, { borderColor: theme.colors.primary }]} mode="outlined">
            <Card.Content style={styles.cardContent}>
              <View style={styles.row}>
                <MaterialIcons name="information" size={20} color={theme.colors.primary} />
                <Text variant="titleMedium" style={[styles.cardTitle, { marginBottom: 0 }]}>
                  Notes from Owner
                </Text>
              </View>
              <Text variant="bodyLarge">{job.ownerNotes}</Text>
            </Card.Content>
          </Card>
        )}

        {/* Photos */}
        {allPhotos.length > 0 && (
          <Card style={styles.card} mode="outlined">
            <Card.Content style={styles.cardContent}>
              <PhotoGallery photos={allPhotos} />
            </Card.Content>
          </Card>
        )}

        {/* Jobsite Documentation — only show for active (non-complete) jobs */}
        {job.status !== 'completed' && (
          <Card style={styles.card} mode="outlined">
            <Card.Content style={styles.cardContent}>
              <Text variant="titleMedium" style={styles.cardTitle}>Jobsite Documentation</Text>
              <PhotoCapture jobId={job.id} onPhotoAdded={handlePhotoAdded} />
              <Divider style={{ marginVertical: 4 }} />
              <VoiceNoteButton onTranscript={handleVoiceTranscript} />
              <Divider style={{ marginVertical: 4 }} />
              <AddNoteInput jobId={job.id} onNoteAdded={handleNoteAdded} />
            </Card.Content>
          </Card>
        )}

        {/* Job Notes */}
        {allNotes.length > 0 && (
          <Card style={styles.card} mode="outlined">
            <Card.Content style={styles.cardContent}>
              <Text variant="titleMedium" style={styles.cardTitle}>Notes</Text>
              {allNotes.map((note) => (
                <View key={note.id} style={styles.noteItem}>
                  <View style={styles.row}>
                    {note.isVoiceNote && (
                      <MaterialIcons name="microphone" size={16} color={theme.colors.onSurfaceVariant} />
                    )}
                    <Text variant="bodyLarge" style={{ flex: 1 }}>{note.text}</Text>
                  </View>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    {formatRelative(note.createdAt)}
                  </Text>
                </View>
              ))}
            </Card.Content>
          </Card>
        )}

        {/* Status History */}
        {job.statusHistory.length > 0 && (
          <Card style={styles.card} mode="outlined">
            <Card.Content style={styles.cardContent}>
              <Text variant="titleMedium" style={styles.cardTitle}>History</Text>
              {job.statusHistory.map((event, idx) => (
                <View key={idx} style={styles.historyItem}>
                  <View style={[styles.historyDot, { backgroundColor: theme.colors.primary }]} />
                  <View style={{ flex: 1 }}>
                    <Text variant="bodyMedium" style={{ fontWeight: '600' }}>
                      {getJobStatusLabel(event.status)}
                    </Text>
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                      {formatRelative(event.timestamp)}
                    </Text>
                  </View>
                </View>
              ))}
            </Card.Content>
          </Card>
        )}

        {/* Clock In/Out */}
        {job.status !== 'completed' && (
          <>
            <Divider style={styles.divider} />
            <View style={styles.section}>
              <ClockButton compact jobId={job.id} />
            </View>
          </>
        )}

        {/* Status Action */}
        <JobStatusActions jobId={job.id} currentStatus={job.status} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  scroll: {
    paddingBottom: 32,
  },
  loadingContainer: {
    padding: 24,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  jobTitle: {
    fontWeight: '700',
  },
  card: {
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
  },
  cardContent: {
    gap: 8,
  },
  cardTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  lineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 4,
    gap: 12,
  },
  noteItem: {
    gap: 2,
    paddingVertical: 4,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 4,
  },
  historyDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 5,
  },
  divider: {
    marginVertical: 8,
    marginHorizontal: 16,
  },
});
