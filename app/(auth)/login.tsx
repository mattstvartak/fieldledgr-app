import React from 'react';
import { StyleSheet, View, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, TextInput, useTheme, HelperText } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'expo-router';
import { LargeButton } from '@/components/ui/LargeButton';
import { Logo } from '@/components/ui/Logo';
import { useAuth } from '@/hooks/useAuth';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { login, isLoggingIn, loginError } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data);
    } catch {
      // Error is surfaced via loginError
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Logo size={40} dark />
            <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
              Built for the trades
            </Text>
          </View>

          <View style={styles.form}>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <View>
                  <TextInput
                    label="Email"
                    mode="outlined"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect={false}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={!!errors.email}
                    style={styles.input}
                  />
                  {errors.email && (
                    <HelperText type="error">{errors.email.message}</HelperText>
                  )}
                </View>
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <View>
                  <TextInput
                    label="Password"
                    mode="outlined"
                    secureTextEntry
                    autoCapitalize="none"
                    autoComplete="password"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={!!errors.password}
                    style={styles.input}
                  />
                  {errors.password && (
                    <HelperText type="error">{errors.password.message}</HelperText>
                  )}
                </View>
              )}
            />

            {loginError && (
              <HelperText type="error" style={styles.loginError}>
                {loginError instanceof Error
                  ? loginError.message
                  : 'Login failed. Please try again.'}
              </HelperText>
            )}

            <LargeButton
              label={isLoggingIn ? 'Signing In...' : 'Sign In'}
              onPress={handleSubmit(onSubmit)}
              loading={isLoggingIn}
              disabled={isLoggingIn}
              style={styles.submitButton}
            />
          </View>

          <Text
            variant="bodySmall"
            style={[styles.footer, { color: theme.colors.onSurfaceVariant }]}
            onPress={() => router.push('/(auth)/signup')}
          >
            Don&apos;t have an account?{' '}
            <Text style={{ color: theme.colors.primary }}>Sign Up</Text>
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
    gap: 8,
  },
  form: {
    gap: 12,
  },
  input: {
    fontSize: 16,
  },
  loginError: {
    textAlign: 'center',
    fontSize: 14,
  },
  submitButton: {
    marginTop: 8,
  },
  footer: {
    textAlign: 'center',
    marginTop: 32,
    fontSize: 14,
  },
});
