# Evenly iOS HIG Upgrade: Hooks, Tokens, and Primitives

This doc summarizes the key additions for Apple HIG compliance and how to use them.

## New Hooks

- __useHaptics (`hooks/useHaptics.ts`)__
  - Throttled, easy haptic helpers: `impact(level?: 'light'|'medium'|'heavy')` and `notification(success?: boolean)`.
  - Use in press handlers for microinteractions. Example:
    ```tsx
    const haptics = useHaptics();
    <Pressable onPress={() => haptics.impact('light')} />
    ```

- __useReducedMotion (`hooks/useReducedMotion.ts`)__
  - Returns boolean `true` when the system Reduce Motion setting is enabled.
  - Use to switch animations to instant updates, or fall back to opacity changes instead of scale transforms.

- __useDynamicTypeScale (`hooks/useDynamicTypeScale.ts`)__
  - Returns `{ fontScale, scale }` where `scale(n)` multiplies the given size by the current font scale.
  - Use only for sizing custom UI; Text already honors Dynamic Type by default when `allowFontScaling` is true.

## Theme Motion Tokens

- Tokens live in `theme/tokens.ts` under `t.motion`.
  - __Durations__: `t.motion.durations.fast | medium | slow`
  - __Easing__: `t.motion.easing.standard(x)` (identity by default; swap when adding custom curves)

Use these for all animations to keep motion consistent.

## Refactored Primitives

- __Button (`components/ui/Button.tsx`)__
  - Now uses `useHaptics` for consistent feedback.
  - Continues to support size, shape, and block props with Apple-native spacing and typography.

- __ListItem (`components/ui/ListItem.tsx`)__
  - Uses `useHaptics` when `enableHaptics` is true (default true).
  - Standardized spacing/typography via theme tokens.

## Screen Updates

- __Group Detail (`app/group/[id]/index.tsx`)__
  - Animated net balance uses `t.motion.durations.medium`.
  - Respects Reduce Motion: instantly updates values and uses opacity pressed-state instead of scale.
  - All haptics moved to `useHaptics`.

## Guidelines

- __Navigation__: Prefer small titles and a universal back/close on non-root screens.
- __Spacing__: Use `t.spacing.*` throughout; avoid per-item ad hoc padding.
- __Typography__: Use `t.text.*` for iOS HIG text styles.
- __Colors__: Use semantic `t.colors.*`, not hard-coded hex when possible.
- __Motion__: Respect `useReducedMotion` and use `t.motion` tokens.
- __Accessibility__: Provide roles, labels, hints, and large touch targets.

## Next Steps

- Finish migrating remaining screens to use the hooks and motion tokens.
- Add unit tests for formatting and motion reducers where feasible.
- Extend easing tokens with standardized curves when we finalize motion language.
