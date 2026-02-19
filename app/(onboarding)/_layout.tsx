import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="business-basics" />
      <Stack.Screen name="trade" />
      <Stack.Screen name="logo" />
      <Stack.Screen name="defaults" />
    </Stack>
  );
}
