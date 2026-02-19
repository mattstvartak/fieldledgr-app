import React from 'react';
import {
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LargeButton } from '@/components/ui/LargeButton';
import { brand } from '@/constants/theme';

const TOTAL_STEPS = 4;

interface OnboardingShellProps {
  step: number;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onNext: () => void;
  onSkip?: () => void;
  nextLabel?: string;
  loading?: boolean;
  nextDisabled?: boolean;
}

export function OnboardingShell({
  step,
  title,
  subtitle,
  children,
  onNext,
  onSkip,
  nextLabel = 'Next',
  loading = false,
  nextDisabled = false,
}: OnboardingShellProps) {
  const theme = useTheme();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.dots}>
            {Array.from({ length: TOTAL_STEPS }, (_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  {
                    backgroundColor: i <= step ? brand.primary : theme.colors.outline,
                  },
                ]}
              />
            ))}
          </View>

          <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.onBackground }]}>
            {title}
          </Text>
          {subtitle && (
            <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
              {subtitle}
            </Text>
          )}

          <View style={styles.content}>{children}</View>

          <View style={styles.buttons}>
            <LargeButton
              label={loading ? 'Please wait...' : nextLabel}
              onPress={onNext}
              loading={loading}
              disabled={nextDisabled || loading}
            />
            {onSkip && (
              <Text
                variant="bodyMedium"
                style={[styles.skip, { color: theme.colors.onSurfaceVariant }]}
                onPress={onSkip}
              >
                Skip for now
              </Text>
            )}
          </View>
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
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 32,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  title: {
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  content: {
    flex: 1,
    marginTop: 24,
    gap: 12,
  },
  buttons: {
    marginTop: 24,
    gap: 16,
    alignItems: 'center',
  },
  skip: {
    textAlign: 'center',
  },
});
