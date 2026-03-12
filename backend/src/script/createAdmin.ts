/**
 * Script pour créer un utilisateur administrateur
 * 
 * Pour exécuter: npx ts-node src/script/createAdmin.ts
 * ou: npm run create-admin
 */

import mongoose from 'mongoose';
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import User from '../models/User';

const createAdmin = async () => {
  try {
    // Connexion à la DB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bisapp');
    console.log('🔌 Connexion à la DB réussie...');

    // Vérifier si l'admin existe déjà
    const existingAdmin = await User.findOne({ email: 'admin@bisapp.com' });
    
    if (existingAdmin) {
      console.log('⚠️  Un admin existe déjà avec cet email!');
      console.log('   Email:', existingAdmin.email);
      console.log('   Rôle:', existingAdmin.role);
      
      // Mettre à jour le rôle en admin
      existingAdmin.role = 'admin';
      await existingAdmin.save();
      console.log('Rôle admin mis à jour!');
    } else {
      // Créer le mot de passe hashé
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Admin123!', salt);

      // Créer l'utilisateur admin
      const adminUser = await User.create({
        firstName: 'Admin',
        lastName: 'BISApp',
        email: 'admin@bisapp.com',
        password: hashedPassword,
        accessibilityLevel: 'no-visual-impairment',
        audioMode: false,
        role: 'admin',
        isVerified: true,
        subscriptionStatus: 'premium'
      });

      console.log('Utilisateur admin créé avec succès!');
      console.log('   Email: admin@bisapp.com');
      console.log('   Mot de passe: Admin123!');
    }

    console.log('');
    console.log('═══════════════════════════════════════');
    console.log('🎉 ADMIN CRÉÉ AVEC SUCCÈS!');
    console.log('═══════════════════════════════════════');
    console.log('');
    console.log('Vous pouvez maintenant vous connecter avec:');
    console.log('  Email: admin@bisapp.com');
    console.log('  Mot de passe: Admin123!');
    console.log('');

    process.exit();
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
};

createAdmin();
