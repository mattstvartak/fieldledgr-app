import React from 'react';
import { StyleSheet, View, FlatList, RefreshControl, Alert } from 'react-native';
import { Text, Card, Chip, FAB, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTeamMembers, usePendingInvites, useDeactivateUser, useReactivateUser, useCancelInvitation, useResendInvitation } from '@/hooks/useTeam';
import type { User } from '@/types/user';
import type { Invitation } from '@/types/invitation';

function getRoleLabel(member: User): string {
  if (member.role === 'admin') return 'Admin';
  if (member.role === 'owner') return 'Owner';
  if (member.customRole && typeof member.customRole === 'object') {
    return member.customRole.name;
  }
  return 'Member';
}

export default function TeamScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { data: membersData, isLoading, refetch, isRefetching } = useTeamMembers();
  const { data: invitesData, refetch: refetchInvites } = usePendingInvites();
  const deactivate = useDeactivateUser();
  const reactivate = useReactivateUser();
  const cancelInvite = useCancelInvitation();
  const resendInvite = useResendInvitation();

  const members = membersData?.docs ?? [];
  const invites = invitesData?.docs ?? [];

  const handleToggleActive = (member: User) => {
    const action = member.isActive ? 'deactivate' : 'reactivate';
    Alert.alert(
      `${action.charAt(0).toUpperCase() + action.slice(1)} member?`,
      `${member.firstName} ${member.lastName} will be ${member.isActive ? 'deactivated' : 'reactivated'}.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: action.charAt(0).toUpperCase() + action.slice(1),
          onPress: async () => {
            if (member.isActive) {
              await deactivate.mutateAsync(member.id);
            } else {
              await reactivate.mutateAsync(member.id);
            }
          },
        },
      ],
    );
  };

  const handleInvitePress = (invite: Invitation) => {
    const buttons: { text: string; style?: 'cancel' | 'destructive' | 'default'; onPress?: () => void }[] = [];

    if (!invite.emailSent) {
      buttons.push({
        text: 'Resend Email',
        onPress: () => resendInvite.mutateAsync(invite.id).then(() => refetchInvites()),
      });
    }

    buttons.push({
      text: 'Cancel Invitation',
      style: 'destructive',
      onPress: () => cancelInvite.mutateAsync(invite.id).then(() => refetchInvites()),
    });

    buttons.push({ text: 'Dismiss', style: 'cancel' });

    Alert.alert(
      `${invite.firstName} ${invite.lastName}`,
      invite.emailSent ? 'Invitation is pending.' : 'Invitation email failed to send.',
      buttons,
    );
  };

  const refreshAll = () => {
    refetch();
    refetchInvites();
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={members}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <Card style={styles.card} onPress={() => handleToggleActive(item)} mode="elevated">
            <Card.Content style={styles.cardContent}>
              <View style={styles.memberInfo}>
                <Text variant="titleMedium" style={{ fontWeight: '600' }}>
                  {item.firstName} {item.lastName}
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  {item.email} &middot; {getRoleLabel(item)}
                </Text>
              </View>
              <Chip compact textStyle={{ fontSize: 11 }}>
                {item.isActive ? 'Active' : 'Inactive'}
              </Chip>
            </Card.Content>
          </Card>
        )}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refreshAll} />}
        ListHeaderComponent={
          invites.length > 0 ? (
            <View style={styles.invitesSection}>
              <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
                Pending Invitations
              </Text>
              {invites.map((inv) => (
                <Card key={inv.id} style={styles.card} onPress={() => handleInvitePress(inv)} mode="elevated">
                  <Card.Content style={styles.cardContent}>
                    <View style={{ flex: 1 }}>
                      <Text variant="bodyMedium">
                        {inv.firstName && inv.lastName
                          ? `${inv.firstName} ${inv.lastName}`
                          : inv.email}
                      </Text>
                      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                        {inv.customRole && typeof inv.customRole === 'object'
                          ? inv.customRole.name
                          : 'Member'}
                      </Text>
                    </View>
                    {inv.emailSent === false ? (
                      <Chip compact textStyle={{ fontSize: 11, color: theme.colors.error }}>
                        Email Failed
                      </Chip>
                    ) : (
                      <Chip compact textStyle={{ fontSize: 11 }}>
                        Pending
                      </Chip>
                    )}
                  </Card.Content>
                </Card>
              ))}
              <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onBackground, marginTop: 16 }]}>
                Team Members
              </Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          isLoading ? null : (
            <View style={styles.empty}>
              <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
                No team members yet.
              </Text>
            </View>
          )
        }
        contentContainerStyle={styles.list}
      />

      <FAB
        icon="account-plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color={theme.colors.onPrimary}
        onPress={() => router.push('/team/invite')}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  card: { marginHorizontal: 16, marginVertical: 4 },
  cardContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  memberInfo: { flex: 1 },
  invitesSection: { paddingHorizontal: 16, paddingTop: 16 },
  sectionTitle: { fontWeight: '600', marginBottom: 8 },
  list: { paddingBottom: 80 },
  empty: { alignItems: 'center', paddingVertical: 48 },
  fab: { position: 'absolute', right: 16, bottom: 16 },
});
