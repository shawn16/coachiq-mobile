import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  DS_COLORS,
  DS_TYPOGRAPHY,
  DS_SPACING,
  DS_RADIUS,
} from '@/constants/design-system';

interface ProgressBarProps {
  completed: number;
  total: number;
}

export default function ProgressBar({ completed, total }: ProgressBarProps) {
  const fraction = Math.min(completed / total, 1);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {completed} of {total}
      </Text>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${fraction * 100}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: DS_SPACING.sm,
    marginBottom: DS_SPACING.xxl,
  },
  label: {
    ...DS_TYPOGRAPHY.captionMedium,
    color: DS_COLORS.text.secondary,
    textAlign: 'right',
  },
  track: {
    height: 6,
    backgroundColor: DS_COLORS.border.light,
    borderRadius: DS_RADIUS.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: DS_COLORS.accent.blue,
    borderRadius: DS_RADIUS.full,
  },
});
