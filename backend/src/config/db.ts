import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/bisapp';
        
        // Options de configuration modernes
        const conn = await mongoose.connect(mongoUri, {
            autoIndex: true, // Génère les index pour les recherches rapides (ex: chercher un quiz par son ID)
            connectTimeoutMS: 10000, // Abandonne après 10s si la DB est injoignable
        });

        console.log(`✅ MongoDB connecté: ${conn.connection.host}`);
    } catch (error: any) {
        console.error('❌ Erreur de connexion à MongoDB:', error?.message || error);
        // On ne coupe pas forcément le processus en développement, 
        // mais en production, c'est indispensable.
        if (process.env.NODE_ENV === 'production') {
            process.exit(1);
        }
    }
};

// Écouteur d'événements pour les déconnexions imprévues
mongoose.connection.on('error', err => {
    console.error(`🔴 Erreur de base de données en cours de route: ${err}`);
});

export default connectDB;