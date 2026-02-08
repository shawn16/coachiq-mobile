import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import {
  DS_COLORS,
  DS_TYPOGRAPHY,
  DS_SPACING,
  DS_RADIUS,
  DS_SHADOWS,
} from '@/constants/design-system';

export default function AllCaughtUpCard() {
  return (
    <View style={styles.card}>
      <View style={styles.iconCircle}>
        <MaterialIcons name="check" size={32} color={DS_COLORS.text.onGradient} />
      </View>
      <Text style={styles.title}>{"You're all caught up! \u2713"}</Text>
      <Text style={styles.subtitle}>No pending check-ins</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: DS_COLORS.surface.card,
    borderRadius: DS_RADIUS.lg,
    padding: DS_SPACING.lg,
    alignItems: 'center',
    ...DS_SHADOWS.card,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: DS_RADIUS.full,
    backgroundColor: DS_COLORS.accent.green,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: DS_SPACING.md,
  },
  title: {
    ...DS_TYPOGRAPHY.questionTitle,
    color: DS_COLORS.text.primary,
    textAlign: 'center',
  },
  subtitle: {
    ...DS_TYPOGRAPHY.caption,
    color: DS_COLORS.text.secondary,
    textAlign: 'center',
    marginTop: DS_SPACING.xs,
  },
});
