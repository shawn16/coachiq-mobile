import React from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  DS_COLORS,
  DS_TYPOGRAPHY,
  DS_COMPONENTS,
  DS_ANIMATION,
} from '@/constants/design-system';

interface EmojiScaleProps {
  icon: string;
  question: string;
  emojis: readonly string[];
  values: readonly number[];
  leftLabel: string;
  rightLabel: string;
  selectedValue: number | null;
  onSelect: (value: number) => void;
}

function EmojiCircle({
  emoji,
  value,
  isSelected,
  onPress,
}: {
  emoji: string;
  value: number;
  isSelected: boolean;
  onPress: (value: number) => void;
}) {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.85,
        duration: DS_ANIMATION.duration.press,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: DS_ANIMATION.duration.selection,
        useNativeDriver: true,
      }),
    ]).start();
    onPress(value);
  };

  return (
    <Pressable onPress={handlePress}>
      <Animated.View
        style={[
          styles.circle,
          isSelected && styles.circleSelected,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <Text style={styles.emoji}>{emoji}</Text>
      </Animated.View>
    </Pressable>
  );
}

export default function EmojiScale({
  icon,
  question,
  emojis,
  values,
  leftLabel,
  rightLabel,
  selectedValue,
  onSelect,
}: EmojiScaleProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.question}>
        {icon} {question}
      </Text>
      <View style={styles.row}>
        {emojis.map((emoji, i) => (
          <EmojiCircle
            key={values[i]}
            emoji={emoji}
            value={values[i]}
            isSelected={selectedValue === values[i]}
            onPress={onSelect}
          />
        ))}
      </View>
      <View style={styles.labelRow}>
        <Text style={styles.anchorLabel}>{leftLabel}</Text>
        <Text style={styles.anchorLabel}>{rightLabel}</Text>
      </View>
    </View>
  );
}

const { circleSize, emojiSize, gap } = DS_COMPONENTS.emojiScale;

const styles = StyleSheet.create({
  section: {
    gap: DS_COMPONENTS.questionSection.innerGap,
  },
  question: {
    ...DS_TYPOGRAPHY.questionTitle,
    color: DS_COLORS.text.primary,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap,
  },
  circle: {
    width: circleSize,
    height: circleSize,
    borderRadius: circleSize / 2,
    backgroundColor: DS_COLORS.interactive.emojiCircle.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleSelected: {
    backgroundColor: DS_COLORS.interactive.emojiCircle.selected,
    borderWidth: 2,
    borderColor: DS_COLORS.accent.blue,
  },
  emoji: {
    fontSize: emojiSize,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  anchorLabel: {
    ...DS_TYPOGRAPHY.scaleLabel,
    color: DS_COLORS.text.tertiary,
  },
});
