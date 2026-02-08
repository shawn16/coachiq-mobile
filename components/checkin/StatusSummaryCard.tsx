import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import {
  DS_COLORS,
  DS_TYPOGRAPHY,
  DS_SPACING,
  DS_RADIUS,
  DS_SHADOWS,
} from '@/constants/design-system';

interface StatusSummaryCardProps {
  wellnessComplete: boolean;
  rpeComplete: boolean;
}

export default function StatusSummaryCard({ wellnessComplete, rpeComplete }: StatusSummaryCardProps) {
  const completedCount = (wellnessComplete ? 1 : 0) + (rpeComplete ? 1 : 0);
  const allComplete = completedCount === 2;
  const noneComplete = completedCount === 0;

  if (allComplete) {
    return (
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <MaterialIcons name="check" size={32} color={DS_COLORS.text.onGradient} />
        </View>
        <Text style={styles.title}>{"You're all caught up!"}</Text>
        <Text style={styles.subtitle}>Coach has your data for today.</Text>
      </View>
    );
  }

  if (noneComplete) {
    return (
      <View style={styles.card}>
        <Text style={styles.titleWarning}>2 check-ins waiting</Text>
        <Text style={styles.subtitle}>Complete them before and after practice</Text>
      </View>
    );
  }

  // Partially complete
  return (
    <View style={styles.card}>
      <Text style={styles.titlePartial}>1 of 2 check-ins complete</Text>
      <View style={styles.progressTrack}>
        <View style={styles.progressFill} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: DS_COLORS.surface.card,
    borderRadius: DS_RADIUS.lg,
    padding: DS_SPACING.lg,
    alignItems: 'center',
    ...DS_SHADOWS.card,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: DS_RADIUS.full,
    backgroundColor: DS_COLORS.accent.green,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: DS_SPACING.md,
  },
  title: {
    ...DS_TYPOGRAPHY.questionTitle,
    color: DS_COLORS.text.primary,
    textAlign: 'center',
  },
  titleWarning: {
    ...DS_TYPOGRAPHY.questionTitle,
    color: DS_COLORS.status.warning,
    textAlign: 'center',
  },
  titlePartial: {
    ...DS_TYPOGRAPHY.questionTitle,
    color: DS_COLORS.text.primary,
    textAlign: 'center',
    marginBottom: DS_SPACING.md,
  },
  subtitle: {
    ...DS_TYPOGRAPHY.caption,
    color: DS_COLORS.text.secondary,
    textAlign: 'center',
    marginTop: DS_SPACING.xs,
  },
  progressTrack: {
    width: '100%',
    height: 8,
    borderRadius: DS_RADIUS.full,
    backgroundColor: DS_COLORS.border.light,
  },
  progressFill: {
    width: '50%',
    height: '100%',
    borderRadius: DS_RADIUS.full,
    backgroundColor: DS_COLORS.status.success,
  },
});
