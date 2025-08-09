import React from 'react';
import { StyleSheet, View, PlatformColor } from 'react-native';
import { BlurView } from 'expo-blur';

export default function HeaderBackground() {
  // systemChromeMaterial matches native UINavigationBar material
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <BlurView tint="systemChromeMaterial" intensity={100} style={StyleSheet.absoluteFill} />
      {/* Hairline separator like UIKit */}
      <View
        style={{
          position: 'absolute',
          bottom: -StyleSheet.hairlineWidth, // align with edge
          left: 0,
          right: 0,
          height: StyleSheet.hairlineWidth,
          backgroundColor: PlatformColor('separator') as any,
        }}
      />
    </View>
  );
}
