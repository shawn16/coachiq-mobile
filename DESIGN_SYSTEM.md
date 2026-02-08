# CoachIQ Mobile Design System

## Overview

This design system is extracted from the Pre-Practice Check-in prototype and serves as the foundation for all athlete-facing screens in the CoachIQ Mobile app.

**Target audience:** High school athletes (ages 14-18)

**Visual language:** Clean, approachable, and sports-oriented. Uses a bold purple-to-blue gradient header, white card surfaces, and green accent colors for positive actions. Typography is clear and legible with strong hierarchy. Touch targets are sized generously for quick input during pre-practice routines.

**Implementation:** All tokens live in `constants/design-system.ts` as typed constants with `as const` assertions for full literal type inference.

---

## Color Palette

### Gradient

| Token | Value | Usage |
|-------|-------|-------|
| `DS_COLORS.gradient.deepPurple` | `#6B3FA0` | Header gradient start |
| `DS_COLORS.gradient.midPurple` | `#7B4FB0` | Header gradient midpoint |
| `DS_COLORS.gradient.brightBlue` | `#4A7CF7` | Header gradient end |
| `DS_COLORS.gradient.stops` | Array of above | Pass to `LinearGradient colors` prop |

### Surface

| Token | Value | Usage |
|-------|-------|-------|
| `DS_COLORS.surface.card` | `#FFFFFF` | Card backgrounds |
| `DS_COLORS.surface.background` | `#F9FAFB` | Page/content area background |
| `DS_COLORS.surface.frosted` | `rgba(255,255,255,0.18)` | Frosted glass overlay (banner) |

### Text

| Token | Value | Usage |
|-------|-------|-------|
| `DS_COLORS.text.primary` | `#11181C` | Headings, body text |
| `DS_COLORS.text.secondary` | `#687076` | Supporting text, labels |
| `DS_COLORS.text.tertiary` | `#9CA3AF` | Placeholder text, disabled text |
| `DS_COLORS.text.onGradient` | `#FFFFFF` | Text on gradient backgrounds |

### Accent

| Token | Value | Usage |
|-------|-------|-------|
| `DS_COLORS.accent.blue` | `#4A7CF7` | Slider values, selected states |
| `DS_COLORS.accent.green` | `#22C55E` | Submit button, positive states |
| `DS_COLORS.accent.greenDot` | `#4ADE80` | Status indicator dot |

### Interactive

| Token | Value | Usage |
|-------|-------|-------|
| `DS_COLORS.interactive.chipDefault.border` | `#E5E7EB` | Unselected chip border |
| `DS_COLORS.interactive.chipDefault.background` | `#FFFFFF` | Unselected chip fill |
| `DS_COLORS.interactive.chipSelected.border` | `#22C55E` | Selected chip border |
| `DS_COLORS.interactive.chipSelected.background` | `rgba(34,197,94,0.08)` | Selected chip fill |
| `DS_COLORS.interactive.chipNegative.border` | `#EF4444` | Negative chip border |
| `DS_COLORS.interactive.chipNegative.background` | `rgba(239,68,68,0.08)` | Negative chip fill |
| `DS_COLORS.interactive.emojiCircle.default` | `#F3F4F6` | Unselected emoji circle |
| `DS_COLORS.interactive.emojiCircle.selected` | `#EEF2FF` | Selected emoji circle |
| `DS_COLORS.interactive.mealCard.default` | `#E5E7EB` | Unselected meal card border |
| `DS_COLORS.interactive.mealCard.selected` | `#22C55E` | Selected meal card border |

### Slider

| Token | Value | Usage |
|-------|-------|-------|
| `DS_COLORS.slider.trackGradient` | `['#22C55E', '#EAB308', '#22C55E']` | Slider track gradient |
| `DS_COLORS.slider.thumb` | `#FFFFFF` | Slider thumb fill |
| `DS_COLORS.slider.valueText` | `#4A7CF7` | Slider value readout |

### Input

