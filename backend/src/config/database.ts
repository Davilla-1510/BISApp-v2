import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bisapp';

    // Options recommandées pour éviter les avertissements de dépréciation
    const options = {
      autoIndex: true, // Aide à construire les index (utile pour les recherches de quiz)
    };

    const conn = await mongoose.connect(mongoUri, options);

    console.log(`✅ MongoDB Connecté : ${conn.connection.host}`);
  } catch (error: any) {
    console.error(`❌ Erreur de connexion : ${error.message}`);
    // On attend un peu avant de quitter pour laisser le temps aux logs de s'afficher
    process.exit(1);
  }
};

// Gestion des événements de connexion
mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB déconnecté. Tentative de reconnexion...');
});

export default connectDB;