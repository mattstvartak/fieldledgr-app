import React from 'react';
import { StyleSheet, View } from 'react-native';
import { TextInput, IconButton, Text, useTheme, Divider } from 'react-native-paper';

export interface LineItemData {
  description: string;
  quantity: string;
  unitPrice: string;
}

interface LineItemEditorProps {
  items: LineItemData[];
  onItemsChange: (items: LineItemData[]) => void;
}

export function LineItemEditor({ items, onItemsChange }: LineItemEditorProps) {
  const theme = useTheme();

  const addItem = () => {
    onItemsChange([...items, { description: '', quantity: '1', unitPrice: '' }]);
  };

  const removeItem = (index: number) => {
    onItemsChange(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof LineItemData, value: string) => {
    const updated = items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item,
    );
    onItemsChange(updated);
  };

  const getLineTotal = (item: LineItemData) => {
    const qty = parseFloat(item.quantity) || 0;
    const price = parseFloat(item.unitPrice) || 0;
    return (qty * price).toFixed(2);
  };

  return (
    <View style={styles.container}>
      <Text variant="titleMedium" style={[styles.heading, { color: theme.colors.onBackground }]}>
        Line Items
      </Text>

      {items.map((item, index) => (
        <View key={index} style={styles.item}>
          <TextInput
            label="Description"
            mode="outlined"
            value={item.description}
            onChangeText={(v) => updateItem(index, 'description', v)}
            style={styles.descriptionInput}
            dense
          />
          <View style={styles.numericRow}>
            <TextInput
              label="Qty"
              mode="outlined"
              keyboardType="decimal-pad"
              value={item.quantity}
              onChangeText={(v) => updateItem(index, 'quantity', v)}
              style={styles.qtyInput}
              dense
            />
            <TextInput
              label="Unit Price"
              mode="outlined"
              keyboardType="decimal-pad"
              value={item.unitPrice}
              onChangeText={(v) => updateItem(index, 'unitPrice', v)}
              style={styles.priceInput}
              left={<TextInput.Affix text="$" />}
              dense
            />
            <Text variant="bodyMedium" style={styles.lineTotal}>
              ${getLineTotal(item)}
            </Text>
            <IconButton
              icon="close"
              size={20}
              onPress={() => removeItem(index)}
              iconColor={theme.colors.error}
            />
          </View>
          {index < items.length - 1 && <Divider style={styles.divider} />}
        </View>
      ))}

      <IconButton
        icon="plus-circle-outline"
        size={24}
        onPress={addItem}
        iconColor={theme.colors.primary}
      />
    </View>
  );
}

export function calculateTotals(
  items: LineItemData[],
  taxRate?: number,
): { subtotal: number; taxAmount: number; total: number } {
  const subtotal = items.reduce((sum, item) => {
    const qty = parseFloat(item.quantity) || 0;
    const price = parseFloat(item.unitPrice) || 0;
    return sum + qty * price;
  }, 0);
  const taxAmount = taxRate ? subtotal * (taxRate / 100) : 0;
  return { subtotal, taxAmount, total: subtotal + taxAmount };
}

const styles = StyleSheet.create({
  container: { gap: 8 },
  heading: { fontWeight: '600' },
  item: { gap: 4 },
  descriptionInput: { fontSize: 14 },
  numericRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qtyInput: { width: 70, fontSize: 14 },
  priceInput: { flex: 1, fontSize: 14 },
  lineTotal: { minWidth: 60, textAlign: 'right', fontWeight: '600' },
  divider: { marginVertical: 8 },
});
