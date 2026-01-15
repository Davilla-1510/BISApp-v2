// Charger les variables d'environnement
import cors from 'cors';
import dotenv from 'dotenv';
import express, { Express, Request, Response } from 'express';
import connectDB from './config/database.js';
import adminRoutes from './routes/adminRoutes';
import authRoutes from './routes/authRoutes';
import contentRoutes from './routes/contentRoutes';
import progressRoutes from './routes/progressRoutes';
import Badge from './models/Badge';
import UserBadge from './models/UserBadge';
import badgeRoutes from './routes/badgeRoutes';

// Charger les variables d'environnement
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

// --- Tes autres routes ---
app.use('/api/auth', authRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/admin/badges', badgeRoutes);
export const checkAndAwardBadges = async (userId: string, levelId: string, score: number) => {
  try {
    // 1. Chercher les badges liés à ce niveau dont le score est atteint
    const eligibleBadges = await Badge.find({
      'criteria.levelId': levelId,
      'criteria.type': 'quiz_score',
      'criteria.value': { $lte: score }
    });

    for (const badge of eligibleBadges) {
      try {
        // 2. Tenter d'attribuer le badge (l'index unique empêche les doublons)
        await UserBadge.create({
          user: userId,
          badge: badge._id
        });
        console.log(`🏅 Badge "${badge.name}" attribué à l'utilisateur ${userId}`);
      } catch (err) {
        // L'erreur ici signifie simplement que l'utilisateur a déjà le badge
      }
    }
  } catch (error) {
    console.error('Erreur lors de l’attribution des badges:', error);
  }
};

// ========== MIDDLEWARE ==========
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(
  cors({
    origin: ['http://localhost:4000', 'http://localhost:8081', '*'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// ========== CONNEXION DATABASE ==========
connectDB();

// ========== ROUTES ==========
app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/progress', progressRoutes);

// Route de test
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({ message: 'Server is running ✅' });
});

// Gestion des erreurs 404
app.use((_req: Request, res: Response) => {
  res.status(404).json({ message: 'Route non trouvée' });
});

// ========== DÉMARRAGE ==========
(async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`\n🚀 BISApp Backend démarré sur le port ${PORT}`);
    console.log(`📝 API disponible sur http://localhost:${PORT}/api`);
    console.log(`💡 Vérifiez http://localhost:${PORT}/api/health\n`);
  });
})();

export default app;
