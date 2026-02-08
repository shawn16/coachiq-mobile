import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PinDots from '@/components/PinDots';
import PinPad from '@/components/PinPad';
import {
  DS_COLORS,
  DS_TYPOGRAPHY,
  DS_SPACING,
  DS_ANIMATION,
} from '@/constants/design-system';

export default function PinLoginScreen() {
  const insets = useSafeAreaInsets();

  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const locked = failedAttempts >= 5;

  const padOpacity = useSharedValue(1);
  const padAnimStyle = useAnimatedStyle(() => ({
    opacity: padOpacity.value,
  }));

  const handleDigitPress = useCallback(
    (digit: string) => {
      if (locked) return;
      setPin((prev) => {
        const next = prev + digit;
        if (next.length === 4) {
          setTimeout(() => {
            if (next === '1234') {
              console.log('PIN correct, navigate to home');
            } else {
              setPinError(true);
              setErrorMessage('Incorrect PIN — try again');
              setFailedAttempts((f) => {
                const updated = f + 1;
                if (updated >= 5) {
                  padOpacity.value = withTiming(0.4, {
                    duration: DS_ANIMATION.duration.transition,
                  });
                }
                return updated;
              });
              setTimeout(() => {
                setPinError(false);
                setErrorMessage('');
                setPin('');
              }, 300);
            }
          }, 300);
        }
        return next.length <= 4 ? next : prev;
      });
    },
    [locked, padOpacity]
  );

  const handleBackspacePress = useCallback(() => {
    setPin((prev) => prev.slice(0, -1));
  }, []);

  return (
    <LinearGradient
      colors={[...DS_COLORS.gradient.stops]}
      style={styles.gradient}
    >
      <View
        style={[styles.container, { paddingTop: insets.top + DS_SPACING.xxl }]}
      >
        <View style={styles.header}>
          <Text style={styles.emoji}>🏃</Text>
          <Text style={styles.title}>CoachIQ</Text>
          <Text style={styles.subtitle}>
            {locked
              ? 'Too many attempts. Please see your coach.'
              : 'Enter your PIN to check in'}
          </Text>
        </View>

        <View style={styles.middle}>
          <PinDots length={4} filled={pin.length} error={pinError} />
          {errorMessage !== '' && (
            <Animated.Text
              entering={FadeIn.duration(DS_ANIMATION.duration.transition)}
              style={styles.errorText}
            >
              {errorMessage}
            </Animated.Text>
          )}
        </View>

        <Animated.View style={[styles.bottom, padAnimStyle]}>
          <PinPad
            onDigitPress={handleDigitPress}
            onBackspacePress={handleBackspacePress}
            disabled={locked || pin.length >= 4}
          />
          <View style={{ height: insets.bottom }} />
        </Animated.View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: DS_SPACING.xxl,
  },
  header: {
    alignItems: 'center',
    gap: DS_SPACING.sm,
  },
  emoji: {
    fontSize: 48,
  },
  title: {
    ...DS_TYPOGRAPHY.screenTitle,
    color: DS_COLORS.text.onGradient,
  },
  subtitle: {
    ...DS_TYPOGRAPHY.body,
    color: DS_COLORS.text.onGradient,
    opacity: 0.8,
  },
  middle: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: DS_SPACING.lg,
  },
  errorText: {
    ...DS_TYPOGRAPHY.body,
    color: DS_COLORS.text.onGradient,
  },
  bottom: {
    alignItems: 'center',
  },
});
