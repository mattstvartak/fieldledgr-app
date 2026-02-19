import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import MaterialIcons from '@expo/vector-icons/MaterialCommunityIcons';

interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  color?: string;
  onPress?: () => void;
}

export function StatCard({ icon, label, value, color, onPress }: StatCardProps) {
  const theme = useTheme();
  const iconColor = color ?? theme.colors.primary;

  return (
    <Card style={[styles.card, { backgroundColor: theme.colors.surfaceVariant }]} onPress={onPress} mode="contained">
      <Card.Content style={styles.content}>
        <MaterialIcons name={icon as never} size={24} color={iconColor} />
        <View style={styles.text}>
          <Text variant="titleLarge" style={[styles.value, { color: theme.colors.onSurface }]}>
            {value}
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {label}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '45%',
  },
  content: {
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  text: {
    alignItems: 'center',
  },
  value: {
    fontWeight: '800',
  },
});
