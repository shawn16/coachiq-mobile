import React from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import {
  DS_COLORS,
  DS_TYPOGRAPHY,
  DS_SPACING,
  DS_RADIUS,
  DS_SHADOWS,
  DS_ANIMATION,
} from '@/constants/design-system';
import type { PendingAction } from '@/mocks/dashboard';

interface ActionNeededCardProps {
  action: PendingAction;
  onPress?: () => void;
}

export default function ActionNeededCard({ action, onPress }: ActionNeededCardProps) {
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

  return (
    <View style={styles.card}>
      <Text style={styles.label}>ACTION NEEDED</Text>
      <Text style={styles.title}>{action.title}</Text>
      <Text style={styles.subtitle}>{action.subtitle}</Text>
      <Pressable onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}>
        <Animated.View style={[styles.button, { transform: [{ scale: scaleAnim }] }]}>
          <Text style={styles.buttonText}>{'Complete Now →'}</Text>
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
    borderLeftColor: DS_COLORS.status.warning,
    ...DS_SHADOWS.card,
  },
  label: {
    ...DS_TYPOGRAPHY.captionMedium,
    color: DS_COLORS.status.warning,
    textTransform: 'uppercase',
    marginBottom: DS_SPACING.xs,
  },
  title: {
    ...DS_TYPOGRAPHY.questionTitle,
    color: DS_COLORS.text.primary,
  },
  subtitle: {
    ...DS_TYPOGRAPHY.caption,
    color: DS_COLORS.text.secondary,
    marginTop: DS_SPACING.xs,
    marginBottom: DS_SPACING.md,
  },
  button: {
    height: 48,
    backgroundColor: DS_COLORS.gradient.deepPurple,
    borderRadius: DS_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    ...DS_TYPOGRAPHY.buttonLabelSmall,
    color: DS_COLORS.text.onGradient,
  },
});
