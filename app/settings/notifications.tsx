import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { List, Switch, Text, useTheme, Divider, Snackbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/api/endpoints/auth';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function NotificationPreferencesScreen() {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const setAuth = useAuthStore((s) => s.setAuth);
  const token = useAuthStore((s) => s.token);

  const [pushEnabled, setPushEnabled] = useState(user?.pushNotificationsEnabled !== false);
  const [emailEnabled, setEmailEnabled] = useState(user?.emailNotificationsEnabled !== false);
  const [snackbar, setSnackbar] = useState('');

  // Sync local state if user data refreshes
  useEffect(() => {
    if (user) {
      setPushEnabled(user.pushNotificationsEnabled !== false);
      setEmailEnabled(user.emailNotificationsEnabled !== false);
    }
  }, [user]);

  const updatePrefs = useMutation({
    mutationFn: async (data: { pushNotificationsEnabled?: boolean; emailNotificationsEnabled?: boolean }) => {
      if (!user) throw new Error('Not authenticated');
      return authApi.updateMe(user.id, data);
    },
    onSuccess: (result, variables) => {
      // Update local auth store with new user data
      if (user && token) {
        setAuth({ ...user, ...variables }, token);
      }
      queryClient.invalidateQueries({ queryKey: ['me'] });
      setSnackbar('Preferences saved');
    },
    onError: () => {
      // Revert toggles on error
      if (user) {
        setPushEnabled(user.pushNotificationsEnabled !== false);
        setEmailEnabled(user.emailNotificationsEnabled !== false);
      }
      setSnackbar('Failed to save preferences');
    },
  });

  function handlePushToggle(value: boolean) {
    setPushEnabled(value);
    updatePrefs.mutate({ pushNotificationsEnabled: value });
  }

  function handleEmailToggle(value: boolean) {
    setEmailEnabled(value);
    updatePrefs.mutate({ emailNotificationsEnabled: value });
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <List.Section>
          <List.Subheader>Notification Channels</List.Subheader>
          <List.Item
            title="Push Notifications"
            description="Receive alerts on your mobile device"
            left={(props) => <List.Icon {...props} icon="cellphone" />}
            right={() => (
              <Switch
                value={pushEnabled}
                onValueChange={handlePushToggle}
                disabled={updatePrefs.isPending}
              />
            )}
          />
          <Divider />
          <List.Item
            title="Email Notifications"
            description="Receive notification emails"
            left={(props) => <List.Icon {...props} icon="email-outline" />}
            right={() => (
              <Switch
                value={emailEnabled}
                onValueChange={handleEmailToggle}
                disabled={updatePrefs.isPending}
              />
            )}
          />
        </List.Section>

        <View style={styles.note}>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            Important emails like invitations and password resets will always be sent regardless of
            these settings.
          </Text>
        </View>
      </ScrollView>

      <Snackbar
        visible={!!snackbar}
        onDismiss={() => setSnackbar('')}
        duration={2000}
      >
        {snackbar}
      </Snackbar>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  scroll: {
    paddingBottom: 24,
  },
  note: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
});
