import React from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

export type FormFieldProps = {
  label: string;
  children: React.ReactNode;
  helper?: string | React.ReactNode;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  required?: boolean;
};

export function FormField({ label, children, helper, style, required }: FormFieldProps) {
  const t = useTheme();
  const styles = React.useMemo(() => makeStyles(t), [t]);
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.label}>
        {label}
        {required ? ' *' : ''}
      </Text>
      {children}
      {helper ? (typeof helper === 'string' ? <Text style={styles.helper}>{helper}</Text> : helper) : null}
    </View>
  );
}

function makeStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    container: { marginBottom: 16 },
    label: { marginBottom: 8, color: t.colors.secondaryLabel },
    helper: { marginTop: 6, color: t.colors.secondaryLabel },
  });
}
