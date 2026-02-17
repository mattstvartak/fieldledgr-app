import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, TextInput, useTheme, Portal, Dialog, RadioButton, HelperText } from 'react-native-paper';
import { LargeButton } from '@/components/ui/LargeButton';
import { useAuthStore } from '@/stores/authStore';
import { useAppSettingsStore } from '@/stores/appSettingsStore';
import { timeEntriesApi } from '@/api/endpoints/time-entries';
import type { TimeEntryType } from '@/types/time-entry';
import { touchTargets } from '@/constants/theme';

interface CorrectionRequestFormProps {
  visible: boolean;
  onDismiss: () => void;
  date: string; // YYYY-MM-DD
}

export function CorrectionRequestForm({ visible, onDismiss, date }: CorrectionRequestFormProps) {
  const theme = useTheme();
  const userId = useAuthStore((s) => s.user?.id) ?? 0;
  const numericUserId = typeof userId === 'string' ? Number(userId) : userId;
  const useMockData = useAppSettingsStore((s) => s.useMockData);
  const [type, setType] = useState<TimeEntryType>('clock-in');
  const [time, setTime] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const timePattern = /^([01]?\d|2[0-3]):([0-5]\d)$/;
  const isTimeValid = timePattern.test(time);

  const handleSubmit = async () => {
    if (!isTimeValid || !reason.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      if (useMockData) {
        await new Promise((r) => setTimeout(r, 500));
      } else {
        await timeEntriesApi.requestCorrection({
          user: numericUserId,
          date,
          requestedTime: `${date}T${time}:00Z`,
          requestedType: type,
          reason: reason.trim(),
        });
      }
      setSubmitted(true);
    } catch {
      setError('Failed to submit correction request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setType('clock-in');
    setTime('');
    setReason('');
    setSubmitted(false);
    setError(null);
    onDismiss();
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={handleClose}>
        <Dialog.Title>Request Time Correction</Dialog.Title>
        <Dialog.Content>
          {submitted ? (
            <View style={styles.success}>
              <Text variant="bodyLarge" style={{ color: theme.colors.primary, fontWeight: '600' }}>
                Correction request submitted!
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                Your team owner will review and approve or deny this request.
              </Text>
            </View>
          ) : (
            <View style={styles.form}>
              <Text variant="bodyMedium" style={{ marginBottom: 8 }}>
                Requesting a correction for {date}
              </Text>

              <Text variant="labelLarge" style={{ marginBottom: 4 }}>Entry Type</Text>
              <RadioButton.Group
                value={type}
                onValueChange={(val) => setType(val as TimeEntryType)}
              >
                <RadioButton.Item label="Clock In" value="clock-in" style={styles.radioItem} />
                <RadioButton.Item label="Clock Out" value="clock-out" style={styles.radioItem} />
                <RadioButton.Item label="Break Start" value="break-start" style={styles.radioItem} />
                <RadioButton.Item label="Break End" value="break-end" style={styles.radioItem} />
              </RadioButton.Group>

              <TextInput
                label="Correct Time (HH:MM)"
                mode="outlined"
                value={time}
                onChangeText={setTime}
                placeholder="08:00"
                keyboardType="numbers-and-punctuation"
                style={styles.input}
                error={time.length > 0 && !isTimeValid}
              />
              {time.length > 0 && !isTimeValid && (
                <HelperText type="error">Enter time as HH:MM (e.g. 08:00)</HelperText>
              )}

              <TextInput
                label="Reason for correction"
                mode="outlined"
                value={reason}
                onChangeText={setReason}
                multiline
                numberOfLines={3}
                style={styles.input}
                error={false}
              />

              {error && (
                <HelperText type="error">{error}</HelperText>
              )}
            </View>
          )}
        </Dialog.Content>
        <Dialog.Actions>
          {submitted ? (
            <LargeButton label="Done" onPress={handleClose} compact />
          ) : (
            <>
              <LargeButton label="Cancel" mode="text" onPress={handleClose} compact />
              <LargeButton
                label="Submit Request"
                onPress={handleSubmit}
                loading={isSubmitting}
                disabled={!isTimeValid || !reason.trim() || isSubmitting}
                compact
              />
            </>
          )}
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 8,
  },
  radioItem: {
    minHeight: touchTargets.minimum,
  },
  input: {
    fontSize: 16,
  },
  success: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
  },
});
