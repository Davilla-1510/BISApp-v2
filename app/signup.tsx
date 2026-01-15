import React, { useState } from 'react';
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
import { useRouter } from 'expo-router'; // ✅ Import correct pour Expo Router

interface AccessibilityOption {
  id: string;
  label: string;
  value: 'no-visual-impairment' | 'partial' | 'total';
  icon: string;
  description: string;
}

const SignupScreen = () => {
  const router = useRouter(); // ✅ Utilisation du router
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    accessibilityLevel: '' as 'no-visual-impairment' | 'partial' | 'total' | '',
    audioMode: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const { signup } = useAuth();

  const accessibilityOptions: AccessibilityOption[] = [
    { id: '1', label: 'Pas de déficience visuelle', value: 'no-visual-impairment', icon: '👁️', description: 'Vision normale' },
    { id: '2', label: 'Malvoyance partielle', value: 'partial', icon: '👓', description: 'Vision partielle' },
    { id: '3', label: 'Cécité totale', value: 'total', icon: '🕶️', description: 'Sans vision' }
  ];

  const validateStep = (step: number): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (step === 0) {
      if (!formData.firstName.trim()) newErrors.firstName = 'Prénom est requis';
      if (!formData.lastName.trim()) newErrors.lastName = 'Nom est requis';
    }
    if (step === 1) {
      if (!formData.email.trim()) {
        newErrors.email = 'Email est requis';
      } else if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)) {
        newErrors.email = 'Email invalide';
      }
    }
    if (step === 2) {
      if (!formData.password) {
        newErrors.password = 'Mot de passe est requis';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Minimum 6 caractères';
      }
      // if (formData.password !== formData.confirmPassword) {
      //   newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
      // }
      
    if (step === 2) {
      if (!formData.password) {
        newErrors.password = 'Mot de passe est requis';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Minimum 6 caractères';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
      }
    }
    }
    if (step === 3) {
      if (!formData.accessibilityLevel) {
        newErrors.accessibilityLevel = 'Sélectionnez votre niveau d\'accessibilité';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => { if (validateStep(currentStep)) setCurrentStep(currentStep + 1); };
  const handlePrevStep = () => { setCurrentStep(currentStep - 1); };

  const handleSignup = async () => {
    if (!validateStep(currentStep)) return;
    setIsLoading(true);
    try {
      await signup({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        accessibilityLevel: formData.accessibilityLevel as 'no-visual-impairment' | 'partial' | 'total',
        audioMode: formData.audioMode
      });
      // ✅ Si le signup réussit, rediriger vers login ou home
      router.replace('/login');
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Erreur lors de l\'inscription');
    } finally {
      setIsLoading(false);
    }
  };

  const renderNameStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Identité</Text>
      <Text style={styles.stepDescription}>Commençons par votre identité</Text>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Prénom</Text>
        <TextInput
          style={[styles.input, !!errors.firstName && styles.inputError]}
          placeholder="Votre prénom"
          placeholderTextColor="#9CA3AF"
          value={formData.firstName}
          onChangeText={(text) => setFormData({ ...formData, firstName: text })}
        />
        {!!errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Nom</Text>
        <TextInput
          style={[styles.input, !!errors.lastName && styles.inputError]}
          placeholder="Votre nom"
          placeholderTextColor="#9CA3AF"
          value={formData.lastName}
          onChangeText={(text) => setFormData({ ...formData, lastName: text })}
        />
        {!!errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
      </View>
    </View>
  );

  const renderEmailStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Email</Text>
      <Text style={styles.stepDescription}>Nous utiliserons cet email pour votre compte</Text>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Adresse Email</Text>
        <TextInput
          style={[styles.input, !!errors.email && styles.inputError]}
          placeholder="exemple@email.com"
          placeholderTextColor="#9CA3AF"
          value={formData.email}
          onChangeText={(text) => setFormData({ ...formData, email: text })}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {!!errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
      </View>
    </View>
  );

  const renderPasswordStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Mot de Passe</Text>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Mot de Passe</Text>
        <TextInput
          style={[styles.input, !!errors.password && styles.inputError]}
          secureTextEntry={!showPassword}
          value={formData.password}
          onChangeText={(text) => setFormData({ ...formData, password: text })}
          placeholder="••••••••"
        />
        {!!errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
      </View>
    </View>
  );

  const renderAccessibilityStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Accessibilité</Text>
      {accessibilityOptions.map((option) => (
        <TouchableOpacity
          key={option.id}
          style={[styles.optionCard, formData.accessibilityLevel === option.value && styles.optionCardSelected]}
          onPress={() => setFormData({ ...formData, accessibilityLevel: option.value })}
        >
          <Text style={styles.optionIcon}>{option.icon}</Text>
          <View style={styles.optionContent}>
            <Text style={styles.optionLabel}>{option.label}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderConfirmationStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Vérification</Text>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryValue}>{formData.firstName} {formData.lastName}</Text>
        <Text style={styles.summaryValue}>{formData.email}</Text>
      </View>
    </View>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: return renderNameStep();
      case 1: return renderEmailStep();
      case 2: return renderPasswordStep();
      case 3: return renderAccessibilityStep();
      case 4: return renderConfirmationStep();
      default: return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView>
          <View style={styles.logoSection}><View style={styles.logo}><Text style={styles.logoText}>BIS</Text></View></View>
          
          <View style={styles.progressContainer}>
             <Text style={styles.progressText}>Étape {currentStep + 1} sur 5</Text>
          </View>

          {renderStepContent()}

          <View style={styles.navButtons}>
            {currentStep > 0 && (
              <TouchableOpacity style={styles.backButton} onPress={handlePrevStep}>
                <Text style={styles.backButtonText}>← Retour</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              style={styles.nextButton} 
              onPress={currentStep < 4 ? handleNextStep : handleSignup}
              disabled={isLoading}
            >
              {isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.nextButtonText}>{currentStep < 4 ? 'Suivant →' : "S'inscrire"}</Text>}
            </TouchableOpacity>
          </View>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Déjà inscrit? </Text>
            <TouchableOpacity onPress={() => router.push('/login')}>
              <Text style={styles.loginLink}>Se connecter</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// ... Garde tes styles identiques ici ...
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  logoSection: { alignItems: 'center', marginTop: 20, marginBottom: 20 },
  logo: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#6366F1', justifyContent: 'center', alignItems: 'center' },
  logoText: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
  progressContainer: { paddingHorizontal: 20, marginBottom: 30 },
  progressText: { fontSize: 12, color: '#6B7280', textAlign: 'center' },
  stepContent: { paddingHorizontal: 20, marginBottom: 30 },
  stepTitle: { fontSize: 24, fontWeight: 'bold', color: '#1F2937', marginBottom: 8 },
  stepDescription: { fontSize: 14, color: '#6B7280', marginBottom: 20 },
  formGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#1F2937', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 12, backgroundColor: '#F9FAFB' },
  inputError: { borderColor: '#EF4444' },
  errorText: { color: '#EF4444', fontSize: 12, marginTop: 6 },
  optionCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderWidth: 2, borderColor: '#E5E7EB', borderRadius: 8, marginBottom: 12 },
  optionCardSelected: { borderColor: '#6366F1', backgroundColor: '#EEF2FF' },
  optionIcon: { fontSize: 28, marginRight: 15 },
  optionContent: { flex: 1 },
  optionLabel: { fontSize: 14, fontWeight: '600' },
  summaryCard: { backgroundColor: '#F9FAFB', padding: 16, borderRadius: 8 },
  summaryValue: { fontSize: 14, fontWeight: 'bold', marginBottom: 5 },
  navButtons: { flexDirection: 'row', paddingHorizontal: 20, gap: 10 },
  backButton: { padding: 14, borderWidth: 1, borderRadius: 8 },
  backButtonText: { color: '#1F2937' },
  nextButton: { flex: 1, padding: 14, backgroundColor: '#6366F1', borderRadius: 8, alignItems: 'center' },
  nextButtonText: { color: '#FFFFFF', fontWeight: 'bold' },
  loginContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  loginText: { color: '#6B7280' },
  loginLink: { color: '#6366F1', fontWeight: 'bold' }
});

export default SignupScreen;


//  import React, { useState } from 'react';
// import {
//     ActivityIndicator,
//     Alert,
//     KeyboardAvoidingView,
//     Platform,
//     SafeAreaView,
//     ScrollView,
//     StyleSheet,
//     Text,
//     TextInput,
//     TouchableOpacity,
//     View
// } from 'react-native';
// import { useAuth } from '../context/AuthContext';

// interface AccessibilityOption {
//   id: string;
//   label: string;
//   value: 'no-visual-impairment' | 'partial' | 'total';
//   icon: string;
//   description: string;
// }

// const SignupScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
//   const [currentStep, setCurrentStep] = useState(0);
//   const [formData, setFormData] = useState({
//     firstName: '',
//     lastName: '',
//     email: '',
//     password: '',
//     confirmPassword: '',
//     accessibilityLevel: '' as 'no-visual-impairment' | 'partial' | 'total' | '',
//     audioMode: false
//   });
//   const [isLoading, setIsLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const [errors, setErrors] = useState<{ [key: string]: string }>({});

//   const { signup } = useAuth();

//   const accessibilityOptions: AccessibilityOption[] = [
//     {
//       id: '1',
//       label: 'Pas de déficience visuelle',
//       value: 'no-visual-impairment',
//       icon: '👁️',
//       description: 'Vision normale'
//     },
//     {
//       id: '2',
//       label: 'Malvoyance partielle',
//       value: 'partial',
//       icon: '👓',
//       description: 'Vision partielle'
//     },
//     {
//       id: '3',
//       label: 'Cécité totale',
//       value: 'total',
//       icon: '🕶️',
//       description: 'Sans vision'
//     }
//   ];

//   const validateStep = (step: number): boolean => {
//     const newErrors: { [key: string]: string } = {};

//     if (step === 0) {
//       if (!formData.firstName.trim()) {
//         newErrors.firstName = 'Prénom est requis';
//       }
//       if (!formData.lastName.trim()) {
//         newErrors.lastName = 'Nom est requis';
//       }
//     }

//     if (step === 1) {
//       if (!formData.email.trim()) {
//         newErrors.email = 'Email est requis';
//       } else if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)) {
//         newErrors.email = 'Email invalide';
//       }
//     }

//     if (step === 2) {
//       if (!formData.password) {
//         newErrors.password = 'Mot de passe est requis';
//       } else if (formData.password.length < 6) {
//         newErrors.password = 'Minimum 6 caractères';
//       }
//       if (formData.password !== formData.confirmPassword) {
//         newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
//       }
//     }

//     if (step === 3) {
//       if (!formData.accessibilityLevel) {
//         newErrors.accessibilityLevel = 'Sélectionnez votre niveau d\'accessibilité';
//       }
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleNextStep = () => {
//     if (validateStep(currentStep)) {
//       setCurrentStep(currentStep + 1);
//     }
//   };

//   const handlePrevStep = () => {
//     setCurrentStep(currentStep - 1);
//   };

//   const handleSignup = async () => {
//     if (!validateStep(currentStep)) return;

//     setIsLoading(true);
//     try {
//       await signup({
//         firstName: formData.firstName,
//         lastName: formData.lastName,
//         email: formData.email,
//         password: formData.password,
//         accessibilityLevel: formData.accessibilityLevel as 'no-visual-impairment' | 'partial' | 'total',
//         audioMode: formData.audioMode
//       });
//     } catch (error: any) {
//       Alert.alert('Erreur', error.message || 'Erreur lors de l\'inscription');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const renderStep = () => {
//     switch (currentStep) {
//       case 0:
//         return renderNameStep();
//       case 1:
//         return renderEmailStep();
//       case 2:
//         return renderPasswordStep();
//       case 3:
//         return renderAccessibilityStep();
//       case 4:
//         return renderConfirmationStep();
//       default:
//         return null;
//     }
//   };
// const renderNameStep = () => (
//     <View style={styles.stepContent}>
//       <Text style={styles.stepTitle}>Identité</Text>
//       <Text style={styles.stepDescription}>
//         Commençons par votre identité
//       </Text>

//       <View style={styles.formGroup}>
//         <Text style={styles.label}>Prénom</Text>
//         <TextInput
//           style={[styles.input, errors.firstName ? styles.inputError : null]}
//           placeholder="Votre prénom"
//           placeholderTextColor="#9CA3AF"
//           value={formData.firstName}
//           onChangeText={(text) => {
//             setFormData({ ...formData, firstName: text });
//             if (errors.firstName) setErrors({ ...errors, firstName: '' });
//           }}
//           editable={!isLoading}
//         />
//         {!!errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
//       </View>

//       <View style={styles.formGroup}>
//         <Text style={styles.label}>Nom</Text>
//         <TextInput
//           style={[styles.input, errors.lastName ? styles.inputError : null]}
//           placeholder="Votre nom"
//           placeholderTextColor="#9CA3AF"
//           value={formData.lastName}
//           onChangeText={(text) => {
//             setFormData({ ...formData, lastName: text });
//             if (errors.lastName) setErrors({ ...errors, lastName: '' });
//           }}
//           editable={!isLoading}
//         />
//         {!!errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
//       </View>
//     </View>
//   );

//   const renderEmailStep = () => (
//     <View style={styles.stepContent}>
//       <Text style={styles.stepTitle}>Email</Text>
//       <Text style={styles.stepDescription}>
//         Nous utiliserons cet email pour votre compte
//       </Text>

//       <View style={styles.formGroup}>
//         <Text style={styles.label}>Adresse Email</Text>
//         <TextInput
//           style={[styles.input, errors.email && styles.inputError]}
//           placeholder="exemple@email.com"
//           placeholderTextColor="#9CA3AF"
//           value={formData.email}
//           onChangeText={(text) => {
//             setFormData({ ...formData, email: text });
//             if (errors.email) setErrors({ ...errors, email: '' });
//           }}
//           keyboardType="email-address"
//           autoCapitalize="none"
//           editable={!isLoading}
//         />
//         {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
//       </View>

//       <View style={styles.infoBox}>
//         <Text style={styles.infoText}>
//           💡 Si vous n'avez pas d'email, nous créerons un profil provisoire pour vous.
//         </Text>
//       </View>
//     </View>
//   );

//   const renderPasswordStep = () => (
//     <View style={styles.stepContent}>
//       <Text style={styles.stepTitle}>Mot de Passe</Text>
//       <Text style={styles.stepDescription}>
//         Créez un mot de passe sécurisé
//       </Text>

//       <View style={styles.formGroup}>
//         <Text style={styles.label}>Mot de Passe</Text>
//         <View style={styles.passwordContainer}>
//           <TextInput
//             style={[styles.input, styles.passwordInput, errors.password && styles.inputError]}
//             placeholder="••••••••"
//             placeholderTextColor="#9CA3AF"
//             value={formData.password}
//             onChangeText={(text) => {
//               setFormData({ ...formData, password: text });
//               if (errors.password) setErrors({ ...errors, password: '' });
//             }}
//             secureTextEntry={!showPassword}
//             editable={!isLoading}
//           />
//           <TouchableOpacity
//             style={styles.eyeButton}
//             onPress={() => setShowPassword(!showPassword)}
//           >
//             <Text>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
//           </TouchableOpacity>
//         </View>
//         {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
//       </View>

//       <View style={styles.formGroup}>
//         <Text style={styles.label}>Confirmer Mot de Passe</Text>
//         <View style={styles.passwordContainer}>
//           <TextInput
//             style={[styles.input, styles.passwordInput, errors.confirmPassword && styles.inputError]}
//             placeholder="••••••••"
//             placeholderTextColor="#9CA3AF"
//             value={formData.confirmPassword}
//             onChangeText={(text) => {
//               setFormData({ ...formData, confirmPassword: text });
//               if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
//             }}
//             secureTextEntry={!showConfirmPassword}
//             editable={!isLoading}
//           />
//           <TouchableOpacity
//             style={styles.eyeButton}
//             onPress={() => setShowConfirmPassword(!showConfirmPassword)}
//           >
//             <Text>{showConfirmPassword ? '👁️' : '👁️‍🗨️'}</Text>
//           </TouchableOpacity>
//         </View>
//         {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
//       </View>
//     </View>
//   );

//   const renderAccessibilityStep = () => (
//     <View style={styles.stepContent}>
//       <Text style={styles.stepTitle}>Accessibilité</Text>
//       <Text style={styles.stepDescription}>
//         Quel est votre niveau de vision?
//       </Text>

//       {accessibilityOptions.map((option) => (
//         <TouchableOpacity
//           key={option.id}
//           style={[
//             styles.optionCard,
//             formData.accessibilityLevel === option.value && styles.optionCardSelected
//           ]}
//           onPress={() => {
//             setFormData({ ...formData, accessibilityLevel: option.value });
//             setErrors({ ...errors, accessibilityLevel: '' });
//           }}
//         >
//           <Text style={styles.optionIcon}>{option.icon}</Text>
//           <View style={styles.optionContent}>
//             <Text style={styles.optionLabel}>{option.label}</Text>
//             <Text style={styles.optionDescription}>{option.description}</Text>
//           </View>
//           {formData.accessibilityLevel === option.value && (
//             <Text style={styles.checkmark}>✓</Text>
//           )}
//         </TouchableOpacity>
//       ))}

//       {errors.accessibilityLevel && (
//         <Text style={styles.errorText}>{errors.accessibilityLevel}</Text>
//       )}
//     </View>
//   );

//   const renderConfirmationStep = () => (
//     <View style={styles.stepContent}>
//       <Text style={styles.stepTitle}>Vérification</Text>
//       <Text style={styles.stepDescription}>
//         Vérifiez vos informations
//       </Text>

//       <View style={styles.summaryCard}>
//         <View style={styles.summaryRow}>
//           <Text style={styles.summaryLabel}>Nom:</Text>
//           <Text style={styles.summaryValue}>
//             {formData.firstName} {formData.lastName}
//           </Text>
//         </View>
//         <View style={styles.summaryRow}>
//           <Text style={styles.summaryLabel}>Email:</Text>
//           <Text style={styles.summaryValue}>{formData.email}</Text>
//         </View>
//         <View style={styles.summaryRow}>
//           <Text style={styles.summaryLabel}>Accessibilité:</Text>
//           <Text style={styles.summaryValue}>
//             {accessibilityOptions.find(o => o.value === formData.accessibilityLevel)?.label}
//           </Text>
//         </View>
//       </View>

//       <View style={styles.infoBox}>
//         <Text style={styles.infoText}>
//           ✅ Vos données sont chiffrées et sécurisées.
//         </Text>
//       </View>
//     </View>
//   );

//   return (
//     <SafeAreaView style={styles.container}>
//       <KeyboardAvoidingView
//         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//         style={{ flex: 1 }}
//       >
//         <ScrollView showsVerticalScrollIndicator={false}>
//           {/* Logo */}
//           <View style={styles.logoSection}>
//             <View style={styles.logo}>
//               <Text style={styles.logoText}>BIS</Text>
//             </View>
//           </View>

//           {/* Progress Bar */}
//           <View style={styles.progressContainer}>
//             <View style={styles.progressBars}>
//               {[0, 1, 2, 3, 4].map((step) => (
//                 <View
//                   key={step}
//                   style={[
//                     styles.progressBar,
//                     step <= currentStep && styles.progressBarActive
//                   ]}
//                 />
//               ))}
//             </View>
//             <Text style={styles.progressText}>
//               Étape {currentStep + 1} sur 5
//             </Text>
//           </View>

//           {/* Content */}
//           {renderStep()}

//           {/* Navigation Buttons */}
//           <View style={styles.navButtons}>
//             {currentStep > 0 && (
//               <TouchableOpacity
//                 style={styles.backButton}
//                 onPress={handlePrevStep}
//               >
//                 <Text style={styles.backButtonText}>← Retour</Text>
//               </TouchableOpacity>
//             )}

//             {currentStep < 4 ? (
//               <TouchableOpacity
//                 style={[styles.nextButton, { flex: currentStep > 0 ? 1 : 1 }]}
//                 onPress={handleNextStep}
//               >
//                 <Text style={styles.nextButtonText}>Suivant →</Text>
//               </TouchableOpacity>
//             ) : (
//               <TouchableOpacity
//                 style={[styles.signupButton, isLoading && styles.signupButtonDisabled, { flex: 1 }]}
//                 onPress={handleSignup}
//                 disabled={isLoading}
//               >
//                 {isLoading ? (
//                   <ActivityIndicator color="#FFFFFF" size="small" />
//                 ) : (
//                   <Text style={styles.signupButtonText}>S'inscrire</Text>
//                 )}
//               </TouchableOpacity>
//             )}
//           </View>

//           {/* Login Link */}
//           <View style={styles.loginContainer}>
//             <Text style={styles.loginText}>Déjà inscrit? </Text>
//             <TouchableOpacity onPress={() => navigation.navigate('Login')}>
//               <Text style={styles.loginLink}>Se connecter</Text>
//             </TouchableOpacity>
//           </View>

//           <View style={{ height: 20 }} />
//         </ScrollView>
//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#FFFFFF'
//   },
//   logoSection: {
//     alignItems: 'center',
//     marginTop: 20,
//     marginBottom: 20
//   },
//   logo: {
//     width: 60,
//     height: 60,
//     borderRadius: 30,
//     backgroundColor: '#6366F1',
//     justifyContent: 'center',
//     alignItems: 'center'
//   },
//   logoText: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#FFFFFF',
//     letterSpacing: 1
//   },
//   progressContainer: {
//     paddingHorizontal: 20,
//     marginBottom: 30
//   },
//   progressBars: {
//     flexDirection: 'row',
//     gap: 6,
//     marginBottom: 10
//   },
//   progressBar: {
//     flex: 1,
//     height: 4,
//     backgroundColor: '#E5E7EB',
//     borderRadius: 2
//   },
//   progressBarActive: {
//     backgroundColor: '#6366F1'
//   },
//   progressText: {
//     fontSize: 12,
//     color: '#6B7280',
//     textAlign: 'center'
//   },
//   stepContent: {
//     paddingHorizontal: 20,
//     marginBottom: 30
//   },
//   stepTitle: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#1F2937',
//     marginBottom: 8
//   },
//   stepDescription: {
//     fontSize: 14,
//     color: '#6B7280',
//     marginBottom: 20,
//     lineHeight: 20
//   },
//   formGroup: {
//     marginBottom: 20
//   },
//   label: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#1F2937',
//     marginBottom: 8
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#D1D5DB',
//     borderRadius: 8,
//     paddingHorizontal: 15,
//     paddingVertical: 12,
//     fontSize: 14,
//     color: '#1F2937',
//     backgroundColor: '#F9FAFB'
//   },
//   inputError: {
//     borderColor: '#EF4444'
//   },
//   passwordContainer: {
//     flexDirection: 'row',
//     alignItems: 'center'
//   },
//   passwordInput: {
//     flex: 1,
//     paddingRight: 45
//   },
//   eyeButton: {
//     position: 'absolute',
//     right: 12
//   },
//   errorText: {
//     color: '#EF4444',
//     fontSize: 12,
//     marginTop: 6
//   },
//   infoBox: {
//     backgroundColor: '#DBEAFE',
//     borderLeftWidth: 4,
//     borderLeftColor: '#3B82F6',
//     padding: 12,
//     borderRadius: 6,
//     marginTop: 10
//   },
//   infoText: {
//     fontSize: 12,
//     color: '#1E40AF',
//     lineHeight: 18
//   },
//   optionCard: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 16,
//     borderWidth: 2,
//     borderColor: '#E5E7EB',
//     borderRadius: 8,
//     marginBottom: 12,
//     backgroundColor: '#F9FAFB'
//   },
//   optionCardSelected: {
//     borderColor: '#6366F1',
//     backgroundColor: '#EEF2FF'
//   },
//   optionIcon: {
//     fontSize: 28,
//     marginRight: 15
//   },
//   optionContent: {
//     flex: 1
//   },
//   optionLabel: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#1F2937',
//     marginBottom: 4
//   },
//   optionDescription: {
//     fontSize: 12,
//     color: '#6B7280'
//   },
//   checkmark: {
//     fontSize: 20,
//     color: '#6366F1',
//     fontWeight: 'bold'
//   },
//   summaryCard: {
//     backgroundColor: '#F9FAFB',
//     padding: 16,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: '#E5E7EB'
//   },
//   summaryRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 12
//   },
//   summaryLabel: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#6B7280'
//   },
//   summaryValue: {
//     fontSize: 14,
//     fontWeight: 'bold',
//     color: '#1F2937'
//   },
//   navButtons: {
//     flexDirection: 'row',
//     paddingHorizontal: 20,
//     gap: 10,
//     marginBottom: 20
//   },
//   backButton: {
//     paddingVertical: 14,
//     paddingHorizontal: 20,
//     borderWidth: 1,
//     borderColor: '#D1D5DB',
//     borderRadius: 8,
//     justifyContent: 'center',
//     alignItems: 'center'
//   },
//   backButtonText: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#1F2937'
//   },
//   nextButton: {
//     paddingVertical: 14,
//     backgroundColor: '#6366F1',
//     borderRadius: 8,
//     justifyContent: 'center',
//     alignItems: 'center'
//   },
//   nextButtonText: {
//     fontSize: 14,
//     fontWeight: 'bold',
//     color: '#FFFFFF'
//   },
//   signupButton: {
//     paddingVertical: 14,
//     backgroundColor: '#6366F1',
//     borderRadius: 8,
//     justifyContent: 'center',
//     alignItems: 'center'
//   },
//   signupButtonDisabled: {
//     backgroundColor: '#A5B4FC',
//     opacity: 0.8
//   },
//   signupButtonText: {
//     fontSize: 14,
//     fontWeight: 'bold',
//     color: '#FFFFFF'
//   },
//   loginContainer: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     marginBottom: 20
//   },
//   loginText: {
//     fontSize: 14,
//     color: '#6B7280'
//   },
//   loginLink: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#6366F1'
//   }
// });

// export default SignupScreen;
