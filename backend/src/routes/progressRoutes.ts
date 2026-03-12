import { Request, Response, Router } from 'express';
import { authenticate } from '../middleware/auth';
import UserProgress from '../models/UserProgress';
import UserBadge from '../models/UserBadge';
import Badge from '../models/Badge';
import Level from '../models/Level';

const router = Router();

// Helper function: Check and award badges
const checkAndAwardBadges = async (userId: string, levelId: string, score: number): Promise<void> => {
  try {
    const eligibleBadges = await Badge.find({
      'criteria.levelId': levelId,
      'criteria.type': 'quiz_score',
      'criteria.value': { $lte: score }
    });

    for (const badge of eligibleBadges) {
      try {
        await UserBadge.create({
          user: userId,
          badge: badge._id
        });
        console.log(`🏅 Nouveau badge attribué : ${badge.name}`);
      } catch (err) {
        // User already has this badge
      }
    }
  } catch (error) {
    console.error('Erreur attribution badges:', error);
  }
};

// Submit exercise answer
router.post('/exercise', authenticate, async (req: Request, res: Response) => {
  try {
    const { exerciseId, isCorrect, attempts } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Utilisateur non authentifié' });
    }

    if (!exerciseId) {
      return res.status(400).json({ message: 'exerciseId requis' });
    }

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
  } catch (error: any) {
    console.error('Submit exercise error:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Submit quiz answers
router.post('/quiz', authenticate, async (req: Request, res: Response) => {
  try {
    const { quizId, levelId, score, passed } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Utilisateur non authentifié' });
    }

    if (!quizId || !levelId) {
      return res.status(400).json({ message: 'Données manquantes' });
    }

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
  } catch (error: any) {
    console.error('Submit quiz error:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Complete lesson
router.post('/lesson/:lessonId', authenticate, async (req: Request, res: Response) => {
  try {
    const { lessonId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Utilisateur non authentifié' });
    }

    if (!lessonId) {
      return res.status(400).json({ message: 'lessonId requis' });
    }

    let progress: any = await UserProgress.findOne({ user: userId, lesson: lessonId });

    if (!progress) {
      progress = new UserProgress({
        user: userId,
        lesson: lessonId,
        status: 'completed',
        score: 100,
        completedAt: new Date(),
      });
    } else {
      progress.status = 'completed';
      progress.completedAt = new Date();
    }

    await progress.save();
    return res.json({ success: true, message: 'Leçon marquée comme terminée', progress });
  } catch (error: any) {
    console.error('Complete lesson error:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Get user progress overview - VERSION SIMPLIFIÉE
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Utilisateur non authentifié' });
    }

    // Get all user progresses
    const progresses: any[] = await UserProgress.find({ user: userId })
      .populate('exercise')
      .populate('lesson')
      .populate('level');

    // Return simple data
    return res.json({ 
      success: true, 
      data: {
        modules: [],  // données vides car pas de modules
        levels: progresses.map(p => ({
          levelId: p.level?._id?.toString() || p.level?.toString(),
          levelName: p.level?.name || 'Niveau',
          completed: p.status === 'passed' || p.status === 'completed',
          quizPassed: p.status === 'passed',
          quizScore: p.score,
        })),
      }
    });
  } catch (error: any) {
    console.error('Get progress error:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Get user statistics
router.get('/stats', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Utilisateur non authentifié' });
    }

    const progresses: any[] = await UserProgress.find({ user: userId });

    // Compter uniquement les leçons complétées (qui ont un lessonId ObjectId valide et un status completed/passed)
    const totalLessons = progresses.filter(p => 
      p.lesson && 
      p.lesson !== null &&
      typeof p.lesson === 'object' &&
      (p.status === 'completed' || p.status === 'passed')
    ).length;

    // Compter uniquement les exercices complétés (qui ont un exerciseId ObjectId valide et un status completed/passed)
    const totalExercises = progresses.filter(p => 
      p.exercise && 
      p.exercise !== null &&
      typeof p.exercise === 'object' &&
      (p.status === 'completed' || p.status === 'passed')
    ).length;

    // Compter uniquement les quiz réussis (qui ont un levelId ObjectId valide et un status passed)
    const totalQuizzes = progresses.filter(p => 
      p.level && 
      p.level !== null &&
      typeof p.level === 'object' &&
      p.status === 'passed'
    ).length;

    // Calculer le score moyen uniquement sur les entrées qui ont un score numérique
    const validScores: number[] = progresses
      .filter(p => typeof p.score === 'number' && p.score !== null)
      .map(p => p.score as number);

    const averageScore = validScores.length > 0
      ? validScores.reduce((a, b) => a + b, 0) / validScores.length
      : 0;

    // Calculer le temps passé (15 minutes par activité complétée)
    const timeSpentHours = Math.floor((totalLessons + totalExercises + totalQuizzes) * 15 / 60);

    return res.json({
      success: true,
      data: {
        totalLessonsCompleted: totalLessons,
        totalExercisesCompleted: totalExercises,
        totalQuizzesCompleted: totalQuizzes,
        averageScore: Math.round(averageScore),
        timeSpentHours,
      },
    });
  } catch (error: any) {
    console.error('Get stats error:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Check if level is unlocked
router.get('/check-unlock/:levelId', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Utilisateur non authentifié' });
    }

    const currentLevel = await Level.findById(req.params.levelId);

    if (!currentLevel) {
      return res.status(404).json({ message: 'Niveau introuvable' });
    }

    // Level 1 is always unlocked
    if (currentLevel.order <= 1) {
      return res.json({ unlocked: true });
    }

    const prevLevel = await Level.findOne({
      module: currentLevel.module,
      order: currentLevel.order - 1
    });

    if (!prevLevel) {
      return res.json({ unlocked: true });
    }

    const progress = await UserProgress.findOne({
      user: userId,
      level: prevLevel._id,
      status: 'passed'
    });

    const unlocked = !!(progress && (progress.score || 0) >= 70);
    return res.json({ unlocked, previousLevelScore: progress?.score || 0 });
  } catch (error: any) {
    console.error('Check unlock error:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Get user's badges
router.get('/my-badges', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Utilisateur non authentifié' });
      return;
    }

    const badges = await UserBadge.find({ user: userId }).populate('badge');
    res.json({ success: true, badges });
  } catch (error: any) {
    console.error('Get badges error:', error);
    res.status(500).json({ message: "Erreur lors de la récupération des badges" });
  }
});

export default router;
