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

interface WellnessCheckInCardProps {
  isComplete: boolean;
  onStartPress: () => void;
}

export default function WellnessCheckInCard({ isComplete, onStartPress }: WellnessCheckInCardProps) {
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

  if (isComplete) {
    return (
      <View style={[styles.card, styles.cardComplete]}>
        <View style={styles.header}>
          <View style={styles.iconRow}>
            <MaterialIcons name="check-circle" size={20} color={DS_COLORS.status.success} />
            <Text style={styles.categoryLabel}>PRE-PRACTICE</Text>
          </View>
        </View>
        <Text style={styles.title}>Wellness Check-in</Text>
        <StatusBadge label="Submitted today" variant="success" />
        <Text style={styles.timestamp}>Completed at 2:45 PM</Text>
        <Text style={styles.summary}>Sleep: 7.5h  |  Energy: Good  |  Soreness: Feels Fine</Text>
      </View>
    );
  }

  return (
    <View style={[styles.card, styles.cardPending]}>
      <View style={styles.header}>
        <View style={styles.iconRow}>
          <Text style={styles.emoji}>{'💪'}</Text>
          <Text style={styles.categoryLabel}>PRE-PRACTICE</Text>
        </View>
      </View>
      <Text style={styles.title}>Wellness Check-in</Text>
      <Text style={styles.subtitle}>Tell Coach how you{"'"}re feeling today</Text>
      <StatusBadge label="Not submitted" variant="warning" />
      <Text style={styles.timeEstimate}>~60 seconds</Text>
      <Pressable onPress={handlePress} onPressIn={onPressIn} onPressOut={onPressOut}>
        <Animated.View style={[styles.button, { transform: [{ scale: scaleAnim }] }]}>
          <Text style={styles.buttonText}>{'Start Check-in \u2192'}</Text>
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
  header: {
    marginBottom: DS_SPACING.sm,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DS_SPACING.sm,
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
  timeEstimate: {
    ...DS_TYPOGRAPHY.caption,
    color: DS_COLORS.text.tertiary,
    marginTop: DS_SPACING.sm,
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
