import { Stack, useRouter } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { HeaderBackButton } from '@react-navigation/elements';
import { sharedStackOptions } from '@/lib/navigation';

export default function ProductsLayout() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <Stack screenOptions={sharedStackOptions(theme)}>
      <Stack.Screen
        name="index"
        options={{
          title: 'Products & Services',
          headerLeft: () => (
            <HeaderBackButton tintColor={theme.colors.onSurface} onPress={() => router.dismiss()} />
          ),
        }}
      />
      <Stack.Screen name="[id]" options={{ title: 'Product' }} />
    </Stack>
  );
}
