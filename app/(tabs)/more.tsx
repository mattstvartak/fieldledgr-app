import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { List, Divider, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/stores/authStore';
import { isOwner as checkIsOwner } from '@/lib/roles';

export default function MoreScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { logout } = useAuth();
  const role = useAuthStore((s) => s.user?.role);
  const isOwner = checkIsOwner(role);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <ScrollView>
        <List.Section>
          <List.Subheader>Business</List.Subheader>
          <List.Item
            title="Estimates"
            left={(props) => <List.Icon {...props} icon="file-document-outline" />}
            onPress={() => router.push('/estimates/')}
          />
          <List.Item
            title="Invoices"
            left={(props) => <List.Icon {...props} icon="receipt" />}
            onPress={() => router.push('/invoices/')}
          />
          <List.Item
            title="Products & Services"
            left={(props) => <List.Icon {...props} icon="package-variant-closed" />}
            onPress={() => router.push('/products/')}
          />
          <List.Item
            title="Payments"
            left={(props) => <List.Icon {...props} icon="cash-multiple" />}
            onPress={() => router.push('/payments/' as never)}
          />
          {isOwner && (
            <List.Item
              title="Reports"
              left={(props) => <List.Icon {...props} icon="chart-bar" />}
              onPress={() => router.push('/reports/' as never)}
            />
          )}
        </List.Section>

        {isOwner && (
          <>
            <Divider />
            <List.Section>
              <List.Subheader>Management</List.Subheader>
              <List.Item
                title="Roles"
                left={(props) => <List.Icon {...props} icon="shield-account-outline" />}
                onPress={() => router.push('/settings/roles' as never)}
              />
              <List.Item
                title="Team"
                left={(props) => <List.Icon {...props} icon="account-group" />}
                onPress={() => router.push('/team/' as never)}
              />
              <List.Item
                title="Time Corrections"
                left={(props) => <List.Icon {...props} icon="clock-check-outline" />}
                onPress={() => router.push('/corrections/' as never)}
              />
              <List.Item
                title="Settings"
                left={(props) => <List.Icon {...props} icon="cog-outline" />}
                onPress={() => router.push('/settings/' as never)}
              />
              <List.Item
                title="Billing"
                left={(props) => <List.Icon {...props} icon="credit-card-outline" />}
                onPress={() => router.push('/billing/' as never)}
              />
            </List.Section>
          </>
        )}

        <Divider />

        <List.Section>
          <List.Item
            title="Notifications"
            left={(props) => <List.Icon {...props} icon="bell-outline" />}
            onPress={() => router.push('/(tabs)/notifications')}
          />
          <List.Item
            title="Notification Preferences"
            left={(props) => <List.Icon {...props} icon="bell-cog-outline" />}
            onPress={() => router.push('/settings/notifications')}
          />
          <List.Item
            title="Log Out"
            titleStyle={{ color: theme.colors.error }}
            left={(props) => <List.Icon {...props} icon="logout" color={theme.colors.error} />}
            onPress={logout}
          />
        </List.Section>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
});