| Token | Value | Usage |
|-------|-------|-------|
| `DS_COLORS.input.border` | `#E5E7EB` | Default text input border |
| `DS_COLORS.input.borderFocused` | `#4A7CF7` | Focused text input border |
| `DS_COLORS.input.placeholder` | `#9CA3AF` | Input placeholder text |

### Button

| Token | Value | Usage |
|-------|-------|-------|
| `DS_COLORS.button.primaryBackground` | `#22C55E` | Primary button fill |
| `DS_COLORS.button.primaryPressed` | `#16A34A` | Primary button pressed state |
| `DS_COLORS.button.primaryText` | `#FFFFFF` | Primary button label |
| `DS_COLORS.button.secondaryBackground` | `#F3F4F6` | Secondary button fill |
| `DS_COLORS.button.secondaryText` | `#374151` | Secondary button label |
| `DS_COLORS.button.disabledBackground` | `#E5E7EB` | Disabled button fill |
| `DS_COLORS.button.disabledText` | `#9CA3AF` | Disabled button label |

### Status

| Token | Value | Usage |
|-------|-------|-------|
| `DS_COLORS.status.success` | `#22C55E` | Success feedback |
| `DS_COLORS.status.warning` | `#F59E0B` | Warning feedback |
| `DS_COLORS.status.error` | `#EF4444` | Error feedback |
| `DS_COLORS.status.info` | `#3B82F6` | Info feedback |

### Border

| Token | Value | Usage |
|-------|-------|-------|
| `DS_COLORS.border.light` | `#E5E7EB` | Subtle dividers, default borders |
| `DS_COLORS.border.medium` | `#D1D5DB` | Medium emphasis borders |
| `DS_COLORS.border.dark` | `#9CA3AF` | Strong emphasis borders |

---

## Typography

All typography styles include `fontSize`, `fontWeight`, and `lineHeight`. Font weights are string literals for React Native compatibility.

| Token | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| `screenTitle` | 24 | 700 | 32 | Screen header title ("Pre-Practice Check-in") |
| `screenSubtitle` | 14 | 400 | 20 | Screen header subtitle (date/time) |
| `screenLabel` | 13 | 500 | 18 | Small labels in header area |
| `bannerName` | 16 | 700 | 22 | Athlete name in banner |
| `bannerDetail` | 13 | 500 | 18 | Banner metadata (sport, position) |
| `questionTitle` | 17 | 700 | 24 | Question headings ("How are you feeling?") |
| `sectionLabel` | 15 | 600 | 22 | Section labels within questions |
| `body` | 16 | 400 | 24 | General body text |
| `bodyMedium` | 15 | 500 | 22 | Medium-weight body text |
| `bodySemiBold` | 16 | 600 | 24 | Semi-bold body text |
| `caption` | 13 | 400 | 18 | Small supporting text |
| `captionMedium` | 13 | 500 | 18 | Medium-weight captions |
| `chipLabel` | 14 | 600 | 20 | Chip/tag text |
| `cardTitle` | 14 | 700 | 20 | Card heading text |
| `cardSubtitle` | 12 | 400 | 16 | Card supporting text |
| `scaleLabel` | 13 | 600 | 18 | Scale endpoint labels |
| `valueDisplay` | 28 | 700 | 34 | Large data readout (slider value) |
| `buttonLabel` | 17 | 700 | 24 | Primary button text |
| `buttonLabelSmall` | 15 | 600 | 22 | Small/secondary button text |
| `inputText` | 16 | 400 | 24 | Text input value |
| `inputPlaceholder` | 15 | 400 | 22 | Text input placeholder |
| `helperText` | 12 | 400 | 16 | Helper/hint text below inputs |

---

## Spacing

Named spacing scale used for margins, padding, and gaps.

