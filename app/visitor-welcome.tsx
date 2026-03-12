import React, { useState, useEffect } from 'react';
import {
  Animated,
  Dimensions,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import * as Speech from 'expo-speech';

const { width } = Dimensions.get('window');

const VisitorWelcomeScreen = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [isVisuallyImpaired, setIsVisuallyImpaired] = useState<boolean | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [hasSpoken, setHasSpoken] = useState(false);

  useEffect(() => {
    // Animation d'entrée
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Si déjà connecté, aller directement aux onglets
    if (user) {
      router.replace('/(tabs)');
    }
  }, [fadeAnim, user]);

  // Lecture vocale de la question à l'ouverture (uniquement sur mobile)
  useEffect(() => {
    const speakQuestion = async () => {
      if (hasSpoken || Platform.OS === 'web') return;
      
      // Petit délai pour laisser l'écran s'afficher
      setTimeout(async () => {
        const question = "Êtes-vous déficient visuel ?";
        try {
          await Speech.speak(question, {
            language: 'fr-FR',
            pitch: 1.0,
            rate: 1.0,
          });
          setHasSpoken(true);
        } catch (error) {
          console.error('Erreur lecture vocale:', error);
        }
      }, 1000);
    };

    speakQuestion();
  }, []);

  const handleResponse = async (hasVisualImpairment: boolean) => {
    // Arrêter la synthèse vocale en cours
    if (Platform.OS !== 'web') {
      await Speech.stop();
    }
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsVisuallyImpaired(hasVisualImpairment);

    // Sauvegarder le choix d'accessibilité
    await AsyncStorage.setItem('visualImpairmentMode', hasVisualImpairment ? 'true' : 'false');

    // Petit délai pour l'animation, puis continuer
    setTimeout(() => {
      router.push('/about');
    }, 300);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>BIS</Text>
          </View>
          <Text style={styles.appName}>BISApp</Text>
        </View>

        {/* Question principale */}
        <View style={styles.questionContainer}>
          <Text style={styles.questionTitle}>Question</Text>
          <Text style={styles.question}>
            Êtes-vous déficient visuel ?
          </Text>
          <Text style={styles.questionHint}>
            Cette information nous aide à adapter l'expérience à vos besoins
          </Text>
        </View>

        {/* Boutons de réponse */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.responseButton, styles.yesButton]}
            onPress={() => handleResponse(true)}
            activeOpacity={0.8}
            accessibilityLabel="Oui, je suis déficient visuel"
            accessibilityHint="Activer le mode accessibilité avec synthèse vocale"
          >
            <Text style={styles.buttonEmoji}>👁️</Text>
            <Text style={styles.buttonText}>Oui</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.responseButton, styles.noButton]}
            onPress={() => handleResponse(false)}
            activeOpacity={0.8}
            accessibilityLabel="Non, je ne suis pas déficient visuel"
            accessibilityHint="Continuer avec l'expérience standard"
          >
            <Text style={styles.buttonEmoji}>😊</Text>
            <Text style={[styles.buttonText, styles.noButtonText]}>Non</Text>
          </TouchableOpacity>
        </View>

        {/* Info accessibilité */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoIcon}>♿</Text>
          <Text style={styles.infoText}>
            BISApp est conçu pour être accessible à tous
          </Text>
        </View>

      </Animated.View>

      {/* Version */}
      <View style={styles.footer}>
        <Text style={styles.version}>v1.0.0</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  appName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2937',
  },
  questionContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  questionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366F1',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 10,
  },
  question: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 12,
  },
  questionHint: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 40,
  },
  responseButton: {
    flex: 1,
    paddingVertical: 24,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  yesButton: {
    backgroundColor: '#6366F1',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  noButton: {
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  buttonEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  noButtonText: {
    color: '#374151',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  version: {
    fontSize: 12,
    color: '#D1D5DB',
  },
});

export default VisitorWelcomeScreen;
