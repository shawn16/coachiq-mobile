import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import {
  DS_COLORS,
  DS_TYPOGRAPHY,
  DS_SPACING,
  DS_RADIUS,
  DS_SHADOWS,
} from '@/constants/design-system';
import type { RecentWorkout } from '@/mocks/stats';
import InfoTooltip from './InfoTooltip';

interface RecentWorkoutsCardProps {
  workouts: RecentWorkout[];
}

function getPacingColor(score: number): string {
  if (score >= 90) return DS_COLORS.accent.green;
  if (score >= 80) return DS_COLORS.gradient.deepPurple;
  return DS_COLORS.status.warning;
}

export default function RecentWorkoutsCard({ workouts }: RecentWorkoutsCardProps) {
  const [showPacingInfo, setShowPacingInfo] = useState(false);
  const [showEffortInfo, setShowEffortInfo] = useState(false);

  return (
    <View style={styles.card}>
      <Text style={styles.label}>{'🏃 RECENT WORKOUTS'}</Text>
      {workouts.map((workout, index) => (
        <React.Fragment key={workout.date}>
          {index > 0 && <View style={styles.divider} />}
          <View style={styles.row}>
            <Text style={styles.workoutDate}>{workout.date}</Text>
            <Text style={styles.workoutName}>{workout.name}</Text>
            <View style={styles.metricsRow}>
              <View style={styles.metric}>
                <Text style={styles.metricLabel}>Pacing: </Text>
                <Text style={[styles.metricValue, { color: getPacingColor(workout.pacingScore) }]}>
                  {workout.pacingScore}
                </Text>
                {workout.pacingScore >= 85 && (
                  <Text style={styles.checkmark}> ✓</Text>
                )}
                <Pressable
                  onPress={() => setShowPacingInfo(true)}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                  <MaterialIcons
                    name="info-outline"
                    size={14}
                    color={DS_COLORS.text.tertiary}
                    style={styles.infoIcon}
                  />
                </Pressable>
              </View>
              <View style={styles.metric}>
                <Text style={styles.metricLabel}>Effort: </Text>
                <Text style={styles.metricValue}>{workout.effortRating}/10</Text>
                <Pressable
                  onPress={() => setShowEffortInfo(true)}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                  <MaterialIcons
                    name="info-outline"
                    size={14}
                    color={DS_COLORS.text.tertiary}
                    style={styles.infoIcon}
                  />
                </Pressable>
              </View>
            </View>
          </View>
        </React.Fragment>
      ))}
      <View style={styles.divider} />
      <Pressable
        onPress={() => console.log('[Stats] View All Workouts tapped')}
        style={styles.viewAll}
      >
        <Text style={styles.viewAllText}>{'View All Workouts →'}</Text>
      </Pressable>

      <InfoTooltip
        visible={showPacingInfo}
        onClose={() => setShowPacingInfo(false)}
        title="What is Pacing Score?"
        body={'Pacing Score (WECI) measures how consistently you hit your target paces.\n\n90+ = Excellent\n80–89 = Good\n70–79 = Needs work\n\nSmaller difference between fastest and slowest rep = higher score.'}
      />
      <InfoTooltip
        visible={showEffortInfo}
        onClose={() => setShowEffortInfo(false)}
        title="What is Effort (RPE)?"
        body={'Effort (RPE) captures how hard the workout felt on a 1–10 scale.\n\n1–3 = Easy\n4–6 = Moderate\n7–8 = Hard\n9–10 = Max effort\n\nCoach uses this to manage your training load.'}
      />
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
  row: {
    paddingVertical: DS_SPACING.sm,
  },
  workoutDate: {
    ...DS_TYPOGRAPHY.bodySemiBold,
    color: DS_COLORS.text.primary,
  },
  workoutName: {
    ...DS_TYPOGRAPHY.caption,
    color: DS_COLORS.text.secondary,
    marginTop: DS_SPACING.xxs,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: DS_SPACING.xl,
    marginTop: DS_SPACING.sm,
  },
  metric: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricLabel: {
    ...DS_TYPOGRAPHY.caption,
    color: DS_COLORS.text.secondary,
  },
  metricValue: {
    ...DS_TYPOGRAPHY.captionMedium,
    color: DS_COLORS.text.primary,
  },
  checkmark: {
    ...DS_TYPOGRAPHY.captionMedium,
    color: DS_COLORS.accent.green,
  },
  infoIcon: {
    marginLeft: DS_SPACING.xs,
  },
  divider: {
    height: 1,
    backgroundColor: DS_COLORS.border.light,
    marginVertical: DS_SPACING.xs,
  },
  viewAll: {
    alignItems: 'flex-end',
    paddingVertical: DS_SPACING.xs,
  },
  viewAllText: {
    ...DS_TYPOGRAPHY.captionMedium,
    color: DS_COLORS.gradient.deepPurple,
  },
});
