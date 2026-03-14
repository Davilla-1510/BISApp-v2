import cors from 'cors';
import dotenv from 'dotenv';
import express, { Express, Request, Response } from 'express';
import connectDB from './config/database';
import adminRoutes from './routes/adminRoutes';
import authRoutes from './routes/authRoutes';
import badgeRoutes from './routes/badgeRoutes';
import contentRoutes from './routes/contentRoutes';
import notificationRoutes from './routes/notificationRoutes';
import progressRoutes from './routes/progressRoutes';
import { startInactivityCronJob } from './services/notificationService';

// Charger les variables d'environnement
dotenv.config();

const app: Express = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// ========== MIDDLEWARE ==========
app.use(express.json({ limit: '50mb' }));
+
+
// CORS - configuré pour accepter toutes les origines en développement
app.use(
  cors({
    origin: true,
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
app.use('/api/notifications', notificationRoutes);

// Route de test
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({ message: 'Server is running' });
});

// Gestion des erreurs 404
app.use((_req: Request, res: Response) => {
  res.status(404).json({ message: 'Route non trouvee' });
});

// ========== DEMARRAGE ==========
(async () => {
  await connectDB();
  
  // Démarrer le cron job pour les rappels d'inactivité
  startInactivityCronJob();
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log('\nBISApp Backend demarre sur le port ' + PORT);
    console.log('API disponible sur http://localhost:' + PORT + '/api');
    console.log('API disponible sur http://0.0.0.0:' + PORT + '/api');
    console.log('Verifiez http://localhost:' + PORT + '/api/health\n');
  });
})();

export default app;

