import React, { useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Text, Card, Divider, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { ClockButton } from '@/components/time-tracking/ClockButton';
import { CorrectionRequestForm } from '@/components/time-tracking/CorrectionRequestForm';
import { LargeButton } from '@/components/ui/LargeButton';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { useTimesheet } from '@/hooks/useTimeTracking';
import { formatDate, formatTime, formatHoursDecimal } from '@/lib/formatting';

export default function TimesheetScreen() {
  const theme = useTheme();
  const { data: days, isLoading } = useTimesheet();
  const [correctionVisible, setCorrectionVisible] = useState(false);
  const today = new Date().toISOString().split('T')[0];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.onBackground }]}>
            Timesheet
          </Text>
        </View>

        {/* Clock controls */}
        <View style={styles.clockSection}>
          <ClockButton />
        </View>

        <Divider style={styles.divider} />

        {/* Weekly summary */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
            This Week
          </Text>

          {isLoading ? (
            <View style={{ gap: 12 }}>
              <SkeletonLoader height={80} />
              <SkeletonLoader height={80} />
            </View>
          ) : days && days.length > 0 ? (
            <>
              {/* Week total */}
              <Card style={styles.summaryCard} mode="elevated">
                <Card.Content style={styles.summaryContent}>
                  <View style={styles.summaryItem}>
                    <Text variant="headlineMedium" style={{ color: theme.colors.primary, fontWeight: '700' }}>
                      {formatHoursDecimal(days.reduce((sum, d) => sum + d.netHours, 0))}
                    </Text>
                    <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                      Total Hours
                    </Text>
                  </View>
                  <View style={styles.summaryDivider} />
                  <View style={styles.summaryItem}>
                    <Text variant="headlineMedium" style={{ color: theme.colors.onSurface, fontWeight: '700' }}>
                      {formatHoursDecimal(days.reduce((sum, d) => sum + d.breakHours, 0))}
                    </Text>
                    <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                      Break Hours
                    </Text>
                  </View>
                </Card.Content>
              </Card>

              {/* Daily breakdown */}
              {days.map((day) => (
                <Card key={day.date} style={styles.dayCard} mode="outlined">
                  <Card.Content style={styles.dayContent}>
                    <View style={styles.dayHeader}>
                      <Text variant="titleSmall" style={{ fontWeight: '600' }}>
                        {formatDate(day.date)}
                      </Text>
                      <Text variant="titleSmall" style={{ color: theme.colors.primary, fontWeight: '700' }}>
                        {formatHoursDecimal(day.netHours)}
                      </Text>
                    </View>
                    {day.entries.length > 0 ? (
                      <View style={styles.entriesList}>
                        {day.entries.map((entry) => (
                          <View key={entry.id} style={styles.entryRow}>
                            <MaterialIcons
                              name={getEntryIcon(entry.type) as keyof typeof MaterialIcons.glyphMap}
                              size={16}
                              color={theme.colors.onSurfaceVariant}
                            />
                            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                              {getEntryLabel(entry.type)}
                            </Text>
                            <Text variant="bodyMedium" style={{ marginLeft: 'auto' }}>
                              {formatTime(entry.timestamp)}
                            </Text>
                          </View>
                        ))}
                      </View>
                    ) : (
                      <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                        No entries
                      </Text>
                    )}
                  </Card.Content>
                </Card>
              ))}
            </>
          ) : (
            <View style={styles.empty}>
              <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
                No timesheet entries this week.
              </Text>
            </View>
          )}
        </View>

        {/* Manual correction request */}
        <View style={styles.section}>
          <LargeButton
            label="Request Time Correction"
            icon="clock-edit-outline"
            onPress={() => setCorrectionVisible(true)}
            mode="outlined"
          />
        </View>

        <CorrectionRequestForm
          visible={correctionVisible}
          onDismiss={() => setCorrectionVisible(false)}
          date={today}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function getEntryIcon(type: string): string {
  switch (type) {
    case 'clock-in': return 'login';
    case 'clock-out': return 'logout';
    case 'break-start': return 'coffee';
    case 'break-end': return 'coffee-off';
    default: return 'circle-small';
  }
}

function getEntryLabel(type: string): string {
  switch (type) {
    case 'clock-in': return 'Clock In';
    case 'clock-out': return 'Clock Out';
    case 'break-start': return 'Break Start';
    case 'break-end': return 'Break End';
    default: return type;
  }
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  scroll: {
    paddingBottom: 32,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  title: {
    fontWeight: '700',
  },
  clockSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  divider: {
    marginVertical: 16,
    marginHorizontal: 16,
  },
  section: {
    paddingHorizontal: 16,
    gap: 12,
  },
  sectionTitle: {
    fontWeight: '600',
  },
  summaryCard: {
    borderRadius: 12,
  },
  summaryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E0E0E0',
  },
  dayCard: {
    borderRadius: 12,
  },
  dayContent: {
    gap: 8,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  entriesList: {
    gap: 4,
  },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 2,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 32,
  },
});
