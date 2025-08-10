# Apple-Native UI/UX Transformation Plan (Phase 3)

This plan drives a repo-wide transformation to an Apple-authentic iOS 18 look & feel. Deliver high-quality, cohesive experiences using system-aligned tokens, microinteractions, and components. Keep third-party UI minimal.

## Objectives
- Replace outlines/hairlines with filled surfaces, blur, and subtle shadows.
- Standardize spacing, typography, and colors with theme tokens.
- Adopt shared, native-like components across the app.
- Add microinteractions, haptics, animations, and discoverability Apple would include.
- Ensure great accessibility, performance, and reliability.

## Design Tenets
- Clarity: generous spacing, readable type, true separators only.
- Depth: layered surfaces with blur and soft shadows; no hard borders.
- Deference: content-first UI, unobtrusive chroma.
- Familiarity: align with iOS 18 HIG patterns and microinteractions.

## Core Primitives
- Colors: background, card, fill, label, secondaryLabel, separator, tint.
- Typography: largeTitle, title, headline, subheadline, body, footnote.
- Spacing & Radius: xs/s/m/l/xl/xxl; sm/md/lg radii.
- Shadows: header, card, floating, modal.
- Motion: ease curves, spring for affordances, reduce-motion support.

## Shared Components (deliverables)
- Buttons: primary, secondary, tertiary (filled/tonal, no outlines).
- SearchField & SearchBar: filled, clearable, with recent searches.
- SegmentedControl: filled Apple style; supports scroll if overflow.
- ListItem: avatar/icon, title/subtitle, chevron/amount, inset separators.
- GroupedSection: lists/forms with titles, footers, spacing.
- FormField: label, input, helper/error; consistent paddings and states.
- Sheet/Modal: pageSheet and compact sheet with blur + shadow.
- Banner/Toast: subtle in-app notifications.
- EmptyState: friendly icon + guidance.

## Navigation & Hierarchy
- Unified headers with small titles on inner screens; consistent back affordance.
- System-like transitions; respect reduce motion.
- Standard tab bar behavior and contextual actions via header/right.

## Lists & Collections
- Inset separators only; swipe actions with haptics.
- Pull-to-refresh with playful but restrained animation.
- Section headers for grouping and clarity.

## Forms & Inputs
- Filled inputs, no outlines; proper keyboard types and return flows.
- Live currency formatting; validation and disabled/inline feedback.
- Autocomplete and accessory actions where helpful.

## Search & Scope
- Prominent search with recent queries and suggestions.
- Scope bar/segmented filters.
- Consistent empty states and guidance.

## Microinteractions & Haptics
- Selection and success haptics.
- Subtle scale/opacity on presses.
- Gentle springs for chips/segmented transitions.

## Accessibility
- VoiceOver labels/hints, Dynamic Type, 44x44 hit targets.
- Color contrast and focus order verified.
- Reduce Motion support.

## System Integrations (later milestones)
- Siri Shortcuts for common actions.
- Spotlight indexing of groups/expenses.
- Share Sheet for exporting receipts.
- Widgets for balances/recents.

## Performance & QA
- Smooth 60fps interactions; avoid overdraw.
- Device matrix: SE/13 Mini/15 Pro Max; Light/Dark; Small–XL text.
- Visual regression snapshots for key screens.

## Rollout Plan
1) Components: SegmentedControl, FormField, Sheet, Banner.
2) Activity: search recents + scope bar; polish list cards.
3) Expense flows: FormField adoption; currency formatting in-place.
4) Pickers: unify using SearchField + Sheet; remove outlines.
5) Haptics & microinteractions pass across app.
6) Accessibility audit + fixes.
7) Optional system integrations.

## Acceptance Criteria
- No outlines on interactive surfaces; filled/blur/shadow used appropriately.
- Shared components used across all screens.
- Search has recents and scope; lists use inset separators.
- Haptics present on key interactions; animations respect Reduce Motion.
- A11y checks pass; QA matrix green.
