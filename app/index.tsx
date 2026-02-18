import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Redirect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import ApexLogo from '@/components/ApexLogo';
import { useAuth } from '@/contexts/AuthContext';
import {
  DS_COLORS,
  DS_TYPOGRAPHY,
  DS_SPACING,
  DS_RADIUS,
  DS_SHADOWS,
  DS_ANIMATION,
} from '@/constants/design-system';

function RoleCard({
  icon,
  title,
  subtitle,
  onPress,
  index,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
  index: number;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    const delay = 400 + index * 150;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- stable refs, run once
  }, [index]);

  const handlePressIn = () => {
    Animated.timing(scale, {
      toValue: DS_ANIMATION.pressedScale,
      duration: DS_ANIMATION.duration.press,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(scale, {
      toValue: 1,
      duration: DS_ANIMATION.duration.press,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }, { scale }] }}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.roleCard}
      >
        <View style={styles.roleIconContainer}>
          <Ionicons name={icon} size={28} color={DS_COLORS.gradient.deepPurple} />
        </View>
        <View style={styles.roleTextContainer}>
          <Text style={styles.roleTitle}>{title}</Text>
          <Text style={styles.roleSubtitle}>{subtitle}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={DS_COLORS.text.tertiary} />
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function LandingScreen() {
  const { isLoading, role } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(logoScale, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- stable refs, run once
  }, []);

  if (isLoading) {
    return (
      <LinearGradient colors={[...DS_COLORS.gradient.stops]} style={styles.gradient}>
        <View style={styles.loadingContainer}>
          <ApexLogo size={120} />
          <ActivityIndicator size="large" color="#FFFFFF" style={{ marginTop: DS_SPACING.xxl }} />
        </View>
      </LinearGradient>
    );
  }

  if (role === 'coach') return <Redirect href="/(coach)" />;
  if (role === 'athlete') return <Redirect href="/(tabs)" />;

  return (
    <LinearGradient
      colors={[...DS_COLORS.gradient.stops]}
      style={[styles.gradient, { paddingTop: insets.top }]}
    >
      <View style={styles.content}>
        <Animated.View
          style={[styles.logoArea, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}
        >
          <ApexLogo size={120} />
          <Text style={styles.appName}>CoachIQ</Text>
          <Text style={styles.tagline}>Track. Perform. Excel.</Text>
        </Animated.View>

        <View style={styles.cardsArea}>
          <RoleCard
            icon="clipboard-outline"
            title="I'm a Coach"
            subtitle="Sign in to manage your team"
            onPress={() => router.push('/(coach-auth)/login')}
            index={0}
          />
          <RoleCard
            icon="person-outline"
            title="I'm an Athlete"
            subtitle="Join your team"
            onPress={() => router.push('/(auth)')}
            index={1}
          />
        </View>

        <Text style={[styles.version, { marginBottom: insets.bottom + DS_SPACING.lg }]}>
          v1.0
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: DS_SPACING.xxl,
  },
  logoArea: {
    alignItems: 'center',
    marginTop: 80,
  },
  appName: {
    ...DS_TYPOGRAPHY.screenTitle,
    fontSize: 36,
    lineHeight: 44,
    color: DS_COLORS.text.onGradient,
    marginTop: DS_SPACING.lg,
  },
  tagline: {
    ...DS_TYPOGRAPHY.screenSubtitle,
    color: DS_COLORS.text.onGradient,
    opacity: 0.75,
    marginTop: DS_SPACING.sm,
  },
  cardsArea: {
    width: '100%',
    gap: DS_SPACING.md,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DS_COLORS.surface.card,
    borderRadius: DS_RADIUS.lg,
    padding: DS_SPACING.xl,
    ...DS_SHADOWS.card,
  },
  roleIconContainer: {
    width: 48,
    height: 48,
    borderRadius: DS_RADIUS.md,
    backgroundColor: 'rgba(123, 47, 247, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: DS_SPACING.lg,
  },
  roleTextContainer: {
    flex: 1,
  },
  roleTitle: {
    ...DS_TYPOGRAPHY.questionTitle,
    color: DS_COLORS.text.primary,
  },
  roleSubtitle: {
    ...DS_TYPOGRAPHY.caption,
    color: DS_COLORS.text.secondary,
    marginTop: 2,
  },
  version: {
    ...DS_TYPOGRAPHY.helperText,
    color: DS_COLORS.text.onGradient,
    opacity: 0.5,
  },
});
