/**
 * CMMS App Color System
 * Industrial dark theme optimized for field use
 */

export const Colors = {
  // Primary palette
  primary: '#3B82F6', // Standard Blue
  primaryLight: '#60A5FA',
  primaryDark: '#2E78F1',

  // Status colors
  success: '#2ECC71',
  successLight: '#A3E4C1',
  successDark: '#1A9B50',

  warning: '#F39C12',
  warningLight: '#F9D77E',
  warningDark: '#C87F0A',

  danger: '#E74C3C',
  dangerLight: '#F1948A',
  dangerDark: '#C0392B',

  info: '#3498DB',
  infoLight: '#85C1E9',
  infoDark: '#2471A3',

  // Background
  background: '#0B1120', // Dark industrial blue
  backgroundSecondary: '#182954', // Dark Slate Blue (ICONNET)
  surface: '#1E293B', // Card background for grid items
  surfaceLight: '#334155',
  surfaceElevated: '#334155',

  // Text
  text: '#F8FAFC',
  textSecondary: '#CBD5E1',
  textMuted: '#94A3B8',
  textInverse: '#0B1120',

  // Border
  border: '#334155',
  borderLight: '#475569',
  borderFocus: '#3B82F6',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.7)',
  overlayLight: 'rgba(0, 0, 0, 0.4)',

  // Glass effect
  glass: 'rgba(30, 41, 59, 0.85)',
  glassBorder: 'rgba(255, 255, 255, 0.1)',

  // Misc
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',

  // Status badge backgrounds
  statusOk: 'rgba(46, 204, 113, 0.15)',
  statusWarning: 'rgba(243, 156, 18, 0.15)',
  statusCritical: 'rgba(231, 76, 60, 0.15)',
  statusNa: 'rgba(127, 140, 155, 0.15)',
} as const;

export type ColorKey = keyof typeof Colors;
