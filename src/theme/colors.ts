/**
 * CMMS App Color System
 * Industrial dark theme optimized for field use
 */

export const Colors = {
  // Primary palette
  primary: '#1E3A5F',
  primaryLight: '#2A4D7A',
  primaryDark: '#142840',

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
  background: '#0F1923',
  backgroundSecondary: '#141F2B',
  surface: '#1A2A3A',
  surfaceLight: '#223344',
  surfaceElevated: '#2A3A4A',

  // Text
  text: '#ECF0F1',
  textSecondary: '#7F8C9B',
  textMuted: '#4A5568',
  textInverse: '#0F1923',

  // Border
  border: '#2A3A4A',
  borderLight: '#344455',
  borderFocus: '#3498DB',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.6)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',

  // Glass effect
  glass: 'rgba(26, 42, 58, 0.85)',
  glassBorder: 'rgba(255, 255, 255, 0.08)',

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
