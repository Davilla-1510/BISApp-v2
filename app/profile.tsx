import React, { useEffect, useState, useRef } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    ScrollView, 
    TouchableOpacity, 
    ActivityIndicator, 
    SafeAreaView, 
    Switch, 
    Alert,
    TextInput,
    Modal,
    Image
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'expo-router';
import api from '../services/api';

interface UserStats {
  totalLessonsCompleted: number;
  totalQuizzesCompleted: number;
  averageScore: number;
  timeSpentHours: number;
}

const ProfileScreen = () => {
  const { user, logout, isAccessibleMode, setIsAccessibleMode, updateProfile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [audioMode, setAudioMode] = useState(false);
  
  // Modal states
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showBioModal, setShowBioModal] = useState(false);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newBio, setNewBio] = useState('');
  
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  const handleLogout = () => {
    Alert.alert(
      'Deconnexion',
      'Etes-vous sur de vouloir vous deconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Deconnecter', 
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/visitor-welcome');
          }
        },
      ]
    );
  };

  const handleAudioModeToggle = async (value: boolean) => {
    setAudioMode(value);
    try {
      await updateProfile({ audioMode: value });
      if (value) {
        Speech.speak("Mode audio active", { language: 'fr' });
      }
    } catch (error) {
      console.error('Error updating audio mode:', error);
    }
  };

  const handleAccessibilityToggle = (value: boolean) => {
    setIsAccessibleMode(value);
    if (value) {
      Speech.speak("Mode accessibilite active. Je vais vous guider vocalement.", { language: 'fr' });
    } else {
      Speech.speak("Mode accessibilite desactive", { language: 'fr' });
    }
  };

  // Handle photo update
  const handleUpdatePhoto = async () => {
    try {
      await updateProfile({ profilePhoto: newPhotoUrl });
      setShowPhotoModal(false);
      setNewPhotoUrl('');
      Alert.alert('Succes', 'Photo de profil mise a jour');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de mettre a jour la photo');
    }
  };

  // Handle bio update
  const handleUpdateBio = async () => {
    try {
      await updateProfile({ bio: newBio });
      setShowBioModal(false);
      Alert.alert('Succes', 'Description mise a jour');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de mettre a jour la description');
    }
  };

  const speakProfile = () => {
    if (!isAccessibleMode) return;
    
    const message = `Votre profil. ${user?.firstName} ${user?.lastName}. 
    Email: ${user?.email}. 
    Description: ${user?.bio || 'Aucune description'}.
    Niveau d'accessibilite: ${user?.accessibilityLevel}.
    Lecons completes: ${stats?.totalLessonsCompleted || 0}.
    Quiz reussis: ${stats?.totalQuizzesCompleted || 0}.`;
    
    Speech.speak(message, { language: 'fr' });
  };

  const getAccessibilityLabel = (level: string) => {
    switch (level) {
      case 'no-visual-impairment': return 'Pas de deficience visuelle';
      case 'partial': return 'Malvoyance partielle';
      case 'total': return ' Cecite totale';
      default: return level;
    }
  };

  const StatCard = ({ icon, label, value, color }: { icon: string; label: string; value: string | number; color: string }) => (
    <View style={styles.statCard}>
      <MaterialCommunityIcons name={icon as any} size={28} color={color} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  const navigateToAdmin = () => {
    (router.push as any)('/admin');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" style={styles.loader} color="#6366F1" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        accessible={isAccessibleMode}
      >
        {/* Header with Photo */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={speakProfile}
            accessibilityLabel="Informations du profil"
            accessibilityHint="Appuyez pour entendre votre profil"
          >
            <View style={styles.avatarContainer}>
              {user?.profilePhoto ? (
                <Image 
                  source={{ uri: user.profilePhoto }} 
                  style={styles.avatarImage}
                />
              ) : (
                <MaterialCommunityIcons name="account-circle" size={100} color="#6366F1" />
              )}
              <TouchableOpacity 
                style={styles.editPhotoButton}
                onPress={() => {
                  setNewPhotoUrl(user?.profilePhoto || '');
                  setShowPhotoModal(true);
                }}
                accessibilityLabel="Modifier la photo de profil"
              >
                <MaterialCommunityIcons name="camera" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
            <Text style={styles.userName}>
              {user?.firstName} {user?.lastName}
            </Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </TouchableOpacity>
          
          {/* Bio Section */}
          <TouchableOpacity 
            style={styles.bioContainer}
            onPress={() => {
              setNewBio(user?.bio || '');
              setShowBioModal(true);
            }}
            accessibilityLabel="Modifier la description"
          >
            <Text style={styles.bioText}>
              {user?.bio || 'Ajoutez une description...'}
            </Text>
            <MaterialCommunityIcons name="pencil" size={16} color="#6366F1" />
          </TouchableOpacity>
        </View>

        {/* Accessibilite Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>♿ Accessibilite</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <MaterialCommunityIcons name="eye-outline" size={24} color="#6366F1" />
              <Text style={styles.settingLabel}>Mode Accessibilite</Text>
            </View>
            <Switch
              value={isAccessibleMode}
              onValueChange={handleAccessibilityToggle}
              trackColor={{ false: '#E5E7EB', true: '#A5B4FC' }}
              thumbColor={isAccessibleMode ? '#6366F1' : '#F9FAFB'}
              accessibilityLabel="Activer le mode accessibilite"
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <MaterialCommunityIcons name="volume-high" size={24} color="#6366F1" />
              <Text style={styles.settingLabel}>Mode Audio</Text>
            </View>
            <Switch
              value={audioMode}
              onValueChange={handleAudioModeToggle}
              trackColor={{ false: '#E5E7EB', true: '#A5B4FC' }}
              thumbColor={audioMode ? '#6366F1' : '#F9FAFB'}
              accessibilityLabel="Activer le mode audio"
            />
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              Niveau: {getAccessibilityLabel(user?.accessibilityLevel || 'no-visual-impairment')}
            </Text>
            <Text style={styles.infoText}>
              Statut: {user?.subscriptionStatus === 'premium' ? 'Premium ⭐' : 'Gratuit'}
            </Text>
          </View>
        </View>

        {/* Statistiques */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Ma Progression</Text>
          <View style={styles.statsGrid}>
            <StatCard 
              icon="book-open-page-variant" 
              label="Lecons" 
              value={stats?.totalLessonsCompleted || 0} 
              color="#4CAF50" 
            />
            <StatCard 
              icon="bullseye-arrow" 
              label="Quiz" 
              value={stats?.totalQuizzesCompleted || 0} 
              color="#FF9800" 
            />
            <StatCard 
              icon="star-circle" 
              label="Score" 
              value={`${stats?.averageScore || 0}%`} 
              color="#E91E63" 
            />
            <StatCard 
              icon="clock-outline" 
              label="Temps" 
              value={`${stats?.timeSpentHours || 0}h`} 
              color="#2196F3" 
            />
          </View>
        </View>

        {/* Menu */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️ Parametres</Text>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/achievements')}
            accessibilityLabel="Voir mes achievements"
          >
            <MaterialCommunityIcons name="trophy" size={24} color="#6366F1" />
            <Text style={styles.menuText}>Mes Achievements</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#9CA3AF" />
          </TouchableOpacity>

          {user?.role === 'admin' && (
            <TouchableOpacity 
              style={[styles.menuItem, { backgroundColor: '#EEF2FF' }]}
              onPress={navigateToAdmin}
              accessibilityLabel="Administration"
            >
              <MaterialCommunityIcons name="shield-crown" size={24} color="#6366F1" />
              <Text style={styles.menuText}>Administration</Text>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#9CA3AF" />
            </TouchableOpacity>
          )}

          <TouchableOpacity 
            style={styles.menuItem}
            accessibilityLabel="Parametres de l'application"
          >
            <MaterialCommunityIcons name="cog" size={24} color="#6366F1" />
            <Text style={styles.menuText}>Parametres</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            accessibilityLabel="Obtenir de l'aide"
          >
            <MaterialCommunityIcons name="help-circle" size={24} color="#6366F1" />
            <Text style={styles.menuText}>Aide & Support</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Deconnexion */}
        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={handleLogout}
          accessibilityLabel="Se deconnecter"
        >
          <MaterialCommunityIcons name="logout" size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Se deconnecter</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>BISApp v1.0.0</Text>
        </View>
      </ScrollView>

      {/* Photo Update Modal */}
      <Modal visible={showPhotoModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Modifier la photo</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="URL de la photo"
              value={newPhotoUrl}
              onChangeText={setNewPhotoUrl}
              autoCapitalize="none"
              keyboardType="url"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={() => setShowPhotoModal(false)}
              >
                <Text style={styles.cancelBtnText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalBtn, styles.saveBtn]}
                onPress={handleUpdatePhoto}
              >
                <Text style={styles.saveBtnText}>Enregistrer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Bio Update Modal */}
      <Modal visible={showBioModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Modifier la description</Text>
            <TextInput
              style={[styles.modalInput, styles.bioInput]}
              placeholder="Decrivez-vous..."
              value={newBio}
              onChangeText={setNewBio}
              multiline
              numberOfLines={4}
              maxLength={500}
            />
            <Text style={styles.charCount}>{newBio.length}/500</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={() => setShowBioModal(false)}
              >
                <Text style={styles.cancelBtnText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalBtn, styles.saveBtn]}
                onPress={handleUpdateBio}
              >
                <Text style={styles.saveBtnText}>Enregistrer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  loader: { flex: 1, justifyContent: 'center' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 30, paddingTop: 20 },
  avatarContainer: { marginBottom: 15, position: 'relative' },
  avatarImage: { width: 100, height: 100, borderRadius: 50 },
  editPhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#6366F1',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff'
  },
  userName: { fontSize: 24, fontWeight: 'bold', color: '#1F2937', marginBottom: 5 },
  userEmail: { fontSize: 14, color: '#6B7280' },
  bioContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 10,
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 20
  },
  bioText: { flex: 1, fontSize: 14, color: '#6B7280', marginRight: 8 },
  
  section: { marginBottom: 25 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#1F2937' },
  
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  settingInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingLabel: { fontSize: 16, color: '#374151' },
  
  infoBox: {
    backgroundColor: '#EEF2FF',
    padding: 15,
    borderRadius: 12,
    marginTop: 10,
  },
  infoText: { fontSize: 14, color: '#4F46E5', marginBottom: 5 },
  
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  statCard: {
    backgroundColor: '#FFFFFF',
    width: '48%',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  statValue: { fontSize: 22, fontWeight: 'bold', marginTop: 8, color: '#1F2937' },
  statLabel: { fontSize: 12, color: '#6B7280', marginTop: 4 },
  
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  menuText: { flex: 1, fontSize: 16, color: '#374151', marginLeft: 12 },
  
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#EF4444',
    borderRadius: 12,
    marginTop: 10,
  },
  logoutText: { color: '#EF4444', fontWeight: '600', marginLeft: 8, fontSize: 16 },
  
  footer: { alignItems: 'center', marginTop: 20 },
  footerText: { fontSize: 12, color: '#9CA3AF' },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    width: '100%',
    maxWidth: 400
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center'
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    marginBottom: 15
  },
  bioInput: {
    height: 120,
    textAlignVertical: 'top'
  },
  charCount: {
    textAlign: 'right',
    color: '#9CA3AF',
    fontSize: 12,
    marginBottom: 15,
    marginTop: -10
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10
  },
  modalBtn: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center'
  },
  cancelBtn: {
    backgroundColor: '#F3F4F6'
  },
  cancelBtnText: {
    color: '#6B7280',
    fontWeight: '600'
  },
  saveBtn: {
    backgroundColor: '#6366F1'
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: '600'
  }
});

export default ProfileScreen;

