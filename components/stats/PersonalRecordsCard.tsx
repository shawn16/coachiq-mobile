import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  DS_COLORS,
  DS_TYPOGRAPHY,
  DS_SPACING,
  DS_RADIUS,
  DS_SHADOWS,
} from '@/constants/design-system';
import type { PersonalRecord } from '@/mocks/stats';

interface PersonalRecordsCardProps {
  records: PersonalRecord[];
}

export default function PersonalRecordsCard({ records }: PersonalRecordsCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{'🏆 PERSONAL RECORDS'}</Text>
      {records.map((record, index) => (
        <React.Fragment key={record.event}>
          {index > 0 && <View style={styles.divider} />}
          <View
            style={[
              styles.row,
              record.isRecent && styles.recentRow,
            ]}
          >
            <Text style={styles.event}>
              {record.isRecent && <Text style={styles.star}>★ </Text>}
              {record.event}
            </Text>
            <Text style={styles.time}>{record.time}</Text>
            <Text style={styles.date}>{record.date}</Text>
          </View>
        </React.Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: DS_COLORS.surface.card,
    borderRadius: DS_RADIUS.lg,
    padding: DS_SPACING.lg,
    ...DS_SHADOWS.card,
  },
  label: {
    ...DS_TYPOGRAPHY.captionMedium,
    color: DS_COLORS.text.secondary,
    marginBottom: DS_SPACING.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 44,
    paddingHorizontal: DS_SPACING.sm,
  },
  recentRow: {
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderRadius: DS_RADIUS.sm,
  },
  event: {
    ...DS_TYPOGRAPHY.bodySemiBold,
    color: DS_COLORS.text.primary,
    flex: 1,
  },
  star: {
    color: DS_COLORS.status.warning,
  },
  time: {
    ...DS_TYPOGRAPHY.bodyMedium,
    color: DS_COLORS.text.primary,
    flex: 1,
    textAlign: 'center',
  },
  date: {
    ...DS_TYPOGRAPHY.caption,
    color: DS_COLORS.text.tertiary,
    flex: 1,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: DS_COLORS.border.light,
  },
});
