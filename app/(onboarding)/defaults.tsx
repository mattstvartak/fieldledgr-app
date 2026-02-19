import React from 'react';
import { View, Alert } from 'react-native';
import { TextInput, HelperText } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { useRouter } from 'expo-router';
import { OnboardingShell } from '@/components/onboarding/OnboardingShell';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { useCompleteOnboarding } from '@/hooks/useOnboarding';

interface FormData {
  taxRate: string;
  defaultEstimateNotes: string;
  defaultInvoiceNotes: string;
}

export default function DefaultsScreen() {
  const router = useRouter();
  const store = useOnboardingStore();
  const completeOnboarding = useCompleteOnboarding();

  const { control, handleSubmit } = useForm<FormData>({
    defaultValues: {
      taxRate: store.taxRate,
      defaultEstimateNotes: store.defaultEstimateNotes,
      defaultInvoiceNotes: store.defaultInvoiceNotes,
    },
  });

  const onFinish = async (data: FormData) => {
    store.setDefaults(data);

    try {
      await completeOnboarding.mutateAsync();
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert(
        'Setup Error',
        error instanceof Error ? error.message : 'Failed to complete setup. Please try again.',
      );
    }
  };

  return (
    <OnboardingShell
      step={3}
      title="Set your defaults"
      subtitle="You can always change these later in Settings"
      onNext={handleSubmit(onFinish)}
      onSkip={handleSubmit(onFinish)}
      nextLabel="Finish Setup"
      loading={completeOnboarding.isPending}
    >
      <Controller
        control={control}
        name="taxRate"
        render={({ field: { onChange, onBlur, value } }) => (
          <View>
            <TextInput
              label="Tax Rate (%)"
              mode="outlined"
              keyboardType="decimal-pad"
              placeholder="e.g. 8.25"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              right={<TextInput.Affix text="%" />}
            />
            <HelperText type="info">Applied to estimates and invoices by default</HelperText>
          </View>
        )}
      />
      <Controller
        control={control}
        name="defaultEstimateNotes"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label="Default Estimate Notes (optional)"
            mode="outlined"
            multiline
            numberOfLines={3}
            placeholder="e.g. Estimate valid for 30 days"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
          />
        )}
      />
      <Controller
        control={control}
        name="defaultInvoiceNotes"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label="Default Invoice Notes (optional)"
            mode="outlined"
            multiline
            numberOfLines={3}
            placeholder="e.g. Payment due within 30 days"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
          />
        )}
      />
    </OnboardingShell>
  );
}
