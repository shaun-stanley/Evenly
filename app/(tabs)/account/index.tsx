import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Card } from '@/components/ui/Card';
import { ListItem } from '@/components/ui/ListItem';
import { useStore } from '@/store/store';
import { CurrencyPicker } from '@/components/ui/CurrencyPicker';

export default function AccountScreen() {
  const t = useTheme();
  const styles = React.useMemo(() => makeStyles(t), [t]);
  const { state, setCurrency } = useStore();
  const [showCurrencyPicker, setShowCurrencyPicker] = React.useState(false);

  return (
    <View style={{ flex: 1 }}>
      <Card style={styles.card}>
        <Text style={styles.title}>Preferences</Text>
        <ListItem
          title={<Text style={styles.titleRow}>Default currency</Text>}
          subtitle={<Text style={styles.muted}>Used when a group hasn't set a currency</Text>}
          right={<Text style={styles.rightText}>{state.settings.currency}</Text>}
          showChevron
          onPress={() => setShowCurrencyPicker(true)}
          accessibilityLabel={`Default currency ${state.settings.currency}`}
          accessibilityHint="Opens currency picker"
        />
      </Card>
      <CurrencyPicker
        visible={showCurrencyPicker}
        selectedCode={state.settings.currency}
        onSelect={(code) => {
          if (code) setCurrency(code);
        }}
        onClose={() => setShowCurrencyPicker(false)}
        title="Default Currency"
      />
    </View>
  );
}

function makeStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    card: { marginHorizontal: 16, marginTop: 16 },
    title: { color: t.colors.label, fontSize: 17, fontWeight: '600', marginBottom: 8 },
    titleRow: { color: t.colors.label, fontSize: 16, fontWeight: '600' },
    muted: { color: t.colors.secondaryLabel, marginTop: 4 },
    rightText: { color: t.colors.label, fontWeight: '600' },
  });
}
