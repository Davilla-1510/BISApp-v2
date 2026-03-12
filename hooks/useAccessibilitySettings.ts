import { useAccessibility } from '../context/AccessibilityContext';
import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';

// Hook pour utiliser les paramètres d'accessibilité dans n'importe quel composant
export function useAccessibilitySettings() {
  const { settings, updateSettings } = useAccessibility();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Les settings sont chargés
    setIsReady(true);
  }, [settings]);

  // Fonction pour obtenir la taille de police selon le paramètre
  const getFontSize = (baseSize: number = 16): number => {
    const multipliers = {
      small: 0.85,
      medium: 1,
      large: 1.25,
      'extra-large': 1.5,
    };
    return Math.round(baseSize * multipliers[settings.fontSize]);
  };

  // Fonction pour obtenir les couleurs selon le mode
  const getColors = () => {
    if (settings.darkMode) {
      return {
        background: '#000000',
        surface: '#1F2937',
        text: '#FFFFFF',
        textSecondary: '#D1D5DB',
        primary: '#6366F1',
        border: '#374151',
      };
    }
    if (settings.highContrast) {
      return {
        background: '#000000',
        surface: '#1F2937',
        text: '#FFFFFF',
        textSecondary: '#F3F4F6',
        primary: '#FBBF24',
        border: '#FFFFFF',
      };
    }
    return {
      background: '#FFFFFF',
      surface: '#F9FAFB',
      text: '#1F2937',
      textSecondary: '#6B7280',
      primary: '#6366F1',
      border: '#E5E7EB',
    };
  };

  return {
    settings,
    updateSettings,
    isReady,
    getFontSize,
    getColors,
  };
}

// Hook global pour appliquer les styles d'accessibilité
export function useAccessibilityStyles() {
  const { settings } = useAccessibility();
  
  const getFontSize = (baseSize: number = 16): number => {
    const multipliers = {
      small: 0.85,
      medium: 1,
      large: 1.25,
      'extra-large': 1.5,
    };
    return Math.round(baseSize * multipliers[settings.fontSize]);
  };

  const colors = settings.darkMode 
    ? { bg: '#000000', text: '#FFFFFF', primary: '#6366F1' }
    : settings.highContrast 
      ? { bg: '#000000', text: '#FFFFFF', primary: '#FBBF24' }
      : { bg: '#FFFFFF', text: '#1F2937', primary: '#6366F1' };

  return {
    fontSize: getFontSize(),
    colors,
    settings,
  };
}
