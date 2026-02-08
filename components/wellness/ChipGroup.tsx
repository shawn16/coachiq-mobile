import React from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  DS_COLORS,
  DS_TYPOGRAPHY,
  DS_COMPONENTS,
  DS_ANIMATION,
} from '@/constants/design-system';

interface ChipGroupProps {
  icon: string;
  question: string;
  options: readonly string[];
  feelsFineOption: string;
  selected: string[];
  onToggle: (selected: string[]) => void;
}

function Chip({
  label,
  isSelected,
  isFeelsFine,
  isNegative,
  onPress,
}: {
  label: string;
  isSelected: boolean;
  isFeelsFine: boolean;
  isNegative: boolean;
  onPress: () => void;
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
    onPress();
  };

  const chipStyle = isSelected
    ? isNegative
      ? styles.chipNegative
      : styles.chipPositive
    : styles.chipDefault;

  const textStyle = isSelected
    ? isNegative
      ? styles.chipTextNegative
      : styles.chipTextPositive
    : styles.chipTextDefault;

  return (
    <Pressable
      onPress={handlePress}
      style={isFeelsFine ? styles.feelsFineContainer : styles.chipContainer}
    >
      <Animated.View
        style={[styles.chip, chipStyle, { transform: [{ scale: scaleAnim }] }]}
      >
        <Text style={[styles.chipText, textStyle]}>{label}</Text>
      </Animated.View>
    </Pressable>
  );
}

export default function ChipGroup({
  icon,
  question,
  options,
  feelsFineOption,
  selected,
  onToggle,
}: ChipGroupProps) {
  const handleChipPress = (option: string) => {
    if (option === feelsFineOption) {
      // Exclusive toggle: selecting "Feels fine" clears all others
      if (selected.includes(feelsFineOption)) {
        onToggle([]);
      } else {
        onToggle([feelsFineOption]);
      }
    } else {
      // Regular chip: remove "Feels fine" if present, toggle this chip
      const withoutFeelsFine = selected.filter((s) => s !== feelsFineOption);
      if (withoutFeelsFine.includes(option)) {
        onToggle(withoutFeelsFine.filter((s) => s !== option));
      } else {
        onToggle([...withoutFeelsFine, option]);
      }
    }
  };

  const regularOptions = options.filter((o) => o !== feelsFineOption);

  return (
    <View style={styles.section}>
      <Text style={styles.question}>
        {icon} {question}
      </Text>

      {/* Feels Fine chip — full width */}
      <Chip
        label={feelsFineOption}
        isSelected={selected.includes(feelsFineOption)}
        isFeelsFine={true}
        isNegative={false}
        onPress={() => handleChipPress(feelsFineOption)}
      />

      {/* Regular chips — 2-column grid */}
      <View style={styles.grid}>
        {regularOptions.map((option) => (
          <Chip
            key={option}
            label={option}
            isSelected={selected.includes(option)}
            isFeelsFine={false}
            isNegative={true}
            onPress={() => handleChipPress(option)}
          />
        ))}
      </View>
    </View>
  );
}

const { height, borderRadius, borderWidth, paddingHorizontal } = DS_COMPONENTS.chip;

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
    gap: DS_COMPONENTS.chip.gap,
  },
  feelsFineContainer: {
    width: '100%',
  },
  chipContainer: {
    width: '48%',
  },
  chip: {
    height,
    borderRadius,
    borderWidth,
    paddingHorizontal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipDefault: {
    borderColor: DS_COLORS.interactive.chipDefault.border,
    backgroundColor: DS_COLORS.interactive.chipDefault.background,
  },
  chipPositive: {
    borderColor: DS_COLORS.interactive.chipSelected.border,
    backgroundColor: DS_COLORS.interactive.chipSelected.background,
  },
  chipNegative: {
    borderColor: DS_COLORS.interactive.chipNegative.border,
    backgroundColor: DS_COLORS.interactive.chipNegative.background,
  },
  chipText: {
    ...DS_TYPOGRAPHY.chipLabel,
  },
  chipTextDefault: {
    color: DS_COLORS.text.primary,
  },
  chipTextPositive: {
    color: DS_COLORS.interactive.chipSelected.border,
  },
  chipTextNegative: {
    color: DS_COLORS.interactive.chipNegative.border,
  },
});