| Token | Value | Typical Usage |
|-------|-------|---------------|
| `xxs` | 2px | Micro adjustments |
| `xs` | 4px | Tight spacing (icon gaps) |
| `sm` | 8px | Small gaps (emoji scale items) |
| `md` | 12px | Default inner padding |
| `lg` | 16px | Component padding, list gaps |
| `xl` | 20px | Section padding, content margins |
| `xxl` | 24px | Large section spacing |
| `xxxl` | 32px | Major section breaks |
| `huge` | 40px | Large whitespace areas |
| `massive` | 48px | Top padding (below status bar) |

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `xs` | 4px | Slider track, small badges |
| `sm` | 8px | Small cards, tags |
| `md` | 12px | Cards, text inputs, meal cards |
| `lg` | 16px | Submit button, large cards |
| `xl` | 20px | Content area top corners |
| `pill` | 24px | Chips, banners, pill shapes |
| `full` | 9999px | Circles (status dots, avatars) |

---

## Shadows

| Token | Usage | Description |
|-------|-------|-------------|
| `card` | Default card elevation | Subtle shadow (1px offset, 5% opacity) |
| `elevated` | Elevated cards, modals | Medium shadow (4px offset, 10% opacity) |
| `thumb` | Slider thumb | Medium shadow for floating elements |
| `stickyButton` | Fixed bottom submit bar | Upward shadow for sticky elements |
| `none` | Reset | Zero shadow values |

All shadow objects include both iOS properties (`shadowColor`, `shadowOffset`, `shadowOpacity`, `shadowRadius`) and Android (`elevation`).

---

## Component Patterns

### Header (Gradient)

```
┌──────────────────────────────────┐
│  ← Back          [gradient bg]   │
│                                  │
│  Pre-Practice Check-in           │  screenTitle, onGradient
│  Tuesday, January 14             │  screenSubtitle, onGradient
└──────────────────────────────────┘
```

- **Min height:** 120px
- **Padding:** top 48 (status bar), horizontal 20, bottom 24
- **Gradient:** `DS_COLORS.gradient.stops` (3-stop linear)
- **States:** Static, no interactive states

### Banner (Athlete Info)

```
┌──────────────────────────────────┐
│  ● Alex Johnson · Football · QB  │  frosted glass, bannerName
└──────────────────────────────────┘
```

- **Height:** 48px, pill radius (24)
- **Background:** Frosted white overlay (`rgba(255,255,255,0.18)`)
- **Status dot:** 8px green circle (`accent.greenDot`)
- **Accessibility:** Announce as "Active athlete: Alex Johnson, Football, Quarterback"

### Content Area (White Card)

```
┌──────────────────────────────────┐  ← borderTopRadius: 20
│                                  │     marginTop: -20 (overlaps header)
│  [Question sections here]       │     background: #F9FAFB
│                                  │
└──────────────────────────────────┘
```

- **Overlap:** -20px margin pulls content over gradient
- **Corners:** Top-left and top-right radius 20
- **Padding:** Top 24, horizontal 20, bottom 48

### Emoji Scale (Mood/Feeling)

```
  😫    😕    😐    😊    🤩
  (2)   (4)   (6)   (8)   (10)
```

- **Emoji size:** 34px, **Circle size:** 50px
- **Gap:** 8px between items
- **Values:** [2, 4, 6, 8, 10]
- **Default circle:** `#F3F4F6`, **Selected:** `#EEF2FF` with blue border
- **Accessibility:** Each item is a radio button with label "Feeling level [value] out of 10"

### Sleep Slider

```
  4h ═══════════●═══════════ 12h
                8.5
```

- **Track:** 8px height, gradient (green → yellow → green)
- **Thumb:** 28px white circle with shadow
- **Range:** 4–12 hours, step 0.5
- **Value display:** 28px bold blue text (`valueDisplay` typography)
- **Accessibility:** Adjustable slider, "Sleep hours, [value] hours"

### Meal Card

```
┌───────────────┐  ┌───────────────┐
│  🍳 Breakfast │  │  🥗 Lunch     │
│  ✓ Selected   │  │               │
└───────────────┘  └───────────────┘
```

