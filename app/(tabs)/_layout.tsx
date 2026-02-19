import React, { useCallback } from 'react';
import { Tabs } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme, IconButton } from 'react-native-paper';
import { HapticTab } from '@/components/haptic-tab';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/stores/authStore';
import { isOwner as checkIsOwner } from '@/lib/roles';

export default function TabLayout() {
  const theme = useTheme();
  const { unreadCount } = useNotifications();
  const { logout } = useAuth();
  const role = useAuthStore((s) => s.user?.role);
  const isOwner = checkIsOwner(role);

  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outline,
        },
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.onSurface,
        tabBarButton: HapticTab,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      {/* Shared home tab — delegates to role-specific dashboard */}
      <Tabs.Screen
        name="index"
        options={{
          title: isOwner ? 'Dashboard' : 'Today',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons
              name={isOwner ? 'view-dashboard' : 'calendar-today'}
              size={size}
              color={color}
            />
          ),
          headerRight: () =>
            !isOwner ? (
              <IconButton
                icon="logout"
                size={22}
                onPress={handleLogout}
                iconColor={theme.colors.onSurfaceVariant}
              />
            ) : null,
        }}
      />

      {/* Jobs tab — visible to all */}
      <Tabs.Screen
        name="jobs"
        options={{
          title: isOwner ? 'Jobs' : 'My Jobs',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="clipboard-list" size={size} color={color} />
          ),
        }}
      />

      {/* Customers tab — owner only */}
      <Tabs.Screen
        name="customers"
        options={{
          title: 'Customers',
          headerShown: false,
          href: isOwner ? undefined : null,
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="account-group" size={size} color={color} />
          ),
        }}
      />

      {/* Timesheet tab — team member only */}
      <Tabs.Screen
        name="timesheet"
        options={{
          title: 'Timesheet',
          href: isOwner ? null : undefined,
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="clock-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Notifications tab — team member only */}
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Notifications',
          href: isOwner ? null : undefined,
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="bell-outline" size={size} color={color} />
          ),
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: theme.colors.error,
            fontSize: 11,
            fontWeight: '700',
          },
        }}
      />

      {/* More tab — visible to all */}
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="dots-horizontal" size={size} color={color} />
          ),
          tabBarBadge: isOwner && unreadCount > 0 ? unreadCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: theme.colors.error,
            fontSize: 11,
            fontWeight: '700',
          },
        }}
      />
    </Tabs>
  );
}
