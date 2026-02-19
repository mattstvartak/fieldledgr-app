import { Stack, useRouter } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { HeaderBackButton } from '@react-navigation/elements';
import { sharedStackOptions } from '@/lib/navigation';

export default function PaymentsLayout() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <Stack screenOptions={sharedStackOptions(theme)}>
      <Stack.Screen
        name="index"
        options={{
          title: 'Payments',
          headerLeft: () => (
            <HeaderBackButton tintColor={theme.colors.onSurface} onPress={() => router.dismiss()} />
          ),
        }}
      />
    </Stack>
  );
}
