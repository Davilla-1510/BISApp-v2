import React from 'react';
import { View, Image, TouchableOpacity, Platform, Alert, StyleSheet, ActivityIndicator, Text } from "react-native";
import { useRouter } from 'expo-router';
import { useTTS } from '@/hooks/useTTS';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function OffreVisitor() {
  const router = useRouter();
  const { speak } = useTTS();
  const [isDownloading, setIsDownloading] = React.useState(false);

  // URL du guide PDF - hébergez votre propre document
  const pdfUrl = "https://www.w3.org/WAI/fundamentals/accessibility-intro/fr/accessibility-intro.pdf";

  const openPdf = async () => {
    speak("Ouverture du guide d'accessibilité numérique");
    setIsDownloading(true);
    try {
      if (Platform.OS === 'web') {
        window.open(pdfUrl, '_blank');
      } else {
        // Download direct sans directory statique - utilise URI dynamique
        const downloadResult = await FileSystem.downloadAsync(pdfUrl, FileSystem.documentDirectory + 'guide.pdf');
        if (downloadResult.status === 200) {
          const isAvailable = await Sharing.isAvailableAsync();
          if (isAvailable) {
            await Sharing.shareAsync(downloadResult.uri);
          } else {
            Alert.alert("Erreur", "Partage non disponible sur cet appareil.");
          }
        } else {
          Alert.alert("Erreur", "Échec du téléchargement.");
        }
      }
    } catch (error) {
      console.error("Erreur PDF:", error);
      Alert.alert("Erreur", "Problème connexion internet ou PDF.");
    } finally {
      setIsDownloading(false);
    }
  };

  const goBack = () => {
    router.back();
  };

  return (
    <ThemedView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={goBack} accessibilityLabel="Retour">
        <Text style={styles.backText}>← Retour</Text>
      </TouchableOpacity>
      
      <ThemedText style={styles.headerText}>Guide d'Accessibilité Numérique</ThemedText>
      <ThemedText style={styles.subText}>Document complet pour tous</ThemedText>
      
      <TouchableOpacity
        style={styles.card}
        onPress={openPdf}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Ouvrir guide PDF accessibilité"
        accessibilityHint="Télécharge et ouvre le document"
      >
        {isDownloading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color="#6366F1" />
            <ThemedText style={styles.loadingText}>Téléchargement...</ThemedText>
          </View>
        ) : (
          <>
            <Image
              source={{ uri: 'https://via.placeholder.com/400x250/f8fafc/6366F1?text=Guide+PDF' }}
              style={styles.image}
              resizeMode="cover"
            />
            <View style={styles.overlay}>
              <ThemedText style={styles.overlayText}>📄 Ouvrir le Guide</ThemedText>
            </View>
          </>
        )}
      </TouchableOpacity>
      
      <ThemedText style={styles.footer}>Web: nouvel onglet | Mobile: télécharge + partage</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  backButton: {
    marginBottom: 20,
    padding: 12,
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366F1',
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  subText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.8,
  },
  card: {
    width: '100%',
    height: 250,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#f8fafc',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
  },
  image: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(99, 102, 241, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  overlayText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  footer: {
    marginTop: 32,
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 20,
  },
});

