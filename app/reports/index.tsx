import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';


import MaterialIcons from '@expo/vector-icons/MaterialCommunityIcons';

export default function ReportsScreen() {
  const theme = useTheme();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <View style={styles.center}>
        <MaterialIcons name="chart-bar" size={64} color={theme.colors.onSurfaceVariant} />
        <Text variant="titleLarge" style={[styles.title, { color: theme.colors.onBackground }]}>
          Reports
        </Text>
        <Text
          variant="bodyLarge"
          style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
        >
          Reports are available on the web dashboard. Visit your FieldLedgr account on desktop to
          view revenue, job, and customer reports.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  title: { fontWeight: '600', marginTop: 16, marginBottom: 8 },
  subtitle: { textAlign: 'center', lineHeight: 22 },
});
