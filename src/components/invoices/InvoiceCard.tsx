import React from 'react';
import { StyleSheet } from 'react-native';
import { Card, Text, Chip, useTheme } from 'react-native-paper';
import type { Invoice } from '@/types/invoice';

const statusColors: Record<string, string> = {
  draft: '#757575',
  sent: '#1565C0',
  paid: '#2E7D32',
  overdue: '#C62828',
  void: '#E65100',
};

interface InvoiceCardProps {
  invoice: Invoice;
  onPress: (invoice: Invoice) => void;
}

export function InvoiceCard({ invoice, onPress }: InvoiceCardProps) {
  const theme = useTheme();
  const customerName =
    typeof invoice.customer === 'object'
      ? [invoice.customer.firstName, invoice.customer.lastName].join(' ')
      : `Customer #${invoice.customer}`;

  return (
    <Card style={styles.card} onPress={() => onPress(invoice)} mode="elevated">
      <Card.Content style={styles.content}>
        <Text variant="titleMedium" style={{ fontWeight: '600' }}>
          {invoice.invoiceNumber ?? `INV-${invoice.id}`}
        </Text>
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          {customerName}
        </Text>
        <Text variant="titleMedium" style={styles.total}>
          ${invoice.total.toFixed(2)}
        </Text>
        <Chip
          compact
          textStyle={{ fontSize: 12, color: statusColors[invoice.status] ?? theme.colors.onSurface }}
          style={styles.chip}
        >
          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
        </Chip>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginHorizontal: 16, marginVertical: 4 },
  content: { gap: 4 },
  total: { fontWeight: '700' },
  chip: { alignSelf: 'flex-start', marginTop: 4 },
});
