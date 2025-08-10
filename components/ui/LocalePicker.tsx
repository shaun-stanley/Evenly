import React from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View, FlatList } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { SearchField } from '@/components/ui/SearchField';
import { LOCALES } from '@/utils/locales';
import { toShadowStyle } from '@/utils/shadow';

export type LocalePickerProps = {
  visible: boolean;
  selected?: string | 'system';
  onSelect: (locale?: string | 'system') => void;
  onClose: () => void;
  title?: string;
};

export function LocalePicker({ visible, selected, onSelect, onClose, title = 'Select Locale' }: LocalePickerProps) {
  const t = useTheme();
  const styles = React.useMemo(() => makeStyles(t), [t]);
  const [query, setQuery] = React.useState('');

  React.useEffect(() => {
    if (!visible) setQuery('');
  }, [visible]);

  const data = React.useMemo(() => {
    const items = LOCALES.filter((c) => {
      if (!query) return true;
      const q = query.toLowerCase();
      return c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q);
    });
    return [{ code: '__SYSTEM__', name: 'System (device)' }, ...items];
  }, [query]);

  return (
    <Modal
      visible={visible}
      onRequestClose={onClose}
      animationType={Platform.select({ ios: 'slide', default: 'fade' })}
      presentationStyle={Platform.select({ ios: 'pageSheet', default: 'fullScreen' }) as any}
      transparent={false}
    >
      <View style={styles.container}>
        <View style={[styles.header, styles.headerShadow]}>
          <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={onClose} hitSlop={8}>
            <Text style={styles.headerAction}>Cancel</Text>
          </Pressable>
          <Text style={styles.headerTitle}>{title}</Text>
          <View style={{ width: 60 }} />
        </View>

        <View style={styles.searchWrap}>
          <SearchField
            value={query}
            onChangeText={setQuery}
            placeholder="Search locale"
            returnKeyType="done"
          />
        </View>

        <FlatList
          data={data}
          keyExtractor={(item) => item.code}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item }) => {
            const isSystem = item.code === '__SYSTEM__';
            const isSelected = (selected ?? 'system') === (isSystem ? 'system' : item.code);
            return (
              <Pressable
                onPress={() => {
                  onSelect(isSystem ? 'system' : item.code);
                  onClose();
                }}
                style={({ pressed }) => [styles.row, pressed && { opacity: 0.8 }]}
                accessibilityRole="button"
                accessibilityLabel={isSystem ? item.name : `${item.code} ${item.name}`}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <Text style={styles.code}>{isSystem ? '' : item.code}</Text>
                  <Text style={styles.name}>{item.name}</Text>
                </View>
                {isSelected ? <IconSymbol name="checkmark" size={16} color={t.colors.tint as any} /> : null}
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
    headerShadow: toShadowStyle(t.shadows.header),
    headerTitle: { color: t.colors.label, fontSize: 16, fontWeight: '600' },
    headerAction: { color: t.colors.tint, fontSize: 16, fontWeight: '600' },
    searchWrap: { margin: 16 },
    row: {
      paddingHorizontal: 16,
      paddingVertical: 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: t.colors.background,
    },
    separator: { height: StyleSheet.hairlineWidth, backgroundColor: t.colors.separator },
    code: { color: t.colors.label, fontSize: 15, fontWeight: '700', width: 72 },
    name: { color: t.colors.label, fontSize: 15, flexShrink: 1 },
  });
}
