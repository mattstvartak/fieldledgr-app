import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, Card, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';


import * as WebBrowser from 'expo-web-browser';
import { LargeButton } from '@/components/ui/LargeButton';
import { config } from '@/constants/config';

export default function BillingScreen() {
  const theme = useTheme();

  const openBillingPortal = async () => {
    await WebBrowser.openBrowserAsync(`${config.apiUrl}/api/billing/portal`);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Card mode="elevated" style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <Text variant="titleLarge" style={styles.title}>
              Subscription
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              Manage your subscription, update payment methods, and view billing history through the
              secure Stripe billing portal.
            </Text>
          </Card.Content>
        </Card>

        <LargeButton label="Manage Billing" onPress={openBillingPortal} style={styles.button} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: 16, gap: 16 },
  card: {},
  cardContent: { gap: 12 },
  title: { fontWeight: '700' },
  button: {},
});
