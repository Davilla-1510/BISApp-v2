// import { useEffect } from 'react';
// import { Stack } from 'expo-router';
// import { StatusBar } from 'expo-status-bar';
// import { AuthProvider } from './(auth)/context/AuthContext'; // Vérifiez que le chemin est correct selon votre structure
// import { useFonts, Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';
// import * as SplashScreen from 'expo-splash-screen';

// // Empêche l'écran de chargement de se fermer trop tôt
// SplashScreen.preventAutoHideAsync();

// export default function RootLayout() {
//   const [loaded, error] = useFonts({
//     Inter_400Regular,
//     Inter_700Bold,
//   });

//   useEffect(() => {
//     if (loaded || error) {
//       SplashScreen.hideAsync();
//     }
//   }, [loaded, error]);

//   if (!loaded && !error) {
//     return null;
//   }

//   return (
//     /* IMPORTANT : L'AuthProvider DOIT être le parent le plus haut 
//        pour que useAuth() fonctionne dans TOUS les écrans (Login, Home, etc.)
//     */
   
//     <AuthProvider>
//       <Stack screenOptions={{ headerShown: false }}>
//         {/* L'écran de connexion */}
//         <Stack.Screen name="login" options={{ headerShown: false }} />
        
//         {/* Les autres groupes d'écrans (app) */}
//         <Stack.Screen name="(app)" options={{ headerShown: false }} />
        
//         {/* Les écrans d'authentification */}
//         <Stack.Screen name="(auth)" options={{ headerShown: false }} />
//       </Stack>
//       <StatusBar style="auto" />
//     </AuthProvider>
//   );
// }


import { Stack } from 'expo-router';
import { AuthProvider } from '@/context/AuthContext';
import VoiceAssistant from '@/components/voice';
import { useAudioPlayer } from "expo-audio";
export default function RootLayout() {
  return (
    <AuthProvider>
      {/* L'assistant est un composant "frère" du Stack, pas un parent */}
      <VoiceAssistant /> 
      
      <Stack screenOptions={{ headerShown: false }}>
        {/* Tous ces écrans ont accès à AuthProvider et VoiceAssistant tournera en fond */}
        <Stack.Screen name="index" /> 
        <Stack.Screen name="login" /> 
        <Stack.Screen name="(app)" />
      </Stack>
    </AuthProvider>
  );
}

