import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import PinDots from '@/components/PinDots';
import PinPad from '@/components/PinPad';
import ApexLogo from '@/components/ApexLogo';
import {
  DS_COLORS,
  DS_TYPOGRAPHY,
  DS_SPACING,
} from '@/constants/design-system';

export default function PinLoginScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [pin, setPin] = useState('');

  const handleDigitPress = useCallback(
    (digit: string) => {
      setPin((prev) => {
        const next = prev + digit;
        if (next.length === 4) {
          // Brief delay so athlete sees all 4 dots filled before transitioning
          setTimeout(() => {
            router.replace('/(tabs)');
          }, 300);
        }
        return next.length <= 4 ? next : prev;
      });
    },
    [router]
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
          <ApexLogo size={72} />
          <Text style={styles.title}>CoachIQ</Text>
          <Text style={styles.subtitle}>Enter your PIN to check in</Text>
        </View>

        <View style={styles.middle}>
          <PinDots length={4} filled={pin.length} error={false} />
        </View>

        <View style={styles.bottom}>
          <PinPad
            onDigitPress={handleDigitPress}
            onBackspacePress={handleBackspacePress}
            disabled={pin.length >= 4}
          />
          <View style={{ height: insets.bottom }} />
        </View>
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
  bottom: {
    alignItems: 'center',
  },
});
