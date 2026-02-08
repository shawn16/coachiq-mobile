import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  DS_COLORS,
  DS_TYPOGRAPHY,
  DS_SPACING,
  DS_COMPONENTS,
} from '@/constants/design-system';
import { INITIAL_RPE_FORM_DATA } from '@/types/rpe';
import type { RPEFormData } from '@/types/rpe';
import { submitRPE } from '@/mocks/rpe';
import { mockTodaysWorkout } from '@/mocks/dashboard';
import { useCheckIn } from '@/contexts/CheckInContext';

import RPEScale from '@/components/rpe/RPEScale';
import WorkoutReferenceCard from '@/components/rpe/WorkoutReferenceCard';
import CoachNotes from '@/components/wellness/CoachNotes';
import SubmitButton from '@/components/wellness/SubmitButton';

function formatDate(): string {
  const now = new Date();
  return now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function isFormValid(form: RPEFormData): boolean {
  return (
    form.rpeOverall !== null &&
    form.rpeLegs !== null &&
    form.rpeBreathing !== null
  );
}

export default function RPESubmissionScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { markRPEComplete } = useCheckIn();
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState<RPEFormData>({ ...INITIAL_RPE_FORM_DATA });

  const valid = useMemo(() => isFormValid(form), [form]);

  const updateField = <K extends keyof RPEFormData>(
    key: K,
    value: RPEFormData[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!valid || submitting) return;
    setSubmitting(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    await submitRPE(form, mockTodaysWorkout.name);
    markRPEComplete();
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <LinearGradient
        colors={[...DS_COLORS.gradient.stops]}
        style={styles.flex}
      >
        {/* Header on gradient */}
        <View style={[styles.header, { paddingTop: insets.top + DS_SPACING.lg }]}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backChevron}>{'‹'}</Text>
          </Pressable>
          <Text style={styles.headerTitle}>{'🏋️'} Post-Workout RPE</Text>
          <Text style={styles.headerDate}>{formatDate()}</Text>
          <Text style={styles.headerSubtitle}>Rate today{"'"}s effort</Text>

          {/* Athlete name pill */}
          <View style={styles.pill}>
            <Text style={styles.pillName}>Shawn Siemers</Text>
            <View style={styles.pillBadge}>
              <View style={styles.greenDot} />
              <Text style={styles.pillGroup}>Distance</Text>
            </View>
          </View>
        </View>

        {/* White content card */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.contentArea,
            { paddingBottom: insets.bottom + DS_SPACING.massive },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* 1. Workout Reference */}
          <WorkoutReferenceCard workout={mockTodaysWorkout} />

          <View style={styles.sectionSpacer} />

          {/* 2. Overall RPE */}
          <RPEScale
            question="How hard did that feel overall?"
            selectedValue={form.rpeOverall}
            onSelect={(v) => updateField('rpeOverall', v)}
            showLabel
            leftAnchor="Easy"
            rightAnchor="Max"
          />

          <View style={styles.sectionSpacer} />

          {/* 3. Legs RPE */}
          <RPEScale
            question="How do your legs feel right now?"
            selectedValue={form.rpeLegs}
            onSelect={(v) => updateField('rpeLegs', v)}
            leftAnchor="Fresh"
            rightAnchor="Dead"
          />

          <View style={styles.sectionSpacer} />

          {/* 4. Breathing RPE */}
          <RPEScale
            question="How's your breathing?"
            selectedValue={form.rpeBreathing}
            onSelect={(v) => updateField('rpeBreathing', v)}
            leftAnchor="Easy"
            rightAnchor="Gasping"
          />

          <View style={styles.sectionSpacer} />

          {/* 5. Notes */}
          <CoachNotes
            value={form.notes}
            onChangeText={(v) => updateField('notes', v)}
            title="📝 Anything to note?"
            placeholder="How the workout went, any pain during reps, etc..."
          />

          <View style={styles.sectionSpacer} />

          {/* Submit */}
          <SubmitButton
            disabled={!valid || submitting}
            onPress={handleSubmit}
            label="✅ Submit RPE"
          />
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  header: {
    paddingHorizontal: DS_SPACING.xl,
    paddingBottom: DS_SPACING.xxl + 20,
  },
  backButton: {
    marginBottom: DS_SPACING.md,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backChevron: {
    fontSize: 32,
    color: DS_COLORS.text.onGradient,
    fontWeight: '300',
    marginTop: -4,
  },
  headerTitle: {
    ...DS_TYPOGRAPHY.screenTitle,
    color: DS_COLORS.text.onGradient,
  },
  headerDate: {
    ...DS_TYPOGRAPHY.body,
    color: DS_COLORS.text.onGradient,
    opacity: 0.75,
    marginTop: DS_SPACING.xs,
  },
  headerSubtitle: {
    ...DS_TYPOGRAPHY.screenSubtitle,
    color: DS_COLORS.text.onGradient,
    opacity: 0.9,
    marginTop: DS_SPACING.sm,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: DS_COMPONENTS.banner.height,
    borderRadius: DS_COMPONENTS.banner.borderRadius,
    backgroundColor: DS_COMPONENTS.banner.backgroundColor,
    paddingHorizontal: DS_COMPONENTS.banner.paddingHorizontal,
    marginTop: DS_SPACING.lg,
  },
  pillName: {
    ...DS_TYPOGRAPHY.bannerName,
    color: DS_COLORS.text.onGradient,
  },
  pillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DS_SPACING.xs,
  },
  greenDot: {
    width: DS_COMPONENTS.banner.statusDotSize,
    height: DS_COMPONENTS.banner.statusDotSize,
    borderRadius: DS_COMPONENTS.banner.statusDotSize / 2,
    backgroundColor: DS_COLORS.accent.greenDot,
  },
  pillGroup: {
    ...DS_TYPOGRAPHY.bannerDetail,
    color: DS_COLORS.text.onGradient,
  },
  scrollView: {
    flex: 1,
  },
  contentArea: {
    backgroundColor: DS_COLORS.surface.background,
    borderTopLeftRadius: DS_COMPONENTS.contentArea.borderTopLeftRadius,
    borderTopRightRadius: DS_COMPONENTS.contentArea.borderTopRightRadius,
    marginTop: DS_COMPONENTS.contentArea.marginTop,
    paddingTop: DS_COMPONENTS.contentArea.paddingTop,
    paddingHorizontal: DS_COMPONENTS.contentArea.paddingHorizontal,
  },
  sectionSpacer: {
    height: DS_COMPONENTS.questionSection.sectionGap,
  },
});
