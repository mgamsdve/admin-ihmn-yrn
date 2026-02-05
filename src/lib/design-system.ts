/**
 * Design System - Couleurs, espacements, typographies
 * Single source of truth pour la cohérence visuelle
 */

export const colors = {
  // Primaire (bleu moderne)
  primary: {
    50: '#EEF4FF',
    100: '#DCE7FF',
    200: '#B7CFFF',
    300: '#8FB4FF',
    400: '#5C8DFF',
    500: '#3B6CFF', // Main
    600: '#2A52E6',
    700: '#1F3DAD',
    800: '#182E82',
    900: '#111F59',
  },
  // Success
  success: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399',
    500: '#10B981', // Main
    600: '#059669',
    700: '#047857',
    800: '#065F46',
    900: '#064E3B',
  },
  // Danger
  danger: {
    50: '#FFF1F2',
    100: '#FFE4E6',
    200: '#FECDD3',
    300: '#FDA4AF',
    400: '#FB7185',
    500: '#F43F5E', // Main
    600: '#E11D48',
    700: '#BE123C',
    800: '#9F1239',
    900: '#881337',
  },
  // Warning
  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B', // Main
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },
  // Neutral/Gray
  gray: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B', // Main
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  },
  // Status colors
  info: '#38BDF8',
  bg: '#F5F7FB',
  bgAlt: '#FFFFFF',
  text: {
    primary: '#111827',
    secondary: '#6B7280',
    tertiary: '#9CA3AF',
  },
  border: '#E2E8F0',
  shadow: 'rgba(15, 23, 42, 0.06)',
  overlay: 'rgba(15, 23, 42, 0.45)',
};

export const spacing = {
  0: '0',
  1: '0.25rem', // 4px
  2: '0.5rem', // 8px
  3: '0.75rem', // 12px
  4: '1rem', // 16px
  5: '1.25rem', // 20px
  6: '1.5rem', // 24px
  8: '2rem', // 32px
  10: '2.5rem', // 40px
  12: '3rem', // 48px
  16: '4rem', // 64px
  // Named aliases for convenience
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '2.5rem',
  '3xl': '3rem',
  '4xl': '4rem',
} as const;

export const typography = {
  // Headings
  h1: {
    fontSize: '2.25rem', // 36px
    fontWeight: 800,
    lineHeight: 1.15,
    letterSpacing: '-0.025em',
  },
  h2: {
    fontSize: '1.75rem', // 28px
    fontWeight: 700,
    lineHeight: 1.25,
    letterSpacing: '-0.02em',
  },
  h3: {
    fontSize: '1.375rem', // 22px
    fontWeight: 600,
    lineHeight: 1.35,
    letterSpacing: '-0.01em',
  },
  h4: {
    fontSize: '1.125rem', // 18px
    fontWeight: 600,
    lineHeight: 1.35,
  },
  // Body
  body: {
    fontSize: '1rem', // 16px
    fontWeight: 400,
    lineHeight: 1.5,
  },
  bodySmall: {
    fontSize: '0.875rem', // 14px
    fontWeight: 400,
    lineHeight: 1.5,
  },
  bodyTiny: {
    fontSize: '0.75rem', // 12px
    fontWeight: 400,
    lineHeight: 1.5,
  },
  // Special
  label: {
    fontSize: '0.875rem', // 14px
    fontWeight: 500,
    lineHeight: 1.5,
    letterSpacing: '0.01em',
  },
  caption: {
    fontSize: '0.75rem', // 12px
    fontWeight: 400,
    lineHeight: 1.5,
  },
  code: {
    fontSize: '0.75rem', // 12px
    fontWeight: 500,
    fontFamily: '"JetBrains Mono", "Courier New", monospace',
  },
};

export const borderRadius = {
  none: '0',
  sm: '0.375rem', // 6px
  base: '0.5rem', // 8px
  md: '0.75rem', // 12px
  lg: '1rem', // 16px
  full: '9999px',
};

export const shadows = {
  none: 'none',
  xs: '0 1px 2px rgba(15, 23, 42, 0.04)',
  sm: '0 2px 6px rgba(15, 23, 42, 0.06)',
  base: '0 6px 12px rgba(15, 23, 42, 0.08)',
  md: '0 10px 20px rgba(15, 23, 42, 0.1)',
  lg: '0 12px 24px rgba(15, 23, 42, 0.12)',
  xl: '0 20px 40px rgba(15, 23, 42, 0.12)',
};

export const transitions = {
  fast: '140ms cubic-bezier(0.4, 0, 0.2, 1)',
  base: '220ms cubic-bezier(0.2, 0.8, 0.2, 1)',
  slow: '320ms cubic-bezier(0.2, 0.8, 0.2, 1)',
};

export const breakpoints = {
  xs: '480px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// Export as single object for convenience
export const designSystem = {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
  transitions,
  breakpoints,
};
