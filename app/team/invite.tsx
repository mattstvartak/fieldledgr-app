import React, { useState } from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { TextInput, HelperText, Text, ActivityIndicator, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LargeButton } from '@/components/ui/LargeButton';
import { NativePicker } from '@/components/ui/NativePicker';
import { useInviteMember } from '@/hooks/useTeam';
import { useRoles } from '@/hooks/useRoles';

const schema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Enter a valid email'),
});

type FormValues = z.infer<typeof schema>;

export default function InviteScreen() {
  const theme = useTheme();
  const router = useRouter();
  const inviteMember = useInviteMember();
  const { data: roles, isLoading: rolesLoading } = useRoles();
  const [selectedRoleId, setSelectedRoleId] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { firstName: '', lastName: '', email: '' },
  });

  const onSubmit = async (data: FormValues) => {
    await inviteMember.mutateAsync({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      role: 'member',
      customRole: selectedRoleId ? Number(selectedRoleId) : undefined,
    });
    router.dismiss();
  };

  const roleOptions = (roles ?? []).map((role) => ({
    value: String(role.id),
    label: role.name,
  }));

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.nameRow}>
          <View style={styles.nameField}>
            <Controller
              control={control}
              name="firstName"
              render={({ field: { onChange, onBlur, value } }) => (
                <View>
                  <TextInput
                    label="First Name"
                    mode="outlined"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={!!errors.firstName}
                  />
                  {errors.firstName && (
                    <HelperText type="error">{errors.firstName.message}</HelperText>
                  )}
                </View>
              )}
            />
          </View>
          <View style={styles.nameField}>
            <Controller
              control={control}
              name="lastName"
              render={({ field: { onChange, onBlur, value } }) => (
                <View>
                  <TextInput
                    label="Last Name"
                    mode="outlined"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={!!errors.lastName}
                  />
                  {errors.lastName && (
                    <HelperText type="error">{errors.lastName.message}</HelperText>
                  )}
                </View>
              )}
            />
          </View>
        </View>

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <View>
              <TextInput
                label="Email"
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={!!errors.email}
              />
              {errors.email && <HelperText type="error">{errors.email.message}</HelperText>}
            </View>
          )}
        />

        {rolesLoading ? (
          <ActivityIndicator style={styles.roleLoader} />
        ) : roleOptions.length > 0 ? (
          <NativePicker
            label="Role"
            options={roleOptions}
            selectedValue={selectedRoleId}
            onValueChange={setSelectedRoleId}
            placeholder="Select a role..."
          />
        ) : (
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            No custom roles defined. The member will be added with default permissions.
          </Text>
        )}

        <LargeButton
          label={inviteMember.isPending ? 'Sending...' : 'Send Invitation'}
          onPress={handleSubmit(onSubmit)}
          loading={inviteMember.isPending}
          disabled={inviteMember.isPending}
          style={styles.submitButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 16, gap: 12 },
  nameRow: { flexDirection: 'row', gap: 12 },
  nameField: { flex: 1 },
  roleLoader: { marginVertical: 16 },
  submitButton: { marginTop: 8 },
});
