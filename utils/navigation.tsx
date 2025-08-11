import React from 'react';
import { Platform } from 'react-native';

import HeaderBackground from '@/components/ui/HeaderBackground';
import type { Tokens } from '@/theme/tokens';

export type HeaderOptionsParams = {
  large: boolean;
};

export function getStackHeaderOptions(t: Tokens, { large }: HeaderOptionsParams) {
  return {
    headerLargeTitle: large,
    headerTintColor: t.colors.tint as any,
    headerTitleStyle: { ...(t.text as any).headline, color: t.colors.label as any },
    headerLargeTitleStyle: { ...(t.text as any).largeTitle, color: t.colors.label as any },
    headerShadowVisible: false,
    headerTransparent: Platform.OS === 'ios',
    headerStyle: { backgroundColor: Platform.OS === 'ios' ? 'transparent' : (t.colors.background as any) },
    headerBackground: Platform.OS === 'ios' ? (() => <HeaderBackground />) : undefined,
  };
}
