import React, { useState } from 'react';
import { Platform, Modal, View, Pressable, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { TextInput, Text, useTheme } from 'react-native-paper';
import { format } from 'date-fns';

interface NativeDatePickerProps {
  label: string;
  value: string; // ISO date string (YYYY-MM-DD) or empty
  onValueChange: (dateString: string) => void;
  placeholder?: string;
  minimumDate?: Date;
}

/**
 * Cross-platform date picker using the device's native date selection:
 * - iOS: bottom-sheet modal with spinner
 * - Android: native date dialog
 */
export function NativeDatePicker({
  label,
  value,
  onValueChange,
  placeholder = 'Select a date...',
  minimumDate,
}: NativeDatePickerProps) {
  const theme = useTheme();
  const [showPicker, setShowPicker] = useState(false);

  // Normalize: extract YYYY-MM-DD whether value is "2026-02-20" or "2026-02-20T00:00:00.000Z"
  const dateOnly = value ? value.split('T')[0] : '';
  const dateValue = dateOnly ? new Date(dateOnly + 'T00:00:00') : new Date();
  const displayValue = dateOnly ? format(dateValue, 'MMM d, yyyy') : '';

  const handleChange = (_event: unknown, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    if (selectedDate) {
      onValueChange(format(selectedDate, 'yyyy-MM-dd'));
    }
  };

  if (Platform.OS === 'android') {
    return (
      <>
        <TextInput
          label={label}
          mode="outlined"
          value={displayValue}
          placeholder={placeholder}
          onFocus={() => setShowPicker(true)}
          showSoftInputOnFocus={false}
          right={<TextInput.Icon icon="calendar" onPress={() => setShowPicker(true)} />}
        />
        {showPicker && (
          <DateTimePicker
            value={dateValue}
            mode="date"
            display="default"
            onChange={handleChange}
            minimumDate={minimumDate}
          />
        )}
      </>
    );
  }

  // iOS: bottom-sheet modal
  return (
    <>
      <TextInput
        label={label}
        mode="outlined"
        value={displayValue}
        placeholder={placeholder}
        onFocus={() => setShowPicker(true)}
        showSoftInputOnFocus={false}
        right={<TextInput.Icon icon="calendar" onPress={() => setShowPicker(true)} />}
      />
      <Modal visible={showPicker} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setShowPicker(false)}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.modalHeader}>
              <Pressable onPress={() => setShowPicker(false)}>
                <Text variant="labelLarge" style={{ color: theme.colors.primary }}>
                  Done
                </Text>
              </Pressable>
            </View>
            <DateTimePicker
              value={dateValue}
              mode="date"
              display="spinner"
              onChange={handleChange}
              minimumDate={minimumDate}
              style={styles.iosPicker}
            />
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.3)' },
  modalContent: { borderTopLeftRadius: 16, borderTopRightRadius: 16, paddingBottom: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'flex-end', padding: 16, paddingBottom: 0 },
  iosPicker: { height: 200 },
});
