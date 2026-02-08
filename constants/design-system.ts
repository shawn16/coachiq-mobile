/**
 * CoachIQ Mobile Design System
 *
 * Extracted from the Pre-Practice Check-in prototype.
 * All tokens use `as const` for literal type inference.
 * Sections are ordered so downstream sections can reference upstream ones.
 */

// ─── 1. Colors ───────────────────────────────────────────────────────────────

export const DS_COLORS = {
  gradient: {
    deepPurple: '#7B2FF7',
    midPurple: '#5B6AF7',
    brightBlue: '#4A8CF7',
    stops: ['#7B2FF7', '#5B6AF7', '#4A8CF7'] as const,
  },

  surface: {
    card: '#FFFFFF',
    background: '#F9FAFB',
    frosted: 'rgba(255,255,255,0.18)',
  },

  text: {
    primary: '#11181C',
    secondary: '#687076',
    tertiary: '#9CA3AF',
    onGradient: '#FFFFFF',
  },

  accent: {
    blue: '#4A7CF7',
    green: '#22C55E',
    greenDot: '#4ADE80',
  },

  interactive: {
    chipDefault: {
      border: '#E5E7EB',
      background: '#FFFFFF',
    },
    chipSelected: {
      border: '#22C55E',
      background: 'rgba(34,197,94,0.08)',
    },
    chipNegative: {
      border: '#EF4444',
      background: 'rgba(239,68,68,0.08)',
    },
    emojiCircle: {
      default: '#F3F4F6',
      selected: '#EEF2FF',
    },
    mealCard: {
      default: '#E5E7EB',
      selected: '#22C55E',
    },
  },

  slider: {
    trackGradient: ['#FF3B30', '#EAB308', '#22C55E'] as const,
    thumb: '#FFFFFF',
    valueText: '#4A7CF7',
  },

  rpeScale: {
    green: '#22C55E',
    yellow: '#EAB308',
    orange: '#F97316',
    red: '#EF4444',
    unselectedBg: '#F3F4F6',
    unselectedText: '#687076',
    selectedText: '#FFFFFF',
  },

  input: {
    border: '#E5E7EB',
    borderFocused: '#4A7CF7',
    placeholder: '#9CA3AF',
  },

  button: {
    primaryBackground: '#22C55E',
    primaryPressed: '#16A34A',
    primaryText: '#FFFFFF',
    secondaryBackground: '#F3F4F6',
    secondaryText: '#374151',
    disabledBackground: '#E5E7EB',
    disabledText: '#9CA3AF',
  },

  status: {
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },

  border: {
    light: '#E5E7EB',
    medium: '#D1D5DB',
    dark: '#9CA3AF',
  },
} as const;

// ─── 2. Typography ───────────────────────────────────────────────────────────

export const DS_TYPOGRAPHY = {
  // Screen header group
  screenTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    lineHeight: 32,
  },
  screenSubtitle: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  screenLabel: {
    fontSize: 13,
    fontWeight: '500' as const,
    lineHeight: 18,
  },

  // Banner
  bannerName: {
    fontSize: 16,
    fontWeight: '700' as const,
    lineHeight: 22,
  },
  bannerDetail: {
    fontSize: 13,
    fontWeight: '500' as const,
    lineHeight: 18,
  },

  // Questions
  questionTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    lineHeight: 24,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '600' as const,
    lineHeight: 22,
  },

  // Body
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  bodyMedium: {
    fontSize: 15,
    fontWeight: '500' as const,
    lineHeight: 22,
  },
  bodySemiBold: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
  },

  // Small
  caption: {
    fontSize: 13,
    fontWeight: '400' as const,
    lineHeight: 18,
  },
  captionMedium: {
    fontSize: 13,
    fontWeight: '500' as const,
    lineHeight: 18,
  },

  // Components
  chipLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    lineHeight: 20,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    lineHeight: 20,
  },
  cardSubtitle: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
  scaleLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    lineHeight: 18,
  },

  // Data
  valueDisplay: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 34,
  },

  // Actions
  buttonLabel: {
    fontSize: 17,
    fontWeight: '700' as const,
    lineHeight: 24,
  },
  buttonLabelSmall: {
    fontSize: 15,
    fontWeight: '600' as const,
    lineHeight: 22,
  },

  // Input
  inputText: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  inputPlaceholder: {
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 22,
  },

  // Helper
  helperText: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
} as const;

// ─── 3. Spacing ──────────────────────────────────────────────────────────────

export const DS_SPACING = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
  massive: 48,
} as const;

// ─── 4. Border Radius ────────────────────────────────────────────────────────

export const DS_RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 24,
  full: 9999,
} as const;

// ─── 5. Shadows ──────────────────────────────────────────────────────────────

export const DS_SHADOWS = {
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  elevated: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  thumb: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  stickyButton: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
} as const;

