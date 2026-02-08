import React from 'react';
import { View, Pressable, Platform, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import {
  DS_COLORS,
  DS_TYPOGRAPHY,
  DS_ANIMATION,
  DS_COMPONENTS,
} from '@/constants/design-system';

interface PinPadProps {
  onDigitPress: (digit: string) => void;
  onBackspacePress: () => void;
  disabled?: boolean;
}

const GRID = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['', '0', 'backspace'],
] as const;

function PadKey({
  value,
  onPress,
  disabled,
}: {
  value: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (value === '') {
    return <View style={styles.key} />;
  }

  const handlePressIn = () => {
    if (disabled) return;
    scale.value = withTiming(DS_ANIMATION.pressedScale, {
      duration: DS_ANIMATION.duration.press,
    });
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: DS_ANIMATION.duration.press });
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
    >
      <Animated.View style={[styles.key, styles.keyBackground, animatedStyle]}>
        {value === 'backspace' ? (
          <MaterialIcons
            name="backspace"
            size={24}
            color={DS_COLORS.text.onGradient}
          />
        ) : (
          <Animated.Text style={styles.keyText}>{value}</Animated.Text>
        )}
      </Animated.View>
    </Pressable>
  );
}

export default function PinPad({
  onDigitPress,
  onBackspacePress,
  disabled,
}: PinPadProps) {
  return (
    <View style={styles.container}>
      {GRID.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((value, colIndex) => (
            <PadKey
              key={`${rowIndex}-${colIndex}`}
              value={value}
              disabled={disabled}
              onPress={() => {
                if (value === 'backspace') {
                  onBackspacePress();
                } else if (value !== '') {
                  onDigitPress(value);
                }
              }}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: DS_COMPONENTS.pinPad.keyGap,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: DS_COMPONENTS.pinPad.keyGap,
  },
  key: {
    width: DS_COMPONENTS.pinPad.keySize,
    height: DS_COMPONENTS.pinPad.keySize,
    borderRadius: DS_COMPONENTS.pinPad.keyBorderRadius,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyBackground: {
    backgroundColor: DS_COMPONENTS.pinPad.keyBackground,
  },
  keyText: {
    fontSize: DS_TYPOGRAPHY.screenTitle.fontSize,
    fontWeight: DS_TYPOGRAPHY.screenTitle.fontWeight,
    color: DS_COLORS.text.onGradient,
  },
});
