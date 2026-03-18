import React, { useEffect } from 'react';
import {
    ImageBackground,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Platform
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useAutoTTS } from '../hooks/useTTS';
import { AccessibilityInfo } from 'react-native';

const HomeScreen = () => {
  const { user } = useAuth();
  const router = useRouter();
  
  // Hook TTS pour l'accessibilité
  const { announceWelcome, announceInstructions } = useAutoTTS();

  // Annoncer le message de bienvenue au chargement
  useEffect(() => {
    if (user) {
      const welcomeMessage = `Bienvenue ${user.firstName} sur BISApp. 
        Vous avez 2 modules disponibles. 
        Appuyez sur Commencer Maintenant pour démarrer votre apprentissage.`;
      announceWelcome(user.firstName);
    }
  }, [user]);

  const handleStartNow = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    announceInstructions("Navigation vers la sélection des modules");
    router.push('/modules-selection');
  };

  const handleDashboard = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    announceInstructions("Navigation vers le tableau de bord");
    router.push('/dashboard');
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* Header - Amélioration du contraste */}
        <View style={styles.header}>
          <Text style={styles.greeting} accessibilityRole="header">
            Bienvenue {user.firstName}! 👋
          </Text>
          <Text style={styles.headerSubtitle}>
            Préparez-vous à explorer le monde du Braille et de l'Informatique Accessible.
          </Text>
        </View>

        {/* Hero Section */}
        <ImageBackground
          source={require('../assets/images/Reading-Braille.png')}
          style={styles.heroSection}
          imageStyle={{ borderRadius: 2 }
        }
        >
          <View style={styles.heroOverlay}>
            <Text style={styles.heroTitle}>Apprenez le Braille</Text>
            <Text style={styles.heroSubtitle}>Maîtrisez les compétences essentielles à votre rythme</Text>
          </View>
        </ImageBackground>

        {/* Main CTA - Plus grand pour l'accessibilité */}
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={handleStartNow}
          activeOpacity={0.8}
          accessibilityLabel="Commencer l'apprentissage maintenant"
          accessibilityHint="Navigue vers la sélection des modules"
        >
          <Text style={styles.ctaButtonText}>Commencer Maintenant</Text>
        </TouchableOpacity>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          {[
            { num: '2', label: 'Modules' },
            { num: '3', label: 'Niveaux' },
            { num: '∞', label: 'Leçons' },
          ].map((stat, idx) => (
            <View key={idx} style={styles.statCard}>
              <Text style={styles.statNumber}>{stat.num}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Features - Liste scannable */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Pourquoi BISApp?</Text>

          {[
            { icon: '♿', title: 'Accessibilité Totale', desc: 'Conçu spécifiquement pour TalkBack et VoiceOver.' },
            { icon: '🎓', title: 'Parcours Adapté', desc: 'Suivez votre progression en temps réel.' },
            { icon: '🔊', title: 'Mode Audio', desc: 'Soutien par synthèse vocale intégré.' },
          ].map((feature, idx) => (
            <View key={idx} style={styles.featureItem} accessibilityRole="text">
              <Text style={styles.featureIcon}>{feature.icon}</Text>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Action Secondary */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleDashboard}
            accessibilityLabel="Aller au tableau de bord"
          >
            <Text style={styles.secondaryButtonText}>📊 Mon Tableau de Bord</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingTop: Platform.OS === 'android' ? 30 : 0
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 22
  },
  heroSection: {
    marginHorizontal: 20,
    marginTop: 20,
    height: 180,
    borderRadius: 6,
    overflow: 'hidden',
  },
  heroOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    padding: 20,
    justifyContent: 'center',
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#F3F4F6',
    lineHeight: 20
  },
  ctaButton: {
    marginHorizontal: 20,
    marginTop: -25,
    marginBottom: 30,
    paddingVertical: 18,
    backgroundColor: '#6366F1',
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8
  },
  ctaButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF'
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    marginBottom: 30
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 5,
    paddingVertical: 20,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6'
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: '#6366F1',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4
  },
  featuresSection: {
    paddingHorizontal: 20,
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 15
  },
  featureItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6'
  },
  featureIcon: {
    fontSize: 30,
    marginRight: 15,
  },
  featureContent: {
    flex: 1
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
  },
  featureDescription: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2
  },
  actionButtons: {
    paddingHorizontal: 20,
  },
  secondaryButton: {
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB'
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#374151'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB'
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280'
  }
});

export default HomeScreen;
