import React, { useEffect } from 'react';
import { StyleSheet, ScrollView, View, Alert, Image } from 'react-native';
import { Text, Chip, Divider, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { LargeButton } from '@/components/ui/LargeButton';
import { useEstimate, useSendEstimate, useAcceptEstimate } from '@/hooks/useEstimates';
import { useSignatureStore } from '@/stores/signatureStore';
import { config } from '@/constants/config';

export default function EstimateDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();
  const { data: estimate, isLoading } = useEstimate(Number(id));
  const sendEstimate = useSendEstimate();
  const acceptEstimate = useAcceptEstimate();

  const signatureData = useSignatureStore((s) => s.signatureData);
  const signedByName = useSignatureStore((s) => s.signedByName);
  const clearSignature = useSignatureStore((s) => s.clearSignature);

  // Handle signature data returned from the sign screen
  useEffect(() => {
    if (signatureData && signedByName && id) {
      acceptEstimate.mutate(
        { id: Number(id), signedByName, signatureBase64: signatureData },
        {
          onSuccess: () => {
            Alert.alert('Success', 'Estimate has been accepted.');
          },
          onError: () => {
            Alert.alert('Error', 'Failed to accept estimate. Please try again.');
          },
        },
      );
      clearSignature();
    }
  }, [signatureData]); // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoading || !estimate) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
        <Stack.Screen options={{ title: 'Estimate' }} />
        <View style={styles.loading}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const customerName =
    typeof estimate.customer === 'object'
      ? `${estimate.customer.firstName} ${estimate.customer.lastName}`
      : `Customer #${estimate.customer}`;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{ title: estimate.estimateNumber ?? `EST-${estimate.id}` }} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text variant="headlineSmall" style={styles.title}>
            {estimate.estimateNumber ?? `EST-${estimate.id}`}
          </Text>
          <Chip compact>{estimate.status.charAt(0).toUpperCase() + estimate.status.slice(1)}</Chip>
        </View>

        <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
          {customerName}
        </Text>

        <Divider style={styles.divider} />

        {(estimate.lineItems ?? []).map((item, i) => (
          <View key={i} style={styles.lineItem}>
            <Text variant="bodyMedium" style={styles.lineDesc}>
              {item.description}
            </Text>
            <Text variant="bodyMedium">
              {item.quantity} x ${item.unitPrice.toFixed(2)} = ${(item.total ?? item.quantity * item.unitPrice).toFixed(2)}
            </Text>
          </View>
        ))}

        <Divider style={styles.divider} />

        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text variant="bodyMedium">Subtotal</Text>
            <Text variant="bodyMedium">${estimate.subtotal.toFixed(2)}</Text>
          </View>
          {estimate.taxAmount != null && estimate.taxAmount > 0 && (
            <View style={styles.totalRow}>
              <Text variant="bodyMedium">Tax ({estimate.taxRate}%)</Text>
              <Text variant="bodyMedium">${estimate.taxAmount.toFixed(2)}</Text>
            </View>
          )}
          <View style={styles.totalRow}>
            <Text variant="titleMedium" style={styles.totalLabel}>
              Total
            </Text>
            <Text variant="titleMedium" style={styles.totalLabel}>
              ${estimate.total.toFixed(2)}
            </Text>
          </View>
        </View>

        {estimate.notes && (
          <>
            <Divider style={styles.divider} />
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              {estimate.notes}
            </Text>
          </>
        )}

        {estimate.status === 'draft' && (
          <LargeButton
            label={sendEstimate.isPending ? 'Sending...' : 'Send Estimate'}
            onPress={() => sendEstimate.mutate(estimate.id)}
            loading={sendEstimate.isPending}
            style={styles.actionButton}
          />
        )}

        {['sent', 'viewed'].includes(estimate.status) && (
          <LargeButton
            label={acceptEstimate.isPending ? 'Processing...' : 'Get Signature'}
            onPress={() =>
              router.push({
                pathname: '/estimates/sign',
                params: { estimateId: String(estimate.id), customerName },
              })
            }
            loading={acceptEstimate.isPending}
            style={styles.actionButton}
          />
        )}

        {estimate.status === 'accepted' && estimate.signatureUrl && (
          <>
            <Divider style={styles.divider} />
            <Text variant="titleSmall" style={styles.sectionTitle}>
              Signature
            </Text>
            <View style={styles.signatureContainer}>
              <Image
                source={{ uri: estimate.signatureUrl.startsWith('http') ? estimate.signatureUrl : `${config.apiUrl}${estimate.signatureUrl}` }}
                style={styles.signatureImage}
                resizeMode="contain"
              />
            </View>
            {estimate.signedByName && (
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                Signed by {estimate.signedByName}
              </Text>
            )}
          </>
        )}
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
  actionButton: { marginTop: 16 },
  sectionTitle: { fontWeight: '600', marginBottom: 8 },
  signatureContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 8,
    alignItems: 'center',
  },
  signatureImage: {
    width: '100%',
    height: 100,
  },
});
