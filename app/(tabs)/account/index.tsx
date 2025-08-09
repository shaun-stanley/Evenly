import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Card } from '@/components/ui/Card';

export default function AccountScreen() {
  const t = useTheme();
  const styles = React.useMemo(() => makeStyles(t), [t]);
  return (
    <View style={{ flex: 1 }}>
      <Card style={styles.card}>
        <Text style={styles.title}>Account</Text>
        <Text style={styles.muted}>Profile and settings coming soon.</Text>
      </Card>
    </View>
  );
}

function makeStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    card: { marginHorizontal: 16, marginTop: 16 },
    title: { color: t.colors.label, fontSize: 17, fontWeight: '600' },
    muted: { color: t.colors.secondaryLabel, marginTop: 6 },
  });
}
