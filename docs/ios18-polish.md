# iOS 18 Polish: Design System and Usage Guide

This document summarizes the tokens, components, and patterns to achieve an Apple-authentic look on iOS 18 while keeping Android acceptable.

## Tokens (theme/tokens.ts via useTheme)

- Colors (semantic)
  - Use `t.colors.background` for grouped views, `t.colors.card` for card/list cells.
  - Prefer new iOS aliases when needed: `systemBackground`, `secondarySystemBackground`, `tertiarySystemBackground`.
  - Text: `label`, `secondaryLabel`.
  - Accents: `tint`, `tintColor`, `link`.
  - Hairline: `separator`.
  - Status: `success`, `danger`, `warning`.
- Spacing
  - 4pt grid: `t.spacing.xs|s|m|l|xl|xxl`.
- Radius
  - Default 12pt (`t.radius.md`) for cards; `sm` for list cells, `lg` for modals.
- Text styles (Dynamic Type-friendly)
  - `t.text.largeTitle`, `title1|2|3`, `headline`, `body`, `callout`, `subheadline`, `footnote`, `caption1|2`.
- Motion (`t.motion`)
  - Durations: `fast|medium|slow` and `easing.standard(x)`.

## Hooks

- `useHaptics()`
  - `impact('light'|'medium'|'heavy')`, `notification(success?)` with throttle.
- `useReducedMotion()`
  - Switch motion to instant/opacity when true.
- `useDynamicTypeScale()`
  - Access `fontScale` or `scale(n)` for custom sizing; Text already scales by default.

## Components

- Grouped lists
  - Use `components/ui/GroupedSection` to wrap rows and auto-insert hairline separators (no per-row borders).
  - Use `Separator` sparingly for custom dividers; prefer GroupedSection.
- ListItem
  - Props: `variant="card"|"row"`, `outlined?: boolean` (off by default), `inset?: boolean`, `showChevron`.
  - No default border; rely on separators or `outlined` when necessary.
- Card
  - Props: `padded`, `elevated`, `variant` (shadow token), `outlined?: boolean`.
  - No default border; use subtle elevation and `outlined` only when required.
- Button
  - Variants: `filled|gray|destructive`, sizes: `small|medium|large`, shape: `rounded|pill`, `block`.
  - Uses haptics and correct touch targets (>=44pt).

## Navigation & Tabs

- Prefer small titles by default; enable large titles only where appropriate (e.g., Overview/Home).
- Use `HeaderIconButton` with SF Symbols for back/close and actions.
- Keep header blur/translucency on iOS via `HeaderBackground` and transparent styles.
- Tab bar uses SF Symbols, correct weight/scale, and blur background.

## Patterns & Guidelines

- Borders
  - Avoid strong borders. Use hairline `Separator` or `GroupedSection` and spacing to create structure.
- Spacing
  - Use tokenized paddings/margins throughout; avoid ad hoc values.
- Typography
  - Always use `t.text.*`. Keep weights/sizes consistent with HIG.
- Motion
  - Use `t.motion` tokens; respect `useReducedMotion`.
- Accessibility
  - `allowFontScaling` on Text, `minHeight: 44` for touch areas, proper `accessibilityLabel` and `accessibilityHint`.

## Example: Detail Summary

- Replace bordered summary boxes with:

```tsx
<GroupedSection inset>
  <Row label="Type">...</Row>
  <Row label="Date">...</Row>
</GroupedSection>
```

## Maintenance

- When adding new UI, start from shared primitives and tokens.
- Keep React Navigation header colors as plain hex (not PlatformColor) to avoid runtime issues.
