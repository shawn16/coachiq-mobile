import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import Animated, {
  SlideInRight,
  SlideOutLeft,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import StepIndicator from '@/components/StepIndicator';
import PinDots from '@/components/PinDots';
import PinPad from '@/components/PinPad';
import {
  DS_COLORS,
  DS_TYPOGRAPHY,
  DS_SPACING,
  DS_ANIMATION,
  DS_COMPONENTS,
} from '@/constants/design-system';

export default function SetupScreen() {
  const insets = useSafeAreaInsets();

  const [currentStep, setCurrentStep] = useState<0 | 1 | 2>(0);
  const [inviteCode, setInviteCode] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [inputFocused, setInputFocused] = useState(false);

  const buttonScale = useSharedValue(1);
  const buttonAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const isButtonDisabled = inviteCode.trim().length === 0;

  const handleContinue = useCallback(() => {
    Keyboard.dismiss();
    console.log('Invite code:', inviteCode);
    setCurrentStep(1);
  }, [inviteCode]);

  const handlePinDigit = useCallback(
    (digit: string) => {
      if (currentStep === 1) {
        setPin((prev) => {
          const next = prev + digit;
          if (next.length === 4) {
            setTimeout(() => setCurrentStep(2), 300);
          }
          return next.length <= 4 ? next : prev;
        });
      } else if (currentStep === 2) {
        setConfirmPin((prev) => {
          const next = prev + digit;
          if (next.length === 4) {
            setTimeout(() => {
              if (next === pin) {
                console.log('PIN set, navigate to home');
              } else {
                setPinError(true);
                setErrorMessage("PINs didn't match — try again");
                setTimeout(() => {
                  setPinError(false);
                  setErrorMessage('');
                  setConfirmPin('');
                  setPin('');
                  setCurrentStep(1);
                }, 1000);
              }
            }, 300);
          }
          return next.length <= 4 ? next : prev;
        });
      }
    },
    [currentStep, pin]
  );

  const handleBackspace = useCallback(() => {
    if (currentStep === 1) {
      setPin((prev) => prev.slice(0, -1));
    } else if (currentStep === 2) {
      setConfirmPin((prev) => prev.slice(0, -1));
    }
  }, [currentStep]);

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Animated.View
            key="step-0"
            entering={SlideInRight.duration(DS_ANIMATION.duration.transition)}
            exiting={SlideOutLeft.duration(DS_ANIMATION.duration.transition)}
            style={styles.stepContent}
          >
            <View style={styles.textGroup}>
              <Text style={styles.title}>Join Your Team</Text>
              <Text style={styles.subtitle}>
                Enter the invite code from your coach to get started.
              </Text>
            </View>

            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.inputArea}
            >
              <TextInput
                style={[
                  styles.input,
                  inputFocused && styles.inputFocused,
                ]}
                placeholder="INVITE CODE"
                placeholderTextColor={DS_COLORS.text.tertiary}
                value={inviteCode}
                onChangeText={setInviteCode}
                autoCapitalize="characters"
                autoCorrect={false}
                textAlign="center"
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
              />

              <Pressable
                onPress={handleContinue}
                disabled={isButtonDisabled}
                onPressIn={() => {
                  if (!isButtonDisabled) {
                    buttonScale.value = withTiming(DS_ANIMATION.pressedScale, {
                      duration: DS_ANIMATION.duration.press,
                    });
                  }
                }}
                onPressOut={() => {
                  buttonScale.value = withTiming(1, {
                    duration: DS_ANIMATION.duration.press,
                  });
                }}
              >
                <Animated.View
                  style={[
                    styles.button,
                    isButtonDisabled && styles.buttonDisabled,
                    buttonAnimStyle,
                  ]}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      isButtonDisabled && styles.buttonTextDisabled,
                    ]}
                  >
                    Continue
                  </Text>
                </Animated.View>
              </Pressable>
            </KeyboardAvoidingView>
          </Animated.View>
        );

      case 1:
        return (
          <Animated.View
            key="step-1"
            entering={SlideInRight.duration(DS_ANIMATION.duration.transition)}
            exiting={SlideOutLeft.duration(DS_ANIMATION.duration.transition)}
            style={styles.stepContent}
          >
            <View style={styles.textGroup}>
              <Text style={styles.title}>Create Your PIN</Text>
              <Text style={styles.subtitle}>
                Choose a 4-digit PIN for daily check-in.
              </Text>
            </View>

            <View style={styles.pinArea}>
              <PinDots length={4} filled={pin.length} error={false} />
              <View style={styles.padSpacer} />
              <PinPad
                onDigitPress={handlePinDigit}
                onBackspacePress={handleBackspace}
                disabled={pin.length >= 4}
              />
            </View>
          </Animated.View>
        );

      case 2:
        return (
          <Animated.View
            key="step-2"
            entering={SlideInRight.duration(DS_ANIMATION.duration.transition)}
            exiting={SlideOutLeft.duration(DS_ANIMATION.duration.transition)}
            style={styles.stepContent}
          >
            <View style={styles.textGroup}>
              <Text style={styles.title}>Confirm Your PIN</Text>
              {errorMessage ? (
                <Text style={styles.errorText}>{errorMessage}</Text>
              ) : (
                <Text style={styles.subtitle}>
                  Re-enter your 4-digit PIN to confirm.
                </Text>
              )}
            </View>

            <View style={styles.pinArea}>
              <PinDots
                length={4}
                filled={confirmPin.length}
                error={pinError}
              />
              <View style={styles.padSpacer} />
              <PinPad
                onDigitPress={handlePinDigit}
                onBackspacePress={handleBackspace}
                disabled={confirmPin.length >= 4}
              />
            </View>
          </Animated.View>
        );
    }
  };

  return (
    <LinearGradient
      colors={[...DS_COLORS.gradient.stops]}
      style={styles.gradient}
    >
      <View style={[styles.container, { paddingTop: insets.top + DS_SPACING.xxl }]}>
        <StepIndicator totalSteps={3} currentStep={currentStep} />

        <View style={styles.content}>{renderStepContent()}</View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: DS_SPACING.xxl,
  },
  content: {
    flex: 1,
    marginTop: DS_SPACING.xxxl,
  },
  stepContent: {
    flex: 1,
  },
  textGroup: {
    gap: DS_SPACING.sm,
  },
  title: {
    ...DS_TYPOGRAPHY.screenTitle,
    color: DS_COLORS.text.onGradient,
  },
  subtitle: {
    ...DS_TYPOGRAPHY.body,
    color: DS_COLORS.text.onGradient,
    opacity: 0.8,
  },
  errorText: {
    ...DS_TYPOGRAPHY.body,
    color: DS_COLORS.text.onGradient,
  },
  inputArea: {
    marginTop: DS_SPACING.huge,
    gap: DS_SPACING.xxl,
  },
  input: {
    backgroundColor: DS_COLORS.surface.frosted,
    borderRadius: DS_COMPONENTS.textInput.borderRadius,
    height: DS_COMPONENTS.submitButton.height,
    paddingHorizontal: DS_SPACING.lg,
    ...DS_TYPOGRAPHY.inputText,
    color: DS_COLORS.text.onGradient,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  inputFocused: {
    borderColor: 'rgba(255,255,255,0.5)',
  },
  button: {
    height: DS_COMPONENTS.submitButton.height,
    borderRadius: DS_COMPONENTS.submitButton.borderRadius,
    backgroundColor: DS_COLORS.button.primaryBackground,
    alignItems: 'center',
    justifyContent: 'center',
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
  pinArea: {
    marginTop: DS_SPACING.huge,
    alignItems: 'center',
  },
  padSpacer: {
    height: DS_SPACING.xxxl,
  },
});
