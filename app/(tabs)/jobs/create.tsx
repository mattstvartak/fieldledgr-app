import React, { useState } from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { TextInput, useTheme, HelperText } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LargeButton } from '@/components/ui/LargeButton';
import { NativePicker } from '@/components/ui/NativePicker';
import { NativeDatePicker } from '@/components/ui/NativeDatePicker';
import { useCreateJob } from '@/hooks/useJobs';
import { useCustomers } from '@/hooks/useCustomers';
import { useTeamMembers } from '@/hooks/useTeam';

const schema = z.object({
  title: z.string().min(1, 'Job title is required'),
  description: z.string().optional(),
  scheduledDate: z.string().optional(),
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function CreateJobScreen() {
  const theme = useTheme();
  const router = useRouter();
  const createJob = useCreateJob();
  const { data: customersData } = useCustomers();
  const { data: membersData } = useTeamMembers();
  const [customerId, setCustomerId] = useState<string>('');
  const [assignedTo, setAssignedTo] = useState<string>('');

  const customers = customersData?.docs ?? [];
  const customerOptions = customers.map((c) => ({
    value: String(c.id),
    label: `${c.firstName} ${c.lastName}`,
  }));

  const members = membersData?.docs ?? [];
  const memberOptions = members
    .filter((m) => m.isActive)
    .map((m) => ({
      value: String(m.id),
      label: `${m.firstName} ${m.lastName}`,
    }));

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', description: '', scheduledDate: '', street: '', city: '', state: '', zip: '' },
  });

  const onSubmit = async (data: FormData) => {
    if (!customerId) return;
    try {
      await createJob.mutateAsync({
        title: data.title,
        customer: Number(customerId),
        description: data.description || undefined,
        assignedTo: assignedTo ? Number(assignedTo) : undefined,
        scheduledDate: data.scheduledDate || undefined,
        address:
          data.street || data.city
            ? { street: data.street, city: data.city, state: data.state, zip: data.zip }
            : undefined,
      });
      router.dismiss();
    } catch {
      // mutation error is shown via createJob.isError
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]} edges={[]}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Controller
          control={control}
          name="title"
          render={({ field: { onChange, onBlur, value } }) => (
            <View>
              <TextInput label="Job Title" mode="outlined" value={value} onChangeText={onChange} onBlur={onBlur} error={!!errors.title} />
              {errors.title && <HelperText type="error">{errors.title.message}</HelperText>}
            </View>
          )}
        />

        <NativePicker
          label="Customer"
          options={customerOptions}
          selectedValue={customerId}
          onValueChange={setCustomerId}
          placeholder="Select a customer..."
          error={!customerId && createJob.isError}
        />

        <NativePicker
          label="Assign To (optional)"
          options={memberOptions}
          selectedValue={assignedTo}
          onValueChange={setAssignedTo}
          placeholder="Unassigned"
        />

        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput label="Description (optional)" mode="outlined" multiline numberOfLines={3} value={value} onChangeText={onChange} onBlur={onBlur} />
          )}
        />

        <Controller
          control={control}
          name="scheduledDate"
          render={({ field: { onChange, value } }) => (
            <NativeDatePicker
              label="Scheduled Date"
              value={value ?? ''}
              onValueChange={onChange}
              minimumDate={new Date()}
            />
          )}
        />

        <Controller
          control={control}
          name="street"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput label="Street Address (optional)" mode="outlined" value={value} onChangeText={onChange} onBlur={onBlur} />
          )}
        />

        <View style={styles.row}>
          <Controller
            control={control}
            name="city"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput label="City" mode="outlined" value={value} onChangeText={onChange} onBlur={onBlur} style={styles.flex} />
            )}
          />
          <Controller
            control={control}
            name="state"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput label="State" mode="outlined" value={value} onChangeText={onChange} onBlur={onBlur} style={styles.stateField} />
            )}
          />
          <Controller
            control={control}
            name="zip"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput label="ZIP" mode="outlined" keyboardType="number-pad" value={value} onChangeText={onChange} onBlur={onBlur} style={styles.zipField} />
            )}
          />
        </View>

        <LargeButton
          label={createJob.isPending ? 'Creating...' : 'Create Job'}
          onPress={handleSubmit(onSubmit)}
          loading={createJob.isPending}
          disabled={createJob.isPending || !customerId}
          style={styles.submitButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 16, gap: 12 },
  row: { flexDirection: 'row', gap: 8 },
  flex: { flex: 1 },
  stateField: { width: 80 },
  zipField: { width: 100 },
  submitButton: { marginTop: 8 },
});
