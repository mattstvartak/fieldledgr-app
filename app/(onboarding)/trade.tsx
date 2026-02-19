import React, { useState } from 'react';
import { TextInput } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { OnboardingShell } from '@/components/onboarding/OnboardingShell';
import { NativePicker } from '@/components/ui/NativePicker';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { tradeTypeLabels } from '@/types/business';
import type { TradeType } from '@/types/business';

const tradeOptions = Object.entries(tradeTypeLabels).map(([value, label]) => ({
  value,
  label,
}));

export default function TradeScreen() {
  const router = useRouter();
  const store = useOnboardingStore();
  const [tradeType, setTradeType] = useState<TradeType | ''>(store.tradeType);
  const [serviceArea, setServiceArea] = useState(store.serviceArea);

  const onNext = () => {
    store.setTrade({ tradeType, serviceArea });
    store.setStep(2);
    router.push('/(onboarding)/logo');
  };

  return (
    <OnboardingShell
      step={1}
      title="What's your trade?"
      subtitle="This helps us tailor your experience"
      onNext={onNext}
      nextDisabled={!tradeType}
    >
      <NativePicker
        label="Trade Type"
        options={tradeOptions}
        selectedValue={tradeType}
        onValueChange={(val) => setTradeType(val as TradeType)}
        placeholder="Select a trade..."
      />

      <TextInput
        label="Service Area (optional)"
        mode="outlined"
        placeholder="e.g. Greater Austin Area"
        value={serviceArea}
        onChangeText={setServiceArea}
      />
    </OnboardingShell>
  );
}
