import React, { useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import {
  DS_COLORS,
  DS_RADIUS,
  DS_ANIMATION,
  DS_COMPONENTS,
} from '@/constants/design-system';

interface PinDotsProps {
  length: number;
  filled: number;
  error: boolean;
}

function Dot({ isFilled, shouldPulse }: { isFilled: boolean; shouldPulse: boolean }) {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (shouldPulse && isFilled) {
      scale.value = withSequence(
        withSpring(1.3, DS_ANIMATION.spring),
        withSpring(1.0, DS_ANIMATION.spring)
      );
    }
  }, [isFilled, shouldPulse, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: isFilled ? DS_COLORS.text.onGradient : 'transparent',
    borderColor: DS_COLORS.text.onGradient,
  }));

  return <Animated.View style={[styles.dot, animatedStyle]} />;
}

export default function PinDots({ length, filled, error }: PinDotsProps) {
  const prevFilled = useRef(filled);
  const shakeX = useSharedValue(0);

  useEffect(() => {
    if (error) {
      shakeX.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );
    }
  }, [error, shakeX]);

  const newlyFilledIndex = filled > prevFilled.current ? filled - 1 : -1;

  useEffect(() => {
    prevFilled.current = filled;
  }, [filled]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      {Array.from({ length }, (_, i) => (
        <Dot
          key={i}
          isFilled={i < filled}
          shouldPulse={i === newlyFilledIndex}
        />
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: DS_COMPONENTS.pinDot.gap,
  },
  dot: {
    width: DS_COMPONENTS.pinDot.size,
    height: DS_COMPONENTS.pinDot.size,
    borderRadius: DS_RADIUS.full,
    borderWidth: DS_COMPONENTS.pinDot.borderWidth,
  },
});
