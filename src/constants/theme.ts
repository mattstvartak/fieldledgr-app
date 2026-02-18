import { MD3LightTheme, MD3DarkTheme, type MD3Theme } from 'react-native-paper';

// FieldLedgr brand colors
export const brand = {
  primary: '#2D5016', // Deep forest green
  primaryLight: '#4A7A2E',
  primaryDark: '#1a2e0d',
  accent: '#F5A623', // Warm amber for CTAs
} as const;

// Colorblind-friendly status palette — never rely on red/green alone
export const statusColors: Record<string, { bg: string; text: string; icon: string }> = {
  lead: { bg: '#F5F5F5', text: '#757575', icon: 'account-plus-outline' },
  quoted: { bg: '#E3F2FD', text: '#1565C0', icon: 'file-document-outline' },
  accepted: { bg: '#E8F5E9', text: '#2E7D32', icon: 'check-decagram-outline' },
  scheduled: { bg: '#E3F2FD', text: '#1565C0', icon: 'clipboard-text-outline' },
  en_route: { bg: '#FFF3E0', text: '#E65100', icon: 'car' },
  on_site: { bg: '#F3E5F5', text: '#7B1FA2', icon: 'map-marker-check' },
  in_progress: { bg: '#E8F5E9', text: '#2E7D32', icon: 'hammer-wrench' },
  completed: { bg: '#ECEFF1', text: '#37474F', icon: 'check-circle' },
  paid: { bg: '#E8F5E9', text: '#1B5E20', icon: 'cash-check' },
  canceled: { bg: '#FFEBEE', text: '#C62828', icon: 'close-circle-outline' },
};

export const clockedInColor = '#FF6F00'; // Amber/orange — unmissable

export const lightTheme: MD3Theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: brand.primary,
    primaryContainer: '#d4edbc',
    secondary: brand.accent,
    secondaryContainer: '#fde8c8',
    background: '#FAFAFA',
    surface: '#FFFFFF',
    surfaceVariant: '#F0F0F0',
    error: '#B00020',
    onPrimary: '#FFFFFF',
    onSecondary: '#000000',
    onBackground: '#1C1C1C',
    onSurface: '#1C1C1C',
    onSurfaceVariant: '#49454F',
    outline: '#79747E',
  },
};

export const darkTheme: MD3Theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#8CC665',
    primaryContainer: '#2D5016',
    secondary: '#F5A623',
    secondaryContainer: '#5C3D00',
    background: '#121212',
    surface: '#1E1E1E',
    surfaceVariant: '#2A2A2A',
    error: '#CF6679',
    onPrimary: '#003300',
    onSecondary: '#000000',
    onBackground: '#E0E0E0',
    onSurface: '#E0E0E0',
    onSurfaceVariant: '#CAC4D0',
    outline: '#938F99',
  },
};

// Typography constraints per design spec
export const typography = {
  bodyMinSize: 16,
  labelMinSize: 14,
  headerFont: 'DMSerifText-Regular', // logo/headers only
  bodyFont: undefined, // system font
} as const;

// Touch targets per accessibility spec
export const touchTargets = {
  minimum: 48,
  preferred: 56,
} as const;
