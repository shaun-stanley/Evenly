import React from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, TextInput, View, FlatList } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { CURRENCIES } from '@/utils/currencies';
import { IconSymbol } from '@/components/ui/IconSymbol';

export type CurrencyPickerProps = {
  visible: boolean;
  selectedCode?: string;
  onSelect: (code: string | undefined) => void;
  onClose: () => void;
  includeDefaultOption?: { label: string; value: string | undefined };
  title?: string;
};

export function CurrencyPicker({ visible, selectedCode, onSelect, onClose, includeDefaultOption, title = 'Select Currency' }: CurrencyPickerProps) {
  const t = useTheme();
  const styles = React.useMemo(() => makeStyles(t), [t]);
  const [query, setQuery] = React.useState('');

  React.useEffect(() => {
    if (!visible) setQuery('');
  }, [visible]);

  const base = React.useMemo(() => CURRENCIES, []);
  const data = React.useMemo(() => {
    const items = base.filter((c) => {
      if (!query) return true;
      const q = query.toLowerCase();
      return c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q);
    });
    if (includeDefaultOption) {
      return [{ code: '__DEFAULT__', name: includeDefaultOption.label }, ...items];
    }
    return items;
  }, [base, includeDefaultOption, query]);

  return (
    <Modal
      visible={visible}
      onRequestClose={onClose}
      animationType={Platform.select({ ios: 'slide', default: 'fade' })}
      presentationStyle={Platform.select({ ios: 'pageSheet', default: 'fullScreen' }) as any}
      transparent={false}
    >
      <View style={[styles.container]}>
        <View style={styles.header}>
          <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={onClose} hitSlop={8}>
            <Text style={styles.headerAction}>Cancel</Text>
          </Pressable>
          <Text style={styles.headerTitle}>{title}</Text>
          <View style={{ width: 60 }} />
        </View>

        <View style={styles.searchContainer}>
          <IconSymbol name="magnifyingglass" size={16} color={t.colors.secondaryLabel as any} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search currency"
            placeholderTextColor={t.colors.secondaryLabel}
            style={styles.searchInput}
            autoCorrect={false}
            autoCapitalize="characters"
            returnKeyType="done"
          />
        </View>

        <FlatList
          data={data}
          keyExtractor={(item) => item.code}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item }) => {
            const isDefault = item.code === '__DEFAULT__';
            const selected = !isDefault && item.code === selectedCode;
            return (
              <Pressable
                onPress={() => {
                  if (isDefault) {
                    onSelect(includeDefaultOption?.value);
                  } else {
                    onSelect(item.code);
                  }
                  onClose();
                }}
                style={({ pressed }) => [styles.row, pressed && { opacity: 0.8 }]}
                accessibilityRole="button"
                accessibilityLabel={isDefault ? item.name : `${item.code} ${item.name}`}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <Text style={styles.code}>{isDefault ? '' : item.code}</Text>
                  <Text style={styles.name}>{item.name}</Text>
                </View>
                {selected ? <IconSymbol name="checkmark" size={16} color={t.colors.tint as any} /> : null}
              </Pressable>
            );
          }}
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      </View>
    </Modal>
  );
}

function makeStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: t.colors.background },
    header: {
      height: 52,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: t.colors.separator,
    },
    headerTitle: { color: t.colors.label, fontSize: 16, fontWeight: '600' },
    headerAction: { color: t.colors.tint, fontSize: 16, fontWeight: '600' },
    searchContainer: {
      margin: 16,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 12,
      backgroundColor: t.colors.card,
      borderWidth: 1,
      borderColor: t.colors.separator,
    },
    searchInput: { flex: 1, color: t.colors.label },
    row: {
      paddingHorizontal: 16,
      paddingVertical: 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: t.colors.background,
    },
    separator: { height: StyleSheet.hairlineWidth, backgroundColor: t.colors.separator },
    code: { color: t.colors.label, fontSize: 15, fontWeight: '700', width: 56 },
    name: { color: t.colors.label, fontSize: 15, flexShrink: 1 },
  });
}
