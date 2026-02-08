import React from 'react';
import { Text, Pressable, StyleSheet, Animated } from 'react-native';
import {
  DS_COLORS,
  DS_TYPOGRAPHY,
  DS_COMPONENTS,
  DS_ANIMATION,
} from '@/constants/design-system';

interface SubmitButtonProps {
  disabled: boolean;
  onPress: () => void;
  label?: string;
}

export default function SubmitButton({ disabled, onPress, label }: SubmitButtonProps) {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    if (disabled) return;
    Animated.timing(scaleAnim, {
      toValue: DS_ANIMATION.pressedScale,
      duration: DS_ANIMATION.duration.press,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: DS_ANIMATION.duration.press,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      disabled={disabled}
    >
      <Animated.View
        style={[
          styles.button,
          disabled && styles.buttonDisabled,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <Text style={[styles.buttonText, disabled && styles.buttonTextDisabled]}>
          {label ?? '✨ Submit Check-in'}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: DS_COMPONENTS.submitButton.height,
    borderRadius: DS_COMPONENTS.submitButton.borderRadius,
    backgroundColor: DS_COLORS.button.primaryBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: DS_COMPONENTS.submitButton.bottomMargin,
  },
  buttonDisabled: {
    backgroundColor: DS_COLORS.button.disabledBackground,
  },
  buttonText: {
    ...DS_TYPOGRAPHY.buttonLabel,
    color: DS_COLORS.button.primaryText,
  },
  buttonTextDisabled: {
    color: DS_COLORS.button.disabledText,
  },
});
