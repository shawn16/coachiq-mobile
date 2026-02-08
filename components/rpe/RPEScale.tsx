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
import { getRPEColor, RPE_LABELS } from '@/types/rpe';

interface RPEScaleProps {
  question: string;
  selectedValue: number | null;
  onSelect: (value: number) => void;
  showLabel?: boolean;
  leftAnchor: string;
  rightAnchor: string;
}

function RPEButton({
  value,
  isSelected,
  onPress,
}: {
  value: number;
  isSelected: boolean;
  onPress: () => void;
}) {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    Animated.timing(scaleAnim, {
      toValue: isSelected ? DS_COMPONENTS.rpeScale.selectedScale : 1,
      duration: DS_ANIMATION.duration.selection,
      useNativeDriver: true,
    }).start();
  }, [isSelected, scaleAnim]);

  const bgColor = isSelected
    ? getRPEColor(value, DS_COLORS.rpeScale)
    : DS_COLORS.rpeScale.unselectedBg;

  const textColor = isSelected
    ? DS_COLORS.rpeScale.selectedText
    : DS_COLORS.rpeScale.unselectedText;

  return (
    <Pressable onPress={onPress} style={styles.buttonWrapper}>
      <Animated.View
        style={[
          styles.button,
          { backgroundColor: bgColor, transform: [{ scale: scaleAnim }] },
        ]}
      >
        <Text style={[styles.buttonText, { color: textColor }]}>{value}</Text>
      </Animated.View>
    </Pressable>
  );
}

export default function RPEScale({
  question,
  selectedValue,
  onSelect,
  showLabel,
  leftAnchor,
  rightAnchor,
}: RPEScaleProps) {
  const handleSelect = (value: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect(value);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.question}>{question}</Text>

      <View style={styles.row}>
        {Array.from({ length: 10 }, (_, i) => i + 1).map((value) => (
          <RPEButton
            key={value}
            value={value}
            isSelected={selectedValue === value}
            onPress={() => handleSelect(value)}
          />
        ))}
      </View>

      <View style={styles.anchors}>
        <Text style={styles.anchorText}>{leftAnchor}</Text>
        <Text style={styles.anchorText}>{rightAnchor}</Text>
      </View>

      {selectedValue !== null && (
        <View style={styles.selectedDisplay}>
          <Text
            style={[
              styles.selectedValue,
              { color: getRPEColor(selectedValue, DS_COLORS.rpeScale) },
            ]}
          >
            {selectedValue}
          </Text>
          {showLabel && (
            <Text style={styles.selectedLabel}>
              {RPE_LABELS[selectedValue]}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: DS_SPACING.md,
  },
  question: {
    ...DS_TYPOGRAPHY.questionTitle,
    color: DS_COLORS.text.primary,
  },
  row: {
    flexDirection: 'row',
    gap: DS_COMPONENTS.rpeScale.gap,
  },
  buttonWrapper: {
    flex: 1,
  },
  button: {
    height: DS_COMPONENTS.rpeScale.buttonHeight,
    borderRadius: DS_COMPONENTS.rpeScale.borderRadius,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    ...DS_TYPOGRAPHY.scaleLabel,
  },
  anchors: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  anchorText: {
    ...DS_TYPOGRAPHY.caption,
    color: DS_COLORS.text.secondary,
  },
  selectedDisplay: {
    alignItems: 'center',
    gap: DS_SPACING.xs,
  },
  selectedValue: {
    ...DS_TYPOGRAPHY.valueDisplay,
  },
  selectedLabel: {
    ...DS_TYPOGRAPHY.bodyMedium,
    color: DS_COLORS.text.secondary,
  },
});
