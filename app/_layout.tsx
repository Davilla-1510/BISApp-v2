import { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from 'context/AuthContext';
import { AccessibilityProvider } from 'context/AccessibilityContext';
import { useFonts, Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import VoiceAssistant from '@/components/voice';
import AccessibilityMenu from '@/components/AccessibilityMenu';

// Empêche l'écran de chargement de se fermer trop tôt
SplashScreen.preventAutoHideAsync();

function RootLayoutContent() {
  const router = useRouter();
  const { isLoading: authLoading, user } = useAuth();

  // Gestion de la redirection automatique après authentification
  useEffect(() => {
    if (!authLoading && !user) {
      // Vérifier si on n'est pas déjà sur une route publique
      const publicRoutes = ['/splash', '/visitor-welcome', '/login', '/signup', '/about'];
      // Cette logique est gérée par splash.tsx directement
    }
  }, [authLoading, user]);

  return (
    <>
      <VoiceAssistant />
      <AccessibilityMenu />
      
      <Stack 
        screenOptions={{ 
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        {/* Écrans publics - sans authentification requise */}
        <Stack.Screen name="splash" options={{ animation: 'fade' }} />
        <Stack.Screen name="visitor-welcome" options={{ animation: 'fade' }} />
        <Stack.Screen name="about" />
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />
        
        {/* Tab Navigator - principale après connexion */}
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
        
        {/* Écrans de navigation principale */}
        <Stack.Screen name="dashboard" />
        <Stack.Screen name="modules-selection" />
        
        {/* Navigation pédagogique */}
        <Stack.Screen name="levels-selection" />
        <Stack.Screen name="chapters-selection" />
        <Stack.Screen name="lessons" />
        <Stack.Screen name="exercise" />
        <Stack.Screen name="quiz" />
        
        {/* Groupe (app) - écrans tutoriels */}
        <Stack.Screen name="(app)" options={{ animation: 'slide_from_bottom' }} />
        
        {/* Écrans admin */}
        <Stack.Screen name="admin" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Inter_400Regular,
    Inter_700Bold,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <AuthProvider>
      <AccessibilityProvider>
        <RootLayoutContent />
      </AccessibilityProvider>
    </AuthProvider>
  );
}

