import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext'; // Changez de @/context/AuthContext à ./context/AuthContext

import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth(); // Changez 'signIn' en 'login'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '' });

  const validateForm = (): boolean => {
    const newErrors = { email: '', password: '' };
    let isValid = true;

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = 'L\'email est requis';
      isValid = false;
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Email invalide';
      isValid = false;
    }

    // Validation mot de passe
    if (!password) {
      newErrors.password = 'Le mot de passe est requis';
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await login(email, password); // Changez 'signIn' en 'login'
      router.replace('/home');
    } catch (error: any) {
      Alert.alert(
        'Erreur de connexion',
        error.message || 'Une erreur est survenue lors de la connexion'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSignupNavigation = () => {
    router.push('/signup');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <SafeAreaView style={styles.safeArea}>
          <Text style={styles.title} accessibilityRole="header">
            Connexion
          </Text>

          {/* Champ Email */}
          <View style={styles.inputGroup}>
            <TextInput
              style={[styles.input, errors.email ? styles.inputError : null]}
              placeholder="Adresse e-mail"
              placeholderTextColor="#999"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email) setErrors({ ...errors, email: '' });
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
              accessible={true}
              accessibilityLabel="Champ de saisie pour l'adresse e-mail"
              accessibilityHint="Entrez votre adresse e-mail"
            />
            {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
          </View>

          {/* Champ Mot de passe */}
          <View style={styles.inputGroup}>
            <TextInput
              style={[styles.input, errors.password ? styles.inputError : null]}
              placeholder="Mot de passe"
              placeholderTextColor="#999"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) setErrors({ ...errors, password: '' });
              }}
              secureTextEntry
              editable={!loading}
              accessible={true}
              accessibilityLabel="Champ de saisie pour le mot de passe"
              accessibilityHint="Entrez votre mot de passe"
            />
            {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
          </View>

          {/* Bouton Se connecter */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Bouton pour se connecter"
              accessibilityHint={loading ? 'Connexion en cours...' : 'Appuyez pour vous connecter'}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.buttonText}>Se connecter</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Lien vers inscription */}
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Pas encore de compte ? </Text>
            <Link href="/(auth)/signup" asChild>
              <TouchableOpacity
                accessible={true}
                accessibilityRole="link"
                accessibilityLabel="Lien vers la page d'inscription"
              >
                <Text style={styles.link}>S'inscrire</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </SafeAreaView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  safeArea: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
    color: '#333',
  },
  inputGroup: {
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#333',
  },
  inputError: {
    borderColor: '#ff3b30',
    backgroundColor: '#fff5f5',
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
  },
  buttonContainer: {
    marginVertical: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 50,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  signupText: {
    color: '#666',
    fontSize: 14,
  },
  link: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
