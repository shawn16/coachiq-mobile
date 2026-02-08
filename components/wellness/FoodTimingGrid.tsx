import React from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  DS_COLORS,
  DS_TYPOGRAPHY,
  DS_SPACING,
  DS_COMPONENTS,
  DS_ANIMATION,
} from '@/constants/design-system';
import { FOOD_TIMING_OPTIONS } from '@/types/wellness';

interface FoodTimingGridProps {
  selectedId: string | null;
  onSelect: (id: string) => void;
}

function FoodCard({
  id,
  label,
  subtitle,
  isSelected,
  onPress,
}: {
  id: string;
  label: string;
  subtitle: string;
  isSelected: boolean;
  onPress: (id: string) => void;
}) {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: DS_ANIMATION.pressedScale,
        duration: DS_ANIMATION.duration.press,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: DS_ANIMATION.duration.selection,
        useNativeDriver: true,
      }),
    ]).start();
    onPress(id);
  };

  return (
    <Pressable onPress={handlePress} style={styles.cardPressable}>
      <Animated.View
        style={[
          styles.card,
          isSelected && styles.cardSelected,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <Text style={[styles.cardLabel, isSelected && styles.cardLabelSelected]}>
          {label}
        </Text>
        <Text style={styles.cardSubtitle}>{subtitle}</Text>
      </Animated.View>
    </Pressable>
  );
}

export default function FoodTimingGrid({ selectedId, onSelect }: FoodTimingGridProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.question}>{'🍽️'} Food Timing</Text>
      <View style={styles.grid}>
        {FOOD_TIMING_OPTIONS.map((opt) => (
          <FoodCard
            key={opt.id}
            id={opt.id}
            label={opt.label}
            subtitle={opt.subtitle}
            isSelected={selectedId === opt.id}
            onPress={onSelect}
          />
        ))}
      </View>
    </View>
  );
}

const { borderRadius, borderWidth, minHeight, paddingVertical, paddingHorizontal } =
  DS_COMPONENTS.mealCard;

const styles = StyleSheet.create({
  section: {
    gap: DS_COMPONENTS.questionSection.innerGap,
  },
  question: {
    ...DS_TYPOGRAPHY.questionTitle,
    color: DS_COLORS.text.primary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: DS_SPACING.sm,
  },
  cardPressable: {
    width: '48.5%',
  },
  card: {
    borderRadius,
    borderWidth,
    borderColor: DS_COLORS.interactive.mealCard.default,
    minHeight,
    paddingVertical,
    paddingHorizontal,
    backgroundColor: DS_COLORS.surface.card,
    justifyContent: 'center',
  },
  cardSelected: {
    borderColor: DS_COLORS.gradient.deepPurple,
    backgroundColor: 'rgba(123,47,247,0.06)',
  },
  cardLabel: {
    ...DS_TYPOGRAPHY.cardTitle,
    color: DS_COLORS.text.primary,
  },
  cardLabelSelected: {
    color: DS_COLORS.gradient.deepPurple,
  },
  cardSubtitle: {
    ...DS_TYPOGRAPHY.cardSubtitle,
    color: DS_COLORS.text.secondary,
    marginTop: DS_SPACING.xxs,
  },
});
