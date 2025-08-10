import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Separator } from './Separator';

export type GroupedSectionProps = {
  children: React.ReactNode[] | React.ReactNode;
  inset?: boolean; // if true, applies left inset separators
  style?: any;
};

export function GroupedSection({ children, inset = true, style }: GroupedSectionProps) {
  const t = useTheme();
  const styles = React.useMemo(() => makeStyles(t), [t]);
  const items = React.Children.toArray(children);
  return (
    <View style={[styles.container, style]}>
      {items.map((child, idx) => (
        <React.Fragment key={idx}>
          <View>{child}</View>
          {idx < items.length - 1 ? <Separator inset={inset} /> : null}
        </React.Fragment>
      ))}
    </View>
  );
}

function makeStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    container: {
      marginHorizontal: t.spacing.l,
      marginTop: t.spacing.l,
      backgroundColor: t.colors.card,
      borderRadius: t.radius.md,
      overflow: 'hidden',
      shadowColor: t.shadows.card.color,
      shadowOffset: t.shadows.card.offset,
      shadowOpacity: t.shadows.card.opacity,
      shadowRadius: t.shadows.card.radius,
    },
    row: {},
  });
}

export default GroupedSection;
