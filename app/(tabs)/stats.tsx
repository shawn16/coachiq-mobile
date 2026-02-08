import React from 'react';
import { ScrollView, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  DS_COLORS,
  DS_TYPOGRAPHY,
  DS_SPACING,
  DS_ANIMATION,
} from '@/constants/design-system';
import PacingTrendCard from '@/components/stats/PacingTrendCard';
import PersonalRecordsCard from '@/components/stats/PersonalRecordsCard';
import RecentWorkoutsCard from '@/components/stats/RecentWorkoutsCard';
import WellnessTrendsCard from '@/components/stats/WellnessTrendsCard';
import {
  mockPacingTrend,
  mockPersonalRecords,
  mockRecentWorkouts,
  mockWellnessMetrics,
  mockWellnessComparison,
} from '@/mocks/stats';

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

export default function StatsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={[...DS_COLORS.gradient.stops]}
      style={[styles.gradient, { paddingTop: insets.top + DS_SPACING.xxl }]}
    >
      <Text style={styles.screenTitle}>My Stats</Text>
      <Text style={styles.screenSubtitle}>Your performance at a glance</Text>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + DS_SPACING.massive },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <FadeInCard index={0}>
          <PacingTrendCard data={mockPacingTrend} />
        </FadeInCard>
        <FadeInCard index={1}>
          <PersonalRecordsCard records={mockPersonalRecords} />
        </FadeInCard>
        <FadeInCard index={2}>
          <RecentWorkoutsCard workouts={mockRecentWorkouts} />
        </FadeInCard>
        <FadeInCard index={3}>
          <WellnessTrendsCard
            metrics={mockWellnessMetrics}
            comparison={mockWellnessComparison}
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
  screenTitle: {
    ...DS_TYPOGRAPHY.screenTitle,
    color: DS_COLORS.text.onGradient,
    paddingHorizontal: DS_SPACING.xl,
  },
  screenSubtitle: {
    ...DS_TYPOGRAPHY.body,
    color: DS_COLORS.text.onGradient,
    opacity: 0.75,
    paddingHorizontal: DS_SPACING.xl,
    marginTop: DS_SPACING.xs,
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
