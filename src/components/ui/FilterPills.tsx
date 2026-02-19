import React from 'react';
import { StyleSheet, ScrollView, Pressable } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

export interface FilterOption {
  value: string;
  label: string;
}

interface FilterPillsProps {
  options: FilterOption[];
  selected: string;
  onSelect: (value: string) => void;
}

export function FilterPills({ options, selected, onSelect }: FilterPillsProps) {
  const theme = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {options.map((option) => {
        const isActive = option.value === selected;
        return (
          <Pressable
            key={option.value}
            onPress={() => onSelect(option.value)}
            style={[
              styles.pill,
              {
                backgroundColor: isActive ? theme.colors.primary : theme.colors.surfaceVariant,
              },
            ]}
          >
            <Text
              variant="labelMedium"
              style={[
                styles.label,
                {
                  color: isActive ? theme.colors.onPrimary : theme.colors.onSurfaceVariant,
                },
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  label: {
    fontWeight: '600',
  },
});
