import { Stack } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { useAuthStore } from '@/stores/authStore';
import { isOwner } from '@/lib/roles';
import { sharedStackOptions } from '@/lib/navigation';

export default function JobsLayout() {
  const theme = useTheme();
  const role = useAuthStore((s) => s.user?.role);

  return (
    <Stack screenOptions={sharedStackOptions(theme)}>
      <Stack.Screen name="index" options={{ title: isOwner(role) ? 'Jobs' : 'My Jobs' }} />
      <Stack.Screen name="[id]" options={{ title: 'Job Details' }} />
      <Stack.Screen name="edit" options={{ title: 'Edit Job' }} />
      <Stack.Screen name="create" options={{ title: 'New Job' }} />
    </Stack>
  );
}
