import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
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
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ paddingBottom: t.spacing.xxl, paddingTop: t.spacing.m }}>
      <View style={styles.sectionHeaderContainer}>
        <Text style={styles.title}>Preferences</Text>
      </View>
      <ListItem
        title="Default currency"
        subtitle="Used when a group hasn't set a currency"
        right={<Text style={styles.rightText}>{state.settings.currency}</Text>}
        showChevron
        onPress={() => setShowCurrencyPicker(true)}
        accessibilityLabel={`Default currency ${state.settings.currency}`}
        accessibilityHint="Opens currency picker"
      />
      <ListItem
        title="Locale"
        subtitle="Number, date, and currency formatting"
        right={<Text style={styles.rightText}>{localeLabel}</Text>}
        showChevron
        onPress={() => setShowLocalePicker(true)}
        accessibilityLabel={`Locale ${localeLabel}`}
        accessibilityHint="Opens locale picker"
      />

      <View style={styles.sectionHeaderContainer}>
        <Text style={styles.title}>Data</Text>
      </View>
      <ListItem
        title="Export data"
        subtitle="Save or share a JSON copy of your data"
        showChevron
        onPress={async () => {
          try {
            const { uri, shared } = await exportAndShare(state);
            if (!shared) {
              Alert.alert('Export complete', `Saved to: ${uri}`);
            }
          } catch (e) {
            console.error('Export failed', e);
            Alert.alert('Export failed', 'Unable to export at this time.');
          }
        }}
        accessibilityLabel="Export data"
        accessibilityHint="Creates a JSON export and opens the share sheet"
      />
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
    </ScrollView>
  );
}

function makeStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    sectionHeaderContainer: { marginHorizontal: t.spacing.l, marginTop: t.spacing.l },
    title: { ...t.text.title3, color: t.colors.label, marginBottom: t.spacing.s },
    rightText: { ...t.text.headline, color: t.colors.label },
  });
}
