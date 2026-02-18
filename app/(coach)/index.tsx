import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/contexts/AuthContext';
import { mockTeams } from '@/mocks/coach';
import type { TeamSummary } from '@/types/coach';
import {
  DS_COLORS,
  DS_TYPOGRAPHY,
  DS_SPACING,
  DS_RADIUS,
  DS_SHADOWS,
  DS_ANIMATION,
} from '@/constants/design-system';

function FadeInCard({ index, children }: { index: number; children: React.ReactNode }) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- stable refs, run once
  }, [index]);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  );
}

function TeamCard({ team, onPress }: { team: TeamSummary; onPress: () => void }) {
  const scale = useRef(new Animated.Value(1)).current;

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
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.teamCard}
      >
        <View style={styles.teamCardHeader}>
          <Text style={styles.teamName}>{team.name}</Text>
          <Ionicons name="chevron-forward" size={18} color={DS_COLORS.text.tertiary} />
        </View>
        <Text style={styles.schoolName}>{team.schoolName}</Text>
        <View style={styles.teamMeta}>
          <View style={styles.badge}>
            <Ionicons name="people-outline" size={14} color={DS_COLORS.text.secondary} />
            <Text style={styles.badgeText}>{team.athleteCount} athletes</Text>
          </View>
          {team.pendingCount > 0 && (
            <View style={[styles.badge, styles.pendingBadge]}>
              <View style={styles.pendingDot} />
              <Text style={styles.pendingBadgeText}>
                {team.pendingCount} pending
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function CoachHomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const auth = useAuth();

  const [settingsVisible, setSettingsVisible] = useState(false);
  const [isLoadingTeams, setIsLoadingTeams] = useState(true);
  const [teams, setTeams] = useState<TeamSummary[]>([]);

  useEffect(() => {
    // Simulate API loading, use mock data for now
    const timer = setTimeout(() => {
      setTeams(mockTeams);
      setIsLoadingTeams(false);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  const handleLogout = () => {
    setSettingsVisible(false);
    auth.logout();
  };

  return (
    <LinearGradient
      colors={[...DS_COLORS.gradient.stops]}
      style={[styles.gradient, { paddingTop: insets.top + DS_SPACING.xxl }]}
    >
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.screenTitle}>My Teams</Text>
          {auth.coach && (
            <Text style={styles.coachName}>Coach {auth.coach.lastName}</Text>
          )}
        </View>
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setSettingsVisible(true);
          }}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="settings-outline" size={24} color={DS_COLORS.text.onGradient} />
        </TouchableOpacity>
      </View>

      {isLoadingTeams ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      ) : teams.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={48} color="rgba(255,255,255,0.5)" />
          <Text style={styles.emptyText}>No teams yet</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + DS_SPACING.massive },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {teams.map((team, index) => (
            <FadeInCard key={team.id} index={index}>
              <TeamCard
                team={team}
                onPress={() => router.push(`/(coach)/team/${team.id}`)}
              />
            </FadeInCard>
          ))}
        </ScrollView>
      )}

      {/* Settings Modal */}
      <Modal
        visible={settingsVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setSettingsVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: insets.bottom + DS_SPACING.xxl }]}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Settings</Text>

            {auth.coach && (
              <View style={styles.profileSection}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarText}>
                    {auth.coach.firstName[0]}{auth.coach.lastName[0]}
                  </Text>
                </View>
                <View style={styles.profileInfo}>
                  <Text style={styles.profileName}>
                    {auth.coach.firstName} {auth.coach.lastName}
                  </Text>
                  <Text style={styles.profileEmail}>{auth.coach.email}</Text>
                </View>
              </View>
            )}

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={20} color={DS_COLORS.status.error} />
              <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSettingsVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: DS_SPACING.xl,
    marginBottom: DS_SPACING.xl,
  },
  screenTitle: {
    ...DS_TYPOGRAPHY.screenTitle,
    color: DS_COLORS.text.onGradient,
  },
  coachName: {
    ...DS_TYPOGRAPHY.screenSubtitle,
    color: DS_COLORS.text.onGradient,
    opacity: 0.75,
    marginTop: DS_SPACING.xxs,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: DS_SPACING.md,
  },
  emptyText: {
    ...DS_TYPOGRAPHY.body,
    color: DS_COLORS.text.onGradient,
    opacity: 0.6,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: DS_SPACING.xl,
    gap: DS_SPACING.md,
  },
  teamCard: {
    backgroundColor: DS_COLORS.surface.card,
    borderRadius: DS_RADIUS.lg,
    padding: DS_SPACING.xl,
    ...DS_SHADOWS.card,
  },
  teamCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  teamName: {
    ...DS_TYPOGRAPHY.questionTitle,
    color: DS_COLORS.text.primary,
    flex: 1,
  },
  schoolName: {
    ...DS_TYPOGRAPHY.caption,
    color: DS_COLORS.text.secondary,
    marginTop: DS_SPACING.xxs,
  },
  teamMeta: {
    flexDirection: 'row',
    marginTop: DS_SPACING.md,
    gap: DS_SPACING.sm,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DS_SPACING.xs,
    backgroundColor: DS_COLORS.surface.background,
    paddingHorizontal: DS_SPACING.sm,
    paddingVertical: DS_SPACING.xs,
    borderRadius: DS_RADIUS.pill,
  },
  badgeText: {
    ...DS_TYPOGRAPHY.helperText,
    color: DS_COLORS.text.secondary,
  },
  pendingBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  pendingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: DS_COLORS.status.warning,
  },
  pendingBadgeText: {
    ...DS_TYPOGRAPHY.helperText,
    color: DS_COLORS.status.warning,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: DS_COLORS.surface.card,
    borderTopLeftRadius: DS_RADIUS.xl,
    borderTopRightRadius: DS_RADIUS.xl,
    padding: DS_SPACING.xxl,
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: DS_COLORS.border.light,
    alignSelf: 'center',
    marginBottom: DS_SPACING.xl,
  },
  modalTitle: {
    ...DS_TYPOGRAPHY.screenTitle,
    color: DS_COLORS.text.primary,
    marginBottom: DS_SPACING.xxl,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: DS_SPACING.xxl,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: DS_COLORS.gradient.deepPurple,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: DS_SPACING.md,
  },
  avatarText: {
    ...DS_TYPOGRAPHY.buttonLabel,
    color: DS_COLORS.text.onGradient,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    ...DS_TYPOGRAPHY.bodySemiBold,
    color: DS_COLORS.text.primary,
  },
  profileEmail: {
    ...DS_TYPOGRAPHY.caption,
    color: DS_COLORS.text.secondary,
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DS_SPACING.sm,
    paddingVertical: DS_SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: DS_COLORS.border.light,
  },
  logoutText: {
    ...DS_TYPOGRAPHY.bodyMedium,
    color: DS_COLORS.status.error,
  },
  closeButton: {
    alignItems: 'center',
    paddingVertical: DS_SPACING.lg,
    marginTop: DS_SPACING.sm,
    backgroundColor: DS_COLORS.surface.background,
    borderRadius: DS_RADIUS.md,
  },
  closeButtonText: {
    ...DS_TYPOGRAPHY.buttonLabelSmall,
    color: DS_COLORS.text.secondary,
  },
});
