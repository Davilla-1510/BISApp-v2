import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AccessibilitySettings {
  textToSpeech: boolean;
  speechToText: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  highContrast: boolean;
  darkMode: boolean;
  language: 'fr' | 'en';
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSettings: (newSettings: Partial<AccessibilitySettings>) => Promise<void>;
  isLoading: boolean;
  isVisuallyImpaired: boolean;
}

const DEFAULT_SETTINGS: AccessibilitySettings = {
  textToSpeech: false,
  speechToText: false,
  fontSize: 'medium',
  highContrast: false,
  darkMode: false,
  language: 'fr',
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AccessibilitySettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isVisuallyImpaired, setIsVisuallyImpaired] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  // Sync TTS with visual impairment mode
  useEffect(() => {
    if (isVisuallyImpaired) {
      // Automatically enable TTS and STT for visually impaired users
      const newSettings = { textToSpeech: true, speechToText: true };
      setSettings(prev => ({ ...prev, ...newSettings }));
    } else {
      // Disable TTS and STT for non-visually impaired users
      const newSettings = { textToSpeech: false, speechToText: false };
      setSettings(prev => ({ ...prev, ...newSettings }));
    }
  }, [isVisuallyImpaired]);

  const loadSettings = async () => {
    try {
      // Load saved accessibility settings
      const saved = await AsyncStorage.getItem('accessibilitySettings');
      if (saved) {
        setSettings(JSON.parse(saved));
      }
      
      // Load visual impairment mode
      const visualImpairmentMode = await AsyncStorage.getItem('visualImpairmentMode');
      setIsVisuallyImpaired(visualImpairmentMode === 'true');
    } catch (e) {
      console.error('Erreur chargement paramètres accessibilité:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<AccessibilitySettings>) => {
    try {
      const updated = { ...settings, ...newSettings };
      await AsyncStorage.setItem('accessibilitySettings', JSON.stringify(updated));
      setSettings(updated);
    } catch (e) {
      console.error('Erreur sauvegarde paramètres:', e);
    }
  };

  return (
    <AccessibilityContext.Provider value={{ settings, updateSettings, isLoading, isVisuallyImpaired }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}
