// Design tokens for the SaaS Template mobile app.
// Mirrors the web app's CSS custom properties from globals.css so both
// platforms share a consistent visual language.

// ---------------------------------------------------------------------------
// Colors
// ---------------------------------------------------------------------------

export const colors = {
  /** Warm orange -- primary brand color (matches --primary / #e8913a) */
  primary: "#e8913a",
  /** Lighter orange variant (matches --primary-light / #f0b03d) */
  primaryLight: "#f0b03d",
  /** Darker orange variant (matches --primary-dark / #c15415) */
  primaryDark: "#c15415",
  /** Very light tint of primary (--primary-50) */
  primary50: "#fdf8f1",
  /** Light tint of primary (--primary-100) */
  primary100: "#fcefd9",

  /** Accent / interactive color (--accent) */
  accent: "#e8913a",

  /** Page background (--background) */
  background: "#fdfbf7",
  /** Card / elevated surface background (--surface) */
  surface: "#ffffff",
  /** Hovered surface state (--surface-hover) */
  surfaceHover: "#f8f5f0",

  /** Main text color (--foreground) */
  foreground: "#281d15",
  /** Muted / secondary text (--color-muted) */
  muted: "#6b5c4f",

  /** Default border color (--border) */
  border: "#e9e4df",
  /** Stronger border for emphasis (--border-strong) */
  borderStrong: "#d6d0c9",

  /** Semantic: success (--success) */
  success: "#059669",
  /** Semantic: warning (--warning) */
  warning: "#d97706",
  /** Semantic: danger / error (--danger) */
  danger: "#dc2626",
  /** Semantic: informational (--info) */
  info: "#2563eb",

  /** Pure white */
  white: "#ffffff",
  /** Pure black */
  black: "#000000",

  /** Warm dark -- for CTA sections (--warm-dark) */
  warmDark: "#321f13",

  /** Translucent overlay for modals / backdrops */
  overlay: "rgba(0, 0, 0, 0.4)",
} as const;

// ---------------------------------------------------------------------------
// Spacing
// ---------------------------------------------------------------------------

export const spacing = {
  /** 4px */
  xs: 4,
  /** 8px */
  sm: 8,
  /** 16px */
  md: 16,
  /** 24px */
  lg: 24,
  /** 32px */
  xl: 32,
  /** 48px */
  xxl: 48,
} as const;

// ---------------------------------------------------------------------------
// Font sizes
// ---------------------------------------------------------------------------

export const fontSize = {
  /** 12px -- captions, badges */
  xs: 12,
  /** 14px -- secondary text */
  sm: 14,
  /** 16px -- body / default */
  base: 16,
  /** 18px -- slightly larger body */
  lg: 18,
  /** 20px -- sub-headings */
  xl: 20,
  /** 24px -- section headings */
  xxl: 24,
  /** 30px -- page titles */
  xxxl: 30,
} as const;

// ---------------------------------------------------------------------------
// Font weights (numeric values that React Native understands)
// ---------------------------------------------------------------------------

export const fontWeight = {
  normal: "400" as const,
  medium: "500" as const,
  semibold: "600" as const,
  bold: "700" as const,
};

// ---------------------------------------------------------------------------
// Border radii
// ---------------------------------------------------------------------------

export const borderRadius = {
  /** 6px -- subtle rounding (matches --ds-radius-sm) */
  sm: 6,
  /** 8px -- default rounding (matches --ds-radius-default) */
  md: 8,
  /** 12px -- larger rounding for modals etc. (matches --ds-radius-lg) */
  lg: 12,
  /** 9999px -- fully round (pills, avatars) */
  full: 9999,
} as const;

// ---------------------------------------------------------------------------
// Shadows (iOS + Android)
// ---------------------------------------------------------------------------

export const shadows = {
  sm: {
    shadowColor: "#281d15",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: "#281d15",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: "#281d15",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
} as const;

// ---------------------------------------------------------------------------
// Convenience theme object (all tokens bundled together)
// ---------------------------------------------------------------------------

const theme = {
  colors,
  spacing,
  fontSize,
  fontWeight,
  borderRadius,
  shadows,
} as const;

export default theme;
