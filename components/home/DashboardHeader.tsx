import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import ApexLogo from '@/components/ApexLogo';
import {
  DS_COLORS,
  DS_TYPOGRAPHY,
  DS_SPACING,
  DS_RADIUS,
} from '@/constants/design-system';

interface DashboardHeaderProps {
  firstName: string;
  initials: string;
  dateString: string;
  onAvatarLongPress?: () => void;
}

export default function DashboardHeader({
  firstName,
  initials,
  dateString,
  onAvatarLongPress,
}: DashboardHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.logoRow}>
          <ApexLogo size={24} />
          <Text style={styles.logoText}>CoachIQ</Text>
        </View>
        <Pressable onLongPress={onAvatarLongPress}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
        </Pressable>
      </View>
      <Text style={styles.greeting}>Hey, {firstName} {'👋'}</Text>
      <Text style={styles.date}>{dateString}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: DS_SPACING.xl,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DS_SPACING.lg,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DS_SPACING.sm,
  },
  logoText: {
    ...DS_TYPOGRAPHY.questionTitle,
    color: DS_COLORS.text.onGradient,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: DS_RADIUS.full,
    backgroundColor: DS_COLORS.surface.frosted,
    borderWidth: 2,
    borderColor: DS_COLORS.text.onGradient,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...DS_TYPOGRAPHY.captionMedium,
    color: DS_COLORS.text.onGradient,
  },
  greeting: {
    ...DS_TYPOGRAPHY.screenTitle,
    color: DS_COLORS.text.onGradient,
  },
  date: {
    ...DS_TYPOGRAPHY.body,
    color: DS_COLORS.text.onGradient,
    opacity: 0.75,
    marginTop: DS_SPACING.xs,
  },
});
