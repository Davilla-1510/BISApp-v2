import React, { useState } from 'react';
import {
  Animated,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
  Linking
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AboutScreen = () => {
  const router = useRouter();
  const [fadeAnim] = useState(new Animated.Value(0));

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleContinue = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/login');
  };

  const handleSignup = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/signup');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>BIS</Text>
            </View>
            <Text style={styles.appName}>BISApp</Text>
            <Text style={styles.tagline}>
              Apprendre le Braille et l'Informatique Accessible
            </Text>
          </View>

          {/* About Section */}
          <View style={styles.aboutSection}>
            <Text style={styles.sectionTitle}>À propos de BISApp</Text>
            
            <View style={styles.aboutCard}>
              <Text style={styles.aboutText}>
                BISApp est une application innovative conçue pour rendre 
                l'apprentissage du Braille et de l'informatique accessible 
                à tous, quel que soit votre niveau de vision.
              </Text>
            </View>

            {/* Features */}
            <View style={styles.featuresContainer}>
              <Text style={styles.featuresTitle}>Ce que vous trouverez</Text>
              
              {[
                { icon: '📚', title: 'Cours de Braille', desc: 'Apprenez le Braille à votre rythme avec des leçons interactives' },
                { icon: '🎮', title: 'Exercices Pratiques', desc: 'Pratiquez avec des exercices adaptés à votre niveau' },
                { icon: '📊', title: 'Suivi de Progression', desc: 'Visualisez votre évolution dans votre tableau de bord' },
                { icon: '♿', title: 'Accessibilité Totale', desc: 'Mode Text-to-Speech, commandes vocales et plus encore' },
                { icon: '🌐', title: 'Multilingue', desc: 'Disponible en français et en anglais' },
                { icon: '🏆', title: 'Badges & Récompenses', desc: 'Gagnez des badges en accomplissant vos objectifs' },
              ].map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <Text style={styles.featureIcon}>{feature.icon}</Text>
                  <View style={styles.featureContent}>
                    <Text style={styles.featureTitle}>{feature.title}</Text>
                    <Text style={styles.featureDesc}>{feature.desc}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Target Audience */}
            <View style={styles.targetSection}>
              <Text style={styles.targetTitle}>À qui s'adresse BISApp ?</Text>
              <View style={styles.targetTags}>
                <View style={styles.targetTag}>
                  <Text style={styles.targetTagText}>👁️ Déficients visuels</Text>
                </View>
                <View style={styles.targetTag}>
                  <Text style={styles.targetTagText}>👨‍🏫 Enseignants</Text>
                </View>
                <View style={styles.targetTag}>
                  <Text style={styles.targetTagText}>👪 Familles</Text>
                </View>
                <View style={styles.targetTag}>
                  <Text style={styles.targetTagText}>🎓 Étudiants</Text>
                </View>
              </View>
            </View>

          </View>

          {/* CTA Buttons */}
          <View style={styles.ctaContainer}>
            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleContinue}
              activeOpacity={0.8}
              accessibilityLabel="Se connecter à BISApp"
            >
              <Text style={styles.loginButtonText}>Acceder a BISApp</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.signupButton}
              onPress={handleSignup}
              activeOpacity={0.8}
              accessibilityLabel="Créer un compte BISApp"
            >
              <Text style={styles.signupButtonText}>Rejoindre BISApp</Text>
            </TouchableOpacity>
          </View>

          {/* Footer Info */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              ♿ BISApp s'engage pour l'accessibilité numérique
            </Text>
          </View>

        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
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
    fontSize: 28,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
  },
  aboutSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  aboutCard: {
    backgroundColor: '#F3F4F6',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  aboutText: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 24,
    textAlign: 'center',
  },
  featuresContainer: {
    marginBottom: 24,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  featureIcon: {
    fontSize: 28,
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 13,
    color: '#6B7280',
  },
  targetSection: {
    marginBottom: 24,
  },
  targetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  targetTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  targetTag: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  targetTagText: {
    fontSize: 13,
    color: '#4F46E5',
    fontWeight: '500',
  },
  ctaContainer: {
    gap: 12,
    marginTop: 20,
  },
  loginButton: {
    backgroundColor: '#6366F1',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  loginButtonText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  signupButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#6366F1',
  },
  signupButtonText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#6366F1',
  },
  footer: {
    alignItems: 'center',
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  footerText: {
    fontSize: 13,
    color: '#6B7280',
  },
});

export default AboutScreen;
