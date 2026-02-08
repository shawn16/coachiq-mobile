import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  DS_COLORS,
  DS_TYPOGRAPHY,
  DS_SPACING,
  DS_RADIUS,
  DS_SHADOWS,
} from '@/constants/design-system';
import type { TodaysWorkout } from '@/mocks/dashboard';

interface TodaysWorkoutCardProps {
  workout: TodaysWorkout;
}

export default function TodaysWorkoutCard({ workout }: TodaysWorkoutCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{'🏃 TODAY\'S WORKOUT'}</Text>
      <Text style={styles.name}>{workout.name}</Text>
      <Text style={styles.structure}>{workout.structure}</Text>
      <Text style={styles.recovery}>{workout.recovery}</Text>
      <View style={styles.divider} />
      <Text style={styles.target}>Your target: {workout.targetPace}</Text>
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
    marginBottom: DS_SPACING.sm,
  },
  name: {
    ...DS_TYPOGRAPHY.questionTitle,
    color: DS_COLORS.text.primary,
  },
  structure: {
    ...DS_TYPOGRAPHY.body,
    color: DS_COLORS.text.primary,
    marginTop: DS_SPACING.xs,
  },
  recovery: {
    ...DS_TYPOGRAPHY.caption,
    color: DS_COLORS.text.secondary,
    marginTop: DS_SPACING.xs,
  },
  divider: {
    height: 1,
    backgroundColor: DS_COLORS.border.light,
    marginVertical: DS_SPACING.md,
  },
  target: {
    ...DS_TYPOGRAPHY.captionMedium,
    color: DS_COLORS.gradient.deepPurple,
  },
});
