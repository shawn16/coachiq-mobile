import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import {
  DS_COLORS,
  DS_TYPOGRAPHY,
  DS_SPACING,
} from '@/constants/design-system';

interface CheckInHeaderProps {
  onTitleLongPress: () => void;
}

export default function CheckInHeader({ onTitleLongPress }: CheckInHeaderProps) {
  return (
    <View style={styles.container}>
      <Pressable onLongPress={onTitleLongPress}>
        <Text style={styles.title}>Check-in</Text>
      </Pressable>
      <Text style={styles.subtitle}>Stay connected with Coach</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: DS_SPACING.xl,
    paddingBottom: DS_SPACING.lg,
  },
  title: {
    ...DS_TYPOGRAPHY.screenTitle,
    color: DS_COLORS.text.onGradient,
  },
  subtitle: {
    ...DS_TYPOGRAPHY.body,
    color: DS_COLORS.text.onGradient,
    opacity: 0.75,
    marginTop: DS_SPACING.xs,
  },
});
