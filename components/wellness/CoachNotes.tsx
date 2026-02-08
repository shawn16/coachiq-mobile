import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import {
  DS_COLORS,
  DS_TYPOGRAPHY,
  DS_COMPONENTS,
} from '@/constants/design-system';

interface CoachNotesProps {
  value: string;
  onChangeText: (text: string) => void;
  title?: string;
  placeholder?: string;
}

export default function CoachNotes({ value, onChangeText, title, placeholder }: CoachNotesProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.section}>
      <Text style={styles.question}>{title ?? '📝 Coach Notes'}</Text>
      <TextInput
        style={[styles.input, isFocused && styles.inputFocused]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder ?? "Feeling sick, stressed about a test, excited for today's workout, etc..."}
        placeholderTextColor={DS_COLORS.input.placeholder}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
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
  input: {
    ...DS_TYPOGRAPHY.inputText,
    minHeight: DS_COMPONENTS.textInput.minHeight,
    borderRadius: DS_COMPONENTS.textInput.borderRadius,
    borderWidth: DS_COMPONENTS.textInput.borderWidth,
    borderColor: DS_COLORS.input.border,
    paddingHorizontal: DS_COMPONENTS.textInput.paddingHorizontal,
    paddingVertical: DS_COMPONENTS.textInput.paddingVertical,
    backgroundColor: DS_COLORS.surface.card,
    color: DS_COLORS.text.primary,
  },
  inputFocused: {
    borderColor: DS_COLORS.input.borderFocused,
  },
});
