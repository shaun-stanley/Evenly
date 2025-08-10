import React from 'react';
import { Platform, Pressable, StyleSheet, TextInput, View, type StyleProp, type ViewStyle, type TextInputProps } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useHaptics } from '@/hooks/useHaptics';

export type SearchFieldProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  autoCapitalize?: TextInputProps['autoCapitalize'];
  autoCorrect?: boolean;
  returnKeyType?: TextInputProps['returnKeyType'];
  onSubmitEditing?: TextInputProps['onSubmitEditing'];
  onFocus?: TextInputProps['onFocus'];
  onBlur?: TextInputProps['onBlur'];
  autoFocus?: boolean;
  testID?: string;
};

export function SearchField({
  value,
  onChangeText,
  placeholder = 'Search',
  style,
  accessibilityLabel,
  autoCapitalize = 'none',
  autoCorrect = false,
  returnKeyType = 'search',
  onSubmitEditing,
  onFocus,
  onBlur,
  autoFocus,
  testID,
}: SearchFieldProps) {
  const t = useTheme();
  const haptics = useHaptics();
  const styles = React.useMemo(() => makeStyles(t), [t]);

  return (
    <View style={[styles.container, style]} testID={testID}>
      <IconSymbol name="magnifyingglass" size={16} color={t.colors.secondaryLabel as any} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={t.colors.secondaryLabel}
        accessibilityLabel={accessibilityLabel ?? placeholder}
        clearButtonMode="while-editing"
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        returnKeyType={returnKeyType}
        onSubmitEditing={onSubmitEditing}
        onFocus={onFocus}
        onBlur={onBlur}
        autoFocus={autoFocus}
      />
      {Platform.OS !== 'ios' && value.length > 0 ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Clear"
          onPress={() => {
            haptics.impact('light');
            onChangeText('');
          }}
          hitSlop={8}
          style={({ pressed }) => [styles.clearBtn, pressed && { opacity: 0.7 }]}
        >
          <IconSymbol name="xmark.circle.fill" size={16} color={t.colors.secondaryLabel as any} />
        </Pressable>
      ) : null}
    </View>
  );
}

function makeStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 12,
      backgroundColor: t.colors.fill,
      minHeight: 36,
    },
    input: {
      flex: 1,
      color: t.colors.label,
      paddingVertical: 0,
    },
    clearBtn: { marginLeft: 4 },
  });
}

export default SearchField;
