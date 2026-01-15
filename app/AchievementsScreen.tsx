import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import BadgeGallery from './BadgeCard';
import api from '../services/api'; // Ton instance Axios configurée

const AchievementsScreen = () => {
  const [loading, setLoading] = useState(true);
  const [allBadges, setAllBadges] = useState([]);
  const [userBadges, setUserBadges] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
    const resAll = await api.getAllBadges();
    const resUser = await api.getMyBadges();
      setAllBadges(resAll.data.data || []); // On suppose que le format est { success: true, data: [...] }
      setUserBadges(resUser.data.badges || []);
      
    } catch (error) {
      console.error("Erreur chargement badges:", error);
      Alert.alert("Erreur", "Impossible de charger vos trophées.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#FFD700" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <BadgeGallery 
        allBadges={allBadges} 
        userBadges={userBadges} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});

export default AchievementsScreen;