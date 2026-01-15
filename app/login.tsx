import React, { useState } from 'react';
import { useRouter } from 'expo-router'; // ✅ Utilisation exclusive d'Expo Router
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
import { useAuth } from '../context/AuthContext';
import * as Haptics from 'expo-haptics'; // ✅ Ajout du retour haptique

const LoginScreen = () => {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (!email.trim()) {
      newErrors.email = 'Email est requis';
    } else if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      newErrors.email = 'Email invalide';
    }
    if (!password) {
      newErrors.password = 'Mot de passe est requis';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        return;
    };

    setIsLoading(true);
    try {
      await login(email, password);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // La redirection vers /home est généralement gérée par ton RootLayout 
      // via l'état de l'utilisateur dans AuthContext.
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Erreur', error.message || 'Erreur lors de la connexion');
      setPassword('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <View style={styles.logo} accessibilityRole="image" accessibilityLabel="Logo de l'application BIS">
              <Text style={styles.logoText}>BIS</Text>
            </View>
            <Text style={styles.appName}>BISApp</Text>
          </View>

          {/* Form Header */}
          <View style={styles.formHeader}>
            <Text style={styles.title}>Connexion</Text>
            <Text style={styles.subtitle}>
              Connectez-vous pour continuer votre apprentissage
            </Text>
          </View>

          {/* Email Input */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Adresse Email</Text>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="exemple@email.com"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email) setErrors({ ...errors, email: '' });
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading}
              accessibilityLabel="Champ de saisie de l'adresse email"
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>

          {/* Password Input */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Mot de Passe</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, styles.passwordInput, errors.password && styles.inputError]}
                placeholder="••••••••"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errors.password) setErrors({ ...errors, password: '' });
                }}
                secureTextEntry={!showPassword}
                editable={!isLoading}
                accessibilityLabel="Champ de saisie du mot de passe"
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
                accessibilityLabel={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
              </TouchableOpacity>
            </View>
            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Se connecter"
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.loginButtonText}>Se Connecter</Text>
            )}
          </TouchableOpacity>

          {/* Separator */}
          <View style={styles.separator}>
            <View style={styles.line} />
            <Text style={styles.separatorText}>ou</Text>
            <View style={styles.line} />
          </View>

          {/* Signup Link */}
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Pas encore de compte? </Text>
            <TouchableOpacity onPress={() => router.push('/signup')}>
              <Text style={styles.signupLink}>S'inscrire</Text>
            </TouchableOpacity>
          </View>

          {/* Help Text */}
          <View style={styles.helpContainer}>
            <Text style={styles.helpText}>
              Besoin d'aide? Contactez le support à support@bisapp.com
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  logoSection: { alignItems: 'center', marginTop: 40, marginBottom: 30 },
  logo: {
    width: 80, height: 80, borderRadius: 20, // Plus moderne que 40
    backgroundColor: '#6366F1', justifyContent: 'center', alignItems: 'center', marginBottom: 15,
    elevation: 4, shadowColor: '#6366F1', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8
  },
  logoText: { fontSize: 26, fontWeight: '900', color: '#FFFFFF' },
  appName: { fontSize: 22, fontWeight: 'bold', color: '#1F2937' },
  formHeader: { paddingHorizontal: 20, marginBottom: 30 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#111827', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#6B7280', lineHeight: 24 },
  formGroup: { marginHorizontal: 20, marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '700', color: '#374151', marginBottom: 8 },
  input: {
    borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 16, color: '#1F2937', backgroundColor: '#F9FAFB'
  },
  inputError: { borderColor: '#EF4444' },
  passwordContainer: { flexDirection: 'row', alignItems: 'center' },
  passwordInput: { flex: 1, paddingRight: 50 },
  eyeButton: { position: 'absolute', right: 12, padding: 8 },
  eyeIcon: { fontSize: 20 },
  errorText: { color: '#EF4444', fontSize: 13, marginTop: 6, fontWeight: '500' },
  loginButton: {
    marginHorizontal: 20, marginTop: 10, paddingVertical: 18, backgroundColor: '#6366F1',
    borderRadius: 12, justifyContent: 'center', alignItems: 'center',
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4
  },
  loginButtonDisabled: { backgroundColor: '#A5B4FC', opacity: 0.8 },
  loginButtonText: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF' },
  separator: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 30, marginVertical: 30 },
  line: { flex: 1, height: 1, backgroundColor: '#E5E7EB' },
  separatorText: { marginHorizontal: 15, fontSize: 14, color: '#9CA3AF', fontWeight: '600' },
  signupContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20 },
  signupText: { fontSize: 15, color: '#6B7280' },
  signupLink: { fontSize: 15, fontWeight: 'bold', color: '#6366F1' },
  helpContainer: { marginHorizontal: 20, paddingBottom: 20 },
  helpText: { fontSize: 13, color: '#9CA3AF', textAlign: 'center', lineHeight: 20 }
});

export default LoginScreen;