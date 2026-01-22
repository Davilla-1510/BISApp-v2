import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bisapp';
    console.log('🔎 Using MongoDB URI:', mongoUri.startsWith('mongodb+srv:') ? 'atlas cluster' : mongoUri);
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connecté avec succès');
  } catch (error: any) {
    console.error('❌ Erreur de connexion à MongoDB:', error && error.message ? error.message : error);
    process.exit(1);
  }
};

export default connectDB;
