import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  DS_COLORS,
  DS_TYPOGRAPHY,
  DS_SPACING,
  DS_RADIUS,
} from '@/constants/design-system';

type BadgeVariant = 'warning' | 'success' | 'neutral';

interface StatusBadgeProps {
  label: string;
  variant: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string }> = {
  warning: { bg: 'rgba(245,158,11,0.15)', text: '#92400E' },
  success: { bg: 'rgba(34,197,94,0.15)', text: DS_COLORS.status.success },
  neutral: { bg: DS_COLORS.border.light, text: DS_COLORS.text.secondary },
};

export default function StatusBadge({ label, variant }: StatusBadgeProps) {
  const colors = variantStyles[variant];

  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }]}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: DS_RADIUS.pill,
    paddingHorizontal: DS_SPACING.sm,
    paddingVertical: DS_SPACING.xxs,
  },
  label: {
    ...DS_TYPOGRAPHY.captionMedium,
  },
});
