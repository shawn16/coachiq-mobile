import React from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import {
  DS_COLORS,
  DS_TYPOGRAPHY,
  DS_SPACING,
  DS_RADIUS,
  DS_SHADOWS,
  DS_ANIMATION,
} from '@/constants/design-system';
import StatusBadge from './StatusBadge';

type RPEStatus = 'waiting' | 'pending' | 'complete';

interface RPECardProps {
  status: RPEStatus;
  workoutName: string;
  onStartPress: () => void;
}

export default function RPECard({ status, workoutName, onStartPress }: RPECardProps) {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.timing(scaleAnim, {
      toValue: DS_ANIMATION.pressedScale,
      duration: DS_ANIMATION.duration.press,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: DS_ANIMATION.duration.press,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onStartPress();
  };

  if (status === 'complete') {
    return (
      <View style={[styles.card, styles.cardComplete]}>
        <View style={styles.iconRow}>
          <MaterialIcons name="check-circle" size={20} color={DS_COLORS.status.success} />
          <Text style={styles.categoryLabel}>POST-WORKOUT</Text>
        </View>
        <Text style={styles.title}>Effort Rating</Text>
        <StatusBadge label="Submitted today" variant="success" />
        <Text style={styles.timestamp}>Completed at 4:30 PM</Text>
        <Text style={styles.summary}>Overall: 7  |  Legs: 6  |  Breathing: 7</Text>
      </View>
    );
  }

  if (status === 'waiting') {
    return (
      <View style={[styles.card, styles.cardWaiting]}>
        <View style={styles.iconRow}>
          <Text style={styles.emoji}>{'\u23F3'}</Text>
          <Text style={styles.categoryLabel}>POST-WORKOUT</Text>
        </View>
        <Text style={styles.title}>Effort Rating</Text>
        <Text style={styles.subtitle}>Available after today{"'"}s workout</Text>
        <StatusBadge label="Waiting for workout" variant="neutral" />
        <Text style={styles.note}>Coach will notify you when it{"'"}s time</Text>
      </View>
    );
  }

  // pending
  return (
    <View style={[styles.card, styles.cardPending]}>
      <View style={styles.iconRow}>
        <Text style={styles.emoji}>{'\uD83D\uDD25'}</Text>
        <Text style={styles.categoryLabel}>POST-WORKOUT</Text>
      </View>
      <Text style={styles.title}>Effort Rating</Text>
      <Text style={styles.subtitle}>How did today{"'"}s workout feel?</Text>
      <StatusBadge label="Ready to submit" variant="warning" />
      <Text style={styles.workoutRef}>Today: {workoutName}</Text>
      <Text style={styles.timeEstimate}>~30 seconds</Text>
      <Pressable onPress={handlePress} onPressIn={onPressIn} onPressOut={onPressOut}>
        <Animated.View style={[styles.button, { transform: [{ scale: scaleAnim }] }]}>
          <Text style={styles.buttonText}>{'Rate Your Effort \u2192'}</Text>
        </Animated.View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: DS_COLORS.surface.card,
    borderRadius: DS_RADIUS.lg,
    padding: DS_SPACING.lg,
    borderLeftWidth: 4,
    ...DS_SHADOWS.card,
  },
  cardPending: {
    borderLeftColor: DS_COLORS.status.warning,
  },
  cardComplete: {
    borderLeftColor: DS_COLORS.status.success,
    opacity: 0.85,
  },
  cardWaiting: {
    borderLeftColor: DS_COLORS.border.medium,
    opacity: 0.6,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DS_SPACING.sm,
    marginBottom: DS_SPACING.sm,
  },
  emoji: {
    fontSize: 18,
  },
  categoryLabel: {
    ...DS_TYPOGRAPHY.captionMedium,
    color: DS_COLORS.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    ...DS_TYPOGRAPHY.questionTitle,
    color: DS_COLORS.text.primary,
    marginBottom: DS_SPACING.xxs,
  },
  subtitle: {
    ...DS_TYPOGRAPHY.caption,
    color: DS_COLORS.text.secondary,
    marginBottom: DS_SPACING.sm,
  },
  workoutRef: {
    ...DS_TYPOGRAPHY.captionMedium,
    color: DS_COLORS.text.secondary,
    marginTop: DS_SPACING.sm,
  },
  timeEstimate: {
    ...DS_TYPOGRAPHY.caption,
    color: DS_COLORS.text.tertiary,
    marginTop: DS_SPACING.xs,
    marginBottom: DS_SPACING.md,
  },
  timestamp: {
    ...DS_TYPOGRAPHY.caption,
    color: DS_COLORS.text.secondary,
    marginTop: DS_SPACING.sm,
  },
  summary: {
    ...DS_TYPOGRAPHY.caption,
    color: DS_COLORS.text.secondary,
    marginTop: DS_SPACING.xs,
  },
  note: {
    ...DS_TYPOGRAPHY.caption,
    color: DS_COLORS.text.tertiary,
    fontStyle: 'italic',
    marginTop: DS_SPACING.sm,
  },
  button: {
    height: 48,
    backgroundColor: DS_COLORS.button.primaryBackground,
    borderRadius: DS_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    ...DS_TYPOGRAPHY.buttonLabelSmall,
    color: DS_COLORS.button.primaryText,
  },
});
