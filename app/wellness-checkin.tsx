import React, { useState, useRef, useMemo } from 'react';
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
import {
  INITIAL_FORM_DATA,
  SORENESS_AREAS,
  ILLNESS_SYMPTOMS,
} from '@/types/wellness';
import type { WellnessFormData } from '@/types/wellness';
import { submitWellnessCheckIn } from '@/mocks/wellness';
import { useCheckIn } from '@/contexts/CheckInContext';

import ProgressBar from '@/components/wellness/ProgressBar';
import EmojiScale from '@/components/wellness/EmojiScale';
import SleepSlider from '@/components/wellness/SleepSlider';
import FoodTimingGrid from '@/components/wellness/FoodTimingGrid';
import ChipGroup from '@/components/wellness/ChipGroup';
import CoachNotes from '@/components/wellness/CoachNotes';
import SubmitButton from '@/components/wellness/SubmitButton';

const EMOJI_VALUES = [2, 4, 6, 8, 10] as const;

function formatDate(): string {
  const now = new Date();
  return now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function computeProgress(form: WellnessFormData): number {
  let count = 1; // Sleep always counts (has default)
  if (form.hydration !== null) count++;
  if (form.energy !== null) count++;
  if (form.motivation !== null) count++;
  if (form.foodTiming !== null) count++;
  if (form.focus !== null) count++;
  if (form.sorenessAreas.length > 0) count++;
  if (form.illnessSymptoms.length > 0) count++;
  if (form.notes.trim().length > 0) count++;
  return count;
}

function isFormValid(form: WellnessFormData): boolean {
  return (
    form.hydration !== null &&
    form.energy !== null &&
    form.motivation !== null &&
    form.foodTiming !== null &&
    form.focus !== null
  );
}

export default function WellnessCheckInScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { markWellnessComplete } = useCheckIn();
  const scrollRef = useRef<ScrollView>(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState<WellnessFormData>({ ...INITIAL_FORM_DATA });

  const progress = useMemo(() => computeProgress(form), [form]);
  const valid = useMemo(() => isFormValid(form), [form]);

  const updateField = <K extends keyof WellnessFormData>(
    key: K,
    value: WellnessFormData[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!valid || submitting) return;
    setSubmitting(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    await submitWellnessCheckIn(form);
    markWellnessComplete();
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
          <Text style={styles.headerTitle}>{'📋'} Pre-Practice Check-in</Text>
          <Text style={styles.headerDate}>{formatDate()}</Text>
          <Text style={styles.headerSubtitle}>How are you feeling today?</Text>

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
          ref={scrollRef}
          style={styles.scrollView}
          contentContainerStyle={[
            styles.contentArea,
            { paddingBottom: insets.bottom + DS_SPACING.massive },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <ProgressBar completed={progress} total={9} />

          {/* 1. Sleep */}
          <SleepSlider
            value={form.sleepHours}
            onValueChange={(v) => updateField('sleepHours', v)}
          />

          <View style={styles.sectionSpacer} />

          {/* 2. Hydration */}
          <EmojiScale
            icon="🥤"
            question="Hydration"
            emojis={['😵', '😟', '😐', '😊', '💧']}
            values={EMOJI_VALUES}
            leftLabel="Dehydrated"
            rightLabel="Well Hydrated"
            selectedValue={form.hydration}
            onSelect={(v) => updateField('hydration', v)}
          />

          <View style={styles.sectionSpacer} />

          {/* 3. Energy */}
          <EmojiScale
            icon="⚡"
            question="Energy"
            emojis={['😫', '😟', '😐', '😊', '🔥']}
            values={EMOJI_VALUES}
            leftLabel="Exhausted"
            rightLabel="Energized"
            selectedValue={form.energy}
            onSelect={(v) => updateField('energy', v)}
          />

          <View style={styles.sectionSpacer} />

          {/* 4. Motivation */}
          <EmojiScale
            icon="💪"
            question="Motivation"
            emojis={['😩', '😟', '😐', '😊', '🚀']}
            values={EMOJI_VALUES}
            leftLabel="Not Motivated"
            rightLabel="Very Motivated"
            selectedValue={form.motivation}
            onSelect={(v) => updateField('motivation', v)}
          />

          <View style={styles.sectionSpacer} />

          {/* 5. Food Timing */}
          <FoodTimingGrid
            selectedId={form.foodTiming}
            onSelect={(v) => updateField('foodTiming', v)}
          />

          <View style={styles.sectionSpacer} />

          {/* 6. Focus */}
          <EmojiScale
            icon="🧠"
            question="Focus"
            emojis={['😵', '😟', '😐', '😊', '🎯']}
            values={EMOJI_VALUES}
            leftLabel="Distracted"
            rightLabel="Laser Focused"
            selectedValue={form.focus}
            onSelect={(v) => updateField('focus', v)}
          />

          <View style={styles.sectionSpacer} />

          {/* 7. Soreness */}
          <ChipGroup
            icon="🦵"
            question="Soreness"
            options={SORENESS_AREAS}
            feelsFineOption="Feels fine"
            selected={form.sorenessAreas}
            onToggle={(v) => updateField('sorenessAreas', v)}
          />

          <View style={styles.sectionSpacer} />

          {/* 8. Illness */}
          <ChipGroup
            icon="🤒"
            question="Illness"
            options={ILLNESS_SYMPTOMS}
            feelsFineOption="Feels fine"
            selected={form.illnessSymptoms}
            onToggle={(v) => updateField('illnessSymptoms', v)}
          />

          <View style={styles.sectionSpacer} />

          {/* 9. Coach Notes */}
          <CoachNotes
            value={form.notes}
            onChangeText={(v) => updateField('notes', v)}
          />

          <View style={styles.sectionSpacer} />

          {/* Submit */}
          <SubmitButton disabled={!valid || submitting} onPress={handleSubmit} />
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
    paddingBottom: DS_SPACING.xxl + 20, // extra space for content overlap
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
