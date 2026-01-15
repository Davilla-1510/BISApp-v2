import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Module from '../models/Module';
import Level from '../models/Level';
import Badge from '../models/Badge';

dotenv.config();

const seedDatabase = async () => {
  try {
    // 1. Connexion à la DB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bisapp');
    console.log('🌱 Connexion à la DB réussie pour le seeding...');

    // Nettoyage (Optionnel : attention, ceci efface les données existantes pour ces modèles)
    await Module.deleteMany({});
    await Level.deleteMany({});
    await Badge.deleteMany({});

    // 2. Création du Module
    const moduleBraille = await Module.create({
      name: 'BRAILLE_1',
      title: 'Alphabet Braille',
      description: 'Apprenez les bases du système Braille, de A à Z.',
      icon: 'book'
    });

    // 3. Création des Niveaux
    const level1 = await Level.create({
      module: moduleBraille._id,
      name: 'Niveau 1',
      title: 'Les premières lettres',
      description: 'Apprendre les lettres A à J (points supérieurs).',
      order: 1
    });

    const level2 = await Level.create({
      module: moduleBraille._id,
      name: 'Niveau 2',
      title: 'Lettres K à T',
      description: 'Apprendre les lettres avec le point 3.',
      order: 2
    });

    // 4. Création des Badges
    await Badge.create([
      {
        name: 'Apprenti Braille',
        description: 'Réussir le quiz du Niveau 1 avec au moins 70%.',
        icon: 'star',
        criteria: { type: 'quiz_score', value: 70, levelId: level1._id }
      },
      {
        name: 'Expert du Niveau 1',
        description: 'Faire un sans-faute (100%) au quiz du Niveau 1.',
        icon: 'trophy',
        criteria: { type: 'quiz_score', value: 100, levelId: level1._id }
      },
      {
        name: 'Voyageur Braille',
        description: 'Débloquer et réussir le Niveau 2.',
        icon: 'map',
        criteria: { type: 'quiz_score', value: 70, levelId: level2._id }
      }
    ]);

    console.log('✅ Base de données initialisée avec succès !');
    process.exit();
  } catch (error) {
    console.error('❌ Erreur lors du seeding:', error);
    process.exit(1);
  }
};

seedDatabase();