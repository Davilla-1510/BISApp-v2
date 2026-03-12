import Voice from '@react-native-voice/voice';
import * as Speech from 'expo-speech';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState, useCallback } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Modal } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { Platform } from 'react-native';

const HAS_ASKED_ACCESSIBILITY = 'hasAskedAccessibility';

// Fonction utilitaire pour synthèse vocale simplifiée
const speak = async (text: string, lang: 'fr' | 'en' = 'fr') => {
  try {
    await Speech.stop();
    Speech.speak(text, { language: lang });
  } catch (error) {
    console.error('Erreur Speech.speak:', error);
  }
};

export default function VoiceAssistant() {
  if (Platform.OS === 'web') {
    return null; 
  }
  
  const { isAccessibleMode, setIsAccessibleMode } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // NOTE: Le useEffect qui posait la question automatique est désactivé
  // car la question est maintenant posée dans visitor-welcome.tsx

  const startWelcomeSequence = useCallback(() => {
    setIsSpeaking(true);
    const welcome = "Bienvenue sur B.I.S. App. Êtes-vous déficient visuel ?";
    
    speak(welcome, 'fr').then(() => {
      setIsSpeaking(false);
    }).catch(() => {
      setIsSpeaking(false);
    });
  }, []);

  const handleResponse = async (isYes: boolean) => {
    // Arrêter la synthèse vocale en cours
    await Speech.stop();
    
    if (isYes) {
      setIsAccessibleMode(true);
      await speak("Mode accessibilité activé. Je vais vous guider.", 'fr');
    } else {
      setIsAccessibleMode(false);
      await speak("Très bien, passage au mode standard.", 'fr');
    }
    
    // Sauvegarder que l'utilisateur a fait son choix
    await AsyncStorage.setItem(HAS_ASKED_ACCESSIBILITY, 'true');
    setShowModal(false);
  };

  const handleSkip = async () => {
    await Speech.stop();
    await AsyncStorage.setItem(HAS_ASKED_ACCESSIBILITY, 'true');
    setShowModal(false);
  };

  // Retourne null car le modal de question est géré par visitor-welcome.tsx
  return null;
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  modalContent: {
    backgroundColor: '#1F2937',
    borderRadius: 24,
    padding: 30,
    width: '85%',
    maxWidth: 400,
    alignItems: 'center',
  },
  title: { 
    color: '#FFFFFF', 
    fontSize: 22, 
    fontWeight: 'bold', 
    marginBottom: 15,
    textAlign: 'center'
  },
  subtitle: {
    color: '#D1D5DB',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 26,
  },
  buttonContainer: { 
    flexDirection: 'row', 
    gap: 15,
    marginBottom: 20,
  },
  button: { 
    paddingVertical: 18, 
    paddingHorizontal: 30, 
    borderRadius: 12, 
    minWidth: 130, 
    alignItems: 'center',
  },
  yes: { 
    backgroundColor: '#10B981',
  },
  no: { 
    backgroundColor: '#EF4444',
  },
  buttonText: { 
    color: 'white', 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
  skipButton: {
    paddingVertical: 10,
  },
  skipText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
});
