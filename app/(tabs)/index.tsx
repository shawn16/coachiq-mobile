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
import DashboardHeader from '@/components/home/DashboardHeader';
import ActionNeededCard from '@/components/home/ActionNeededCard';
import AllCaughtUpCard from '@/components/home/AllCaughtUpCard';
import TodaysWorkoutCard from '@/components/home/TodaysWorkoutCard';
import MyWeekCard from '@/components/home/MyWeekCard';
import RecentPRCard from '@/components/home/RecentPRCard';
import {
  mockAthlete,
  mockTodaysWorkout,
  mockWeekStats,
  mockRecentPR,
} from '@/mocks/dashboard';

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

function formatDate(): string {
  const now = new Date();
  return now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { nextPendingAction, cycleDevState } = useCheckIn();

  const handleActionPress = () => {
    if (!nextPendingAction) return;
    if (nextPendingAction.type === 'rpe') {
      router.push('/rpe-submission');
    } else {
      router.push('/wellness-checkin');
    }
  };

  return (
    <LinearGradient
      colors={[...DS_COLORS.gradient.stops]}
      style={[styles.gradient, { paddingTop: insets.top + DS_SPACING.xxl }]}
    >
      <DashboardHeader
        firstName={mockAthlete.firstName}
        initials={mockAthlete.initials}
        dateString={formatDate()}
        onAvatarLongPress={cycleDevState}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + DS_SPACING.massive },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <FadeInCard index={0}>
          {nextPendingAction ? (
            <ActionNeededCard
              action={nextPendingAction}
              onPress={handleActionPress}
            />
          ) : (
            <AllCaughtUpCard />
          )}
        </FadeInCard>
        <FadeInCard index={1}>
          <TodaysWorkoutCard workout={mockTodaysWorkout} />
        </FadeInCard>
        <FadeInCard index={2}>
          <MyWeekCard stats={mockWeekStats} />
        </FadeInCard>
        <FadeInCard index={3}>
          <RecentPRCard pr={mockRecentPR} />
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
