import React from 'react';
import { TouchableOpacity, ViewStyle } from 'react-native';
import { Plus } from 'lucide-react-native';
import { useTheme, useStyles } from '../../lib/AppThemeProvider';

interface FABProps {
  onPress: () => void;
  style?: ViewStyle;
  accessibilityLabel?: string;
}

export function FAB({ onPress, style, accessibilityLabel = 'Adicionar' }: FABProps) {
  const { colors } = useTheme();

  const s = useStyles((t) => ({
    fab: {
      position: 'absolute' as const,
      right: 20,
      bottom: 84,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: t.colors.accent,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      shadowColor: t.colors.accent,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
      elevation: 6,
    },
  }));

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
