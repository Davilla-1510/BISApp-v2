import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { useAccessibility } from '../context/AccessibilityContext';

// Importation conditionnelle pour Voice
let Voice: any = null;
if (Platform.OS !== 'web') {
  try {
    Voice = require('@react-native-voice/voice').default;
  } catch (e) {
    console.warn('Voice module not available:', e);
  }
}

interface UseSpeechToTextReturn {
  isListening: boolean;
  recognizedText: string;
  error: string | null;
  startListening: () => Promise<void>;
  stopListening: () => Promise<void>;
  clearText: () => void;
  isAvailable: boolean;
}

export function useSpeechToText(): UseSpeechToTextReturn {
  const { settings } = useAccessibility();
  const [isListening, setIsListening] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isAvailable, setIsAvailable] = useState(!Platform.OS === false);// Disponible par défaut sur mobile, pas sur web

  useEffect(() => {
    if (!Voice) {
      setIsAvailable(false);
      return;
    }

    // Configuration des listeners pour Voice
    const onSpeechStart = () => {
      setError(null);
      setIsListening(true);
    };

    const onSpeechRecognized = () => {
      setIsListening(false);
    };

    const onSpeechEnd = () => {
      setIsListening(false);
    };

    const onSpeechError = (error: any) => {
      console.error('Erreur STT:', error);
      const errorMessage =
        error?.error?.code === '7' || error?.code === '7'
          ? 'Pas de texte reconnu'
          : error?.error?.message || error?.message || 'Erreur de reconnaissance vocale';
      setError(errorMessage);
      setIsListening(false);
    };

    const onSpeechResults = (event: any) => {
      if (event.value && event.value.length > 0) {
        setRecognizedText(event.value[0]);
        setError(null);
      }
    };

    const onSpeechPartialResults = (event: any) => {
      if (event.value && event.value.length > 0) {
        setRecognizedText(event.value[0]);
      }
    };

    try {
      Voice.onSpeechStart = onSpeechStart;
      Voice.onSpeechRecognized = onSpeechRecognized;
      Voice.onSpeechEnd = onSpeechEnd;
      Voice.onSpeechError = onSpeechError;
      Voice.onSpeechResults = onSpeechResults;
      Voice.onSpeechPartialResults = onSpeechPartialResults;

      setIsAvailable(true);
    } catch (err) {
      console.warn('Erreur configuration Voice:', err);
      setIsAvailable(false);
    }

    return () => {
      try {
        Voice?.destroy?.();
      } catch (err) {
        console.warn('Erreur destruction Voice:', err);
      }
    };
  }, []);

  const startListening = useCallback(async (): Promise<void> => {
    if (!Voice || !isAvailable) {
      setError('Reconnaissance vocale non disponible sur cette plateforme');
      return;
    }

    if (!settings.speechToText) {
      setError('STT désactivé');
      return;
    }

    try {
      // Arrêter toute reconnaissance en cours
      if (isListening) {
        await Voice.stop();
      }

      await Voice.start('fr-FR');
      setIsListening(true);
      setRecognizedText('');
      setError(null);
    } catch (err: any) {
      console.error('Erreur démarrage STT:', err);
      setError('Impossible de démarrer la reconnaissance vocale: ' + (err.message || err.code || 'erreur inconnue'));
      setIsListening(false);
    }
  }, [settings.speechToText, isListening, isAvailable]);

  const stopListening = useCallback(async (): Promise<void> => {
    if (!Voice) return;

    try {
      await Voice.stop();
      setIsListening(false);
    } catch (err: any) {
      console.error('Erreur arrêt STT:', err);
      setError('Erreur lors de l\'arrêt du microphone: ' + (err.message || 'erreur inconnue'));
    }
  }, []);

  const clearText = useCallback(() => {
    setRecognizedText('');
    setError(null);
  }, []);

  return {
    isListening,
    recognizedText,
    error,
    startListening,
    stopListening,
    clearText,
    isAvailable,
  };
}
