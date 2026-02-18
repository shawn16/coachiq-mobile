import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { mockTeams, mockTeamRoster } from '@/mocks/coach';
import type { TeamRosterAthlete } from '@/types/coach';
import {
  DS_COLORS,
  DS_TYPOGRAPHY,
  DS_SPACING,
  DS_RADIUS,
  DS_SHADOWS,
} from '@/constants/design-system';

function AthleteCard({
  athlete,
  onMenu,
}: {
  athlete: TeamRosterAthlete;
  onMenu: () => void;
}) {
  return (
    <View style={styles.athleteCard}>
      <View style={styles.athleteInfo}>
        <View style={styles.athleteNameRow}>
          <Text style={styles.athleteName}>
            {athlete.firstName} {athlete.lastName}
          </Text>
          {athlete.grade && (
            <View style={styles.gradeBadge}>
              <Text style={styles.gradeBadgeText}>{athlete.grade}th grade</Text>
            </View>
          )}
        </View>
        <View style={styles.statusRow}>
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor:
                  athlete.status === 'active'
                    ? DS_COLORS.status.success
                    : DS_COLORS.status.warning,
              },
            ]}
          />
          <Text
            style={[
              styles.statusText,
              {
                color:
                  athlete.status === 'active'
                    ? DS_COLORS.status.success
                    : DS_COLORS.status.warning,
              },
            ]}
          >
            {athlete.status === 'active' ? 'Active' : 'Pending'}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        onPress={onMenu}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Ionicons name="ellipsis-horizontal" size={20} color={DS_COLORS.text.tertiary} />
      </TouchableOpacity>
    </View>
  );
}

