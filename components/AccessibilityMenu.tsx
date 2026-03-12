import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  Switch
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../context/AuthContext';

interface AccessibilitySettings {
  textToSpeech: boolean;
  speechToText: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  highContrast: boolean;
  darkMode: boolean;
  language: 'fr' | 'en';
}

const DEFAULT_SETTINGS: AccessibilitySettings = {
  textToSpeech: false,
  speechToText: false,
  fontSize: 'medium',
  highContrast: false,
  darkMode: false,
  language: 'fr',
};

// Fonction utilitaire pour synthèse vocale simplifiée
const speak = async (text: string, lang: 'fr' | 'en' = 'fr') => {
  try {
    // Arrêter toute lecture en cours
    await Speech.stop();
    
    // Utiliser seulement les options de base
    Speech.speak(text, {
      language: lang,
    });
  } catch (error) {
    console.error('Erreur Speech.speak:', error);
  }
};

export default function AccessibilityMenu() {
  const { isAccessibleMode, setIsAccessibleMode } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [settings, setSettings] = useState<AccessibilitySettings>(DEFAULT_SETTINGS);

  // Charger les paramètres au démarrage
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const saved = await AsyncStorage.getItem('accessibilitySettings');
      if (saved) {
        setSettings(JSON.parse(saved));
      }
      // Vérifier aussi le mode déficient visuel
      const visualImpairment = await AsyncStorage.getItem('visualImpairmentMode');
      if (visualImpairment === 'true') {
        setIsAccessibleMode(true);
        setSettings(prev => ({ ...prev, textToSpeech: true }));
      }
    } catch (e) {
      console.error('Erreur chargement paramètres:', e);
    }
  };

  const saveSettings = async (newSettings: AccessibilitySettings) => {
    try {
      await AsyncStorage.setItem('accessibilitySettings', JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (e) {
      console.error('Erreur sauvegarde paramètres:', e);
    }
  };

  const toggleSetting = async (key: keyof AccessibilitySettings) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newSettings = { ...settings, [key]: !settings[key] };
    
    // Si on active le mode déficient visuel, activer le TTS
    if (key === 'textToSpeech' && newSettings.textToSpeech) {
      setIsAccessibleMode(true);
      await speak("Mode synthèse vocale activé", settings.language);
    } else if (key === 'textToSpeech' && !newSettings.textToSpeech) {
      await Speech.stop();
    }
    
    // Si on change la langue, tester la synthèse vocale
    if (key === 'language' && newSettings.textToSpeech) {
      const lang = newSettings.language === 'fr' ? 'français' : 'english';
      await speak(lang, newSettings.language);
    }
    
    await saveSettings(newSettings);
  };

  const cycleFontSize = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const sizes: AccessibilitySettings['fontSize'][] = ['small', 'medium', 'large', 'extra-large'];
    const currentIndex = sizes.indexOf(settings.fontSize);
    const nextIndex = (currentIndex + 1) % sizes.length;
    const newSettings = { ...settings, fontSize: sizes[nextIndex] };
    
    if (newSettings.textToSpeech) {
      const sizeLabels = { small: 'petit', medium: 'moyen', large: 'grand', 'extra-large': 'très grand' };
      await speak(`Taille ${sizeLabels[settings.fontSize]}`, settings.language);
    }
    
    await saveSettings(newSettings);
  };

  const getFontSizeValue = (): number => {
    const values = { small: 12, medium: 16, large: 20, 'extra-large': 24 };
    return values[settings.fontSize];
  };

  const fontSizeLabels = {
    small: 'Petit',
    medium: 'Moyen',
    large: 'Grand',
    'extra-large': 'Très Grand',
  };

  const languageLabels = {
    fr: '🇫🇷 Français',
    en: '🇬🇧 English',
  };

  // Gestion du mode déficient visuel
  const handleVisualImpairmentToggle = async (value: boolean) => {
    setIsAccessibleMode(value);
    const newSettings = { ...settings, textToSpeech: value };
    if (value) {
      await speak("Mode accessibilité activé", settings.language);
    } else {
      await Speech.stop();
    }
    await saveSettings(newSettings);
  };

  // Test de la synthèse vocale
  const handleTestTTS = async () => {
    await speak("Ceci est un test de la synthèse vocale", settings.language);
  };

  return (
    <>
      {/* Bouton flottant d'accessibilité */}
      <TouchableOpacity
        style={[styles.floatingButton, settings.darkMode && styles.floatingButtonDark]}
        onPress={() => setShowMenu(true)}
        accessibilityLabel="Menu accessibilité"
        accessibilityRole="button"
      >
        <Text style={styles.floatingButtonText}>♿</Text>
      </TouchableOpacity>

      {/* Modal du menu accessibilité */}
      <Modal
        visible={showMenu}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowMenu(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, settings.darkMode && styles.modalContentDark]}>
            
            {/* Header */}
            <View style={styles.header}>
              <Text style={[styles.headerTitle, settings.darkMode && styles.textLight]}>
                ♿ Accessibilité
              </Text>
              <TouchableOpacity 
                onPress={() => setShowMenu(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Mode déficient visuel */}
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={[styles.settingLabel, settings.darkMode && styles.textLight]}>
                    👁️ Mode Déficient Visuel
                  </Text>
                  <Text style={styles.settingDescription}>
                    Active les options d'accessibilité avancées
                  </Text>
                </View>
                <Switch
                  value={isAccessibleMode}
                  onValueChange={handleVisualImpairmentToggle}
                  trackColor={{ false: '#E5E7EB', true: '#6366F1' }}
                  thumbColor={isAccessibleMode ? '#FFFFFF' : '#F9FAFB'}
                />
              </View>

              {/* Synthèse vocale (TTS) */}
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={[styles.settingLabel, settings.darkMode && styles.textLight]}>
                    🔊 Synthèse Vocale (TTS)
                  </Text>
                  <Text style={styles.settingDescription}>
                    Lecture automatique du texte
                  </Text>
                </View>
                <Switch
                  value={settings.textToSpeech}
                  onValueChange={() => toggleSetting('textToSpeech')}
                  trackColor={{ false: '#E5E7EB', true: '#6366F1' }}
                  thumbColor={settings.textToSpeech ? '#FFFFFF' : '#F9FAFB'}
                />
              </View>

              {/* Reconnaissance vocale (STT) */}
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={[styles.settingLabel, settings.darkMode && styles.textLight]}>
                    🎤 Reconnaissance Vocale (STT)
                  </Text>
                  <Text style={styles.settingDescription}>
                    Commandes vocales
                  </Text>
                </View>
                <Switch
                  value={settings.speechToText}
                  onValueChange={() => toggleSetting('speechToText')}
                  trackColor={{ false: '#E5E7EB', true: '#6366F1' }}
                  thumbColor={settings.speechToText ? '#FFFFFF' : '#F9FAFB'}
                />
              </View>

              {/* Taille de police */}
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={[styles.settingLabel, settings.darkMode && styles.textLight]}>
                    🔤 Taille de Police
                  </Text>
                  <Text style={styles.settingDescription}>
                    Actuel: {fontSizeLabels[settings.fontSize]}
                  </Text>
                </View>
                <TouchableOpacity 
                  style={styles.cycleButton}
                  onPress={cycleFontSize}
                >
                  <Text style={styles.cycleButtonText}>{getFontSizeValue()}px</Text>
                </TouchableOpacity>
              </View>

              {/* Contraste élevé */}
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={[styles.settingLabel, settings.darkMode && styles.textLight]}>
                    ◐ Contraste Élevé
                  </Text>
                  <Text style={styles.settingDescription}>
                    Améliore la lisibilité
                  </Text>
                </View>
                <Switch
                  value={settings.highContrast}
                  onValueChange={() => toggleSetting('highContrast')}
                  trackColor={{ false: '#E5E7EB', true: '#6366F1' }}
                  thumbColor={settings.highContrast ? '#FFFFFF' : '#F9FAFB'}
                />
              </View>

              {/* Mode sombre */}
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={[styles.settingLabel, settings.darkMode && styles.textLight]}>
                    🌙 Mode Sombre
                  </Text>
                  <Text style={styles.settingDescription}>
                    Réduit la fatigue visuelle
                  </Text>
                </View>
                <Switch
                  value={settings.darkMode}
                  onValueChange={() => toggleSetting('darkMode')}
                  trackColor={{ false: '#E5E7EB', true: '#6366F1' }}
                  thumbColor={settings.darkMode ? '#FFFFFF' : '#F9FAFB'}
                />
              </View>

              {/* Langue */}
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={[styles.settingLabel, settings.darkMode && styles.textLight]}>
                    🌍 Langue / Language
                  </Text>
                  <Text style={styles.settingDescription}>
                    Changer la langue de l'app
                  </Text>
                </View>
                <TouchableOpacity 
                  style={styles.languageButton}
                  onPress={() => {
                    const newLang = settings.language === 'fr' ? 'en' : 'fr';
                    toggleSetting('language');
                  }}
                >
                  <Text style={styles.languageButtonText}>
                    {languageLabels[settings.language]}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Bouton Test TTS */}
              {settings.textToSpeech && (
                <TouchableOpacity 
                  style={styles.testButton}
                  onPress={handleTestTTS}
                >
                  <Text style={styles.testButtonText}>🔊 Tester la synthèse vocale</Text>
                </TouchableOpacity>
              )}

            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  // Bouton flottant
  floatingButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 999,
  },
  floatingButtonDark: {
    backgroundColor: '#4F46E5',
  },
  floatingButtonText: {
    fontSize: 24,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  modalContentDark: {
    backgroundColor: '#1F2937',
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#6B7280',
  },

  // Settings
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingInfo: {
    flex: 1,
    marginRight: 15,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: '#6B7280',
  },
  textLight: {
    color: '#F9FAFB',
  },

  // Buttons
  cycleButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  cycleButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  languageButton: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#6366F1',
  },
  languageButtonText: {
    color: '#4F46E5',
    fontWeight: '600',
    fontSize: 14,
  },
  testButton: {
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  testButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
