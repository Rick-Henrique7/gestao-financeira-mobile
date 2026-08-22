import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View, KeyboardAvoidingView, Platform } from 'react-native';
import { X } from 'lucide-react-native';
import { colors, radius, spacing, typography } from '../../lib/theme';

interface FormModalProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  error?: string | null;
}

export function FormModal({ visible, title, onClose, children, error }: FormModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        style={s.fill}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={s.overlay} onPress={onClose}>
          <Pressable style={s.sheet} onPress={(e) => e.stopPropagation()}>
            <View style={s.handleWrap}>
              <View style={s.handle} />
            </View>

            <View style={s.header}>
              <Text style={s.title}>{title}</Text>
              <Pressable onPress={onClose} style={s.closeBtn} hitSlop={8}>
                <X size={18} color={colors.muted} />
              </Pressable>
            </View>

            <ScrollView
              contentContainerStyle={s.body}
              keyboardShouldPersistTaps="handled"
            >
              {children}
            </ScrollView>

            {error ? (
              <View style={s.errorBox}>
                <Text style={s.errorText}>{error}</Text>
              </View>
            ) : null}
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const s = StyleSheet.create({
  fill: { flex: 1 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.base,
    borderTopLeftRadius: radius.display,
    borderTopRightRadius: radius.display,
    borderTopWidth: 1,
    borderColor: colors.border,
    maxHeight: '90%',
  },
  handleWrap: { alignItems: 'center', paddingTop: 8, paddingBottom: 4 },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.muted },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: { color: colors.text, fontSize: typography.size.lg, fontWeight: typography.weight.semibold },
  closeBtn: { padding: 4 },
  body: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  errorBox: {
    backgroundColor: 'rgba(248, 113, 113, 0.12)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(248, 113, 113, 0.3)',
    padding: spacing.md,
  },
  errorText: { color: colors.danger, fontSize: typography.size.sm, fontWeight: typography.weight.medium },
});
