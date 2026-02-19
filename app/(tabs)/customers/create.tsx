import React from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { TextInput, useTheme, HelperText } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LargeButton } from '@/components/ui/LargeButton';
import { useCreateCustomer } from '@/hooks/useCustomers';

const schema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Enter a valid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  company: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function CreateCustomerScreen() {
  const theme = useTheme();
  const router = useRouter();
  const createCustomer = useCreateCustomer();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { firstName: '', lastName: '', email: '', phone: '', company: '' },
  });

  const onSubmit = async (data: FormData) => {
    await createCustomer.mutateAsync({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email || undefined,
      phone: data.phone || undefined,
      company: data.company || undefined,
    });
    router.dismiss();
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]} edges={[]}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Controller
          control={control}
          name="firstName"
          render={({ field: { onChange, onBlur, value } }) => (
            <View>
              <TextInput label="First Name" mode="outlined" autoCapitalize="words" value={value} onChangeText={onChange} onBlur={onBlur} error={!!errors.firstName} />
              {errors.firstName && <HelperText type="error">{errors.firstName.message}</HelperText>}
            </View>
          )}
        />
        <Controller
          control={control}
          name="lastName"
          render={({ field: { onChange, onBlur, value } }) => (
            <View>
              <TextInput label="Last Name" mode="outlined" autoCapitalize="words" value={value} onChangeText={onChange} onBlur={onBlur} error={!!errors.lastName} />
              {errors.lastName && <HelperText type="error">{errors.lastName.message}</HelperText>}
            </View>
          )}
        />
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput label="Email (optional)" mode="outlined" keyboardType="email-address" autoCapitalize="none" value={value} onChangeText={onChange} onBlur={onBlur} />
          )}
        />
        <Controller
          control={control}
          name="phone"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput label="Phone (optional)" mode="outlined" keyboardType="phone-pad" value={value} onChangeText={onChange} onBlur={onBlur} />
          )}
        />
        <Controller
          control={control}
          name="company"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput label="Company (optional)" mode="outlined" value={value} onChangeText={onChange} onBlur={onBlur} />
          )}
        />

        <LargeButton
          label={createCustomer.isPending ? 'Creating...' : 'Create Customer'}
          onPress={handleSubmit(onSubmit)}
          loading={createCustomer.isPending}
          disabled={createCustomer.isPending}
          style={styles.submitButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 16, gap: 12 },
  submitButton: { marginTop: 8 },
});
