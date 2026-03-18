import { useRouter } from "expo-router";
import React, { useState, useEffect, useCallback } from "react";
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
  View,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { useAutoTTS } from "../hooks/useTTS";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface AccessibilityOption {
  id: string;
  label: string;
  value: "no-visual-impairment" | "partial" | "total";
  icon: string;
  description: string;
}

const SignupScreen = () => {
  const router = useRouter();
  const { signup } = useAuth();
  
  // Hook TTS pour l'accessibilité
  const { announceInstructions, announceError, announceSuccess } = useAutoTTS();

  // Messages pour chaque étape
  const stepMessages = [
    "Étape 1 sur 5. Entrez votre prénom et nom.",
    "Étape 2 sur 5. Entrez votre adresse email.",
    "Étape 3 sur 5. Créez un mot de passe sécurisé.",
    "Étape 4 sur 5. Choisissez votre niveau d'accessibilité.",
    "Étape 5 sur 5. Vérifiez vos informations."
  ];
    // Permet de pronnoncer chaque lettre saisi de l'alphabet saisi dans chaque champ 
 
    // const currentField  ;
   // States
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    accessibilityLevel: "" as "no-visual-impairment" | "partial" | "total" | "",
    audioMode: false,
  });

   

  // Annoncer les instructions quand l'étape change
  useEffect(() => {
    announceInstructions(stepMessages[currentStep]);
  }, [currentStep]);

  const accessibilityOptions: AccessibilityOption[] = [
    {
      id: "1",
      label: "Pas de déficience",
      value: "no-visual-impairment",
      icon: "👁️",
      description: "Vision normale",
    },
    {
      id: "2",
      label: "Malvoyance partielle",
      value: "partial",
      icon: "👓",
      description: "Vision réduite",
    },
    {
      id: "3",
      label: "Cécité totale",
      value: "total",
      icon: "🕶️",
      description: "Usage vocal requis",
    },
  ];

  // Validation
  const validateStep = (step: number): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (step === 0) {
      if (!formData.firstName.trim()) newErrors.firstName = "Prénom requis";
      if (!formData.lastName.trim()) newErrors.lastName = "Nom requis";
    }
    if (step === 1) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!formData.email.trim()) newErrors.email = "Email requis";
      else if (!emailRegex.test(formData.email))
        newErrors.email = "Format invalide";
    }
    if (step === 2) {
      if (!formData.password) newErrors.password = "Mot de passe requis";
      else if (
        !/(?=.*[A-Z])(?=.*\d)(?=.*[@$#!%*?&])[A-Za-z\d@$!#%*?&]{8,}/.test(
          formData.password,
        )
      )
        newErrors.password =
          "Le mot de passe doit contenir au moins 8 caractères, une majuscule, un chiffre et un caractère spécial";
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
      }
    }
    if (step === 3) {
      if (!formData.accessibilityLevel)
        newErrors.accessibilityLevel = "Sélectionnez une option";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  // Actions
  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Annoncer la première erreur
      const firstError = Object.values(errors)[0];
      if (firstError) {
        announceError(firstError);
      }
    }
  };

  const handlePrevStep = () => setCurrentStep((prev) => prev - 1);

  const handleSignup = async () => {
    if (!validateStep(currentStep)) return;
    setIsLoading(true);
    try {
      await signup({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        accessibilityLevel: formData.accessibilityLevel as
          | "no-visual-impairment"
          | "partial"
          | "total",
        audioMode: formData.audioMode,
      });
      
      // Annoncer le succès
      announceSuccess("Compte créé avec succès! Redirection vers l'accueil.");
      
      // Rediriger vers les onglets après l'inscription
      router.replace("/(tabs)");
    } catch (error: any) {
      announceError(error.message || "Échec de l'inscription");
      Alert.alert("Erreur", error.message || "Échec de l'inscription");
    } finally {
      setIsLoading(false);
    }
  };

  // Step rendering
  const renderNameStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Identité</Text>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Prénom</Text>
        <TextInput
          style={[styles.input, !!errors.firstName && styles.inputError]}
          value={formData.firstName}
          onChangeText={(t) => setFormData({ ...formData, firstName: t })}
          placeholder="Ex: Jean"
          accessibilityLabel="Champ prénom"
        />
        {!!errors.firstName && (
          <Text style={styles.errorText}>{errors.firstName}</Text>
        )}
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Nom</Text>
        <TextInput
          style={[styles.input, !!errors.lastName && styles.inputError]}
          value={formData.lastName}
          onChangeText={(t) => setFormData({ ...formData, lastName: t })}
          placeholder="Ex: Dupont"
          accessibilityLabel="Champ nom"
        />
        {!!errors.lastName && (
          <Text style={styles.errorText}>{errors.lastName}</Text>
        )}
      </View>
    </View>
  );

  const renderEmailStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Contact</Text>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Adresse Email</Text>
        <TextInput
          style={[styles.input, !!errors.email && styles.inputError]}
          value={formData.email}
          onChangeText={(t) => setFormData({ ...formData, email: t })}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="cjarc@email.com"
          accessibilityLabel="Champ email"
        />
        {!!errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
      </View>
    </View>
  );

  const renderPasswordStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Sécurité</Text>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Mot de Passe</Text>
        <View style={styles.passwordWrapper}>
          <TextInput
            style={[
              styles.input,
              styles.passwordInput,
              !!errors.password && styles.inputError,
            ]}
            secureTextEntry={!showPassword}
            value={formData.password}
            placeholder="••••••••••••••"
            onChangeText={(t) => setFormData({ ...formData, password: t })}
            accessibilityLabel="Champ mot de passe"
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
            accessibilityLabel={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          >
            <Text>{showPassword ? "👁️" : "🙈"}</Text>
          </TouchableOpacity>
        </View>
        {!!errors.password && (
          <Text style={styles.errorText}>{errors.password}</Text>
        )}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Confirmer le mot de passe</Text>
        <View style={styles.passwordWrapper}>
          <TextInput
            style={[
              styles.input,
              styles.passwordInput,
              !!errors.confirmPassword && styles.inputError,
            ]}
            secureTextEntry={!showConfirmPassword}
            value={formData.confirmPassword}
            placeholder="••••••••••••••"
            onChangeText={(t) =>
              setFormData({ ...formData, confirmPassword: t })
            }
            accessibilityLabel="Champ confirmation mot de passe"
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            accessibilityLabel={showConfirmPassword ? "Masquer" : "Afficher"}
          >
            <Text>{showConfirmPassword ? "👁️" : "🙈"}</Text>
          </TouchableOpacity>
        </View>
        {!!errors.confirmPassword && (
          <Text style={styles.errorText}>{errors.confirmPassword}</Text>
        )}
      </View>
    </View>
  );

  const renderAccessibilityStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Accessibilité</Text>
      {accessibilityOptions.map((option) => (
        <TouchableOpacity
          key={option.id}
          style={[
            styles.optionCard,
            formData.accessibilityLevel === option.value &&
              styles.optionCardSelected,
          ]}
          onPress={() =>
            setFormData({ ...formData, accessibilityLevel: option.value })
          }
          accessibilityRole="radio"
          accessibilityState={{ selected: formData.accessibilityLevel === option.value }}
        >
          <Text style={styles.optionIcon}>{option.icon}</Text>
          <View>
            <Text style={styles.optionLabel}>{option.label}</Text>
            <Text style={styles.optionDesc}>{option.description}</Text>
          </View>
        </TouchableOpacity>
      ))}
      {!!errors.accessibilityLevel && (
        <Text style={styles.errorText}>{errors.accessibilityLevel}</Text>
      )}
    </View>
  );

  const renderConfirmationStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Est ce exact ?</Text>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryText}>
          👤 {formData.firstName} {formData.lastName}
        </Text>
        <Text style={styles.summaryText}>📧 {formData.email}</Text>
        <Text style={styles.summaryText}>
          ⚖️ Niveau: {formData.accessibilityLevel}
        </Text>
      </View>
    </View>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderNameStep();
      case 1:
        return renderEmailStep();
      case 2:
        return renderPasswordStep();
      case 3:
        return renderAccessibilityStep();
      case 4:
        return renderConfirmationStep();
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ paddingVertical: 20 }}>
          <View style={styles.header}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>BIS </Text>
            </View>

            <View style={styles.progressContainer}>
              {[0, 1, 2, 3, 4].map((i) => (
                <View
                  key={i}
                  style={[
                    styles.progressDot,
                    i <= currentStep && styles.progressDotActive,
                  ]}
                />
              ))}
            </View>
          </View>

          {renderStepContent()}

          <View style={styles.footer}>
            {currentStep > 0 && (
              <TouchableOpacity 
                style={styles.btnBack} 
                onPress={handlePrevStep}
                accessibilityRole="button"
                accessibilityLabel="Retour"
              >
                <Text style={styles.btnBackText}>Retour</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.btnNext}
              onPress={currentStep < 4 ? handleNextStep : handleSignup}
              disabled={isLoading}
              accessibilityRole="button"
              accessibilityLabel={currentStep < 4 ? "Suivant" : "S'inscrire"}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.btnNextText}>
                  {currentStep < 4 ? "Suivant" : "S'inscrire"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// Styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  header: { alignItems: "center", marginBottom: 30 },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#6366F1",
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: { color: "#FFF", fontWeight: "bold" },
  progressContainer: { flexDirection: "row", gap: 8, marginTop: 20 },
  progressDot: {
    width: 30,
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
  },
  progressDotActive: { backgroundColor: "#6366F1" },
  stepContent: { paddingHorizontal: 25 },
  stepTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#1F2937",
  },
  formGroup: { marginBottom: 20 },
  label: { fontSize: 14, color: "#4B5563", marginBottom: 8, fontWeight: "600" },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    padding: 12,
    backgroundColor: "#F9FAFB",
  },
  inputError: { borderColor: "#EF4444" },
  errorText: { color: "#EF4444", fontSize: 12, marginTop: 5 },
  passwordWrapper: { flexDirection: "row", alignItems: "center" },
  passwordInput: { flex: 1, paddingRight: 40 },
  eyeIcon: { position: "absolute", right: 12 },
  optionCard: {
    flexDirection: "row",
    padding: 15,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    marginBottom: 12,
    alignItems: "center",
  },
  optionCardSelected: { borderColor: "#6366F1", backgroundColor: "#F5F7FF" },
  optionIcon: { fontSize: 24, marginRight: 15 },
  optionLabel: { fontWeight: "bold", color: "#1F2937" },
  optionDesc: { fontSize: 12, color: "#6B7280" },
  summaryCard: { backgroundColor: "#F3F4F6", padding: 20, borderRadius: 12 },
  summaryText: { fontSize: 16, marginBottom: 10, color: "#374151" },
  footer: { flexDirection: "row", padding: 25, gap: 10 },
  btnBack: {
    flex: 0.4,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    alignItems: "center",
  },
  btnBackText: { color: "#4B5563", fontWeight: "bold" },
  btnNext: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#6366F1",
    alignItems: "center",
  },
  btnNextText: { color: "#FFF", fontWeight: "bold" },
});

export default SignupScreen;

