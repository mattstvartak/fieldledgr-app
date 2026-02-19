import React from 'react';
import { StyleSheet } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import MaterialIcons from '@expo/vector-icons/MaterialCommunityIcons';
import type { Customer } from '@/types/customer';

interface CustomerCardProps {
  customer: Customer;
  onPress: (customer: Customer) => void;
}

export function CustomerCard({ customer, onPress }: CustomerCardProps) {
  const theme = useTheme();
  const name = [customer.firstName, customer.lastName].filter(Boolean).join(' ');
  const subtitle = [customer.company, customer.phone, customer.email].filter(Boolean).join(' \u00B7 ');

  return (
    <Card style={styles.card} onPress={() => onPress(customer)} mode="elevated">
      <Card.Content style={styles.content}>
        <MaterialIcons
          name="account-circle-outline"
          size={36}
          color={theme.colors.primary}
        />
        <Card.Content style={styles.text}>
          <Text variant="titleMedium" style={{ fontWeight: '600' }}>
            {name}
          </Text>
          {subtitle && (
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {subtitle}
            </Text>
          )}
        </Card.Content>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 4,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  text: {
    flex: 1,
    paddingHorizontal: 0,
  },
});
