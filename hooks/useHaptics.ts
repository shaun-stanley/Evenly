import * as Haptics from 'expo-haptics';
import { useRef, useCallback } from 'react';

export type ImpactLevel = 'light' | 'medium' | 'heavy';

/**
 * useHaptics provides throttled haptic feedback helpers to avoid spamming.
 */
export function useHaptics(minIntervalMs: number = 120) {
  const lastRef = useRef(0);

  const canTrigger = () => {
    const now = Date.now();
    if (now - lastRef.current >= minIntervalMs) {
      lastRef.current = now;
      return true;
    }
    return false;
  };

  const impact = useCallback(async (level: ImpactLevel = 'light') => {
    if (!canTrigger()) return;
    try {
      const style =
        level === 'heavy'
          ? Haptics.ImpactFeedbackStyle.Heavy
          : level === 'medium'
          ? Haptics.ImpactFeedbackStyle.Medium
          : Haptics.ImpactFeedbackStyle.Light;
      await Haptics.impactAsync(style);
    } catch {}
  }, []);

  const notification = useCallback(async (success: boolean = true) => {
    if (!canTrigger()) return;
    try {
      await Haptics.notificationAsync(
        success ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Warning
      );
    } catch {}
  }, []);

  return { impact, notification } as const;
}
