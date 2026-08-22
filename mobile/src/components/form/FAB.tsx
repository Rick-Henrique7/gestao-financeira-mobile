import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Plus } from 'lucide-react-native';
import { colors } from '../../lib/theme';

interface FABProps {
  onPress: () => void;
  style?: ViewStyle;
  accessibilityLabel?: string;
}

export function FAB({ onPress, style, accessibilityLabel = 'Adicionar' }: FABProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[s.fab, style]}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <Plus size={24} color={colors.base} strokeWidth={2.5} />
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 84,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
});
