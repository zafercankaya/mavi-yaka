import { Platform } from 'react-native';

export const Colors = {
  primary: '#E8553A',
  primaryLight: '#FF7B5F',
  primaryDark: '#C4392A',
  accent: '#FF9F43',
  accentLight: '#FFD4A3',
  secondary: '#2D3436',
  success: '#2ED573',
  warning: '#FFA502',
  danger: '#FF4757',
  premium: '#F0C040',
  premiumDark: '#D4A017',

  background: '#D6D8D3',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  surfaceVariant: '#F0F1F5',
  card: '#FFFFFF',

  text: '#1A1D26',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textLight: '#9CA3AF',
  textInverse: '#FFFFFF',
  white: '#FFFFFF',
  black: '#000000',

  border: '#E5E7EB',
  borderLight: '#F0F1F5',
  divider: '#F0F1F5',

  tabBar: '#FFFFFF',
  tabBarInactive: '#9CA3AF',
  tabBarActive: '#E8553A',

  badge: '#E74C3C',
  error: '#DC3545',

  overlay: 'rgba(0,0,0,0.5)',
  shadow: 'rgba(0,0,0,0.08)',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  title: 28,
};

export const TAB_BAR_HEIGHT = Platform.OS === 'android' ? 64 : 85;

export const BorderRadius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 9999,
};
