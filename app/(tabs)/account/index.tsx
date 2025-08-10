import React from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Card } from '@/components/ui/Card';
import { ListItem } from '@/components/ui/ListItem';
import { useStore } from '@/store/store';
import { CurrencyPicker } from '@/components/ui/CurrencyPicker';
import { LocalePicker } from '@/components/ui/LocalePicker';
import { LOCALES } from '@/utils/locales';
import { exportAndShare } from '@/utils/export';

export default function AccountScreen() {
  const t = useTheme();
  const styles = React.useMemo(() => makeStyles(t), [t]);
  const { state, setCurrency, setLocale } = useStore();
  const [showCurrencyPicker, setShowCurrencyPicker] = React.useState(false);
  const [showLocalePicker, setShowLocalePicker] = React.useState(false);

  const localeLabel = React.useMemo(() => {
    const l = state.settings.locale ?? 'system';
    if (l === 'system') return 'System';
    const found = LOCALES.find((x) => x.code === l);
    return found ? found.name : l;
  }, [state.settings.locale]);

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
        <ListItem
          title={<Text style={styles.titleRow}>Locale</Text>}
          subtitle={<Text style={styles.muted}>Number, date, and currency formatting</Text>}
          right={<Text style={styles.rightText}>{localeLabel}</Text>}
          showChevron
          onPress={() => setShowLocalePicker(true)}
          accessibilityLabel={`Locale ${localeLabel}`}
          accessibilityHint="Opens locale picker"
        />
      </Card>
      <Card style={styles.card}>
        <Text style={styles.title}>Data</Text>
        <ListItem
          title={<Text style={styles.titleRow}>Export data</Text>}
          subtitle={<Text style={styles.muted}>Save or share a JSON copy of your data</Text>}
          showChevron
          onPress={async () => {
            try {
              const { uri, shared } = await exportAndShare(state);
              if (!shared) {
                Alert.alert('Export complete', `Saved to: ${uri}`);
              }
            } catch (e) {
              Alert.alert('Export failed', 'Unable to export at this time.');
            }
          }}
          accessibilityLabel="Export data"
          accessibilityHint="Creates a JSON export and opens the share sheet"
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
      <LocalePicker
        visible={showLocalePicker}
        selected={state.settings.locale ?? 'system'}
        onSelect={(l) => setLocale(l)}
        onClose={() => setShowLocalePicker(false)}
        title="Locale"
      />
    </View>
  );
}

function makeStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    card: { marginHorizontal: t.spacing.l, marginTop: t.spacing.l },
    title: { color: t.colors.label, fontSize: 17, fontWeight: '600', marginBottom: t.spacing.s },
    titleRow: { color: t.colors.label, fontSize: 16, fontWeight: '600' },
    muted: { color: t.colors.secondaryLabel, marginTop: t.spacing.xs },
    rightText: { color: t.colors.label, fontWeight: '600' },
  });
}
