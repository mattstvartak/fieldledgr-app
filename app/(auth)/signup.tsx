import React, { useState } from 'react';
import { StyleSheet, View, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, TextInput, useTheme, HelperText } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LargeButton } from '@/components/ui/LargeButton';
import { Logo } from '@/components/ui/Logo';
import { useAuth } from '@/hooks/useAuth';

const signupSchema = z
  .object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { signup, isSigningUp, signupError, resendVerification, isResendingVerification } =
    useAuth();
  const [signupEmail, setSignupEmail] = useState('');
  const [showVerify, setShowVerify] = useState(false);
  const [resent, setResent] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: { firstName: '', lastName: '', email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = async (data: SignupFormData) => {
    try {
      await signup({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
      });
      setSignupEmail(data.email);
      setShowVerify(true);
    } catch {
      // Error is surfaced via signupError
    }
  };

  const handleResend = async () => {
    try {
      await resendVerification(signupEmail);
      setResent(true);
    } catch {
      // silently fail — don't reveal if email exists
    }
  };

  // ── Check Your Email screen ──
  if (showVerify) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
        <ScrollView contentContainerStyle={styles.verifyScroll}>
          <MaterialIcons
            name="email-check-outline"
            size={72}
            color={theme.colors.primary}
            style={styles.verifyIcon}
          />

          <Text
            variant="headlineSmall"
            style={[styles.verifyTitle, { color: theme.colors.onBackground }]}
          >
            Check your email
          </Text>

          <Text
            variant="bodyLarge"
            style={[styles.verifyBody, { color: theme.colors.onSurfaceVariant }]}
          >
            We&apos;ve sent a verification link to{' '}
            <Text style={{ fontWeight: '700' }}>{signupEmail}</Text>. Please check your inbox and
            click the link to activate your account.
          </Text>

          <LargeButton
            label="Go to Sign In"
            onPress={() => router.replace('/(auth)/login')}
            style={styles.verifyButton}
          />

          <Text
            variant="bodySmall"
            style={[styles.resendText, { color: theme.colors.onSurfaceVariant }]}
          >
            {resent ? (
              'Verification email resent!'
            ) : (
              <>
                Didn&apos;t receive it?{' '}
                <Text
                  style={{ color: theme.colors.primary }}
                  onPress={handleResend}
                >
                  {isResendingVerification ? 'Sending...' : 'Resend email'}
                </Text>
              </>
            )}
          </Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Signup form ──
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
              Create your account
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.nameRow}>
              <Controller
                control={control}
                name="firstName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={styles.nameField}>
                    <TextInput
                      label="First Name"
                      mode="outlined"
                      autoCapitalize="words"
                      autoComplete="given-name"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={!!errors.firstName}
                      style={styles.input}
                    />
                    {errors.firstName && (
                      <HelperText type="error">{errors.firstName.message}</HelperText>
                    )}
                  </View>
                )}
              />
              <Controller
                control={control}
                name="lastName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={styles.nameField}>
                    <TextInput
                      label="Last Name"
                      mode="outlined"
                      autoCapitalize="words"
                      autoComplete="family-name"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={!!errors.lastName}
                      style={styles.input}
                    />
                    {errors.lastName && (
                      <HelperText type="error">{errors.lastName.message}</HelperText>
                    )}
                  </View>
                )}
              />
            </View>

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
                    autoComplete="new-password"
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

            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <View>
                  <TextInput
                    label="Confirm Password"
                    mode="outlined"
                    secureTextEntry
                    autoCapitalize="none"
                    autoComplete="new-password"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={!!errors.confirmPassword}
                    style={styles.input}
                  />
                  {errors.confirmPassword && (
                    <HelperText type="error">{errors.confirmPassword.message}</HelperText>
                  )}
                </View>
              )}
            />

            {signupError && (
              <HelperText type="error" style={styles.errorText}>
                {signupError instanceof Error
                  ? signupError.message
                  : 'Signup failed. Please try again.'}
              </HelperText>
            )}

            <LargeButton
              label={isSigningUp ? 'Creating Account...' : 'Create Account'}
              onPress={handleSubmit(onSubmit)}
              loading={isSigningUp}
              disabled={isSigningUp}
              style={styles.submitButton}
            />
          </View>

          <Text
            variant="bodySmall"
            style={[styles.footer, { color: theme.colors.onSurfaceVariant }]}
            onPress={() => router.replace('/(auth)/login')}
          >
            Already have an account? <Text style={{ color: theme.colors.primary }}>Sign In</Text>
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
    marginBottom: 36,
    gap: 8,
  },
  form: {
    gap: 12,
  },
  nameRow: {
    flexDirection: 'row',
    gap: 12,
  },
  nameField: {
    flex: 1,
  },
  input: {
    fontSize: 16,
  },
  errorText: {
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
  // Check your email screen
  verifyScroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  verifyIcon: {
    marginBottom: 24,
  },
  verifyTitle: {
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  verifyBody: {
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  verifyButton: {
    alignSelf: 'stretch',
  },
  resendText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
  },
});
