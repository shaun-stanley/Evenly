// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolView, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, Platform, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Partial<Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>>;
export type IconSymbolName = SymbolViewProps['name'];

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING: IconMapping = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'chevron.left': 'chevron-left',
  // Common actions
  'pencil': 'edit',
  'pencil.circle.fill': 'edit',
  'trash': 'delete',
  'trash.circle.fill': 'delete',
  'plus.circle.fill': 'add-circle',
  'plus': 'add',
  'checkmark': 'check',
  'checkmark.circle': 'check-circle',
  // Tabs
  'chart.pie.fill': 'pie-chart',
  'person.3': 'group',
  'person.3.fill': 'group',
  'clock': 'schedule',
  'clock.fill': 'schedule',
  // Misc used
  'textformat': 'text-fields',
  'arrow.triangle.2.circlepath': 'autorenew',
  'paperclip': 'attach-file',
  'camera': 'photo-camera',
  'ellipsis.circle': 'more-horiz',
  'tray': 'inbox',
  'xmark': 'close',
  'text.bubble': 'chat-bubble-outline',
  'text.bubble.fill': 'chat-bubble',
};

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
  weight,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  if (Platform.OS === 'ios') {
    return <SymbolView name={name} tintColor={color} size={size} weight={weight} style={style as any} />;
  }
  return <MaterialIcons color={color} size={size} name={MAPPING[name] ?? 'circle'} style={style} />;
}
