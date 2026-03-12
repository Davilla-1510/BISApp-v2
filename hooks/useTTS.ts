import { useCallback, useEffect, useState } from 'react';
import * as Speech from 'expo-speech';
import { useAccessibility } from '../context/AccessibilityContext';

interface UseTTSReturn {
  speak: (text: string, force?: boolean) => Promise<void>;
  stop: () => Promise<void>;
  isSpeaking: boolean;
}

export function useTTS(): UseTTSReturn {
  const { settings } = useAccessibility();
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Mettre à jour l'état quand la parole change
  useEffect(() => {
    const onSpeechStart = () => setIsSpeaking(true);
    const onSpeechEnd = () => setIsSpeaking(false);

    // Ces événements ne sont pas disponibles dans expo-speech
    // Donc on utilise un interval pour vérifier
    let interval: NodeJS.Timeout | null = null;

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, []);

  const speak = useCallback(async (text: string, force: boolean = false): Promise<void> => {
    // Arrêter toute parole en cours
    await Speech.stop();

    // Vérifier si TTS est activé
    if (!settings.textToSpeech && !force) {
      return;
    }

    if (!text || text.trim() === '') {
      return;
    }

    try {
      setIsSpeaking(true);
      
      // Déterminer la langue
      const language = settings.language === 'en' ? 'en-US' : 'fr-FR';
      
      // Options de lecture
      const options: Speech.SpeechOptions = {
        language,
        pitch: 1.0,
        rate: settings.fontSize === 'small' ? 0.9 : 
              settings.fontSize === 'large' ? 1.1 : 
              settings.fontSize === 'extra-large' ? 1.2 : 1.0,
      };

      await Speech.speak(text, options);
    } catch (error) {
      console.error('Erreur TTS:', error);
    } finally {
      setIsSpeaking(false);
    }
  }, [settings.textToSpeech, settings.language, settings.fontSize]);

  const stop = useCallback(async (): Promise<void> => {
    try {
      await Speech.stop();
      setIsSpeaking(false);
    } catch (error) {
      console.error('Erreur stop TTS:', error);
    }
  }, []);

  return {
    speak,
    stop,
    isSpeaking,
  };
}

// Hook pour lire automatiquement le contenu à l'écran
export function useAutoTTS() {
  const { speak, stop, isSpeaking } = useTTS();

  // Lire un message de bienvenue
  const announceWelcome = useCallback((name: string) => {
    const message = `Bienvenue ${name} sur BISApp. 
    Utilisez l'application pour apprendre le Braille. 
    Appuyez sur le bouton d'accessibilité pour activer la lecture automatique.`;
    speak(message);
  }, [speak]);

  // Lire les instructions
  const announceInstructions = useCallback((instructions: string) => {
    speak(instructions);
  }, [speak]);

  // Lire un titre
  const announceTitle = useCallback((title: string) => {
    speak(title);
  }, [speak]);

  // Lire un message d'erreur
  const announceError = useCallback((error: string) => {
    speak(`Erreur: ${error}`, true); // Force TTS même si désactivé
  }, [speak]);

  // Lire un message de succès
  const announceSuccess = useCallback((message: string) => {
    speak(message, true);
  }, [speak]);

  return {
    speak,
    stop,
    isSpeaking,
    announceWelcome,
    announceInstructions,
    announceTitle,
    announceError,
    announceSuccess,
  };
}

export default useTTS;
