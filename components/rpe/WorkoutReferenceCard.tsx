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

interface WorkoutReferenceCardProps {
  workout: TodaysWorkout;
}

export default function WorkoutReferenceCard({ workout }: WorkoutReferenceCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.border} />
      <View style={styles.content}>
        <Text style={styles.label}>RATING WORKOUT</Text>
        <Text style={styles.name}>{workout.name}</Text>
        <Text style={styles.detail}>
          {workout.structure} {workout.recovery}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: DS_COLORS.surface.card,
    borderRadius: DS_RADIUS.lg,
    ...DS_SHADOWS.card,
    overflow: 'hidden',
  },
  border: {
    width: 4,
    backgroundColor: DS_COLORS.gradient.deepPurple,
  },
  content: {
    flex: 1,
    padding: DS_SPACING.lg,
    gap: DS_SPACING.xs,
  },
  label: {
    ...DS_TYPOGRAPHY.captionMedium,
    color: DS_COLORS.gradient.deepPurple,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  name: {
    ...DS_TYPOGRAPHY.questionTitle,
    color: DS_COLORS.text.primary,
  },
  detail: {
    ...DS_TYPOGRAPHY.caption,
    color: DS_COLORS.text.secondary,
  },
});
