import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';

export default function SignUpScreen() {
  const router = useRouter();
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accessibilityLevel, setAccessibilityLevel] = useState('no-visual-impairment');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();

  const handleSignUp = async () => {
    // Validation
    if (!nom || !prenom || !email || !password || !confirmPassword) {
      Alert.alert('Erreur', 'Tous les champs sont obligatoires');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    try {
      setLoading(true);
      await signup({
        firstName: prenom,
        lastName: nom,
        email,
        password,
        accessibilityLevel: (accessibilityLevel as 'no-visual-impairment' | 'partial' | 'total'),
        audioMode: false,
      });
      
      Alert.alert('Succès', 'Inscription réussie!');
      router.replace('/home');
    } catch (err: any) {
      Alert.alert('Erreur d\'inscription', err.message || 'Une erreur est survenue');
      console.error('Signup error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigateToLogin = () => {
    router.push('/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title} accessibilityRole="header">Inscription</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Nom"
        value={nom}
        onChangeText={setNom}
        autoCapitalize="words"
        editable={!loading}
        accessible={true}
        accessibilityLabel="Champ de saisie pour le nom"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Prénom"
        value={prenom}
        onChangeText={setPrenom}
        autoCapitalize="words"
        editable={!loading}
        accessible={true}
        accessibilityLabel="Champ de saisie pour le prénom"
      />

      <TextInput
        style={styles.input}
        placeholder="Adresse e-mail"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!loading}
        accessible={true}
        accessibilityLabel="Champ de saisie pour l'adresse e-mail"
      />

      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Niveau d'accessibilité:</Text>
        <TouchableOpacity
          style={styles.pickerButton}
          onPress={() => {
            Alert.alert('Niveau d\'accessibilité', 'Sélectionnez votre niveau', [
              { text: 'Aucune déficience visuelle', onPress: () => setAccessibilityLevel('no-visual-impairment') },
              { text: 'Partielle', onPress: () => setAccessibilityLevel('partial') },
              { text: 'Totale', onPress: () => setAccessibilityLevel('total') },
            ]);
          }}
          disabled={loading}
        >
          <Text>{accessibilityLevel === 'no-visual-impairment' ? 'Aucune déficience visuelle' : accessibilityLevel === 'partial' ? 'Partielle' : 'Totale'}</Text>
        </TouchableOpacity>
      </View>
      
      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!loading}
        accessible={true}
        accessibilityLabel="Champ de saisie pour le mot de passe"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Confirmer le mot de passe"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        editable={!loading}
        accessible={true}
        accessibilityLabel="Champ de saisie pour la confirmation du mot de passe"
      />
      
      <View style={styles.buttonContainer}>
        <Button
          title={loading ? 'Inscription en cours...' : 'S\'inscrire'}
          onPress={handleSignUp}
          disabled={loading}
          accessibilityLabel="Bouton pour créer un compte"
        />
      </View>

      <TouchableOpacity onPress={handleNavigateToLogin} disabled={loading}>
        <Text style={styles.link}>Déjà un compte ? Se connecter</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
  },
  input: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  pickerContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  pickerButton: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 8,
    justifyContent: 'center',
    paddingHorizontal: 10,
    backgroundColor: '#f9f9f9',
  },
  buttonContainer: {
    marginVertical: 10,
  },
  link: {
    marginTop: 20,
    color: '#007AFF',
    textAlign: 'center',
    fontSize: 16,
  },
});
