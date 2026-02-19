import React from 'react';
import { StyleSheet, ScrollView, View, Alert } from 'react-native';
import { Text, TextInput, useTheme, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LargeButton } from '@/components/ui/LargeButton';
import { useCustomer, useUpdateCustomer, useDeleteCustomer } from '@/hooks/useCustomers';

const schema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  company: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function CustomerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const router = useRouter();
  const { data: customer, isLoading } = useCustomer(Number(id));
  const updateCustomer = useUpdateCustomer();
  const deleteCustomer = useDeleteCustomer();

  const { control, handleSubmit } = useForm<FormData>({
    resolver: zodResolver(schema),
    values: customer
      ? {
          firstName: customer.firstName,
          lastName: customer.lastName,
          email: customer.email ?? '',
          phone: customer.phone ?? '',
          company: customer.company ?? '',
          notes: customer.notes ?? '',
        }
      : undefined,
  });

  const onSave = async (data: FormData) => {
    await updateCustomer.mutateAsync({ id: Number(id), data });
    router.dismiss();
  };

  const onDelete = () => {
    Alert.alert('Delete Customer', 'Are you sure? This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteCustomer.mutateAsync(Number(id));
          router.dismiss();
        },
      },
    ]);
  };

  if (isLoading || !customer) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loading}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]} edges={[]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Controller
          control={control}
          name="firstName"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput label="First Name" mode="outlined" value={value} onChangeText={onChange} onBlur={onBlur} />
          )}
        />
        <Controller
          control={control}
          name="lastName"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput label="Last Name" mode="outlined" value={value} onChangeText={onChange} onBlur={onBlur} />
          )}
        />
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput label="Email" mode="outlined" keyboardType="email-address" autoCapitalize="none" value={value} onChangeText={onChange} onBlur={onBlur} />
          )}
        />
        <Controller
          control={control}
          name="phone"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput label="Phone" mode="outlined" keyboardType="phone-pad" value={value} onChangeText={onChange} onBlur={onBlur} />
          )}
        />
        <Controller
          control={control}
          name="company"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput label="Company" mode="outlined" value={value} onChangeText={onChange} onBlur={onBlur} />
          )}
        />
        <Controller
          control={control}
          name="notes"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput label="Notes" mode="outlined" multiline numberOfLines={3} value={value} onChangeText={onChange} onBlur={onBlur} />
          )}
        />

        <LargeButton
          label={updateCustomer.isPending ? 'Saving...' : 'Save Changes'}
          onPress={handleSubmit(onSave)}
          loading={updateCustomer.isPending}
          style={styles.saveButton}
        />

        <Divider style={styles.divider} />

        <LargeButton
          label="Delete Customer"
          onPress={onDelete}
          mode="outlined"
          textColor={theme.colors.error}
          style={styles.deleteButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 16, gap: 12 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  saveButton: { marginTop: 8 },
  divider: { marginVertical: 8 },
  deleteButton: { borderColor: '#B00020' },
});
