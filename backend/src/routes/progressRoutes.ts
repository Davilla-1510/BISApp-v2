import { Request, Response, Router } from 'express';
import { authenticate } from '../middleware/auth';
import UserProgress from '../models/UserProgress';
import UserBadge from '../models/UserBadge';
import Badge from '../models/Badge';
import Level from '../models/Level';

const router = Router();

/**
 * LOGIQUE UTILITAIRE : Attribution automatique des badges
 */
const checkAndAwardBadges = async (userId: string, levelId: string, score: number) => {
  try {
    // On cherche les badges dont les critères correspondent au niveau réussi
    const eligibleBadges = await Badge.find({
      'criteria.levelId': levelId,
      'criteria.type': 'quiz_score',
      'criteria.value': { $lte: score }
    });

    for (const badge of eligibleBadges) {
      try {
        // L'index unique {user, badge} dans la DB empêche de donner 2 fois le même badge
        await UserBadge.create({
          user: userId,
          badge: badge._id
        });
        console.log(`🏅 Nouveau badge attribué : ${badge.name}`);
      } catch (err) {
        // L'utilisateur a déjà le badge, on ne fait rien
      }
    }
  } catch (error) {
    console.error('Erreur attribution badges:', error);
  }
};

/**
 * ROUTES DE PROGRESSION
 */

// 1. Soumettre une réponse à un exercice
router.post('/exercise', authenticate, async (req: Request, res: Response) => {
  try {
    const { exerciseId, isCorrect, attempts } = req.body;
    const userId = (req as any).userId;

    if (!exerciseId) return res.status(400).json({ message: 'exerciseId requis' });

    let progress: any = await UserProgress.findOne({ user: userId, exercise: exerciseId });

    if (!progress) {
      progress = new UserProgress({
        user: userId,
        exercise: exerciseId,
        attempts: attempts || 1,
        status: isCorrect ? 'completed' : 'in-progress',
        score: isCorrect ? 100 : 0,
        completedAt: isCorrect ? new Date() : undefined,
      });
    } else {
      progress.attempts = (progress.attempts || 0) + 1;
      if (isCorrect) {
        progress.status = 'completed';
        progress.score = 100;
        progress.completedAt = new Date();
      }
    }

    await progress.save();
    return res.json({ success: true, progress });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

// 2. Soumettre un Quiz (avec déblocage et badges)
router.post('/quiz', authenticate, async (req: Request, res: Response) => {
  try {
    const { quizId, levelId, score, passed } = req.body;
    const userId = (req as any).userId;

    if (!quizId || !levelId) return res.status(400).json({ message: 'Données manquantes' });

    let progress: any = await UserProgress.findOne({ user: userId, level: levelId });

    if (!progress) {
      progress = new UserProgress({
        user: userId,
        level: levelId,
        score: score || 0,
        status: passed ? 'passed' : 'in-progress',
        completedAt: passed ? new Date() : undefined,
      });
    } else {
      // Correction Erreur TypeScript : on s'assure que score est un nombre
      const currentScore = typeof progress.score === 'number' ? progress.score : 0;
      progress.score = Math.max(currentScore, score);
      
      if (passed) {
        progress.status = 'passed';
        progress.completedAt = new Date();
      }
    }

    await progress.save();

    if (passed) {
      await checkAndAwardBadges(userId, levelId, score);
    }

    return res.json({ success: true, passed, score: progress.score, progress });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

// 3. Marquer une leçon comme terminée
router.post('/lesson/:lessonId', authenticate, async (req: Request, res: Response) => {
  try {
    const { lessonId } = req.params;
    const userId = (req as any).userId;

    const progress = await UserProgress.findOneAndUpdate(
      { user: userId, lesson: lessonId },
      { status: 'completed', score: 100, completedAt: new Date() },
      { upsert: true, new: true }
    );

    return res.json({ success: true, progress });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

/**
 * ROUTES DE CONSULTATION
 */

// 4. Vérifier si un niveau est débloqué
router.get('/check-unlock/:levelId', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const currentLevel = await Level.findById(req.params.levelId);

    if (!currentLevel) return res.status(404).json({ message: 'Niveau introuvable' });

    // Le niveau 1 est toujours débloqué
    if (currentLevel.order <= 1) return res.json({ unlocked: true });

    // On cherche le niveau précédent dans le même module
    const prevLevel = await Level.findOne({ 
      module: currentLevel.module, 
      order: currentLevel.order - 1 
    });

    if (!prevLevel) return res.json({ unlocked: true });

    const progress = await UserProgress.findOne({ 
      user: userId, 
      level: prevLevel._id, 
      status: 'passed' 
    });

    // Débloqué si score >= 70% au niveau précédent
    const unlocked = !!(progress && (progress.score || 0) >= 70);
    return res.json({ unlocked, previousLevelScore: progress?.score || 0 });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

// 5. Récupérer les badges de l'utilisateur
router.get('/my-badges', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const badges = await UserBadge.find({ user: userId }).populate('badge');
    res.json({ success: true, badges });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des badges" });
  }
});

// 6. Statistiques globales (Corrigé pour TypeScript)
router.get('/stats', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const progresses: any[] = await UserProgress.find({ user: userId });

    const totalLessons = progresses.filter(p => p.lesson && p.status === 'completed').length;
    const totalQuizzes = progresses.filter(p => p.level && p.status === 'passed').length;

    // Correction TypeScript : Filtrage sécurisé des scores
    const validScores: number[] = progresses
      .filter(p => typeof p.score === 'number')
      .map(p => p.score as number);

    const averageScore = validScores.length > 0 
      ? validScores.reduce((a, b) => a + b, 0) / validScores.length 
      : 0;

    return res.json({
      success: true,
      data: {
        totalLessonsCompleted: totalLessons,
        totalQuizzesCompleted: totalQuizzes,
        averageScore: Math.round(averageScore),
        timeSpentHours: Math.floor((progresses.length * 15) / 60)
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur statistiques' });
  }
});

export default router;