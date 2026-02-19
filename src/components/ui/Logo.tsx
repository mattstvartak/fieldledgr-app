import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { brand } from '@/constants/theme';
import { typography } from '@/constants/theme';

interface LogoProps {
  size?: number;
  dark?: boolean;
}

export function Logo({ size = 32, dark = false }: LogoProps) {
  const secondColor = dark ? '#FFFFFF' : '#1D242A';

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.text,
          {
            fontSize: size,
            fontFamily: typography.headerFont,
          },
        ]}
      >
        <Text style={{ color: brand.primary }}>field</Text>
        <Text style={{ color: secondColor }}>ledgr</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    letterSpacing: -0.5,
  },
});
