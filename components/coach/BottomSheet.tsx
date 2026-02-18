import React from 'react';
import { View, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DS_COLORS, DS_RADIUS, DS_SPACING } from '@/constants/design-system';

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function BottomSheet({ visible, onClose, children }: BottomSheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={[styles.content, { paddingBottom: insets.bottom + DS_SPACING.xxl }]}>
          <View style={styles.handle} />
          {children}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: DS_COLORS.surface.card,
    borderTopLeftRadius: DS_RADIUS.xl,
    borderTopRightRadius: DS_RADIUS.xl,
    padding: DS_SPACING.xxl,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: DS_COLORS.border.light,
    alignSelf: 'center',
    marginBottom: DS_SPACING.xl,
  },
});
