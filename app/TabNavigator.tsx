import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Importe tes écrans
import HomeScreen from './home'; // Ton écran de cours
import AchievementsScreen from './AchievementsScreen';
import ProfileScreen from './profile';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: any;

          if (route.name === 'Apprendre') {
            iconName = 'book-open-variant';
          } else if (route.name === 'Succès') {
            iconName = 'trophy';
          } else if (route.name === 'Profil') {
            iconName = 'account';
          }

          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#5D4037', // Marron pour le thème Braille
        tabBarInactiveTintColor: 'gray',
        headerShown: true, // Affiche le titre en haut de l'écran
      })}
    >
      <Tab.Screen name="Apprendre" component={HomeScreen} />
      <Tab.Screen name="Succès" component={AchievementsScreen} />
      <Tab.Screen name="Profil" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default TabNavigator;