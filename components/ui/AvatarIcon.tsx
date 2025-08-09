import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { IconSymbol } from './IconSymbol';
import type { IconSymbolName } from './IconSymbol';

export type AvatarIconProps = {
  name: IconSymbolName;
  bgColor: string;
  size?: number; // icon size
  containerSize?: number; // avatar diameter
  style?: ViewStyle;
};

export function AvatarIcon({ name, bgColor, size = 18, containerSize = 36, style }: AvatarIconProps) {
  const radius = containerSize / 2;
  return (
    <View style={[styles.container, { width: containerSize, height: containerSize, borderRadius: radius, backgroundColor: bgColor }, style]}> 
      <IconSymbol name={name} color="#ffffff" size={size} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
