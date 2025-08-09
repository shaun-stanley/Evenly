# Phase 2: iOS Polish & UX

This plan drives systematic polish toward an Apple‑native look and feel.
We will deliver in small, high‑quality chunks with clear acceptance criteria.

## Workstreams

1) Design Tokens & Theming
- Tokens: colors (system, semantic), spacing, radius, shadow, typography.
- Light/Dark mode via system color scheme.
- Deliverables: `theme/tokens.ts`, `theme/ThemeProvider.tsx`, `hooks/useTheme.ts`.
- Acceptance: All screens/components use tokens; switching OS theme updates UI.

2) Navigation & Headers
- Single owner for headers (root header hidden), consistent title case, back chevron, spacing.
- Create `components/ui/HeaderIconButton.tsx` for icon actions.
- Acceptance: No duplicate headers; consistent spacing/titles/icons app‑wide.

3) Cards & Lists
- `Card` component with subtle iOS shadows/radius; `ListItem` with avatar/icon, title/subtitle/chevron/amount.
- Inset separators and proper hit areas.
- Acceptance: Group header card and Expenses list refactored to use shared components.

4) Forms UX
- `FormField` component; keyboard‑safe layout by default; autoCapitalize for titles.
- Currency amount formatting while typing; numeric keypad; validation states; disabled actions; clear buttons.
- Acceptance: Add/Edit Expense use shared components; amount formats as currency; validation and haptics consistent.

5) Icons & SF Symbols
- Centralize mappings in `components/ui/IconSymbol.tsx`; add all used symbols.
- Acceptance: All icons come from IconSymbol; no ad‑hoc icons in screens.

6) Haptics & Microinteractions
- Standardize patterns (impact: light/medium; notifications: success/warning/error).
- Pressable scale/opacity feedback where appropriate.
- Acceptance: Primary actions and swipe actions provide consistent feedback.

7) Empty States & Errors
- Friendly empty states with icon and guidance; error toasts/alerts; hydration guard message.
- Acceptance: Every top‑level screen has an empty state; errors are obvious and actionable.

8) Accessibility & Intl
- Dynamic Type; min 44x44 targets; VoiceOver labels; currency/date localization via Intl.
- Acceptance: Basic a11y audit passes; large text remains usable.

9) QA & Polish Checklist
- Test: iOS light/dark, small/XL fonts, iPhone SE/Max, performance, gestures reliability.
- Acceptance: Checklist completed with no blockers.

## Sequence (Sprints)
- Sprint 2.1: Tokens/Theming + Nav/Header + Icon system
- Sprint 2.2: Cards/Lists + Swipe wrappers
- Sprint 2.3: Forms UX + Currency formatting
- Sprint 2.4: Haptics/Microinteractions + Empty states
- Sprint 2.5: Accessibility + QA pass

## Milestone Definitions
- M2.1 Theme Ready: All tokens wired; headers consistent; icons standardized.
- M2.2 Components Ready: Cards/ListItems replace screen‑specific UI.
- M2.3 Forms Ready: Add/Edit Expense share FormField; live currency formatting.
- M2.4 Feedback Ready: Haptics + animations + empty states complete.
- M2.5 Access/QA Ready: A11y + QA checklist done.

## Risks & Notes
- Keep 3rd‑party minimal to preserve HIG.
- Reuse Expo libs only (haptics, blur, symbols).
- Refactors should be incremental and type‑safe.
