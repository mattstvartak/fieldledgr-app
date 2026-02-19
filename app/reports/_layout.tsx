import { Stack, useRouter } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { HeaderBackButton } from '@react-navigation/elements';
import { sharedStackOptions } from '@/lib/navigation';

export default function ReportsLayout() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <Stack screenOptions={sharedStackOptions(theme)}>
      <Stack.Screen
        name="index"
        options={{
          title: 'Reports',
          headerLeft: () => (
            <HeaderBackButton tintColor={theme.colors.onSurface} onPress={() => router.dismiss()} />
          ),
        }}
      />
    </Stack>
  );
}
