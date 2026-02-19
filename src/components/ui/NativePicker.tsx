import React, { useState } from 'react';
import { Platform, Modal, View, Pressable, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { TextInput, Text, useTheme } from 'react-native-paper';

export interface PickerOption {
  label: string;
  value: string;
}

interface NativePickerProps {
  label: string;
  options: PickerOption[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  error?: boolean;
}

/**
 * Cross-platform picker that uses the device's native selection:
 * - iOS: presents a bottom-sheet modal with a wheel picker
 * - Android: native dropdown dialog (built into Picker)
 */
export function NativePicker({
  label,
  options,
  selectedValue,
  onValueChange,
  placeholder = 'Select...',
  error,
}: NativePickerProps) {
  const theme = useTheme();
  const [showIosPicker, setShowIosPicker] = useState(false);
  const selectedLabel = options.find((o) => o.value === selectedValue)?.label ?? '';

  if (Platform.OS === 'android') {
    return (
      <View style={styles.androidContainer}>
        <Text variant="bodySmall" style={[styles.androidLabel, { color: theme.colors.onSurfaceVariant }]}>
          {label}
        </Text>
        <View
          style={[
            styles.androidPickerWrapper,
            {
              borderColor: error ? theme.colors.error : theme.colors.outline,
              backgroundColor: theme.colors.surface,
              borderRadius: theme.roundness,
            },
          ]}
        >
          <Picker
            selectedValue={selectedValue}
            onValueChange={(val) => {
              if (val) onValueChange(val as string);
            }}
            style={{ color: theme.colors.onSurface }}
            dropdownIconColor={theme.colors.onSurfaceVariant}
          >
            <Picker.Item label={placeholder} value="" color={theme.colors.onSurfaceVariant} />
            {options.map((opt) => (
              <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
            ))}
          </Picker>
        </View>
      </View>
    );
  }

  // iOS: TextInput that opens a modal with a wheel picker
  return (
    <>
      <TextInput
        label={label}
        mode="outlined"
        value={selectedLabel}
        onFocus={() => setShowIosPicker(true)}
        showSoftInputOnFocus={false}
        right={<TextInput.Icon icon="chevron-down" onPress={() => setShowIosPicker(true)} />}
        error={error}
      />
      <Modal visible={showIosPicker} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setShowIosPicker(false)}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.modalHeader}>
              <Pressable onPress={() => setShowIosPicker(false)}>
                <Text variant="labelLarge" style={{ color: theme.colors.primary }}>
                  Done
                </Text>
              </Pressable>
            </View>
            <Picker
              selectedValue={selectedValue}
              onValueChange={(val) => {
                if (val) onValueChange(val as string);
              }}
            >
              <Picker.Item label={placeholder} value="" color={theme.colors.onSurfaceVariant} />
              {options.map((opt) => (
                <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
              ))}
            </Picker>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  androidContainer: { gap: 4 },
  androidLabel: { marginLeft: 12 },
  androidPickerWrapper: { borderWidth: 1, overflow: 'hidden' },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.3)' },
  modalContent: { borderTopLeftRadius: 16, borderTopRightRadius: 16, paddingBottom: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'flex-end', padding: 16, paddingBottom: 0 },
});
