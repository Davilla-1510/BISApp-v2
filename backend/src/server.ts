import cors from 'cors';
import dotenv from 'dotenv';
import express, { Express, Request, Response } from 'express';
import connectDB from './config/database';
import adminRoutes from './routes/adminRoutes';
import authRoutes from './routes/authRoutes';
import badgeRoutes from './routes/badgeRoutes';
import contentRoutes from './routes/contentRoutes';
import progressRoutes from './routes/progressRoutes';

// Charger les variables d'environnement
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 4000;

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

// ========== ROUTES ==========
app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/admin/badges', badgeRoutes);

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
