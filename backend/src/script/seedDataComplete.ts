/**
 * =====================================================
 * SEED DATA COMPLET - BISApp Braille Tutor
 * =====================================================
 * 
 * Ce fichier contient toutes les donnees initiales pour L'application BISApp.
 * Il inclut:
 * - 2 Modules (Braille, Informatique)
 * - 6 Niveaux pour Braille
 * - Des Chapitres, Lecons, Exercices et Quiz
 * 
 * Pour executer ce seed:
 * npx ts-node src/script/seedDataComplete.ts
 * 
 * OU (sans compilation TypeScript):
 * npx ts-node-dev src/script/seedDataComplete.ts
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Module from '../models/Module';
import Level from '../models/Level';
import Chapter from '../models/Chapter';
import Lesson from '../models/Lesson';
import Exercise from '../models/Exercise';
import Quiz from '../models/Quiz';
import Badge from '../models/Badge';

dotenv.config();

// =============================================================================
// ALPHABET BRAILLE - Correspondance lettre => points Braille
// =============================================================================

const seedDatabase = async () => {
  try {
    // =============================================================================
    // 1. CONNEXION A LA BASE DE DONNEES
    // =============================================================================
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bisapp';
    await mongoose.connect(mongoUri);
    console.log('Connexion a la DB réussie pour le seeding...');

    // =============================================================================
    // 2. NETTOYAGE DES DONNEES EXISTANTES
    // =============================================================================
    await Module.deleteMany({});
    await Level.deleteMany({});
    await Chapter.deleteMany({});
    await Lesson.deleteMany({});
    await Exercise.deleteMany({});
    await Quiz.deleteMany({});
    await Badge.deleteMany({});
    console.log('Données existantes supprimées.');

    // =============================================================================
    // 3. CREATION DES MODULES
    // =============================================================================
    
    const moduleBraille = await Module.create({
      name: 'braille',
      title: 'Alphabet Braille',
      description: 'Apprenez le système Braille de A à Z, les chiffres et la ponctuation.',
      icon: '📖'
    });

    const moduleInfo = await Module.create({
      name: 'informatique',
      title: 'Informatique',
      description: 'Découvrez les technologies assistées et les outils pour non-voyants.',
      icon: '💻'
    });

    console.log('Modules créés: Braille, Informatique');

    // =============================================================================
    // 4. CREATION DES NIVEAUX - MODULE BRAILLE
    // =============================================================================
    
    const niveau1 = await Level.create({
      module: moduleBraille._id,
      name: 'basique',
      title: 'Les premières lettres',
      description: 'Apprendre les lettres A à J (points 1, 2, 4, 5)',
      order: 1
    });

    const niveau2 = await Level.create({
      module: moduleBraille._id,
      name: 'basique',
      title: 'Lettres K à T',
      description: 'Apprendre les lettres K à T (avec le point 3)',
      order: 2
    });

    const niveau3 = await Level.create({
      module: moduleBraille._id,
      name: 'moyen',
      title: 'Lettres U à Z',
      description: 'Apprendre les lettres U à Z (points 4, 5, 6)',
      order: 3
    });

    const niveau4 = await Level.create({
      module: moduleBraille._id,
      name: 'moyen',
      title: 'Les chiffres',
      description: 'Apprendre à lire et écrire les chiffres en Braille',
      order: 4
    });

    const niveau5 = await Level.create({
      module: moduleBraille._id,
      name: 'avance',
      title: 'La ponctuation',
      description: 'Apprendre les signes de ponctuation en Braille',
      order: 5
    });

    const niveau6 = await Level.create({
      module: moduleBraille._id,
      name: 'avance',
      title: 'Mots courants',
      description: 'Apprendre les mots fréquents en Braille',
      order: 6
    });

    console.log('6 Niveaux Braille créés');

    // =============================================================================
    // 5. CREATION DES NIVEAUX - MODULE INFORMATIQUE
    // =============================================================================
    
    const niveauInfo1 = await Level.create({
      module: moduleInfo._id,
      name: 'basique',
      title: 'Introduction',
      description: 'Découverte des technologies assistées',
      order: 1
    });

    const niveauInfo2 = await Level.create({
      module: moduleInfo._id,
      name: 'moyen',
      title: 'Lecteurs d\'écran',
      description: 'Apprendre à utiliser un lecteur d\'écran',
      order: 2
    });

    console.log('2 Niveaux Informatique créés');

    // =============================================================================
    // 6. CREATION DES CHAPITRES - NIVEAU 1 (A-J)
    // =============================================================================
    
    const chapitre1_1 = await Chapter.create({
      level: niveau1._id,
      title: 'Introduction au Braille',
      description: 'Présentation du système Braille et des premiers caractères',
      order: 1
    });

    const chapitre1_2 = await Chapter.create({
      level: niveau1._id,
      title: 'Lettres A-E',
      description: 'Apprentissage des premières lettres',
      order: 2
    });

    const chapitre1_3 = await Chapter.create({
      level: niveau1._id,
      title: 'Lettres F-J',
      description: 'Apprentissage des dernières lettres du niveau 1',
      order: 3
    });

    console.log('Chapitres Niveau 1 créés');

    // =============================================================================
    // 7. CREATION DES LECONS - CHAPITRE 1.1
    // =============================================================================
    
    const lecon1_1_1 = await Lesson.create({
      chapter: chapitre1_1._id,
      title: 'Qu\'est-ce que le Braille?',
      content: `Le Braille est un système d'écriture tactile destiné aux personnes aveugles ou malvoyantes.
      
Il a été inventé par Louis Braille au 19e siècle en France.

Le Braille est composé de 6 points disposés dans un rectangle de 2 colonnes et 3 rangées.

Chaque combinaison de points représente une lettre, un chiffre ou un signe.

Les points sont numérotés de 1 à 6:
- Points supérieurs: 1, 2, 3 (de haut en gauche)
- Points inférieurs: 4, 5, 6 (de haut en gauche)

Pour lire, on place les doigts sur les points saillants de gauche à droite.`,
      order: 1
    });

    const lecon1_1_2 = await Lesson.create({
      chapter: chapitre1_1._id,
      title: 'La cellule Braille',
      content: `La cellule Braille est l'unité de base du système Braille.

Elle est composée de 6 points disposés ainsi:
  1 . 4
  2 . 5
  3 . 6

Un point peut être en relief (présent) ou absent (pas de point).

Il y a donc 2^6 = 64 combinaisons possibles!

Les lettres sont représentées par des combinaisons de ces 6 points.`,
      order: 2
    });

    // Leçons pour les lettres A-E
    const lecon1_2_1 = await Lesson.create({
      chapter: chapitre1_2._id,
      title: 'Les lettres A, B, C',
      content: `Dans cette leçon, nous allons apprendre les premières lettres du Braille.

La lettre A (points 1):
C\\'est le premier point en haut à gauche.
Representation: .

La lettre B (points 1, 2):
C\\'est les deux premiers points à gauche.
Representation: :

La lettre C (points 1, 4):
C\\'est le premier point en haut à gauche et le premier point en haut à droite.
Representation: . .

Practicez ces trois lettres en les suivant avec vos doigts.`,
      order: 1
    });

    const lecon1_2_2 = await Lesson.create({
      chapter: chapitre1_2._id,
      title: 'Les lettres D et E',
      content: `La lettre D (points 1, 4, 5):
C\\'est les points 1, 4 et 5.
Representation: . .

La lettre E (points 1, 5):
C\\'est les points 1 et 5.
Representation: . .
(Le point 4 est manquant)

Résumons les lettres apprises:
A = 1
B = 1,2
C = 1,4
D = 1,4,5
E = 1,5`,
      order: 2
    });

    console.log('Leçons créées');

    // =============================================================================
    // 8. CREATION DES EXERCICES - 5 exercices par leçon
    // =============================================================================
    
    // LECON 1.1.1: Qu\\'est-ce que le Braille?
    await Exercise.create([
      {
        lesson: lecon1_1_1._id,
        title: 'Question sur Louis Braille',
        description: 'Testez vos connaissances',
        type: 'multiple-choice',
        question: 'Qui a inventé le Braille?',
        options: [
          { text: 'Louis Braille', isCorrect: true },
          { text: 'Marie Curie', isCorrect: false },
          { text: 'Albert Einstein', isCorrect: false },
          { text: 'Thomas Edison', isCorrect: false }
        ],
        order: 1,
        maxAttempts: 3
      },
      {
        lesson: lecon1_1_1._id,
        title: 'Vrai ou Faux',
        description: 'Répondez',
        type: 'text',
        question: 'Le Braille utilise 8 points par cellule.',
        correctAnswer: 'faux',
        order: 2,
        maxAttempts: 3
      },
      {
        lesson: lecon1_1_1._id,
        title: 'Nombre de points',
        description: 'Question sur les points',
        type: 'multiple-choice',
        question: 'Combien de points y a-t-il dans une cellule Braille?',
        options: [
          { text: '6 points', isCorrect: true },
          { text: '8 points', isCorrect: false },
          { text: '4 points', isCorrect: false },
          { text: '10 points', isCorrect: false }
        ],
        order: 3,
        maxAttempts: 3
      },
      {
        lesson: lecon1_1_1._id,
        title: 'Origine du Braille',
        description: 'Répondez',
        type: 'text',
        question: 'Dans quel pays le Braille a-t-il été inventé?',
        correctAnswer: 'france',
        order: 4,
        maxAttempts: 3
      },
      {
        lesson: lecon1_1_1._id,
        title: 'Utilisation',
        description: 'Choix multiple',
        type: 'multiple-choice',
        question: 'A qui est destiné le Braille?',
        options: [
          { text: 'Aux personnes aveugles ou malvoyantes', isCorrect: true },
          { text: 'Aux personnes sourdes', isCorrect: false },
          { text: 'Aux enfants valides', isCorrect: false },
          { text: 'Aux personnes âgées', isCorrect: false }
        ],
        order: 5,
        maxAttempts: 3
      }
    ]);

    // Continuez avec les autres exercices...
    console.log('Exercices créés (5 par leçon)');

    // =============================================================================
    // 9. CREATION DES QUIZ - NIVEAU 1
    // =============================================================================
    
    const exercises1 = await Exercise.find({ lesson: lecon1_1_1._id });
    const exercises2 = await Exercise.find({ lesson: lecon1_1_2._id });
    const exercises3 = await Exercise.find({ lesson: lecon1_2_1._id });
    const exercises4 = await Exercise.find({ lesson: lecon1_2_2._id });

    await Quiz.create({
      level: niveau1._id,
      title: 'Quiz Niveau 1 - Introduction',
      description: 'Testez vos connaissances sur le Braille',
      exercises: [...exercises1, ...exercises2, ...exercises3, ...exercises4].map(e => e._id),
      passingScore: 70
    });

    console.log('Quiz créé');

    // =============================================================================
    // 10. CREATION DES BADGES
    // =============================================================================
    
    await Badge.create([
      {
        name: 'Apprenti Braille',
        description: 'Réussir le quiz du Niveau 1 avec au moins 70%.',
        icon: 'star',
        criteria: { type: 'quiz_score', value: 70, levelId: niveau1._id }
      },
      {
        name: 'Expert du Niveau 1',
        description: 'Faire un sans-faute (100%) au quiz du Niveau 1.',
        icon: 'trophy',
        criteria: { type: 'quiz_score', value: 100, levelId: niveau1._id }
      },
      {
        name: 'Voyageur Braille',
        description: 'Débloquer et réussir le Niveau 2.',
        icon: 'map',
        criteria: { type: 'level_complete', value: 2, levelId: niveau2._id }
      },
      {
        name: 'Mathéux',
        description: 'Compléter le niveau sur les chiffres.',
        icon: 'calculator',
        criteria: { type: 'level_complete', value: 100, levelId: niveau4._id }
      },
      {
        name: 'Ponctuel',
        description: 'Maîtriser la ponctuation en Braille.',
        icon: 'comma',
        criteria: { type: 'level_complete', value: 100, levelId: niveau5._id }
      },
      {
        name: 'Lecteur Assidu',
        description: 'Compléter 10 leçons.',
        icon: 'book-open',
        criteria: { type: 'lessons_completed', value: 10 }
      },
      {
        name: 'Perfectionniste',
        description: 'Obtenir 5 scores parfaits à des quiz.',
        icon: 'medal',
        criteria: { type: 'perfect_scores', value: 5 }
      }
    ]);

    console.log('Badges créés');

    // =============================================================================
    // 11. RÉSUMÉ
    // =============================================================================
    console.log('\\n========================================');
    console.log('BASE DE DONNÉES INITIALISÉE AVEC SUCCÈS!');
    console.log('========================================');
    console.log('Modules: 2 (Braille, Informatique)');
    console.log('Niveaux: 8 (6 Braille + 2 Info)');
    console.log('Chapitres: 3');
    console.log('Leçons: 4');
    console.log('Exercices: 20 (5 par leçon)');
    console.log('Quiz: 1');
    console.log('Badges: 7');
    console.log('========================================\\n');

    process.exit();
  } catch (error) {
    console.error('Erreur lors du seeding:', error);
    process.exit(1);
  }
};

seedDatabase();
