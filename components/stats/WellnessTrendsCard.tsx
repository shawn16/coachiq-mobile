import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  DS_COLORS,
  DS_TYPOGRAPHY,
  DS_SPACING,
  DS_RADIUS,
  DS_SHADOWS,
} from '@/constants/design-system';
import type { WellnessTrendMetric, WellnessTrendComparison } from '@/mocks/stats';

interface WellnessTrendsCardProps {
  metrics: WellnessTrendMetric[];
  comparison: WellnessTrendComparison;
}

function formatValue(metric: WellnessTrendMetric): string {
  if (metric.unit === 'h') return `${metric.value}h`;
  return `${metric.value}/10`;
}

export default function WellnessTrendsCard({ metrics, comparison }: WellnessTrendsCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{'😴 WELLNESS TRENDS'}</Text>
      <Text style={styles.subtitle}>Your averages this week</Text>
      <View style={styles.metricsContainer}>
        {metrics.map((metric) => {
          const fraction = Math.min(metric.value / metric.max, 1);
          return (
            <View key={metric.label} style={styles.metricRow}>
              <View style={styles.metricHeader}>
                <Text style={styles.metricLabel}>{metric.label}</Text>
                <Text style={styles.metricValue}>{formatValue(metric)}</Text>
              </View>
              <View style={styles.track}>
                <View
                  style={[
                    styles.fill,
                    {
                      width: `${fraction * 100}%`,
                      backgroundColor: metric.color,
                    },
                  ]}
                />
              </View>
            </View>
          );
        })}
      </View>
      <Text
        style={[
          styles.comparison,
          { color: comparison.isPositive ? DS_COLORS.accent.green : DS_COLORS.status.warning },
        ]}
      >
        {comparison.text}
      </Text>
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
    marginBottom: DS_SPACING.xxs,
  },
  subtitle: {
    ...DS_TYPOGRAPHY.caption,
    color: DS_COLORS.text.tertiary,
    marginBottom: DS_SPACING.md,
  },
  metricsContainer: {
    gap: DS_SPACING.md,
  },
  metricRow: {
    gap: DS_SPACING.xs,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricLabel: {
    ...DS_TYPOGRAPHY.captionMedium,
    color: DS_COLORS.text.primary,
  },
  metricValue: {
    ...DS_TYPOGRAPHY.captionMedium,
    color: DS_COLORS.text.secondary,
  },
  track: {
    height: 8,
    backgroundColor: DS_COLORS.border.light,
    borderRadius: DS_RADIUS.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: DS_RADIUS.full,
  },
  comparison: {
    ...DS_TYPOGRAPHY.caption,
    marginTop: DS_SPACING.md,
  },
});
