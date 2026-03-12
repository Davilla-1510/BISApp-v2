import React from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// 1. Définition des interfaces pour la sécurité TypeScript
interface Badge {
  _id: string;
  name: string;
  description: string;
  icon: any; // Type 'any' pour s'adapter aux noms d'icônes MaterialCommunityIcons
}

interface UserBadge {
  _id: string;
  badge: Badge | string; // Gère le cas où l'ID n'est pas "peuplé" par MongoDB
  earnedAt: string;
}

interface Props {
  userBadges: UserBadge[];
  allBadges: Badge[];
}

const BadgeGallery: React.FC<Props> = ({ userBadges, allBadges }) => {
  
  // Fonction de rendu pour chaque badge de la liste
  const renderBadge = ({ item }: { item: Badge }) => {
    
    // Logique de vérification : l'utilisateur a-t-il ce badge ?
    const isEarned = userBadges.some(ub => {
      // On extrait l'ID que ce soit un objet (populated) ou une simple string
      const userBadgeId = typeof ub.badge === 'object' ? ub.badge._id : ub.badge;
      return userBadgeId === item._id;
    });

    return (
      <View style={[styles.badgeCard, !isEarned && styles.lockedBadge]}>
        {/* Conteneur de l'icône avec couleur dynamique */}
        <View style={[
          styles.iconContainer, 
          { backgroundColor: isEarned ? '#FFD700' : '#E0E0E0' }
        ]}>
          <MaterialCommunityIcons 
            name={item.icon || 'medal'} 
            size={40} 
            color={isEarned ? '#5D4037' : '#9E9E9E'} 
          />
        </View>

        <Text style={styles.badgeName}>{item.name}</Text>
        <Text style={styles.badgeDesc}>{item.description}</Text>
        
        {/* Affichage d'un petit cadenas si non obtenu */}
        {!isEarned && (
          <View style={styles.lockOverlay}>
            <MaterialCommunityIcons name="lock" size={16} color="#9E9E9E" />
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mes Succès 🏅</Text>
      <FlatList
        data={allBadges}
        renderItem={renderBadge}
        keyExtractor={item => item._id}
        numColumns={2}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.emptyText}>Aucun badge disponible pour le moment.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#F5F5F5' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#333' },
  list: { paddingBottom: 20 },
  badgeCard: {
    backgroundColor: 'white',
    width: width / 2 - 24, // Calcule la largeur pour 2 colonnes avec marges
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 16,
    marginHorizontal: 4,
    // Only use elevation for Android - shadow properties for iOS
    ...Platform.select({
      android: {
        elevation: 3,
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
    }),
  },
  lockedBadge: { 
    opacity: 0.7,
  },
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  badgeName: { fontSize: 14, fontWeight: 'bold', textAlign: 'center', color: '#333' },
  badgeDesc: { fontSize: 10, color: '#757575', textAlign: 'center', marginTop: 4, height: 30 },
  lockOverlay: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center'
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    color: '#999'
  }
});

export default BadgeGallery;