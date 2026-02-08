import React from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import {
  DS_COLORS,
  DS_TYPOGRAPHY,
  DS_SPACING,
  DS_RADIUS,
} from '@/constants/design-system';

interface InfoTooltipProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  body: string;
}

export default function InfoTooltip({ visible, onClose, title, body }: InfoTooltipProps) {
  const insets = useSafeAreaInsets();

  const handleDismiss = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <Pressable style={styles.backdrop} onPress={handleDismiss}>
        <View
          style={[styles.sheet, { paddingBottom: insets.bottom + DS_SPACING.xxl }]}
          onStartShouldSetResponder={() => true}
        >
          <View style={styles.handle} />
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.body}>{body}</Text>
          <Pressable style={styles.button} onPress={handleDismiss}>
            <Text style={styles.buttonText}>Got it</Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: DS_COLORS.surface.card,
    borderTopLeftRadius: DS_RADIUS.xl,
    borderTopRightRadius: DS_RADIUS.xl,
    padding: DS_SPACING.xxl,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: DS_COLORS.border.light,
    borderRadius: DS_RADIUS.full,
    alignSelf: 'center',
    marginBottom: DS_SPACING.lg,
  },
  title: {
    ...DS_TYPOGRAPHY.questionTitle,
    color: DS_COLORS.text.primary,
  },
  body: {
    ...DS_TYPOGRAPHY.body,
    color: DS_COLORS.text.secondary,
    marginTop: DS_SPACING.md,
  },
  button: {
    backgroundColor: DS_COLORS.gradient.deepPurple,
    borderRadius: DS_RADIUS.md,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: DS_SPACING.xxl,
  },
  buttonText: {
    ...DS_TYPOGRAPHY.buttonLabelSmall,
    color: DS_COLORS.text.onGradient,
  },
});
