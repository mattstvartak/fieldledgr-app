import React, { useState } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Text, IconButton, useTheme } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { OnboardingShell } from '@/components/onboarding/OnboardingShell';
import { useOnboardingStore } from '@/stores/onboardingStore';

export default function LogoScreen() {
  const router = useRouter();
  const theme = useTheme();
  const store = useOnboardingStore();
  const [logoUri, setLogoUri] = useState(store.logoUri);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setLogoUri(result.assets[0].uri);
    }
  };

  const onNext = () => {
    store.setLogo(logoUri);
    store.setStep(3);
    router.push('/(onboarding)/defaults');
  };

  const onSkip = () => {
    store.setLogo('');
    store.setStep(3);
    router.push('/(onboarding)/defaults');
  };

  return (
    <OnboardingShell
      step={2}
      title="Add your logo"
      subtitle="This will appear on estimates and invoices"
      onNext={onNext}
      onSkip={onSkip}
      nextDisabled={!logoUri}
    >
      <View style={styles.center}>
        {logoUri ? (
          <View style={styles.previewContainer}>
            <Image source={{ uri: logoUri }} style={styles.preview} />
            <IconButton
              icon="close-circle"
              size={28}
              onPress={() => setLogoUri('')}
              style={styles.removeButton}
            />
          </View>
        ) : (
          <View
            style={[
              styles.placeholder,
              { borderColor: theme.colors.outline, backgroundColor: theme.colors.surfaceVariant },
            ]}
          >
            <IconButton icon="camera-plus" size={48} onPress={pickImage} />
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              Tap to choose an image
            </Text>
          </View>
        )}
      </View>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  placeholder: {
    width: 200,
    height: 200,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewContainer: {
    position: 'relative',
  },
  preview: {
    width: 200,
    height: 200,
    borderRadius: 16,
  },
  removeButton: {
    position: 'absolute',
    top: -12,
    right: -12,
  },
});
