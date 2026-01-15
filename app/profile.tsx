import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, SafeAreaView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../services/api'; // Ton instance Axios

interface UserStats {
  totalLessonsCompleted: number;
  totalQuizzesCompleted: number;
  averageScore: number;
  timeSpentHours: number;
}

const ProfileScreen = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [user, setUser] = useState({ name: 'Étudiant Braille', email: '' });

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      // On récupère les stats depuis la route que nous avons créée précédemment
     const response = await api.getUserStats();
const stats = response.data;
      setStats(response.data.data);
      
      // Optionnel: Récupérer aussi les infos de l'utilisateur si tu as une route /auth/me
      // const userRes = await api.get('/auth/me');
      // setUser(userRes.data);
    } catch (error) {
      console.error("Erreur stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon, label, value, color }: any) => (
    <View style={styles.statCard}>
      <MaterialCommunityIcons name={icon} size={28} color={color} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  if (loading) return <ActivityIndicator size="large" style={styles.loader} color="#5D4037" />;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* En-tête du profil */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <MaterialCommunityIcons name="account-circle" size={100} color="#5D4037" />
          </View>
          <Text style={styles.userName}>{user.name}</Text>
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>Modifier le profil</Text>
          </TouchableOpacity>
        </View>

        {/* Section Statistiques */}
        <Text style={styles.sectionTitle}>Ma Progression</Text>
        <View style={styles.statsGrid}>
          <StatCard 
            icon="book-open-page-variant" 
            label="Leçons" 
            value={stats?.totalLessonsCompleted || 0} 
            color="#4CAF50" 
          />
          <StatCard 
            icon="bullseye-arrow" 
            label="Quiz réussis" 
            value={stats?.totalQuizzesCompleted || 0} 
            color="#FF9800" 
          />
          <StatCard 
            icon="star-circle" 
            label="Score Moyen" 
            value={`${stats?.averageScore || 0}%`} 
            color="#E91E63" 
          />
          <StatCard 
            icon="clock-outline" 
            label="Heures" 
            value={`${stats?.timeSpentHours || 0}h`} 
            color="#2196F3" 
          />
        </View>

        {/* Bouton de Déconnexion */}
        <TouchableOpacity style={styles.logoutButton} onPress={() => {/* Logique de déconnexion */}}>
          <MaterialCommunityIcons name="logout" size={20} color="#F44336" />
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  loader: { flex: 1, justifyContent: 'center' },
  scrollContent: { padding: 20 },
  header: { alignItems: 'center', marginBottom: 30 },
  avatarContainer: { marginBottom: 10 },
  userName: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  editButton: { marginTop: 10, paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, backgroundColor: '#E0E0E0' },
  editButtonText: { fontSize: 14, color: '#666' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#5D4037' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  statCard: {
    backgroundColor: '#fff',
    width: '48%',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  statValue: { fontSize: 20, fontWeight: 'bold', marginTop: 10, color: '#333' },
  statLabel: { fontSize: 12, color: '#888', marginTop: 5 },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: '#F44336',
    borderRadius: 10,
  },
  logoutText: { color: '#F44336', fontWeight: 'bold', marginLeft: 10 }
});

export default ProfileScreen;