export default function TeamDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [isLoading, setIsLoading] = useState(true);
  const [roster, setRoster] = useState<TeamRosterAthlete[]>([]);
  const [selectedAthlete, setSelectedAthlete] = useState<TeamRosterAthlete | null>(null);
  const [athleteMenuVisible, setAthleteMenuVisible] = useState(false);
  const [teamMenuVisible, setTeamMenuVisible] = useState(false);

  const team = mockTeams.find((t) => t.id === id);

  useEffect(() => {
    const timer = setTimeout(() => {
      // Sort: active first (alpha by lastName), then pending (alpha by lastName)
      const sorted = [...mockTeamRoster].sort((a, b) => {
        if (a.status !== b.status) return a.status === 'active' ? -1 : 1;
        return a.lastName.localeCompare(b.lastName);
      });
      setRoster(sorted);
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const handleResetPin = (athlete: TeamRosterAthlete) => {
    setAthleteMenuVisible(false);
    Alert.alert(
      'Reset PIN',
      `Reset ${athlete.firstName} ${athlete.lastName}'s PIN? They will need to set a new one to access the app.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setRoster((prev) =>
              prev.map((a) =>
                a.id === athlete.id ? { ...a, status: 'pending' as const, hasPinSet: false } : a
              )
            );
          },
        },
      ]
    );
  };

  const handleRemoveAthlete = (athlete: TeamRosterAthlete) => {
    setAthleteMenuVisible(false);
    Alert.alert(
      'Remove Athlete',
      `Remove ${athlete.firstName} ${athlete.lastName} from ${team?.name ?? 'the team'}? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setRoster((prev) => prev.filter((a) => a.id !== athlete.id));
          },
        },
      ]
    );
  };

  const pendingCount = roster.filter((a) => a.status === 'pending').length;

  return (
    <LinearGradient
      colors={[...DS_COLORS.gradient.stops]}
      style={[styles.gradient, { paddingTop: insets.top + DS_SPACING.md }]}
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={28} color={DS_COLORS.text.onGradient} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {team?.name ?? 'Team'}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setTeamMenuVisible(true);
          }}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={styles.menuButton}
        >
          <Ionicons name="ellipsis-horizontal" size={24} color={DS_COLORS.text.onGradient} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
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
          {/* Add Athletes button */}
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push({
                pathname: '/(coach)/add-members/[teamId]',
                params: { teamId: id, accessCode: team?.accessCode ?? '' },
              });
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="add-circle-outline" size={22} color={DS_COLORS.text.onGradient} />
            <Text style={styles.addButtonText}>Add Athletes</Text>
          </TouchableOpacity>

          {/* Roster */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Athletes ({roster.length})
            </Text>
            {pendingCount > 0 && (
              <Text style={styles.pendingLabel}>{pendingCount} pending</Text>
            )}
          </View>

          {roster.map((athlete) => (
            <AthleteCard
              key={athlete.id}
              athlete={athlete}
              onMenu={() => {
                setSelectedAthlete(athlete);
                setAthleteMenuVisible(true);
              }}
            />
          ))}
        </ScrollView>
      )}

      {/* Athlete Action Sheet */}
      <Modal
        visible={athleteMenuVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setAthleteMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setAthleteMenuVisible(false)}
        >
          <View style={[styles.modalContent, { paddingBottom: insets.bottom + DS_SPACING.xxl }]}>
            <View style={styles.modalHandle} />
            {selectedAthlete && (
              <>
                <Text style={styles.modalTitle}>
                  {selectedAthlete.firstName} {selectedAthlete.lastName}
                </Text>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => handleResetPin(selectedAthlete)}
                >
                  <Ionicons name="key-outline" size={20} color={DS_COLORS.text.primary} />
                  <Text style={styles.menuItemText}>Reset PIN</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => handleRemoveAthlete(selectedAthlete)}
                >
                  <Ionicons name="trash-outline" size={20} color={DS_COLORS.status.error} />
                  <Text style={[styles.menuItemText, { color: DS_COLORS.status.error }]}>
                    Remove from Team
                  </Text>
                </TouchableOpacity>
              </>
            )}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setAthleteMenuVisible(false)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Team Action Sheet */}
      <Modal
        visible={teamMenuVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setTeamMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setTeamMenuVisible(false)}
        >
          <View style={[styles.modalContent, { paddingBottom: insets.bottom + DS_SPACING.xxl }]}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>{team?.name ?? 'Team'}</Text>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setTeamMenuVisible(false);
                router.push({
                  pathname: '/(coach)/add-members/[teamId]',
                  params: { teamId: id, accessCode: team?.accessCode ?? '' },
                });
              }}
            >
              <Ionicons name="share-outline" size={20} color={DS_COLORS.text.primary} />
              <Text style={styles.menuItemText}>Share Access Code</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setTeamMenuVisible(false);
                Alert.alert(
                  'Team Info',
                  `${team?.name}\n${team?.schoolName}\n${team?.season} ${team?.year}`
                );
              }}
            >
              <Ionicons
                name="information-circle-outline"
                size={20}
                color={DS_COLORS.text.primary}
              />
              <Text style={styles.menuItemText}>Team Info</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setTeamMenuVisible(false)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
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
    alignItems: 'center',
    paddingHorizontal: DS_SPACING.sm,
    marginBottom: DS_SPACING.lg,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    ...DS_TYPOGRAPHY.questionTitle,
    color: DS_COLORS.text.onGradient,
  },
  menuButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: DS_SPACING.xl,
    gap: DS_SPACING.sm,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: DS_SPACING.sm,
    backgroundColor: DS_COLORS.accent.green,
    borderRadius: DS_RADIUS.lg,
    paddingVertical: DS_SPACING.lg,
    marginBottom: DS_SPACING.md,
    ...DS_SHADOWS.card,
  },
  addButtonText: {
    ...DS_TYPOGRAPHY.buttonLabelSmall,
    color: DS_COLORS.text.onGradient,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DS_SPACING.xs,
  },
  sectionTitle: {
    ...DS_TYPOGRAPHY.sectionLabel,
    color: DS_COLORS.text.onGradient,
  },
  pendingLabel: {
    ...DS_TYPOGRAPHY.helperText,
    color: DS_COLORS.status.warning,
  },
  athleteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DS_COLORS.surface.card,
    borderRadius: DS_RADIUS.md,
    padding: DS_SPACING.lg,
    ...DS_SHADOWS.card,
  },
  athleteInfo: {
    flex: 1,
  },
  athleteNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DS_SPACING.sm,
  },
  athleteName: {
    ...DS_TYPOGRAPHY.cardTitle,
    color: DS_COLORS.text.primary,
  },
  gradeBadge: {
    backgroundColor: DS_COLORS.surface.background,
    paddingHorizontal: DS_SPACING.sm,
    paddingVertical: DS_SPACING.xxs,
    borderRadius: DS_RADIUS.xs,
  },
  gradeBadgeText: {
    ...DS_TYPOGRAPHY.helperText,
    color: DS_COLORS.text.secondary,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DS_SPACING.xs,
    marginTop: DS_SPACING.xs,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    ...DS_TYPOGRAPHY.helperText,
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
    ...DS_TYPOGRAPHY.questionTitle,
    color: DS_COLORS.text.primary,
    marginBottom: DS_SPACING.lg,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DS_SPACING.md,
    paddingVertical: DS_SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: DS_COLORS.border.light,
  },
  menuItemText: {
    ...DS_TYPOGRAPHY.bodyMedium,
    color: DS_COLORS.text.primary,
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: DS_SPACING.lg,
    marginTop: DS_SPACING.md,
    backgroundColor: DS_COLORS.surface.background,
    borderRadius: DS_RADIUS.md,
  },
  cancelText: {
    ...DS_TYPOGRAPHY.buttonLabelSmall,
    color: DS_COLORS.text.secondary,
  },
});
