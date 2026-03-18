// Initialisation technique : C'est ici que l'application effectue les tâches de fond nécessaires avant d'être utilisable : vérification du jeton d'authentification (Token JWT), chargement des préférences utilisateur, connexion à la base de données locale ou récupération de données API critiques.

// Identité visuelle : Il renforce la reconnaissance de la marque en affichant le logo et le nom de l'application (ici BISApp).

// Expérience Utilisateur (UX) : Il évite d'afficher un écran vide ou blanc pendant que React Native charge le bundle JavaScript. Il donne l'impression d'une application fluide et professionnelle.

// Redirection logique : Comme on le voit dans le code avec navigation.replace, ce fichier sert de "tour de contrôle" pour décider si l'utilisateur doit aller vers l'écran de Connexion (s'il n'est pas connecté) ou directement vers l'Accueil (s'il possède une session active).

import React, { useEffect, useRef } from 'react';
import {ImageBackground, Animated, SafeAreaView, StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext'; // On utilise ton contexte

const SplashScreen = () => {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Lancer l'animation du logo
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

// 2. Logique de redirection - rediriger dès que l'auth est prête
    const timer = setTimeout(() => {
      if (!authLoading) {
        // Si l'auth a fini de vérifier le jeton
        if (user) {
          router.replace('/(tabs)'); // Utilisateur connecté - va vers les onglets
        } else {
          router.replace('/visitor-welcome'); // Visiteur - page d'accueil avec question accessibilité
        }
      }
    }, 1000); // Réduit à 1 seconde

    // Fallback: redirection forcée après 5 secondes si l'auth est toujours en cours
    const fallbackTimer = setTimeout(() => {
      if (authLoading) {
        console.log('Auth timeout - redirecting to visitor-welcome');
        router.replace('/visitor-welcome');
      }
    }, 5000);

    return () => {
      clearTimeout(timer);
      clearTimeout(fallbackTimer);
    };
  }, [authLoading, user]);

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <ImageBackground
        source={require('../assets/images/logo BISApp.jpeg')}
        style={styles.logo}
        />

        {/* <View style={styles.logo}>
          <Text style={styles.logoText}>BIS</Text>
        </View> */}
        <Text style={styles.title}>BISApp</Text>
        <Text style={styles.subtitle}>
          Apprendre le Braille et l'Informatique Accessible
        </Text>
      </Animated.View>

      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#6366F1" />
        <Text style={styles.version}>v1.0.0</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' },
  content: { alignItems: 'center' },
  logo: {
    width: 100, height: 100, borderRadius: 50, backgroundColor: '#6366F1',
    justifyContent: 'center', alignItems: 'center', marginBottom: 20,
    shadowColor: '#6366F1', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 8
  },
  logoText: { fontSize: 35, fontWeight: 'bold', color: '#FFFFFF' },
  title: { fontSize: 32, fontWeight: '800', color: '#1F2937', marginBottom: 5 },
  subtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center', paddingHorizontal: 40 },
  footer: { position: 'absolute', bottom: 40, alignItems: 'center' },
  version: { fontSize: 12, color: '#D1D5DB', marginTop: 10 }
});

export default SplashScreen;

