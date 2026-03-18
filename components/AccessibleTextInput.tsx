import React, { useState, useCallback } from 'react';
import {
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
  Text,
  ActivityIndicator,
} from 'react-native';
import * as Speech from 'expo-speech';
import { useSpeechToText } from '../hooks/useSpeechToText';
import { useAccessibility } from '../context/AccessibilityContext';

interface AccessibleTextInputProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  label?: string;
  error?: boolean;
  accessibilityLabel?: string;
  editable?: boolean;
  speakLabel?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'decimal-pad';
}

export const AccessibleTextInput = React.forwardRef<TextInput, AccessibleTextInputProps>(
  (
    {
      placeholder,
      value,
      onChangeText,
      secureTextEntry = false,
      label,
      error = false,
      accessibilityLabel,
      editable = true,
      speakLabel = true,
      keyboardType = 'default',
    },
    ref
  ) => {
    const { settings } = useAccessibility();
    const { isListening, startListening, stopListening } = useSpeechToText();
    const [isSpeaking, setIsSpeaking] = useState(false);

    // Parler une lettre (sauf pour les mots de passe)
    const speakLetter = useCallback(
      async (text: string) => {
        if (secureTextEntry) {
          // Ne pas prononcer les mots de passe
          return;
        }

        if (!settings.textToSpeech) {
          return;
        }

        try {
          const lastChar = text[text.length - 1];
          if (lastChar) {
            setIsSpeaking(true);
            // Prononcer juste la dernière lettre
            await Speech.speak(lastChar, {
              language: settings.language === 'en' ? 'en-US' : 'fr-FR',
              pitch: 1.0,
              rate: 0.8, // Plus lent pour qu'on entende bien
            });
            setIsSpeaking(false);
          }
        } catch (err) {
          console.error('Erreur TTS:', err);
          setIsSpeaking(false);
        }
      },
      [settings.textToSpeech, settings.language, secureTextEntry]
    );

    const handleTextChange = useCallback(
      (text: string) => {
        onChangeText(text);
        // Prononcer la nouvelle lettre après un court délai
        setTimeout(() => {
          if (text.length > value.length) {
            // Un caractère a été ajouté
            speakLetter(text);
          }
        }, 50);
      },
      [onChangeText, value, speakLetter]
    );

    const handleMicPress = useCallback(async () => {
      if (isListening) {
        await stopListening();
      } else {
        await startListening();
      }
    }, [isListening, startListening, stopListening]);

    return (
      <View style={styles.container}>
        {label && (
          <Text
            style={[
              styles.label,
              { fontSize: settings.fontSize === 'large' ? 16 : settings.fontSize === 'extra-large' ? 18 : 14 },
            ]}
            accessibilityLabel={label}
          >
            {label}
          </Text>
        )}

        <View style={[styles.inputContainer, error && styles.inputContainerError]}>
          <TextInput
            ref={ref}
            style={[
              styles.input,
              secureTextEntry && styles.secureInput,
              { fontSize: settings.fontSize === 'large' ? 16 : settings.fontSize === 'extra-large' ? 18 : 14 },
            ]}
            placeholder={placeholder}
            value={value}
            onChangeText={handleTextChange}
            secureTextEntry={secureTextEntry}
            keyboardType={keyboardType}
            editable={editable && !isListening}
            accessibilityLabel={accessibilityLabel || placeholder}
            accessibilityHint={
              settings.speechToText && !secureTextEntry
                ? 'Appuyez sur le micro pour dicter le texte'
                : undefined
            }
            placeholderTextColor="#9CA3AF"
          />

          {/* Bouton microphone - seulement si pas de mot de passe et STT activé */}
          {settings.speechToText && !secureTextEntry && (
            <TouchableOpacity
              style={[styles.micButton, isListening && styles.micButtonActive]}
              onPress={handleMicPress}
              accessibilityLabel={isListening ? 'Arrêter l\'écoute' : 'Dicter le texte'}
              accessibilityRole="button"
            >
              {isListening ? (
                <ActivityIndicator color="#6366F1" size="small" />
              ) : (
                <Text style={styles.micIcon}>🎤</Text>
              )}
            </TouchableOpacity>
          )}

          {/* Indicateur TTS */}
          {isSpeaking && !secureTextEntry && (
            <View style={styles.speakingIndicator}>
              <Text style={styles.speakingIcon}>🔊</Text>
            </View>
          )}
        </View>
      </View>
    );
  }
);

AccessibleTextInput.displayName = 'AccessibleTextInput';

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  label: {
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    height: 48,
  },
  inputContainerError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEE2E2',
  },
  input: {
    flex: 1,
    height: 48,
    color: '#1F2937',
    paddingRight: 10,
  },
  secureInput: {
    letterSpacing: 4,
  },
  micButton: {
    padding: 10,
    marginLeft: 5,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
  },
  micButtonActive: {
    backgroundColor: '#DDD6FE',
  },
  micIcon: {
    fontSize: 18,
  },
  speakingIndicator: {
    marginLeft: 8,
    padding: 8,
  },
  speakingIcon: {
    fontSize: 20,
  },
});
