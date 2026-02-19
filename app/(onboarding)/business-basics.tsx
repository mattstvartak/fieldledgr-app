import React from 'react';
import { View } from 'react-native';
import { TextInput, HelperText } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'expo-router';
import { OnboardingShell } from '@/components/onboarding/OnboardingShell';
import { useOnboardingStore } from '@/stores/onboardingStore';

const schema = z.object({
  businessName: z.string().min(1, 'Business name is required'),
  phone: z.string().min(1, 'Phone number is required'),
  email: z.string().email('Enter a valid email'),
});

type FormData = z.infer<typeof schema>;

export default function BusinessBasicsScreen() {
  const router = useRouter();
  const store = useOnboardingStore();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      businessName: store.businessName,
      phone: store.phone,
      email: store.email,
    },
  });

  const onNext = (data: FormData) => {
    store.setBusinessBasics(data);
    store.setStep(1);
    router.push('/(onboarding)/trade');
  };

  return (
    <OnboardingShell
      step={0}
      title="Tell us about your business"
      subtitle="We'll use this to set up your account"
      onNext={handleSubmit(onNext)}
    >
      <Controller
        control={control}
        name="businessName"
        render={({ field: { onChange, onBlur, value } }) => (
          <View>
            <TextInput
              label="Business Name"
              mode="outlined"
              autoCapitalize="words"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={!!errors.businessName}
            />
            {errors.businessName && (
              <HelperText type="error">{errors.businessName.message}</HelperText>
            )}
          </View>
        )}
      />
      <Controller
        control={control}
        name="phone"
        render={({ field: { onChange, onBlur, value } }) => (
          <View>
            <TextInput
              label="Phone Number"
              mode="outlined"
              keyboardType="phone-pad"
              autoComplete="tel"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={!!errors.phone}
            />
            {errors.phone && <HelperText type="error">{errors.phone.message}</HelperText>}
          </View>
        )}
      />
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <View>
            <TextInput
              label="Business Email"
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={!!errors.email}
            />
            {errors.email && <HelperText type="error">{errors.email.message}</HelperText>}
          </View>
        )}
      />
    </OnboardingShell>
  );
}