// ─── 6. Component Tokens ─────────────────────────────────────────────────────

export const DS_COMPONENTS = {
  header: {
    minHeight: 120,
    paddingTop: DS_SPACING.massive,
    paddingHorizontal: DS_SPACING.xl,
    paddingBottom: DS_SPACING.xxl,
    gradientColors: DS_COLORS.gradient.stops,
  },

  banner: {
    height: 48,
    borderRadius: DS_RADIUS.pill,
    backgroundColor: DS_COLORS.surface.frosted,
    statusDotSize: 8,
    paddingHorizontal: DS_SPACING.lg,
  },

  contentArea: {
    borderTopLeftRadius: DS_RADIUS.xl,
    borderTopRightRadius: DS_RADIUS.xl,
    marginTop: -20,
    paddingTop: DS_SPACING.xxl,
    paddingHorizontal: DS_SPACING.xl,
    paddingBottom: DS_SPACING.massive,
    backgroundColor: DS_COLORS.surface.background,
  },

  emojiScale: {
    emojiSize: 34,
    circleSize: 50,
    gap: DS_SPACING.sm,
    values: [2, 4, 6, 8, 10] as const,
  },

  rpeScale: {
    buttonHeight: 44,
    borderRadius: DS_RADIUS.sm,
    gap: DS_SPACING.xs,
    selectedScale: 1.15,
  },

  sleepSlider: {
    trackHeight: 8,
    thumbSize: 28,
    min: 4,
    max: 12,
    step: 0.5,
    trackBorderRadius: DS_RADIUS.xs,
  },

  mealCard: {
    borderRadius: DS_RADIUS.md,
    borderWidth: 1.5,
    minHeight: 72,
    paddingVertical: DS_SPACING.md,
    paddingHorizontal: DS_SPACING.lg,
  },

  chip: {
    height: 44,
    borderRadius: DS_RADIUS.pill,
    borderWidth: 1.5,
    gap: 10,
    paddingHorizontal: DS_SPACING.lg,
  },

  textInput: {
    borderRadius: DS_RADIUS.md,
    minHeight: 100,
    paddingHorizontal: DS_SPACING.lg,
    paddingVertical: DS_SPACING.md,
    borderWidth: 1,
  },

  submitButton: {
    height: 52,
    borderRadius: DS_RADIUS.lg,
    bottomMargin: 34,
  },

  questionSection: {
    innerGap: DS_SPACING.md,
    sectionGap: 28,
  },

  pinDot: { size: 22, gap: 20, borderWidth: 2 },
  pinPad: { keySize: 72, keyGap: 16, keyBorderRadius: 36, keyBackground: 'rgba(255,255,255,0.15)' },
  stepIndicator: { dotSize: 8, dotGap: 8, activeOpacity: 1, inactiveOpacity: 0.35 },
} as const;

// ─── 7. Animation ────────────────────────────────────────────────────────────

export const DS_ANIMATION = {
  duration: {
    selection: 150,
    press: 100,
    transition: 300,
  },
  spring: {
    damping: 15,
    stiffness: 150,
    mass: 1,
  },
  pressedScale: 0.97,
} as const;

// ─── 8. Layout ───────────────────────────────────────────────────────────────

export const DS_LAYOUT = {
  maxContentWidth: 500,
  chipColumns: 2,
  mealCardColumns: 2,
  emojiScaleCount: 5,
} as const;

// ─── Emoji Scale Data ────────────────────────────────────────────────────────

export const DS_EMOJI_SCALES = {
  generic: ['😵', '😐', '🙂', '😁', '🔥'] as const,
  hydration: ['😵', '😐', '🙂', '😁', '💧'] as const,
  motivation: ['😢', '😐', '🙂', '😁', '🔥'] as const,
  focus: ['😵', '😐', '🙂', '😁', '🎯'] as const,
} as const;

// ─── 9. Barrel Export & Types ────────────────────────────────────────────────

export const DesignSystem = {
  colors: DS_COLORS,
  typography: DS_TYPOGRAPHY,
  spacing: DS_SPACING,
  radius: DS_RADIUS,
  shadows: DS_SHADOWS,
  components: DS_COMPONENTS,
  animation: DS_ANIMATION,
  layout: DS_LAYOUT,
  emojiScales: DS_EMOJI_SCALES,
} as const;

// Derived types
export type DSColor = typeof DS_COLORS;
export type DSTypography = typeof DS_TYPOGRAPHY;
export type DSSpacing = typeof DS_SPACING;
export type DSRadius = typeof DS_RADIUS;
export type DSShadows = typeof DS_SHADOWS;
export type DSComponents = typeof DS_COMPONENTS;
export type DSAnimation = typeof DS_ANIMATION;
export type DSLayout = typeof DS_LAYOUT;
export type DSEmojiScales = typeof DS_EMOJI_SCALES;
export type DSDesignSystem = typeof DesignSystem;
