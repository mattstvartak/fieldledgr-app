import React, { useState } from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { TextInput, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LargeButton } from '@/components/ui/LargeButton';
import { NativePicker } from '@/components/ui/NativePicker';
import { NativeDatePicker } from '@/components/ui/NativeDatePicker';
import { useJob, useUpdateJob } from '@/hooks/useJobs';
import { useTeamMembers } from '@/hooks/useTeam';
import type { JobStatus } from '@/types/job';

const statusOptions = [
  { value: 'lead', label: 'Lead' },
  { value: 'quoted', label: 'Quoted' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'en_route', label: 'En Route' },
  { value: 'on_site', label: 'On Site' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'canceled', label: 'Canceled' },
];

export default function EditJobScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const router = useRouter();
  const { data: job, isLoading } = useJob(id);
  const updateJob = useUpdateJob();
  const { data: membersData } = useTeamMembers();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [initialized, setInitialized] = useState(false);

  const members = membersData?.docs ?? [];
  const memberOptions = members
    .filter((m) => m.isActive)
    .map((m) => ({
      value: String(m.id),
      label: `${m.firstName} ${m.lastName}`,
    }));

  // Populate form when job data loads
  if (job && !initialized) {
    setTitle(job.title);
    setDescription(job.description ?? '');
    setStatus(job.status);
    setAssignedTo(job.assignedTo[0] ?? '');
    setScheduledDate(job.scheduledDate);
    setStreet(job.client.address.street);
    setCity(job.client.address.city);
    setState(job.client.address.state);
    setZip(job.client.address.zip);
    setInitialized(true);
  }

  const onSave = async () => {
    try {
      await updateJob.mutateAsync({
        id,
        data: {
          title,
          description: description || undefined,
          status: status as JobStatus,
          assignedTo: assignedTo ? Number(assignedTo) : undefined,
          scheduledDate: scheduledDate || undefined,
          address:
            street || city
              ? { street: street || undefined, city: city || undefined, state: state || undefined, zip: zip || undefined }
              : undefined,
        },
      });
      router.dismiss();
    } catch {
      // error displayed via updateJob.isError
    }
  };

  if (isLoading || !job) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loading}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <TextInput
          label="Job Title"
          mode="outlined"
          value={title}
          onChangeText={setTitle}
        />

        <TextInput
          label="Description (optional)"
          mode="outlined"
          multiline
          numberOfLines={3}
          value={description}
          onChangeText={setDescription}
        />

        <NativePicker
          label="Status"
          options={statusOptions}
          selectedValue={status}
          onValueChange={setStatus}
          placeholder="Select status..."
        />

        <NativePicker
          label="Assign To"
          options={memberOptions}
          selectedValue={assignedTo}
          onValueChange={setAssignedTo}
          placeholder="Unassigned"
        />

        <NativeDatePicker
          label="Scheduled Date"
          value={scheduledDate}
          onValueChange={setScheduledDate}
        />

        <TextInput
          label="Street Address"
          mode="outlined"
          value={street}
          onChangeText={setStreet}
        />

        <View style={styles.row}>
          <TextInput label="City" mode="outlined" value={city} onChangeText={setCity} style={styles.flex} />
          <TextInput label="State" mode="outlined" value={state} onChangeText={setState} style={styles.stateField} />
          <TextInput label="ZIP" mode="outlined" keyboardType="number-pad" value={zip} onChangeText={setZip} style={styles.zipField} />
        </View>

        {updateJob.isError && (
          <Text variant="bodyMedium" style={{ color: theme.colors.error }}>
            Failed to save. Please try again.
          </Text>
        )}

        <LargeButton
          label={updateJob.isPending ? 'Saving...' : 'Save Changes'}
          onPress={onSave}
          loading={updateJob.isPending}
          disabled={updateJob.isPending || !title}
          style={styles.submitButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 16, gap: 12 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  row: { flexDirection: 'row', gap: 8 },
  flex: { flex: 1 },
  stateField: { width: 80 },
  zipField: { width: 100 },
  submitButton: { marginTop: 8 },
});
