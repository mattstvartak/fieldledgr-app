import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import type { MD3Theme } from 'react-native-paper';

/**
 * Shared header + transition options for all Stack navigators.
 * Call this in every _layout.tsx to get consistent headers app-wide.
 */
export function sharedStackOptions(theme: MD3Theme): NativeStackNavigationOptions {
  return {
    headerStyle: { backgroundColor: theme.colors.surface },
    headerTintColor: theme.colors.onSurface,
    headerTitleStyle: { fontWeight: '600', fontSize: 17 },
    headerShadowVisible: false,
    headerBackVisible: true,
    animation: 'slide_from_right',
    contentStyle: { backgroundColor: theme.colors.background },
  };
}