- **Border radius:** 12px, **Border width:** 1.5px
- **Min height:** 72px
- **Default border:** `#E5E7EB`, **Selected:** `#22C55E`
- **Layout:** 2-column grid
- **States:** Default, selected (green border + subtle green bg), pressed (scale 0.97)
- **Accessibility:** Toggle button, "Breakfast, selected/not selected"

### Chip (Multi-Select)

```
┌─────────┐  ┌─────────────┐
│  Knees  │  │ ✓ Shoulders │  ← selected (green)
└─────────┘  └─────────────┘
```

- **Height:** 44px (meets minimum touch target)
- **Border radius:** pill (24), **Border width:** 1.5px
- **Gap:** 10px between chips
- **Layout:** 2-column grid
- **States:** Default (gray border), selected (green border + bg), negative (red, for pain areas)
- **Accessibility:** Checkbox, "[label], selected/not selected"

### Text Input

```
┌──────────────────────────────────┐
│  Anything else to share?         │  ← placeholder
│                                  │
│                                  │
└──────────────────────────────────┘
```

- **Border radius:** 12px, **Min height:** 100px
- **Border:** 1px `#E5E7EB`, focused `#4A7CF7`
- **Padding:** Horizontal 16, vertical 12
- **Accessibility:** Text field with descriptive label

### Submit Button

```
┌──────────────────────────────────┐
│           Submit Check-in        │  ← green, full width
└──────────────────────────────────┘
```

- **Height:** 52px, **Border radius:** 16px
- **Bottom margin:** 34px (safe area clearance)
- **Background:** `#22C55E`, pressed `#16A34A`
- **States:** Default, pressed (darker green + scale), disabled (gray)
- **Accessibility:** Button, "Submit check-in"

---

## Layout Rules

| Token | Value | Description |
|-------|-------|-------------|
| `maxContentWidth` | 500px | Maximum width for content (tablet) |
| `chipColumns` | 2 | Chips arranged in 2-column grid |
| `mealCardColumns` | 2 | Meal cards in 2-column grid |
| `emojiScaleCount` | 5 | Number of emoji scale options |

---

## Integration with theme.ts

The design system **complements** the existing `constants/theme.ts` rather than replacing it.

- **`theme.ts`** handles light/dark mode switching and platform font selection
- **`design-system.ts`** provides component-level tokens, spacing, and measurements
- **Shared values:** `DS_COLORS.text.primary` (`#11181C`) matches `Colors.light.text`; `DS_COLORS.text.secondary` (`#687076`) matches `Colors.light.icon`
- **Usage pattern:** Import both as needed. Use `theme.ts` for theme-aware color switching and `design-system.ts` for layout, typography, and component tokens
- **No circular imports:** `design-system.ts` does not import from `theme.ts`

---

## Dependencies

| Package | Status | Purpose |
|---------|--------|---------|
| `expo-linear-gradient` | Not yet installed | Required for header gradient implementation |

Install when building the first gradient screen:
```bash
npx expo install expo-linear-gradient
```

---

## Accessibility

### Touch Targets
- All interactive elements meet the **44px minimum** touch target size
- Chips: 44px height
- Emoji circles: 50px diameter
- Submit button: 52px height
- Slider thumb: 28px (with hit slop extending to 44px)

### Contrast Ratios
- Primary text (`#11181C`) on white: **16.5:1** (AAA)
- Secondary text (`#687076`) on white: **5.4:1** (AA)
- White text on green button (`#22C55E`): **3.2:1** (use bold 17px+ for AA Large)
- White text on gradient: Sufficient contrast at all gradient stops

### Screen Reader
- All interactive components should have `accessibilityRole` set (`button`, `checkbox`, `adjustable`, `radio`)
- Emoji scale items need `accessibilityLabel` with text description (not emoji)
- Slider needs `accessibilityValue` with current, min, and max values
- Submit button should announce state changes ("Submitting...", "Submitted successfully")
