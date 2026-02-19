import { Stack } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { sharedStackOptions } from '@/lib/navigation';

export default function CustomersLayout() {
  const theme = useTheme();

  return (
    <Stack screenOptions={sharedStackOptions(theme)}>
      <Stack.Screen name="index" options={{ title: 'Customers' }} />
      <Stack.Screen name="[id]" options={{ title: 'Customer Details' }} />
      <Stack.Screen name="create" options={{ title: 'New Customer' }} />
    </Stack>
  );
}
