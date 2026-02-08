import React, { useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import * as Haptics from 'expo-haptics';
import {
  DS_COLORS,
  DS_TYPOGRAPHY,
  DS_COMPONENTS,
} from '@/constants/design-system';

interface SleepSliderProps {
  value: number;
  onValueChange: (value: number) => void;
}

const { min, max, step } = DS_COMPONENTS.sleepSlider;

export default function SleepSlider({ value, onValueChange }: SleepSliderProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const lastSnapped = useRef(value);

  const handleValueChange = useCallback((v: number) => {
    const snapped = Math.round(v / step) * step;
    if (snapped !== lastSnapped.current) {
      Haptics.selectionAsync();
      lastSnapped.current = snapped;
    }
    setDisplayValue(snapped);
  }, []);

  const handleSlidingComplete = useCallback(
    (v: number) => {
      const snapped = Math.round(v / step) * step;
      setDisplayValue(snapped);
      onValueChange(snapped);
    },
    [onValueChange],
  );

  return (
    <View style={styles.section}>
      <Text style={styles.question}>{'😴'} Sleep Hours</Text>

      {/* Wrapper claims touch so parent ScrollView doesn't steal the gesture */}
      <View
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
      >
        <Slider
          style={styles.slider}
          minimumValue={min}
          maximumValue={max}
          step={step}
          value={value}
          onValueChange={handleValueChange}
          onSlidingComplete={handleSlidingComplete}
          minimumTrackTintColor={DS_COLORS.accent.green}
          maximumTrackTintColor={DS_COLORS.border.light}
          thumbTintColor={DS_COLORS.slider.thumb}
        />
      </View>

      <View style={styles.rangeLabels}>
        <Text style={styles.rangeLabel}>{min}h</Text>
        <Text style={styles.rangeLabel}>{max}h</Text>
      </View>

      <Text style={styles.valueDisplay}>{displayValue.toFixed(1)}h</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: DS_COMPONENTS.questionSection.innerGap,
  },
  question: {
    ...DS_TYPOGRAPHY.questionTitle,
    color: DS_COLORS.text.primary,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  rangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -4,
  },
  rangeLabel: {
    ...DS_TYPOGRAPHY.caption,
    color: DS_COLORS.text.tertiary,
  },
  valueDisplay: {
    ...DS_TYPOGRAPHY.valueDisplay,
    color: DS_COLORS.slider.valueText,
    textAlign: 'center',
  },
});
