import { BRAILLE_ALPHABET } from '@/constants/brailleAlphabet';
import { useAuth } from '@/context/AuthContext';
import * as Speech from 'expo-speech';
import React, { useEffect, useState } from 'react';
import { AccessibilityInfo, Button, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Les lettres que nous allons utiliser pour les leçons
const lessonLetters = Object.keys(BRAILLE_ALPHABET);

// Représente un seul point de la cellule Braille
const BrailleDot = ({ dotNumber, onPress, isSelected }: { dotNumber: number; onPress: (n: number) => void; isSelected: boolean }) => (
  <TouchableOpacity 
    onPress={() => onPress(dotNumber)} 
    style={[styles.dot, isSelected && styles.dotSelected]}
    accessible={true}
    accessibilityLabel={`Point ${dotNumber}`}
    accessibilityState={{ selected: isSelected }}
  >
    <Text style={[styles.dotText, isSelected && styles.dotTextSelected]}>{dotNumber}</Text>
  </TouchableOpacity>
);

export default function BrailleTutorScreen() {
  const [currentLetter, setCurrentLetter] = useState<string>('');
  const [selectedDots, setSelectedDots] = useState<number[]>([]);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState(false);
  const { signOut } = useAuth();

  // Sélectionne une nouvelle lettre au hasard
  const selectNewLetter = () => {
    const randomIndex = Math.floor(Math.random() * lessonLetters.length);
    const newLetter = lessonLetters[randomIndex];
    setCurrentLetter(newLetter);
    setSelectedDots([]); // Réinitialise les points
    setIsCorrectAnswer(false); // Réinitialise l'état de la réponse
  };

  // Au chargement du composant, on sélectionne la première lettre
  useEffect(() => {
    selectNewLetter();
  }, []);

  // Effet pour gérer le passage à la lettre suivante après une réponse correcte
  useEffect(() => {
    if (isCorrectAnswer) {
      const timer = setTimeout(() => {
        selectNewLetter();
      }, 1000); // Passe à la lettre suivante après 1 seconde

      // Fonction de nettoyage pour annuler le minuteur si le composant est démonté
      return () => clearTimeout(timer);
    }
  }, [isCorrectAnswer]);

  // Donne l'instruction audio quand la lettre change
  useEffect(() => {
    if (currentLetter) {
      const instruction = `Trouve la lettre ${currentLetter}.`;
      Speech.speak(instruction, { language: 'fr-FR' });
      AccessibilityInfo.announceForAccessibility(instruction);
    }
  }, [currentLetter]);

  // Gère la sélection d'un point
  const handleDotPress = (dotNumber: number) => {
    setSelectedDots(prevSelected => {
      const newSelected = prevSelected.includes(dotNumber)
        ? prevSelected.filter(d => d !== dotNumber)
        : [...prevSelected, dotNumber];
      
      const feedback = `Point ${dotNumber} ${newSelected.includes(dotNumber) ? 'sélectionné' : 'désélectionné'}.`;
      AccessibilityInfo.announceForAccessibility(feedback);
      
      return newSelected;
    });
  };
  
  // Vérifie la réponse de l'utilisateur
  const checkAnswer = () => {
    const correctDots = BRAILLE_ALPHABET[currentLetter];
    const sortedSelectedDots = [...selectedDots].sort((a, b) => a - b);

    if (JSON.stringify(correctDots) === JSON.stringify(sortedSelectedDots)) {
      Speech.speak('Correct !', { language: 'fr-FR' });
      AccessibilityInfo.announceForAccessibility('Correct !');
      setIsCorrectAnswer(true); // Déclenche l'effet pour passer à la suite
    } else {
      Speech.speak('Essaye encore.', { language: 'fr-FR' });
      AccessibilityInfo.announceForAccessibility('Essaye encore.');
      setSelectedDots([]); // Réinitialise pour une nouvelle tentative
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title} accessibilityRole="header">Apprenez le Braille</Text>
      <View style={styles.letterContainer} accessible={true} accessibilityLabel={`Lettre actuelle : ${currentLetter.toUpperCase()}`}>
        <Text style={styles.letter}>{currentLetter.toUpperCase()}</Text>
      </View>
      <View style={styles.brailleCell}>
        <View style={styles.column}>
          {[1, 2, 3].map(num => (
            <BrailleDot 
              key={num} 
              dotNumber={num} 
              onPress={handleDotPress}
              isSelected={selectedDots.includes(num)}
            />
          ))}
        </View>
        <View style={styles.column}>
          {[4, 5, 6].map(num => (
            <BrailleDot 
              key={num} 
              dotNumber={num} 
              onPress={handleDotPress}
              isSelected={selectedDots.includes(num)}
            />
          ))}
        </View>
      </View>
      <View style={styles.checkButton}>
        <Button 
          title="Vérifier" 
          onPress={checkAnswer} 
          disabled={!currentLetter || isCorrectAnswer} // Désactive le bouton après une bonne réponse
          accessibilityLabel="Vérifier la combinaison de points sélectionnée"
        />
      </View>
      <View style={styles.signOutButton}>
        <Button
          title="Déconnexion"
          onPress={signOut}
          color="#ff3b30"
          accessibilityLabel="Bouton pour se déconnecter"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 40,
  },
  letterContainer: {
    marginBottom: 40,
    paddingHorizontal: 30,
    paddingVertical: 20,
    backgroundColor: 'white',
    borderRadius: 15,
    elevation: 5,
  },
  letter: {
    fontSize: 60,
    fontWeight: 'bold',
    color: '#333',
  },
  brailleCell: {
    flexDirection: 'row',
  },
  column: {
    marginHorizontal: 15,
  },
  dot: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
    borderWidth: 2,
    borderColor: '#dcdcdc',
  },
  dotSelected: {
    backgroundColor: '#007AFF', // Couleur bleue pour la sélection
    borderColor: '#0056b3',
  },
  dotText: {
    fontSize: 20,
    color: '#a9a9a9',
  },
  dotTextSelected: {
    color: 'white',
  },
  checkButton: {
    marginTop: 40,
    width: '60%',
  },
  signOutButton: {
    marginTop: 20,
    width: '60%',
  }
});
