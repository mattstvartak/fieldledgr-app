import React from 'react';
import { StyleSheet } from 'react-native';
import { Button, type ButtonProps } from 'react-native-paper';
import { touchTargets } from '@/constants/theme';

interface LargeButtonProps extends Omit<ButtonProps, 'children'> {
  label: string;
}

export function LargeButton({ label, style, contentStyle, labelStyle, ...props }: LargeButtonProps) {
  return (
    <Button
      mode="contained"
      {...props}
      style={[styles.button, style]}
      contentStyle={[styles.content, contentStyle]}
      labelStyle={[styles.label, labelStyle]}
    >
      {label}
    </Button>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
  },
  content: {
    minHeight: touchTargets.preferred,
    paddingHorizontal: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
});
