

// import Voice from '@react-native-voice/voice';
// import * as Speech from 'expo-speech';
// import { useEffect, useCallback } from 'react';
// import { useAuth } from '@/context/AuthContext';
// import { Button, View } from 'react-native';

// export default function VoiceAssistant() {
//   const { setIsAccessibleMode } = useAuth();

//   const startListening = async () => {
//     try {
//       await Voice.stop(); // On s'assure qu'aucune écoute n'est en cours
//       await Voice.start('fr-FR');
//       console.log("Micro activé...");
//     } catch (e) {
//       console.error("Erreur micro:", e);
//     }
//   };

//   useEffect(() => {
//     // 1. Configuration des écouteurs
//     Voice.onSpeechResults = (e: any) => {
//       if (e.value && e.value.length > 0) { // CORRECTION : Si on a un résultat
//         const phrase = e.value[0].toLowerCase();
//         console.log("Phrase entendue :", phrase);

//         if (phrase.includes("oui")) {
//           setIsAccessibleMode(true);
//           Speech.speak("Mode accessibilité activé. Je vais vous guider.");
//         } else if (phrase.includes("non")) {
//           setIsAccessibleMode(false);
//           Speech.speak("Très bien, passage au mode standard.");
//         } else {
//           Speech.speak("Je n'ai pas compris. Répondez par oui ou par non.", {
//             onDone: () => {
//   startListening().catch(err => console.error(err));
// }
//           });
//         }
//       }
//     };

//     Voice.onSpeechError = (e) => {
//       console.error("Erreur Speech :", e);
//     };

//     // 2. Message de bienvenue
//     const welcome = "Bienvenue sur B.I.S. App. Êtes-vous déficient visuel ? Répondez par oui ou par non.";
    
//     // On attend un court instant que le système audio soit prêt
//     setTimeout(() => {
//       Speech.speak(welcome, {
//         language: 'fr',
//         onDone: () => {
//   startListening().catch(err => console.error(err));
// } // Lance l'écoute quand il a fini de parler
//       });
//     }, 500);

//     // 3. Nettoyage
//    return () => {
//     // On vérifie que Voice existe avant de nettoyer
//     if (Voice) {
//       Voice.destroy().then(() => {
//         Voice.removeAllListeners();
//       }).catch(e => console.log("Erreur nettoyage Voice:", e));
//     }
//   };
//   }, []);

//   return (
//   <View style={{ position: 'absolute', bottom: 50, alignSelf: 'center', zIndex: 1000 }}>
//     <Button 
//       title="[TEST] Activer Mode Vocal Manuellement" 
//       onPress={() => {
//         setIsAccessibleMode(true);
//         Speech.speak("Mode accessibilité activé manuellement.");
//       }} 
//     />
//   </View>
// );
// }

import Voice from '@react-native-voice/voice';
import * as Speech from 'expo-speech';
import { useEffect, useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { Platform } from 'react-native';

export default function VoiceAssistant() {
  if (Platform.OS === 'web') {
    return null; 
  }
  const { setIsAccessibleMode } = useAuth();
  const [showButtons, setShowButtons] = useState(false);

  const handleResponse = (isYes: boolean) => {
    
    if (isYes) {
      setIsAccessibleMode(true);
      Speech.speak("Mode accessibilité activé. Je vais vous guider.");
    } else {
      setIsAccessibleMode(false);
      Speech.speak("Très bien, passage au mode standard.");
    }
    setShowButtons(false);
  };

  const startListening = async () => {
    try {
      // Si le micro ne marche pas, on affiche les boutons après 2 secondes
      setShowButtons(true); 
      await Voice.start('fr-FR');
    } catch (e) {
      console.log("Le micro ne peut pas démarrer sur cet appareil/simulateur");
      setShowButtons(true);
    }
  };

  useEffect(() => {
    const welcome = "Bienvenue sur B.I.S. App. Êtes-vous déficient visuel ? Répondez par oui ou par non.";
    
    Speech.speak(welcome, {
      language: 'fr',
      onDone: () => {
        startListening().catch(() => setShowButtons(true));
      },
    });

    return () => {
      Voice.destroy().then(Voice.removeAllListeners).catch(() => {});
    };
  }, []);

  if (!showButtons) return null;

  return (
    <View style={styles.overlay}>
      <Text style={styles.title}>Répondez à la question :</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.button, styles.yes]} onPress={() => handleResponse(true)}>
          <Text style={styles.buttonText}>OUI</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, styles.no]} onPress={() => handleResponse(false)}>
          <Text style={styles.buttonText}>NON</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.subtitle}>(Le micro semble indisponible sur cet appareil)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
 overlay: {
    position: 'absolute',
    top: 0,      // On le met en haut pour être sûr de le voir
    left: 0,
    right: 0,
    bottom: 0,   // Il prend tout l'écran
    backgroundColor: 'rgba(0,0,0,0.85)', // Fond noir semi-transparent
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999, // FORCE l'affichage au premier plan
    elevation: 10, // Pour Android
  },
  title: { color: 'white', fontSize: 18, marginBottom: 20, fontWeight: 'bold' },
  buttonContainer: { flexDirection: 'row', gap: 20 },
  button: { paddingVertical: 20, paddingHorizontal: 40, borderRadius: 10, minWidth: 120, alignItems: 'center' },
  yes: { backgroundColor: '#4CAF50' },
  no: { backgroundColor: '#F44336' },
  buttonText: { color: 'white', fontSize: 22, fontWeight: 'bold' },
  subtitle: { color: '#888', marginTop: 15, fontSize: 12 }
});