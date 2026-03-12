/**
 * Script de seed (初始数据) pour la base de données BISApp
 * 
 * Ce fichier remplit la base de données avec:
 * - 2 Modules: Braille et Informatique
 * - 3 Niveaux par module: Basique, Moyen, Avancé
 * - Chapitres, Leçons, Exercices et Quiz pour chaque niveau
 * 
 * Pour exécuter: npx ts-node src/script/seedData.ts
 */

import mongoose from 'mongoose';
import 'dotenv/config';
import Module from '../models/Module';
import Level from '../models/Level';
import Chapter from '../models/Chapter';
import Lesson from '../models/Lesson';
import Exercise from '../models/Exercise';
import Quiz from '../models/Quiz';
import Badge from '../models/Badge';

/**
 * Configuration du seed
 * Définissez SEED_MODE à 'reset' pour effacer toutes les données existantes
 * ou à 'append' pour ajouter sans effacer
 */
const SEED_MODE = 'reset'; // 'reset' | 'append'

const seedDatabase = async () => {
  try {
    // 1. Connexion à la DB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bisapp');
    console.log('🌱 Connexion à la DB réussie pour le seeding...');

    // 2. Nettoyage si mode reset
    if (SEED_MODE === 'reset') {
      console.log('🗑️  Suppression des données existantes...');
      await Module.deleteMany({});
      await Level.deleteMany({});
      await Chapter.deleteMany({});
      await Lesson.deleteMany({});
      await Exercise.deleteMany({});
      await Quiz.deleteMany({});
      await Badge.deleteMany({});
    }

    // ============================================
    // 3. CRÉATION DES MODULES
    // ============================================
    console.log('📚 Création des modules...');

    // Module 1: Braille
    const moduleBraille = await Module.create({
      name: 'braille',
      title: 'Alphabet Braille',
      description: 'Apprenez le système Braille de A à Z, des lettres de base aux signes de ponctuation.',
      icon: 'book-blind'
    });

    // Module 2: Informatique
    const moduleInformatique = await Module.create({
      name: 'informatique',
      title: 'Informatique',
      description: 'Initiez-vous à l\'informatique et aux technologies assistées pour personnes malvoyantes.',
      icon: 'laptop'
    });

    console.log('✅ Modules créés:', moduleBraille.title, '&', moduleInformatique.title);

    // ============================================
    // 4. CRÉATION DES NIVEAUX - MODULE BRAILLE
    // ============================================
    console.log('📶 Création des niveaux Braille...');

    // Niveau 1: Basique - Lettres A à J
    const brailleBasique = await Level.create({
      module: moduleBraille._id,
      name: 'basique',
      title: 'Les bases du Braille',
      description: 'Apprenez les 10 premières lettres de l\'alphabet Braille (A à J) utilisant les points 1, 2, 4.',
      order: 1
    });

    // Niveau 2: Moyen - Lettres K à T
    const brailleMoyen = await Level.create({
      module: moduleBraille._id,
      name: 'moyen',
      title: 'Lettres K à T',
      description: 'Découvez les lettres K à T qui ajoutent le point 3 aux combinaisons de base.',
      order: 2
    });

    // Niveau 3: Avancé - Lettres U à Z et ponctuation
    const brailleAvance = await Level.create({
      module: moduleBraille._id,
      name: 'avance',
      title: 'Perfectionnement',
      description: 'Maîtrisez les lettres U à Z, les chiffres et les signes de ponctuation courants.',
      order: 3
    });

    // ============================================
    // 5. CRÉATION DES NIVEAUX - MODULE INFORMATIQUE
    // ============================================
    console.log('💻 Création des niveaux Informatique...');

    const infoBasique = await Level.create({
      module: moduleInformatique._id,
      name: 'basique',
      title: 'Introduction à l\'informatique',
      description: 'Découvrez les fondamentaux de l\'informatique et les bases du numérique.',
      order: 1
    });

    const infoMoyen = await Level.create({
      module: moduleInformatique._id,
      name: 'moyen',
      title: 'Technologies assistées',
      description: 'Apprenez à utiliser les outils technologiques adaptés aux personnes malvoyantes.',
      order: 2
    });

    const infoAvance = await Level.create({
      module: moduleInformatique._id,
      name: 'avance',
      title: 'Autonomie numérique',
      description: 'Développez votre autonomie pour naviguer sur internet et utiliser les applications.',
      order: 3
    });

    // ============================================
    // 6. CRÉATION DES CHAPITRES ET LEÇONS - NIVEAU BRAILLE BASIQUE
    // ============================================
    console.log('📖 Création des chapitres et leçons - Braille Basique...');

    // Chapitre 1: Introduction au Braille
    const chap1_1 = await Chapter.create({
      level: brailleBasique._id,
      title: 'Introduction au Braille',
      description: 'Comprendre le système Braille et la disposition des points',
      order: 1
    });

    const lesson1_1_1 = await Lesson.create({
      chapter: chap1_1._id,
      title: 'Qu\'est-ce que le Braille?',
      content: `Le Braille est un système d\'écriture tactile utilisé par les personnes aveugles ou malvoyantes.
      
Il a été inventé par Louis Braille au XIXe siècle.

Le système utilise des combinaisons de 6 points en relief, disposés dans une grille de 2 colonnes par 3 rangées.

Chaque combinaison représente une lettre, un chiffre ou un signe de ponctuation.

Les points sont numérotés de 1 à 6:
- Points supérieurs: 1 (haut gauche), 2 (milieu gauche), 3 (bas gauche)
- Points inférieurs: 4 (haut droite), 5 (milieu droite), 6 (bas droite)`,
      order: 1
    });

    const lesson1_1_2 = await Lesson.create({
      chapter: chap1_1._id,
      title: 'La numérotation des points',
      content: `Chaque point dans une cellule Braille a un numéro spécifique:

Position des points:
• Point 1: Haut gauche
• Point 2: Milieu gauche  
• Point 3: Bas gauche
• Point 4: Haut droite
• Point 5: Milieu droite
• Point 6: Bas droite

Pour former une lettre, on combine ces points.
Par exemple, le 'A' utilise uniquement le point 1.
Le 'B' utilise les points 1 et 2.

Il est important de mémoriser cette disposition pour lire et écrire en Braille.`,
      order: 2
    });

    // Chapitre 2: Lettres A à J
    const chap1_2 = await Chapter.create({
      level: brailleBasique._id,
      title: 'Les lettres A à J',
      description: 'Apprenez les 10 premières lettres du Braille',
      order: 2
    });

    const lesson1_2_1 = await Lesson.create({
      chapter: chap1_2._id,
      title: 'Lettres A, B, C, D',
      content: `Voici les 4 premières lettres de l\'alphabet Braille:

📖 Lettre A (a): Point 1
Braille: ⠁ (un seul point en haut à gauche)

📖 Lettre B (b): Points 1 et 2
Braille: ⠃ (deux points verticaux à gauche)

📖 Lettre C (c): Points 1 et 4
Braille:⠉ (points aux deux coins supérieurs)

📖 Lettre D (d): Points 1, 4 et 5
Braille:⠙ (trois points à droite)

Conseil: Pratiquez ces lettres plusieurs fois avant de passer aux suivantes.`,
      order: 1
    });

    const lesson1_2_2 = await Lesson.create({
      chapter: chap1_2._id,
      title: 'Lettres E, F, G, H',
      content: `Suite de l\'alphabet Braille:

📖 Lettre E (e): Points 1 et 5
Braille: ⠑ (point en haut à gauche et au milieu à droite)

📖 Lettre F (f): Points 1, 2 et 4
Braille: ⠋ (trois points: deux à gauche, un à droite)

📖 Lettre G (g): Points 1, 2, 4 et 5
Braille: ⠛ (quatre points en rectangle)

📖 Lettre H (h): Points 1, 2, 5
Braille: ⠓ (trois points: deux à gauche verticaux, un à droite au milieu)`,
      order: 2
    });

    const lesson1_2_3 = await Lesson.create({
      chapter: chap1_2._id,
      title: 'Lettres I et J',
      content: `Dernières lettres de ce chapitre:

📖 Lettre I (i): Points 2 et 4
Braille: ⠔ (deux points diagonalement opposés)

📖 Lettre J (j): Points 2, 4 et 5
Braille: <⠴> (trois points formant un coin)

💡 Rappel: Les lettres A à J sont les "lettres de base" du Braille.
Elles utilisent uniquement les points des colonnes de gauche et les points supérieurs de droite.

Vous avez maintenant appris tout l\'alphabet de base!`,
      order: 3
    });

    // Chapitre 3: Premiers exercices
    const chap1_3 = await Chapter.create({
      level: brailleBasique._id,
      title: 'Premiers exercices',
      description: 'Pratiquez les lettres apprises',
      order: 3
    });

    // ============================================
    // 7. CRÉATION DES EXERCICES - NIVEAU BRAILLE BASIQUE
    // ============================================
    console.log('✏️ Création des exercices...');

    // Exercices Chapitre 1
    const ex1 = await Exercise.create({
      lesson: lesson1_1_1._id,
      title: 'Quiz: Introduction au Braille',
      description: 'Testez vos connaissances sur le système Braille',
      type: 'multiple-choice',
      question: 'Combien de points y a-t-il dans une cellule Braille?',
      options: [
        { text: '4 points', isCorrect: false },
        { text: '6 points', isCorrect: true },
        { text: '8 points', isCorrect: false },
        { text: '10 points', isCorrect: false }
      ],
      order: 1,
      maxAttempts: 3
    });

    const ex2 = await Exercise.create({
      lesson: lesson1_1_2._id,
      title: 'Position des points',
      description: 'Identifiez la position des points',
      type: 'multiple-choice',
      question: 'Le point 4 est situé:',
      options: [
        { text: 'En haut à gauche', isCorrect: false },
        { text: 'En haut à droite', isCorrect: true },
        { text: 'Au milieu à gauche', isCorrect: false },
        { text: 'En bas à droite', isCorrect: false }
      ],
      order: 2,
      maxAttempts: 3
    });

    const ex3 = await Exercise.create({
      lesson: lesson1_2_1._id,
      title: 'Reconnaître les lettres A-D',
      description: 'Identifiez les lettres Braille',
      type: 'braille-conversion',
      question: 'Quelle lettre est représentée par le point 1 uniquement?',
      correctAnswer: 'A',
      brailleText: '⠁',
      order: 1,
      maxAttempts: 3
    });

    const ex4 = await Exercise.create({
      lesson: lesson1_2_1._id,
      title: 'Lettres A-D: QCM',
      description: 'Choix multiple sur les lettres A-D',
      type: 'multiple-choice',
      question: 'Quelle lettre Braille correspond aux points 1 et 2?',
      options: [
        { text: 'A', isCorrect: false },
        { text: 'B', isCorrect: true },
        { text: 'C', isCorrect: false },
        { text: 'D', isCorrect: false }
      ],
      order: 2,
      maxAttempts: 3
    });

    const ex5 = await Exercise.create({
      lesson: lesson1_2_2._id,
      title: 'Lettres E-H: QCM',
      description: 'Test sur les lettres E-H',
      type: 'multiple-choice',
      question: 'Quelle lettre est formée par les points 1, 2, 4 et 5?',
      options: [
        { text: 'E', isCorrect: false },
        { text: 'F', isCorrect: false },
        { text: 'G', isCorrect: true },
        { text: 'H', isCorrect: false }
      ],
      order: 1,
      maxAttempts: 3
    });

    // ============================================
    // 8. CRÉATION DU QUIZ - NIVEAU BRAILLE BASIQUE
    // ============================================
    console.log('📝 Création des quiz...');

    const quizBasique = await Quiz.create({
      level: brailleBasique._id,
      title: 'Quiz: Niveau Basique',
      description: 'Testez vos connaissances des lettres A à J',
      exercises: [ex1._id, ex2._id, ex3._id, ex4._id, ex5._id],
      passingScore: 70
    });

    // ============================================
    // 9. CRÉATION DES CHAPITRES - NIVEAU BRAILLE MOYEN
    // ============================================
    console.log('📖 Création des chapitres - Braille Moyen...');

    const chap2_1 = await Chapter.create({
      level: brailleMoyen._id,
      title: 'Introduction aux lettres K-T',
      description: 'Découverte des nouvelles combinaisons avec le point 3',
      order: 1
    });

    const lesson2_1_1 = await Lesson.create({
      chapter: chap2_1._id,
      title: 'Le point 3',
      content: `Le point 3 est la clé des lettres K à T.

Il s\'ajoute aux lettres de base A-J pour créer les nouvelles lettres K-T.

Rappel des lettres de base:
- A = ⠁ (point 1)
- B = ⠃ (points 1-2)
- C = ⠉ (points 1-4)
etc.

Pour former les nouvelles lettres:
- K = A + point 3 = ⠅
- L = B + point 3 = ⠇
- M = C + point 3 = ⠍
etc.

Le point 3 est situé en bas à gauche de la cellule Braille.`,
      order: 1
    });

    const lesson2_1_2 = await Lesson.create({
      chapter: chap2_1._id,
      title: 'Lettres K à O',
      content: `Voici les 5 premières lettres du niveau moyen:

📖 Lettre K (k): Points 1 et 3
Braille: ⠅

📖 Lettre L (l): Points 1, 2 et 3
Braille: ⠇

📖 Lettre M (m): Points 1, 3 et 4
Braille: ⠍

📖 Lettre N (n): Points 1, 3, 4 et 5
Braille: ⠝

📖 Lettre O (o): Points 1, 3 et 5
Braille: ⠕

💡 Pattern: Chaque lettre ajoute le point 3 à sa lettre de base.`,
      order: 2
    });

    const lesson2_1_3 = await Lesson.create({
      chapter: chap2_1._id,
      title: 'Lettres P à T',
      content: `Suite et fin de l\'alphabet:

📖 Lettre P (p): Points 1, 2, 3 et 4
Braille: ⠏

📖 Lettre Q (q): Points 1, 2, 3, 4 et 5
Braille: ⠟

📖 Lettre R (r): Points 1, 2, 3 et 5
Braille: ⠗

📖 Lettre S (s): Points 2, 3 et 4
Braille: ⠎

📖 Lettre T (t): Points 2, 3, 4 et 5
Braille: ⠞

🎉 Bravo! Vous connaissez maintenant tout l\'alphabet!`,
      order: 3
    });

    // Exercices Niveau Moyen
    const exM1 = await Exercise.create({
      lesson: lesson2_1_1._id,
      title: 'Quiz: Le point 3',
      description: 'Comprendre le point 3',
      type: 'multiple-choice',
      question: 'Où se situe le point 3 dans la cellule Braille?',
      options: [
        { text: 'En haut à gauche', isCorrect: false },
        { text: 'Au milieu à gauche', isCorrect: false },
        { text: 'En bas à gauche', isCorrect: true },
        { text: 'En bas à droite', isCorrect: false }
      ],
      order: 1,
      maxAttempts: 3
    });

    const exM2 = await Exercise.create({
      lesson: lesson2_1_2._id,
      title: 'Lettres K-O',
      description: 'Test sur les lettres K-O',
      type: 'multiple-choice',
      question: 'Quelle lettre correspond aux points 1, 2 et 3?',
      options: [
        { text: 'K', isCorrect: false },
        { text: 'L', isCorrect: true },
        { text: 'M', isCorrect: false },
        { text: 'N', isCorrect: false }
      ],
      order: 1,
      maxAttempts: 3
    });

    const quizMoyen = await Quiz.create({
      level: brailleMoyen._id,
      title: 'Quiz: Niveau Moyen',
      description: 'Testez vos connaissances des lettres K à T',
      exercises: [exM1._id, exM2._id],
      passingScore: 70
    });

    // ============================================
    // 10. CRÉATION DES CHAPITRES - NIVEAU BRAILLE AVANCÉ
    // ============================================
    console.log('📖 Création des chapitres - Braille Avancé...');

    const chap3_1 = await Chapter.create({
      level: brailleAvance._id,
      title: 'Signes de ponctuation',
      description: 'Apprenez les signes de ponctuation en Braille',
      order: 1
    });

    const lesson3_1_1 = await Lesson.create({
      chapter: chap3_1._id,
      title: 'Ponctuation de base',
      content: `Le Braille utilise des signes de ponctuation spécifiques:

📖 Point (.) : Points 2, 3, 5 et 6 (⠴)
📖 Virgule (,) : Points 2 et 3 (⠄)
📖 Point d\'interrogation (?) : Points 2, 3 et 5 (⠦)
📖 Point d\'exclamation (!) : Points 2, 3, 4 et 6 (⠖)
📖 Deux-points (:) : Points 2, 5 et 6 (⠒)
📖 Point-virgule (;) : Points 2, 4 et 5 (⠆)

💡 Ces signes sont essentiels pour lire et écrire correctement en Braille.`,
      order: 1
    });

    const lesson3_1_2 = await Lesson.create({
      chapter: chap3_1._id,
      title: 'Symboles spéciaux',
      content: `Autres symboles importants:

📖 Guillemets ("): Points 2, 3, 4, 5 et 6 (⠶)
📖 Apostrophe (\'): Points 3 (⠂)
📖 Tiret (-): Points 3, 4 et 6 (⠤)
📖 Parenthèses (): Points 2, 3, 4, 5 et 6 (⠶)
📖 Barre oblique (/): Points 3, 4, 5 et 6 (⠸)

📖 Signe @: Points 2, 4, 5 et 6 (⠫)
📖 Signe &: Points 1, 2, 3, 4 et 6 (⠯)

Ces symboles sont très utiles pour lire des textes modernes.`,
      order: 2
    });

    const chap3_2 = await Chapter.create({
      level: brailleAvance._id,
      title: 'Chiffres',
      description: 'Apprenez à écrire les chiffres en Braille',
      order: 2
    });

    const lesson3_2_1 = await Lesson.create({
      chapter: chap3_2._id,
      title: 'Les chiffres 0-9',
      content: `Pour écrire les chiffres en Braille, on utilise un indicateur de chiffre suivi des lettres A-J:

Indicateur de chiffre: Points 3, 4, 5 et 6 (⠼)

📖 0 = ⠼⠁ (indicateur + A)
📖 1 = ⠼⠃ (indicateur + B)
📖 2 = ⠼⠉ (indicateur + C)
📖 3 = ⠼⠙ (indicateur + D)
📖 4 = ⠼⠓ (indicateur + E)
📖 5 = ⠼⠑ (indicateur + F)
📖 6 = ⠼⠛ (indicateur + G)
📖 7 = ⠼⠓ (indicateur + H)
📖 8 = ⠼⠔ (indicateur + I)
📖 9 = ⠼⠴ (indicateur + J)

💡 Sans l\'indicateur, ce seraient des lettres!`,
      order: 1
    });

    // Exercices Niveau Avancé
    const exA1 = await Exercise.create({
      lesson: lesson3_1_1._id,
      title: 'Ponctuation: QCM',
      description: 'Test sur les signes de ponctuation',
      type: 'multiple-choice',
      question: 'Comment écrit-on le point (.) en Braille?',
      options: [
        { text: 'Points 2 et 3', isCorrect: false },
        { text: 'Points 2, 3, 5 et 6', isCorrect: true },
        { text: 'Points 4 et 6', isCorrect: false },
        { text: 'Points 1, 4 et 5', isCorrect: false }
      ],
      order: 1,
      maxAttempts: 3
    });

    const exA2 = await Exercise.create({
      lesson: lesson3_2_1._id,
      title: 'Chiffres',
      description: 'Test sur les chiffres',
      type: 'multiple-choice',
      question: 'Quel est l\'indicateur de chiffre en Braille?',
      options: [
        { text: 'Points 1, 2 et 3', isCorrect: false },
        { text: 'Points 3, 4, 5 et 6', isCorrect: true },
        { text: 'Points 1, 4 et 5', isCorrect: false },
        { text: 'Points 2, 4 et 6', isCorrect: false }
      ],
      order: 1,
      maxAttempts: 3
    });

    const quizAvance = await Quiz.create({
      level: brailleAvance._id,
      title: 'Quiz: Niveau Avancé',
      description: 'Testez vos connaissances avancées',
      exercises: [exA1._id, exA2._id],
      passingScore: 70
    });

    // ============================================
    // 11. CRÉATION DES CHAPITRES - MODULE INFORMATIQUE
    // ============================================
    console.log('📖 Création des chapitres - Informatique...');

    // Chapitre Info Basique
    const chapInfo1 = await Chapter.create({
      level: infoBasique._id,
      title: 'Qu\'est-ce qu\'un ordinateur?',
      description: 'Découverte des composants de base',
      order: 1
    });

    const lessonInfo1_1 = await Lesson.create({
      chapter: chapInfo1._id,
      title: 'Les composants principaux',
      content: `Un ordinateur est composé de plusieurs éléments essentiels:

🖥️ L\'unité centrale: Le "cerveau" de l\'ordinateur qui traite les informations.

🖥️ L\'écran: Affiche les informations visuelles. Pour les personnes malvoyantes, il existe des écrans agrandis ou des synthesized vocale.

⌨️ Le clavier: Permet de saisir du texte et des commandes. Des claviers en relief ou avec gros caractères existent.

🖱️ La souris: Permet de cliquer et naviguer. Il existe des souris spéciales avec retour vocal.

💾 Le stockage: Disque dur ou SSD pourn vos fichiers.

Comprendre ces composants vous aidera à mieux utiliser votre ordinateur.`,
      order: 1
    });

    const lessonInfo1_2 = await Lesson.create({
      chapter: chapInfo1._id,
      title: 'Allumer et éteindre',
      content: `Guide pour démarrer et arrêter votre ordinateur:

🔵 Pour allumer:
1. Appuyez sur le bouton d\'alimentation (généralement sur le boîtier)
2. Attendez que le système démarre (quelques secondes à quelques minutes)
3. Vous entendrez un son de démarrage

🛑 Pour arrêter correctement:
1. Fermez tous vos programmes
2. Cliquez sur "Démarrer" puis "Arrêter"
3. Attendez que l\'écran s\'éteigne
4. Si vous avez un ordinateur de bureau, vous pouvez aussi fermer le moniteur

⚠️ Important: Éteignez toujours votre ordinateur correctement pour éviter de perdre des données.`,
      order: 2
    });

    // Exercices Info Basique
    const exInfo1 = await Exercise.create({
      lesson: lessonInfo1_1._id,
      title: 'Composants: QCM',
      description: 'Test sur les composants',
      type: 'multiple-choice',
      question: 'Quel composant est considéré comme le "cerveau" de l\'ordinateur?',
      options: [
        { text: 'Le clavier', isCorrect: false },
        { text: 'L\'écran', isCorrect: false },
        { text: 'L\'unité centrale', isCorrect: true },
        { text: 'La souris', isCorrect: false }
      ],
      order: 1,
      maxAttempts: 3
    });

    const quizInfoBasique = await Quiz.create({
      level: infoBasique._id,
      title: 'Quiz: Initiation',
      description: 'Testez vos connaissances de base',
      exercises: [exInfo1._id],
      passingScore: 70
    });

    // ============================================
    // 12. CRÉATION DES BADGES
    // ============================================
    console.log('🏆 Création des badges...');

    await Badge.create([
      {
        name: 'Premier Pas',
        description: 'Complétez votre première leçon de Braille',
        icon: 'star',
        criteria: { type: 'lessons_completed', value: 1 }
      },
      {
        name: 'Apprenti Braille',
        description: 'Réussissez le quiz du Niveau Basique avec au moins 70%',
        icon: 'school',
        criteria: { type: 'quiz_score', value: 70, levelId: brailleBasique._id }
      },
      {
        name: 'Expert du Niveau 1',
        description: 'Faites un sans-faute (100%) au quiz du Niveau Basique',
        icon: 'trophy',
        criteria: { type: 'quiz_score', value: 100, levelId: brailleBasique._id }
      },
      {
        name: 'Voyageur Braille',
        description: 'Débloquez et réussissez le Niveau Moyen',
        icon: 'map',
        criteria: { type: 'quiz_score', value: 70, levelId: brailleMoyen._id }
      },
      {
        name: 'Maître du Braille',
        description: 'Réussissez le Niveau Avancé',
        icon: 'crown',
        criteria: { type: 'quiz_score', value: 70, levelId: brailleAvance._id }
      },
      {
        name: 'Champion de la Ponctuation',
        description: 'Maîtrisez tous les signes de ponctuation',
        icon: 'format-quote-close',
        criteria: { type: 'lessons_completed', value: 3, levelId: brailleAvance._id }
      },
      {
        name: 'Explorateur Informatique',
        description: 'Complétez le premier niveau informatique',
        icon: 'laptop',
        criteria: { type: 'quiz_score', value: 70, levelId: infoBasique._id }
      },
      {
        name: 'Doué',
        description: 'Obtenez 5 badges',
        icon: 'medal',
        criteria: { type: 'badges_earned', value: 5 }
      }
    ]);

    // ============================================
    // 13. RÉSUMÉ
    // ============================================
    console.log('');
    console.log('═══════════════════════════════════════');
    console.log('🎉 BASE DE DONNÉES CRÉÉE AVEC SUCCÈS!');
    console.log('═══════════════════════════════════════');
    console.log('');
    console.log('📚 MODULES:');
    console.log('  • Braille - Alphabet Braille');
    console.log('  • Informatique - Initiation');
    console.log('');
    console.log('📶 NIVEAUX:');
    console.log('  • Braille: Basique, Moyen, Avancé');
    console.log('  • Informatique: Basique, Moyen, Avancé');
    console.log('');
    console.log('📖 CHAPITRES & LEÇONS créés!');
    console.log('✏️ EXERCICES ajoutés!');
    console.log('📝 QUIZ créés!');
    console.log('🏆 BADGES créés!');
    console.log('');
    console.log('Pour exécuter: npm run seed');
    console.log('');

    process.exit();
  } catch (error) {
    console.error('❌ Erreur lors du seeding:', error);
    process.exit(1);
  }
};

// Exécution du seed
seedDatabase();
