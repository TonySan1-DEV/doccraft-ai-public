export type ColorTheme = 
  | 'blue' 
  | 'purple' 
  | 'green' 
  | 'orange' 
  | 'red' 
  | 'pink' 
  | 'indigo' 
  | 'teal' 
  | 'amber' 
  | 'emerald' 
  | 'rose' 
  | 'violet' 
  | 'cyan' 
  | 'lime' 
  | 'fuchsia' 
  | 'sky'

export type ThemeMode = 'light' | 'dark'

export interface ColorThemeConfig {
  name: string
  description: string
  primary: {
    light: string
    dark: string
  }
  secondary: {
    light: string
    dark: string
  }
  accent: {
    light: string
    dark: string
  }
  background: {
    light: string
    dark: string
  }
  surface: {
    light: string
    dark: string
  }
  text: {
    light: string
    dark: string
  }
  border: {
    light: string
    dark: string
  }
}

export const COLOR_THEMES: Record<ColorTheme, ColorThemeConfig> = {
  blue: {
    name: 'Ocean Blue',
    description: 'Professional and trustworthy',
    primary: { light: '#3B82F6', dark: '#60A5FA' },
    secondary: { light: '#1E40AF', dark: '#3B82F6' },
    accent: { light: '#DBEAFE', dark: '#1E3A8A' },
    background: { light: '#FFFFFF', dark: '#0F172A' },
    surface: { light: '#F8FAFC', dark: '#1E293B' },
    text: { light: '#1E293B', dark: '#F1F5F9' },
    border: { light: '#E2E8F0', dark: '#334155' }
  },
  purple: {
    name: 'Royal Purple',
    description: 'Creative and luxurious',
    primary: { light: '#8B5CF6', dark: '#A78BFA' },
    secondary: { light: '#6D28D9', dark: '#8B5CF6' },
    accent: { light: '#F3E8FF', dark: '#581C87' },
    background: { light: '#FFFFFF', dark: '#0F0A1A' },
    surface: { light: '#FAF5FF', dark: '#1E1B2E' },
    text: { light: '#1E1B2E', dark: '#F3F4F6' },
    border: { light: '#E9D5FF', dark: '#4C1D95' }
  },
  green: {
    name: 'Forest Green',
    description: 'Natural and calming',
    primary: { light: '#10B981', dark: '#34D399' },
    secondary: { light: '#059669', dark: '#10B981' },
    accent: { light: '#D1FAE5', dark: '#064E3B' },
    background: { light: '#FFFFFF', dark: '#0A0F0A' },
    surface: { light: '#F0FDF4', dark: '#1A1F1A' },
    text: { light: '#1A1F1A', dark: '#F0FDF4' },
    border: { light: '#A7F3D0', dark: '#065F46' }
  },
  orange: {
    name: 'Sunset Orange',
    description: 'Energetic and warm',
    primary: { light: '#F97316', dark: '#FB923C' },
    secondary: { light: '#EA580C', dark: '#F97316' },
    accent: { light: '#FED7AA', dark: '#7C2D12' },
    background: { light: '#FFFFFF', dark: '#1A0F0A' },
    surface: { light: '#FFF7ED', dark: '#2A1F1A' },
    text: { light: '#2A1F1A', dark: '#FFF7ED' },
    border: { light: '#FDBA74', dark: '#9A3412' }
  },
  red: {
    name: 'Crimson Red',
    description: 'Bold and passionate',
    primary: { light: '#EF4444', dark: '#F87171' },
    secondary: { light: '#DC2626', dark: '#EF4444' },
    accent: { light: '#FEE2E2', dark: '#7F1D1D' },
    background: { light: '#FFFFFF', dark: '#1A0A0A' },
    surface: { light: '#FEF2F2', dark: '#2A1A1A' },
    text: { light: '#2A1A1A', dark: '#FEF2F2' },
    border: { light: '#FECACA', dark: '#991B1B' }
  },
  pink: {
    name: 'Blush Pink',
    description: 'Soft and romantic',
    primary: { light: '#EC4899', dark: '#F472B6' },
    secondary: { light: '#DB2777', dark: '#EC4899' },
    accent: { light: '#FCE7F3', dark: '#831843' },
    background: { light: '#FFFFFF', dark: '#1A0A1A' },
    surface: { light: '#FDF2F8', dark: '#2A1A2A' },
    text: { light: '#2A1A2A', dark: '#FDF2F8' },
    border: { light: '#FBCFE8', dark: '#9D174D' }
  },
  indigo: {
    name: 'Deep Indigo',
    description: 'Professional and sophisticated',
    primary: { light: '#6366F1', dark: '#818CF8' },
    secondary: { light: '#4F46E5', dark: '#6366F1' },
    accent: { light: '#EEF2FF', dark: '#312E81' },
    background: { light: '#FFFFFF', dark: '#0A0A1A' },
    surface: { light: '#F8FAFF', dark: '#1A1A2A' },
    text: { light: '#1A1A2A', dark: '#F8FAFF' },
    border: { light: '#C7D2FE', dark: '#4338CA' }
  },
  teal: {
    name: 'Ocean Teal',
    description: 'Refreshing and modern',
    primary: { light: '#14B8A6', dark: '#2DD4BF' },
    secondary: { light: '#0D9488', dark: '#14B8A6' },
    accent: { light: '#CCFBF1', dark: '#134E4A' },
    background: { light: '#FFFFFF', dark: '#0A1A1A' },
    surface: { light: '#F0FDFA', dark: '#1A2A2A' },
    text: { light: '#1A2A2A', dark: '#F0FDFA' },
    border: { light: '#99F6E4', dark: '#0F766E' }
  },
  amber: {
    name: 'Golden Amber',
    description: 'Warm and inviting',
    primary: { light: '#F59E0B', dark: '#FBBF24' },
    secondary: { light: '#D97706', dark: '#F59E0B' },
    accent: { light: '#FEF3C7', dark: '#78350F' },
    background: { light: '#FFFFFF', dark: '#1A0F0A' },
    surface: { light: '#FFFBEB', dark: '#2A1F1A' },
    text: { light: '#2A1F1A', dark: '#FFFBEB' },
    border: { light: '#FDE68A', dark: '#92400E' }
  },
  emerald: {
    name: 'Emerald Green',
    description: 'Luxurious and vibrant',
    primary: { light: '#10B981', dark: '#34D399' },
    secondary: { light: '#059669', dark: '#10B981' },
    accent: { light: '#D1FAE5', dark: '#064E3B' },
    background: { light: '#FFFFFF', dark: '#0A1A0A' },
    surface: { light: '#ECFDF5', dark: '#1A2A1A' },
    text: { light: '#1A2A1A', dark: '#ECFDF5' },
    border: { light: '#A7F3D0', dark: '#065F46' }
  },
  rose: {
    name: 'Rose Gold',
    description: 'Elegant and sophisticated',
    primary: { light: '#F43F5E', dark: '#FB7185' },
    secondary: { light: '#E11D48', dark: '#F43F5E' },
    accent: { light: '#FFE4E6', dark: '#881337' },
    background: { light: '#FFFFFF', dark: '#1A0A0A' },
    surface: { light: '#FFF1F2', dark: '#2A1A1A' },
    text: { light: '#2A1A1A', dark: '#FFF1F2' },
    border: { light: '#FECDD3', dark: '#9F1239' }
  },
  violet: {
    name: 'Deep Violet',
    description: 'Mysterious and creative',
    primary: { light: '#8B5CF6', dark: '#A78BFA' },
    secondary: { light: '#7C3AED', dark: '#8B5CF6' },
    accent: { light: '#F3E8FF', dark: '#581C87' },
    background: { light: '#FFFFFF', dark: '#0F0A1A' },
    surface: { light: '#FAF5FF', dark: '#1E1B2E' },
    text: { light: '#1E1B2E', dark: '#FAF5FF' },
    border: { light: '#E9D5FF', dark: '#4C1D95' }
  },
  cyan: {
    name: 'Bright Cyan',
    description: 'Fresh and modern',
    primary: { light: '#06B6D4', dark: '#22D3EE' },
    secondary: { light: '#0891B2', dark: '#06B6D4' },
    accent: { light: '#CFFAFE', dark: '#164E63' },
    background: { light: '#FFFFFF', dark: '#0A1A1A' },
    surface: { light: '#ECFEFF', dark: '#1A2A2A' },
    text: { light: '#1A2A2A', dark: '#ECFEFF' },
    border: { light: '#A5F3FC', dark: '#0E7490' }
  },
  lime: {
    name: 'Fresh Lime',
    description: 'Energetic and vibrant',
    primary: { light: '#84CC16', dark: '#A3E635' },
    secondary: { light: '#65A30D', dark: '#84CC16' },
    accent: { light: '#F7FEE7', dark: '#3F6212' },
    background: { light: '#FFFFFF', dark: '#0A1A0A' },
    surface: { light: '#F7FEE7', dark: '#1A2A1A' },
    text: { light: '#1A2A1A', dark: '#F7FEE7' },
    border: { light: '#DCFCE7', dark: '#4D7C0F' }
  },
  fuchsia: {
    name: 'Electric Fuchsia',
    description: 'Bold and energetic',
    primary: { light: '#D946EF', dark: '#E879F9' },
    secondary: { light: '#C026D3', dark: '#D946EF' },
    accent: { light: '#FDF4FF', dark: '#701A75' },
    background: { light: '#FFFFFF', dark: '#1A0A1A' },
    surface: { light: '#FDF4FF', dark: '#2A1A2A' },
    text: { light: '#2A1A2A', dark: '#FDF4FF' },
    border: { light: '#F3E8FF', dark: '#86198F' }
  },
  sky: {
    name: 'Sky Blue',
    description: 'Calm and peaceful',
    primary: { light: '#0EA5E9', dark: '#38BDF8' },
    secondary: { light: '#0284C7', dark: '#0EA5E9' },
    accent: { light: '#E0F2FE', dark: '#0C4A6E' },
    background: { light: '#FFFFFF', dark: '#0A1A1A' },
    surface: { light: '#F0F9FF', dark: '#1A2A2A' },
    text: { light: '#1A2A2A', dark: '#F0F9FF' },
    border: { light: '#BAE6FD', dark: '#075985' }
  }
}

export const getThemeColors = (colorTheme: ColorTheme, mode: ThemeMode) => {
  const theme = COLOR_THEMES[colorTheme]
  return {
    primary: theme.primary[mode],
    secondary: theme.secondary[mode],
    accent: theme.accent[mode],
    background: theme.background[mode],
    surface: theme.surface[mode],
    text: theme.text[mode],
    border: theme.border[mode]
  }
}

export const getThemeCSSVariables = (colorTheme: ColorTheme, mode: ThemeMode) => {
  const colors = getThemeColors(colorTheme, mode)
  return {
    '--color-primary': colors.primary,
    '--color-secondary': colors.secondary,
    '--color-accent': colors.accent,
    '--color-background': colors.background,
    '--color-surface': colors.surface,
    '--color-text': colors.text,
    '--color-border': colors.border
  }
} 