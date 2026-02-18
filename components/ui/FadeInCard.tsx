import React, { useRef, useEffect } from 'react';
import { Animated } from 'react-native';
import { DS_ANIMATION } from '@/constants/design-system';

interface FadeInCardProps {
  index: number;
  children: React.ReactNode;
}

export default function FadeInCard({ index, children }: FadeInCardProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    const delay = index * 100;
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: DS_ANIMATION.duration.transition,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: DS_ANIMATION.duration.transition,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refs are stable; runs once on mount
  }, [index]);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  );
}
