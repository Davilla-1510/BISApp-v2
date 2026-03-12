/**
 * Script simplifié pour créer un utilisateur administrateur
 * 
 * Pour exécuter: npx ts-node src/script/createAdminSimple.ts
 */

import mongoose from 'mongoose';
import User from '../models/User';

const MONGODB_URI = 'mongodb+srv://bisapp_user:4m8kSnrVyJaveyUX@cluster0.vyi43qh.mongodb.net/?appName=Cluster0';

async function createAdminSimple() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log(' Connecté à MongoDB');

    // Vérifier si l'admin existe déjà
    const existingAdmin = await User.findOne({ email: 'admin@bisapp.com' });
    
    if (existingAdmin) {
      console.log('⚠️  Admin existe déjà avec le rôle:', existingAdmin.role);
      
      // Forcer le rôle admin
      existingAdmin.role = 'admin';
      await existingAdmin.save();
      console.log(' Rôle admin mis à jour pour:', existingAdmin.email);
    } else {
      console.log('📝 Création du nouvel admin...');
      
      // Créer un nouvel utilisateur admin avec un mot de passe simple
      // Le pre-save hook de Mongoose va hacher le mot de passe automatiquement
      const adminUser = new User({
        firstName: 'Admin',
        lastName: 'BISApp',
        email: 'admin@bisapp.com',
        password: 'Admin123!',  // Le hook pre-save va hacher ça
        accessibilityLevel: 'no-visual-impairment',
        audioMode: false,
        role: 'admin',
        isVerified: true,
        subscriptionStatus: 'premium'
      });

      await adminUser.save();
      console.log(' Admin créé avec succès!');
    }

    console.log('');
    console.log('═══════════════════════════════════════');
    console.log('🎉 ADMIN CRÉÉ/MAJ AVEC SUCCÈS!');
    console.log('═══════════════════════════════════════');
    console.log('');
    console.log('Identifiants de connexion:');
    console.log('  Email: admin@bisapp.com');
    console.log('  Mot de passe: Admin123!');
    console.log('');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

createAdminSimple();
