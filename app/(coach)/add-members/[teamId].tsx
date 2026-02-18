import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import QRCode from 'react-native-qrcode-svg';
import { mockTeams } from '@/mocks/coach';
import {
  DS_COLORS,
  DS_TYPOGRAPHY,
  DS_SPACING,
  DS_RADIUS,
  DS_SHADOWS,
} from '@/constants/design-system';

export default function AddMembersScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { teamId, accessCode: paramCode } = useLocalSearchParams<{
    teamId: string;
    accessCode?: string;
  }>();

  const team = mockTeams.find((t) => t.id === teamId);
  const accessCode = paramCode || team?.accessCode || '';

  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(accessCode);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <LinearGradient
      colors={[...DS_COLORS.gradient.stops]}
      style={[styles.gradient, { paddingTop: insets.top + DS_SPACING.md }]}
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerSpacer} />
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Add Athletes</Text>
          {team && <Text style={styles.headerSubtitle}>{team.name}</Text>}
        </View>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={styles.closeButton}
        >
          <Ionicons name="close" size={28} color={DS_COLORS.text.onGradient} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + DS_SPACING.massive },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Access Code Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Share Access Code</Text>
          <Text style={styles.codeDisplay}>{accessCode}</Text>
          <Text style={styles.cardDescription}>
            Athletes enter this code in the app to join your team
          </Text>
          <TouchableOpacity
            style={[styles.copyButton, copied && styles.copyButtonCopied]}
            onPress={handleCopy}
            activeOpacity={0.8}
          >
            <Ionicons
              name={copied ? 'checkmark-circle' : 'copy-outline'}
              size={18}
              color={copied ? DS_COLORS.text.onGradient : DS_COLORS.gradient.deepPurple}
            />
            <Text
              style={[
                styles.copyButtonText,
                copied && styles.copyButtonTextCopied,
              ]}
            >
              {copied ? 'Copied!' : 'Copy Code'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* QR Code Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Scan QR Code</Text>
          <View style={styles.qrContainer}>
            <View style={styles.qrBackground}>
              <QRCode value={accessCode} size={200} />
            </View>
          </View>
          <Text style={styles.cardDescription}>
            Athletes scan this with their phone camera to join
          </Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: DS_SPACING.sm,
    marginBottom: DS_SPACING.xl,
  },
  headerSpacer: {
    width: 44,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    ...DS_TYPOGRAPHY.questionTitle,
    color: DS_COLORS.text.onGradient,
  },
  headerSubtitle: {
    ...DS_TYPOGRAPHY.caption,
    color: DS_COLORS.text.onGradient,
    opacity: 0.75,
    marginTop: 2,
  },
  closeButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: DS_SPACING.xl,
    gap: DS_SPACING.lg,
  },
  card: {
    backgroundColor: DS_COLORS.surface.card,
    borderRadius: DS_RADIUS.lg,
    padding: DS_SPACING.xxl,
    alignItems: 'center',
    ...DS_SHADOWS.elevated,
  },
  cardTitle: {
    ...DS_TYPOGRAPHY.sectionLabel,
    color: DS_COLORS.text.primary,
    marginBottom: DS_SPACING.xl,
  },
  codeDisplay: {
    fontSize: 36,
    fontWeight: '700',
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace' }),
    letterSpacing: 4,
    color: DS_COLORS.gradient.deepPurple,
    marginBottom: DS_SPACING.lg,
  },
  cardDescription: {
    ...DS_TYPOGRAPHY.caption,
    color: DS_COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: DS_SPACING.lg,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DS_SPACING.sm,
    borderWidth: 1.5,
    borderColor: DS_COLORS.gradient.deepPurple,
    borderRadius: DS_RADIUS.pill,
    paddingHorizontal: DS_SPACING.xl,
    paddingVertical: DS_SPACING.md,
  },
  copyButtonCopied: {
    backgroundColor: DS_COLORS.accent.green,
    borderColor: DS_COLORS.accent.green,
  },
  copyButtonText: {
    ...DS_TYPOGRAPHY.buttonLabelSmall,
    color: DS_COLORS.gradient.deepPurple,
  },
  copyButtonTextCopied: {
    color: DS_COLORS.text.onGradient,
  },
  qrContainer: {
    marginBottom: DS_SPACING.lg,
  },
  qrBackground: {
    backgroundColor: '#FFFFFF',
    padding: DS_SPACING.xl,
    borderRadius: DS_RADIUS.md,
  },
});
