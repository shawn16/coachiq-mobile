import React from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import {
  DS_COLORS,
  DS_TYPOGRAPHY,
  DS_SPACING,
  DS_RADIUS,
  DS_COMPONENTS,
  DS_ANIMATION,
} from '@/constants/design-system';
import { useCheckIn } from '@/contexts/CheckInContext';

function formatDate(): string {
  const now = new Date();
  return now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function CheckInScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isWellnessComplete } = useCheckIn();
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
    <LinearGradient
      colors={[...DS_COLORS.gradient.stops]}
      style={styles.gradient}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {isWellnessComplete ? (
          /* ─── Completed state ─── */
          <>
            <View style={styles.iconCircle}>
              <MaterialIcons name="check" size={48} color={DS_COLORS.text.onGradient} />
            </View>
            <Text style={styles.title}>Check-in Complete</Text>
            <Text style={styles.date}>{formatDate()}</Text>
            <Text style={styles.subtitle}>Already submitted today</Text>
          </>
        ) : (
          /* ─── Not complete state ─── */
          <>
            <Text style={styles.emoji}>{'📋'}</Text>
            <Text style={styles.title}>Ready to Check In?</Text>
            <Text style={styles.subtitle}>
              Tell your coach how you{"'"}re feeling before practice
            </Text>
            <Pressable
              onPress={() => router.push('/wellness-checkin')}
              onPressIn={onPressIn}
              onPressOut={onPressOut}
            >
              <Animated.View
                style={[styles.button, { transform: [{ scale: scaleAnim }] }]}
              >
                <Text style={styles.buttonText}>Start Check-in</Text>
              </Animated.View>
            </Pressable>
          </>
        )}
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: DS_SPACING.xl,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: DS_RADIUS.full,
    backgroundColor: DS_COLORS.accent.green,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: DS_SPACING.xl,
  },
  emoji: {
    fontSize: 56,
    marginBottom: DS_SPACING.xl,
  },
  title: {
    ...DS_TYPOGRAPHY.screenTitle,
    color: DS_COLORS.text.onGradient,
    textAlign: 'center',
  },
  date: {
    ...DS_TYPOGRAPHY.body,
    color: DS_COLORS.text.onGradient,
    opacity: 0.75,
    marginTop: DS_SPACING.sm,
    textAlign: 'center',
  },
  subtitle: {
    ...DS_TYPOGRAPHY.body,
    color: DS_COLORS.text.onGradient,
    opacity: 0.7,
    marginTop: DS_SPACING.sm,
    textAlign: 'center',
  },
  button: {
    height: DS_COMPONENTS.submitButton.height,
    paddingHorizontal: DS_SPACING.massive,
    backgroundColor: DS_COLORS.text.onGradient,
    borderRadius: DS_COMPONENTS.submitButton.borderRadius,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: DS_SPACING.xxl,
  },
  buttonText: {
    ...DS_TYPOGRAPHY.buttonLabel,
    color: DS_COLORS.gradient.deepPurple,
  },
});
