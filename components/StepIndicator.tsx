import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import {
  DS_COLORS,
  DS_RADIUS,
  DS_ANIMATION,
  DS_COMPONENTS,
} from '@/constants/design-system';

interface StepIndicatorProps {
  totalSteps: number;
  currentStep: number;
}

function Dot({ active }: { active: boolean }) {
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: withTiming(
      active
        ? DS_COMPONENTS.stepIndicator.activeOpacity
        : DS_COMPONENTS.stepIndicator.inactiveOpacity,
      { duration: DS_ANIMATION.duration.transition }
    ),
  }));

  return <Animated.View style={[styles.dot, animatedStyle]} />;
}

export default function StepIndicator({ totalSteps, currentStep }: StepIndicatorProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: totalSteps }, (_, i) => (
        <Dot key={i} active={i === currentStep} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: DS_COMPONENTS.stepIndicator.dotGap,
  },
  dot: {
    width: DS_COMPONENTS.stepIndicator.dotSize,
    height: DS_COMPONENTS.stepIndicator.dotSize,
    borderRadius: DS_RADIUS.full,
    backgroundColor: DS_COLORS.text.onGradient,
  },
});
