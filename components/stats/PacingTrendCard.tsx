import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import Svg, {
  Path,
  Circle,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
  Polygon,
} from 'react-native-svg';
import { MaterialIcons } from '@expo/vector-icons';
import {
  DS_COLORS,
  DS_TYPOGRAPHY,
  DS_SPACING,
  DS_RADIUS,
  DS_SHADOWS,
} from '@/constants/design-system';
import type { PacingTrendData } from '@/mocks/stats';
import InfoTooltip from './InfoTooltip';

interface PacingTrendCardProps {
  data: PacingTrendData;
}

const CHART_HEIGHT = 120;
const SCREEN_WIDTH = Dimensions.get('window').width;
const CHART_WIDTH = SCREEN_WIDTH - DS_SPACING.xl * 2 - DS_SPACING.lg * 2;

export default function PacingTrendCard({ data }: PacingTrendCardProps) {
  const [showInfo, setShowInfo] = useState(false);

  const { points } = data;
  const values = points.map((p) => p.value);
  const minVal = Math.min(...values) - 2;
  const maxVal = Math.max(...values) + 2;
  const range = maxVal - minVal;

  const coords = points.map((p, i) => ({
    x: (i / (points.length - 1)) * CHART_WIDTH,
    y: CHART_HEIGHT - ((p.value - minVal) / range) * CHART_HEIGHT,
  }));

  const linePath = coords
    .map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x},${c.y}`)
    .join(' ');

  const areaPoints = [
    ...coords.map((c) => `${c.x},${c.y}`),
    `${CHART_WIDTH},${CHART_HEIGHT}`,
    `0,${CHART_HEIGHT}`,
  ].join(' ');

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.label}>{'📈 PACING TREND'}</Text>
        <Pressable
          onPress={() => setShowInfo(true)}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <MaterialIcons
            name="info-outline"
            size={18}
            color={DS_COLORS.text.tertiary}
          />
        </Pressable>
      </View>

      <Svg width={CHART_WIDTH} height={CHART_HEIGHT} style={styles.chart}>
        <Defs>
          <SvgLinearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={DS_COLORS.gradient.deepPurple} stopOpacity={0.15} />
            <Stop offset="1" stopColor={DS_COLORS.gradient.deepPurple} stopOpacity={0.02} />
          </SvgLinearGradient>
        </Defs>
        <Polygon points={areaPoints} fill="url(#areaFill)" />
        <Path d={linePath} stroke={DS_COLORS.gradient.deepPurple} strokeWidth={2.5} fill="none" />
        {coords.map((c, i) => (
          <Circle
            key={i}
            cx={c.x}
            cy={c.y}
            r={i === coords.length - 1 ? 6 : 4}
            fill={DS_COLORS.gradient.deepPurple}
            stroke={DS_COLORS.surface.card}
            strokeWidth={2}
          />
        ))}
      </Svg>

      <View style={styles.xLabels}>
        {points.map((p) => (
          <Text key={p.label} style={styles.xLabel}>{p.label}</Text>
        ))}
      </View>

      <View style={styles.scoreRow}>
        <Text style={styles.scoreValue}>{data.currentScore}</Text>
        <Text style={styles.scoreTrend}>↑{data.trendDelta} from start</Text>
      </View>
      <Text style={styles.message}>{data.message}</Text>

      <InfoTooltip
        visible={showInfo}
        onClose={() => setShowInfo(false)}
        title="What is Pacing Score?"
        body={'Pacing Score (WECI) measures how consistently you hit your target paces.\n\n90+ = Excellent\n80–89 = Good\n70–79 = Needs work\n\nSmaller difference between fastest and slowest rep = higher score.'}
      />
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DS_SPACING.md,
  },
  label: {
    ...DS_TYPOGRAPHY.captionMedium,
    color: DS_COLORS.text.secondary,
  },
  chart: {
    alignSelf: 'center',
  },
  xLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: DS_SPACING.xs,
  },
  xLabel: {
    ...DS_TYPOGRAPHY.helperText,
    color: DS_COLORS.text.tertiary,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: DS_SPACING.sm,
    marginTop: DS_SPACING.md,
  },
  scoreValue: {
    ...DS_TYPOGRAPHY.valueDisplay,
    color: DS_COLORS.gradient.deepPurple,
  },
  scoreTrend: {
    ...DS_TYPOGRAPHY.captionMedium,
    color: DS_COLORS.accent.green,
  },
  message: {
    ...DS_TYPOGRAPHY.caption,
    color: DS_COLORS.text.secondary,
    marginTop: DS_SPACING.xs,
  },
});
