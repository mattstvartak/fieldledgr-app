import React, { useState } from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { TextInput, Text, Divider, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LargeButton } from '@/components/ui/LargeButton';
import { NativePicker } from '@/components/ui/NativePicker';
import { LineItemEditor, calculateTotals } from '@/components/shared/LineItemEditor';
import type { LineItemData } from '@/components/shared/LineItemEditor';
import { useCreateEstimate } from '@/hooks/useEstimates';
import { useCustomers } from '@/hooks/useCustomers';

export default function CreateEstimateScreen() {
  const theme = useTheme();
  const router = useRouter();
  const createEstimate = useCreateEstimate();
  const { data: customersData } = useCustomers();

  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState<LineItemData[]>([
    { description: '', quantity: '1', unitPrice: '' },
  ]);
  const [taxRate, setTaxRate] = useState('');
  const [notes, setNotes] = useState('');

  const customers = customersData?.docs ?? [];
  const customerOptions = customers.map((c) => ({
    value: String(c.id),
    label: `${c.firstName} ${c.lastName}`,
  }));
  const { subtotal, taxAmount, total } = calculateTotals(items, parseFloat(taxRate) || undefined);

  const onSubmit = async () => {
    if (!customerId) return;
    await createEstimate.mutateAsync({
      customer: Number(customerId),
      lineItems: items
        .filter((i) => i.description && i.unitPrice)
        .map((i) => ({
          description: i.description,
          quantity: parseFloat(i.quantity) || 1,
          unitPrice: parseFloat(i.unitPrice) || 0,
        })),
      taxRate: parseFloat(taxRate) || undefined,
      notes: notes || undefined,
    });
    router.dismiss();
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <NativePicker
          label="Customer"
          options={customerOptions}
          selectedValue={customerId}
          onValueChange={setCustomerId}
          placeholder="Select a customer..."
        />

        <Divider style={styles.divider} />

        <LineItemEditor items={items} onItemsChange={setItems} />

        <Divider style={styles.divider} />

        <TextInput
          label="Tax Rate (%)"
          mode="outlined"
          keyboardType="decimal-pad"
          value={taxRate}
          onChangeText={setTaxRate}
          right={<TextInput.Affix text="%" />}
        />

        <TextInput
          label="Notes (optional)"
          mode="outlined"
          multiline
          numberOfLines={3}
          value={notes}
          onChangeText={setNotes}
        />

        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text variant="bodyMedium">Subtotal</Text>
            <Text variant="bodyMedium">${subtotal.toFixed(2)}</Text>
          </View>
          {taxAmount > 0 && (
            <View style={styles.totalRow}>
              <Text variant="bodyMedium">Tax</Text>
              <Text variant="bodyMedium">${taxAmount.toFixed(2)}</Text>
            </View>
          )}
          <View style={styles.totalRow}>
            <Text variant="titleMedium" style={{ fontWeight: '700' }}>Total</Text>
            <Text variant="titleMedium" style={{ fontWeight: '700' }}>${total.toFixed(2)}</Text>
          </View>
        </View>

        <LargeButton
          label={createEstimate.isPending ? 'Creating...' : 'Create Estimate'}
          onPress={onSubmit}
          loading={createEstimate.isPending}
          disabled={createEstimate.isPending || !customerId}
          style={styles.submitButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 16, gap: 12 },
  divider: { marginVertical: 8 },
  totals: { gap: 4, marginTop: 8 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between' },
  submitButton: { marginTop: 8 },
});
