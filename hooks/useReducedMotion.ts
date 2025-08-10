import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/**
 * React Native hook for the system "Reduce Motion" setting.
 * Returns a boolean indicating whether motion should be reduced.
 */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (mounted) setReduced(Boolean(enabled));
      })
      .catch(() => {});

    // Modern RN returns a subscription with remove(); older versions accept removeEventListener
    const handler = (enabled: boolean) => setReduced(Boolean(enabled));
    const sub: any = AccessibilityInfo.addEventListener?.('reduceMotionChanged', handler);

    return () => {
      mounted = false;
      if (sub && typeof sub.remove === 'function') sub.remove();
      // Best-effort legacy cleanup if available
      else if (typeof (AccessibilityInfo as any).removeEventListener === 'function') {
        (AccessibilityInfo as any).removeEventListener('reduceMotionChanged', handler);
      }
    };
  }, []);

  return reduced;
}
