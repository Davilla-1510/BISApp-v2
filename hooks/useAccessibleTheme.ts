import { useMemo } from 'react';
import { useAccessibility } from '../context/AccessibilityContext';

interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  success: string;
  warning: string;
}

interface Theme {
  colors: ThemeColors;
  fontSize: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
    title: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
}

// Couleurs pour le mode normal
const lightColors: ThemeColors = {
  primary: '#6366F1',
  secondary: '#8B5CF6',
  background: '#FFFFFF',
  surface: '#F9FAFB',
  text: '#111827',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  error: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
};

// Couleurs pour le mode sombre
const darkColors: ThemeColors = {
  primary: '#818CF8',
  secondary: '#A78BFA',
  background: '#111827',
  surface: '#1F2937',
  text: '#F9FAFB',
  textSecondary: '#9CA3AF',
  border: '#374151',
  error: '#F87171',
  success: '#34D399',
  warning: '#FBBF24',
};

// Couleurs pour le contraste élevé
const highContrastColors: ThemeColors = {
  primary: '#0000FF',
  secondary: '#800080',
  background: '#FFFFFF',
  surface: '#FFFF00',
  text: '#000000',
  textSecondary: '#333333',
  border: '#000000',
  error: '#FF0000',
  success: '#008000',
  warning: '#FFA500',
};

// Couleurs pour le mode sombre + contraste élevé
const highContrastDarkColors: ThemeColors = {
  primary: '#00FFFF',
  secondary: '#FF00FF',
  background: '#000000',
  surface: '#000000',
  text: '#FFFFFF',
  textSecondary: '#CCCCCC',
  border: '#FFFFFF',
  error: '#FF6666',
  success: '#00FF00',
  warning: '#FFD700',
};

// Tailles de police selon les paramètres
const fontSizes = {
  small: { xs: 10, sm: 12, md: 14, lg: 16, xl: 18, xxl: 20, title: 24 },
  medium: { xs: 12, sm: 14, md: 16, lg: 18, xl: 20, xxl: 22, title: 28 },
  large: { xs: 14, sm: 16, md: 18, lg: 20, xl: 24, xxl: 28, title: 32 },
  'extra-large': { xs: 16, sm: 18, md: 20, lg: 24, xl: 28, xxl: 32, title: 36 },
};

export function useAccessibleTheme(): Theme {
  const { settings } = useAccessibility();

  const theme = useMemo(() => {
    // Déterminer les couleurs à utiliser
    let colors: ThemeColors;

    if (settings.darkMode && settings.highContrast) {
      colors = highContrastDarkColors;
    } else if (settings.highContrast) {
      colors = highContrastColors;
    } else if (settings.darkMode) {
      colors = darkColors;
    } else {
      colors = lightColors;
    }

    // Obtenir les tailles de police
    const fontSize = fontSizes[settings.fontSize];

    return {
      colors,
      fontSize,
      borderRadius: {
        sm: 4,
        md: 8,
        lg: 12,
        xl: 16,
      },
      spacing: {
        xs: 4,
        sm: 8,
        md: 12,
        lg: 16,
        xl: 24,
      },
    };
  }, [settings.darkMode, settings.highContrast, settings.fontSize]);

  return theme;
}

export default useAccessibleTheme;
