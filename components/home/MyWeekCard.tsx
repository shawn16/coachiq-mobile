import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  DS_COLORS,
  DS_TYPOGRAPHY,
  DS_SPACING,
  DS_RADIUS,
  DS_SHADOWS,
} from '@/constants/design-system';
import type { WeekStats } from '@/mocks/dashboard';

interface MyWeekCardProps {
  stats: WeekStats;
}

export default function MyWeekCard({ stats }: MyWeekCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{'📊 MY WEEK'}</Text>
      <View style={styles.metricsRow}>
        <View style={styles.metricBox}>
          <Text style={[styles.metricValue, { color: DS_COLORS.accent.green }]}>
            {stats.weci.value}
          </Text>
          <Text style={[styles.metricTrend, { color: DS_COLORS.accent.green }]}>
            {'↑'}{stats.weci.trend.replace('+', '')}
          </Text>
          <Text style={styles.metricLabel}>WECI</Text>
        </View>
        <View style={styles.metricBox}>
          <Text style={[styles.metricValue, { color: DS_COLORS.accent.blue }]}>
            {stats.workouts.completed} of {stats.workouts.total}
          </Text>
          <Text style={styles.metricLabel}>Workouts</Text>
        </View>
        <View style={styles.metricBox}>
          <Text style={[styles.metricValue, { color: DS_COLORS.status.info }]}>
            {stats.avgSleep}h
          </Text>
          <Text style={styles.metricLabel}>Avg Sleep</Text>
        </View>
      </View>
      <Text style={styles.link}>{'View My Stats →'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: DS_COLORS.surface.card,
    borderRadius: DS_RADIUS.lg,
    padding: DS_SPACING.lg,
    ...DS_SHADOWS.card,
  },
  label: {
    ...DS_TYPOGRAPHY.captionMedium,
    color: DS_COLORS.text.secondary,
    marginBottom: DS_SPACING.md,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: DS_SPACING.sm,
  },
  metricBox: {
    flex: 1,
    backgroundColor: DS_COLORS.surface.background,
    borderRadius: DS_RADIUS.sm,
    padding: DS_SPACING.md,
    alignItems: 'center',
  },
  metricValue: {
    ...DS_TYPOGRAPHY.valueDisplay,
  },
  metricTrend: {
    ...DS_TYPOGRAPHY.captionMedium,
    marginTop: DS_SPACING.xxs,
  },
  metricLabel: {
    ...DS_TYPOGRAPHY.helperText,
    color: DS_COLORS.text.tertiary,
    marginTop: DS_SPACING.xs,
  },
  link: {
    ...DS_TYPOGRAPHY.captionMedium,
    color: DS_COLORS.gradient.deepPurple,
    textAlign: 'right',
    marginTop: DS_SPACING.md,
  },
});
