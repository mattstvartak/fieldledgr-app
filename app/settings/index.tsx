import React, { useState } from 'react';
import { StyleSheet, ScrollView, View, Alert } from 'react-native';
import { TextInput, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LargeButton } from '@/components/ui/LargeButton';
import { NativePicker } from '@/components/ui/NativePicker';
import { useBusiness, useUpdateBusiness } from '@/hooks/useBusiness';
import { tradeTypeLabels } from '@/types/business';
import type { TradeType } from '@/types/business';

const tradeOptions = Object.entries(tradeTypeLabels).map(([value, label]) => ({
  value,
  label,
}));

export default function SettingsScreen() {
  const theme = useTheme();
  const { data: business, isLoading } = useBusiness();
  const updateBusiness = useUpdateBusiness();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [tradeType, setTradeType] = useState<TradeType | ''>('');
  const [serviceArea, setServiceArea] = useState('');
  const [taxRate, setTaxRate] = useState('');
  const [defaultEstimateNotes, setDefaultEstimateNotes] = useState('');
  const [defaultInvoiceNotes, setDefaultInvoiceNotes] = useState('');
  const [initialized, setInitialized] = useState(false);

  // Populate form when business data loads
  if (business && !initialized) {
    setName(business.name);
    setPhone(business.phone ?? '');
    setEmail(business.email ?? '');
    setTradeType(business.tradeType ?? '');
    setServiceArea(business.serviceArea ?? '');
    setTaxRate(business.taxRate ? String(business.taxRate) : '');
    setDefaultEstimateNotes(business.defaultEstimateNotes ?? '');
    setDefaultInvoiceNotes(business.defaultInvoiceNotes ?? '');
    setInitialized(true);
  }

  const onSave = async () => {
    try {
      await updateBusiness.mutateAsync({
        name,
        phone,
        email,
        tradeType: tradeType || undefined,
        serviceArea: serviceArea || undefined,
        taxRate: taxRate ? parseFloat(taxRate) : undefined,
        defaultEstimateNotes: defaultEstimateNotes || undefined,
        defaultInvoiceNotes: defaultInvoiceNotes || undefined,
      });
      Alert.alert('Saved', 'Business settings updated.');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to save.');
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loading}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <TextInput label="Business Name" mode="outlined" value={name} onChangeText={setName} />
        <TextInput label="Phone" mode="outlined" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
        <TextInput label="Email" mode="outlined" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />

        <NativePicker
          label="Trade Type"
          options={tradeOptions}
          selectedValue={tradeType}
          onValueChange={(val) => setTradeType(val as TradeType)}
          placeholder="Select a trade..."
        />

        <TextInput label="Service Area" mode="outlined" value={serviceArea} onChangeText={setServiceArea} />
        <TextInput label="Tax Rate (%)" mode="outlined" keyboardType="decimal-pad" value={taxRate} onChangeText={setTaxRate} right={<TextInput.Affix text="%" />} />
        <TextInput label="Default Estimate Notes" mode="outlined" multiline numberOfLines={3} value={defaultEstimateNotes} onChangeText={setDefaultEstimateNotes} />
        <TextInput label="Default Invoice Notes" mode="outlined" multiline numberOfLines={3} value={defaultInvoiceNotes} onChangeText={setDefaultInvoiceNotes} />

        <LargeButton
          label={updateBusiness.isPending ? 'Saving...' : 'Save Settings'}
          onPress={onSave}
          loading={updateBusiness.isPending}
          style={styles.saveButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 16, gap: 12 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  saveButton: { marginTop: 8 },
});
