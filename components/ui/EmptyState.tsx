import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { IconSymbol } from './IconSymbol';

export type EmptyStateProps = {
  icon?: Parameters<typeof IconSymbol>[0]['name'];
  title?: string;
  message?: string;
  children?: React.ReactNode;
};

export function EmptyState({ icon = 'tray', title, message, children }: EmptyStateProps) {
  const t = useTheme();
  const styles = React.useMemo(() => makeStyles(t), [t]);
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <IconSymbol name={icon} color={t.colors.secondaryLabel} size={28} />
      </View>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {children}
    </View>
  );
}

function makeStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    container: { alignItems: 'center', paddingVertical: t.spacing.xl },
    iconWrap: {
      width: 44,
      height: 44,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: t.colors.card,
      shadowColor: t.shadows.card.color,
      shadowOffset: t.shadows.card.offset,
      shadowOpacity: t.shadows.card.opacity,
      shadowRadius: t.shadows.card.radius,
      marginBottom: 10,
    },
    title: { color: t.colors.label, fontWeight: '600', marginTop: 4 },
    message: { color: t.colors.secondaryLabel, marginTop: 4, textAlign: 'center' },
  });
}
