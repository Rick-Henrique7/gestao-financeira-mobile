import React from 'react';
import { Text, View } from 'react-native';
import { useStyles } from '../lib/AppThemeProvider';
import { Theme } from '../lib/theme';

interface ScreenTitleProps {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}

export function ScreenTitle({ title, subtitle, right }: ScreenTitleProps) {
  const s = useStyles((t: Theme) => ({
    wrap: {
      paddingHorizontal: t.spacing.lg,
      paddingTop: t.spacing.xl,
      paddingBottom: t.spacing.md,
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: t.spacing.md,
    },
    textCol: { flex: 1, gap: 2 },
    title: {
      color: t.colors.text,
      fontSize: 28,
      fontWeight: t.typography.weight.black,
      letterSpacing: t.typography.letterSpacing.tight,
    },
    subtitle: {
      color: t.colors.textMuted,
      fontSize: t.typography.size.sm,
      fontWeight: t.typography.weight.medium,
    },
    right: { alignItems: 'flex-end' },
  }));

  return (
    <View style={s.wrap} accessibilityRole="header">
      <View style={s.textCol}>
        <Text style={s.title} numberOfLines={1}>{title}</Text>
        {subtitle ? <Text style={s.subtitle} numberOfLines={1}>{subtitle}</Text> : null}
      </View>
      {right ? <View style={s.right}>{right}</View> : null}
    </View>
  );
}
