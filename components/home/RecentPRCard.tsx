import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  DS_COLORS,
  DS_TYPOGRAPHY,
  DS_SPACING,
  DS_RADIUS,
  DS_SHADOWS,
} from '@/constants/design-system';
import type { RecentPR } from '@/mocks/dashboard';

interface RecentPRCardProps {
  pr: RecentPR;
}

export default function RecentPRCard({ pr }: RecentPRCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{'🏆 RECENT PR'}</Text>
      <View style={styles.contentRow}>
        <Text style={styles.event}>{pr.event}: </Text>
        <Text style={styles.time}>{pr.time}</Text>
        <Text style={styles.date}> ({pr.date})</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: DS_COLORS.surface.card,
    borderRadius: DS_RADIUS.lg,
    padding: DS_SPACING.md,
    borderLeftWidth: 3,
    borderLeftColor: DS_COLORS.status.warning,
    ...DS_SHADOWS.card,
  },
  label: {
    ...DS_TYPOGRAPHY.captionMedium,
    color: DS_COLORS.text.secondary,
    marginBottom: DS_SPACING.sm,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  event: {
    ...DS_TYPOGRAPHY.body,
    color: DS_COLORS.text.primary,
  },
  time: {
    ...DS_TYPOGRAPHY.bodyMedium,
    color: DS_COLORS.text.primary,
    fontWeight: '700',
  },
  date: {
    ...DS_TYPOGRAPHY.caption,
    color: DS_COLORS.text.secondary,
  },
});
