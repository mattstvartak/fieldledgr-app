import { Stack, useRouter } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { HeaderBackButton } from '@react-navigation/elements';
import { sharedStackOptions } from '@/lib/navigation';

export default function EstimatesLayout() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <Stack screenOptions={sharedStackOptions(theme)}>
      <Stack.Screen
        name="index"
        options={{
          title: 'Estimates',
          headerLeft: () => (
            <HeaderBackButton tintColor={theme.colors.onSurface} onPress={() => router.dismiss()} />
          ),
        }}
      />
      <Stack.Screen name="[id]" options={{ title: 'Estimate' }} />
      <Stack.Screen name="create" options={{ title: 'New Estimate' }} />
      <Stack.Screen
        name="sign"
        options={{
          title: 'Capture Signature',
          headerShown: false,
          presentation: 'fullScreenModal',
        }}
      />
    </Stack>
  );
}
