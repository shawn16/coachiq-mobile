import React from 'react';
import { ScrollView, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  DS_COLORS,
  DS_SPACING,
  DS_ANIMATION,
} from '@/constants/design-system';
import { useCheckIn } from '@/contexts/CheckInContext';
import { mockTodaysWorkout } from '@/mocks/dashboard';
import CheckInHeader from '@/components/checkin/CheckInHeader';
import WellnessCheckInCard from '@/components/checkin/WellnessCheckInCard';
import RPECard from '@/components/checkin/RPECard';
import StatusSummaryCard from '@/components/checkin/StatusSummaryCard';

function FadeInCard({ index, children }: { index: number; children: React.ReactNode }) {
  const opacity = React.useRef(new Animated.Value(0)).current;
  const translateY = React.useRef(new Animated.Value(16)).current;

  React.useEffect(() => {
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

export default function CheckInScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    isWellnessComplete,
    isRPEComplete,
    isRPEAvailable,
    cycleDevState,
  } = useCheckIn();

  const rpeStatus: 'complete' | 'pending' | 'waiting' = isRPEComplete
    ? 'complete'
    : isRPEAvailable
      ? 'pending'
      : 'waiting';

  return (
    <LinearGradient
      colors={[...DS_COLORS.gradient.stops]}
      style={[styles.gradient, { paddingTop: insets.top + DS_SPACING.xxl }]}
    >
      <CheckInHeader onTitleLongPress={cycleDevState} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + DS_SPACING.massive },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <FadeInCard index={0}>
          <WellnessCheckInCard
            isComplete={isWellnessComplete}
            onStartPress={() => router.push('/wellness-checkin')}
          />
        </FadeInCard>
        <FadeInCard index={1}>
          <RPECard
            status={rpeStatus}
            workoutName={`${mockTodaysWorkout.structure}`}
            onStartPress={() => router.push('/rpe-submission')}
          />
        </FadeInCard>
        <FadeInCard index={2}>
          <StatusSummaryCard
            wellnessComplete={isWellnessComplete}
            rpeComplete={isRPEComplete}
          />
        </FadeInCard>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: DS_SPACING.xl,
    paddingTop: DS_SPACING.xl,
    gap: DS_SPACING.lg,
  },
});
