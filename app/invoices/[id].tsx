import React from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { Text, Chip, Divider, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams } from 'expo-router';
import { LargeButton } from '@/components/ui/LargeButton';
import { useInvoice, useSendInvoice, useMarkInvoicePaid } from '@/hooks/useInvoices';

export default function InvoiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const { data: invoice, isLoading } = useInvoice(Number(id));
  const sendInvoice = useSendInvoice();
  const markPaid = useMarkInvoicePaid();

  if (isLoading || !invoice) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
        <Stack.Screen options={{ title: 'Invoice' }} />
        <View style={styles.loading}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const customerName =
    typeof invoice.customer === 'object'
      ? `${invoice.customer.firstName} ${invoice.customer.lastName}`
      : `Customer #${invoice.customer}`;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{ title: invoice.invoiceNumber ?? `INV-${invoice.id}` }} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text variant="headlineSmall" style={styles.title}>
            {invoice.invoiceNumber ?? `INV-${invoice.id}`}
          </Text>
          <Chip compact>{invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}</Chip>
        </View>

        <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
          {customerName}
        </Text>

        {invoice.dueDate && (
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            Due: {new Date(invoice.dueDate).toLocaleDateString()}
          </Text>
        )}

        <Divider style={styles.divider} />

        {invoice.items.map((item, i) => (
          <View key={i} style={styles.lineItem}>
            <Text variant="bodyMedium" style={styles.lineDesc}>
              {item.description}
            </Text>
            <Text variant="bodyMedium">
              {item.quantity} x ${item.unitPrice.toFixed(2)} = ${item.total.toFixed(2)}
            </Text>
          </View>
        ))}

        <Divider style={styles.divider} />

        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text variant="bodyMedium">Subtotal</Text>
            <Text variant="bodyMedium">${invoice.subtotal.toFixed(2)}</Text>
          </View>
          {invoice.taxAmount != null && invoice.taxAmount > 0 && (
            <View style={styles.totalRow}>
              <Text variant="bodyMedium">Tax ({invoice.taxRate}%)</Text>
              <Text variant="bodyMedium">${invoice.taxAmount.toFixed(2)}</Text>
            </View>
          )}
          <View style={styles.totalRow}>
            <Text variant="titleMedium" style={styles.totalLabel}>
              Total
            </Text>
            <Text variant="titleMedium" style={styles.totalLabel}>
              ${invoice.total.toFixed(2)}
            </Text>
          </View>
        </View>

        {invoice.notes && (
          <>
            <Divider style={styles.divider} />
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              {invoice.notes}
            </Text>
          </>
        )}

        <View style={styles.actions}>
          {invoice.status === 'draft' && (
            <LargeButton
              label={sendInvoice.isPending ? 'Sending...' : 'Send Invoice'}
              onPress={() => sendInvoice.mutate(invoice.id)}
              loading={sendInvoice.isPending}
            />
          )}
          {invoice.status === 'sent' && (
            <LargeButton
              label={markPaid.isPending ? 'Processing...' : 'Mark as Paid'}
              onPress={() => markPaid.mutate(invoice.id)}
              loading={markPaid.isPending}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 16, gap: 12 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontWeight: '700' },
  divider: { marginVertical: 8 },
  lineItem: { paddingVertical: 4 },
  lineDesc: { fontWeight: '500' },
  totals: { gap: 4 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between' },
  totalLabel: { fontWeight: '700' },
  actions: { gap: 12, marginTop: 16 },
});
