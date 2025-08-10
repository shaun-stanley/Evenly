import { useEffect, useState } from 'react';
import { PixelRatio, AccessibilityInfo } from 'react-native';

/**
 * Returns the current font scale and a helper to get scaled sizes.
 * React Native already scales Text by default when allowFontScaling is true.
 * This hook is useful when you need a scaled dimension or to react to changes.
 */
export function useDynamicTypeScale() {
  const [fontScale, setFontScale] = useState(PixelRatio.getFontScale());

  useEffect(() => {
    const update = () => setFontScale(PixelRatio.getFontScale());

    // Best-effort; RN doesn't have a universal event for font scale changes
    const sub: any = AccessibilityInfo.addEventListener?.('announcementFinished', update);

    return () => {
      if (sub && typeof sub.remove === 'function') sub.remove();
    };
  }, []);

  const scale = (size: number) => size * fontScale;

  return { fontScale, scale } as const;
}
