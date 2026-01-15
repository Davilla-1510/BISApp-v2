import { Request, Response } from 'express';
import Chapter from '../models/Chapter';
import Exercise from '../models/Exercise';
import Lesson from '../models/Lesson';
import Level from '../models/Level';
import Module from '../models/Module';
import Quiz from '../models/Quiz';
import UserProgress from '../models/UserProgress';

export const getModules = async (_req: Request, res: Response): Promise<void> => {
  try {
    const modules = await Module.find();
    res.status(200).json({ modules });
  } catch (error) {
    console.error('Erreur lors de la récupération des modules:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des modules' });
  }
};

export const getLevelsByModule = async (req: Request, res: Response): Promise<void> => {
  try {
    const { moduleId } = req.params;
    const levels = await Level.find({ module: moduleId }).sort({ order: 1 });
    res.status(200).json({ levels });
  } catch (error) {
    console.error('Erreur lors de la récupération des niveaux:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des niveaux' });
  }
};

export const getChaptersByLevel = async (req: Request, res: Response): Promise<void> => {
  try {
    const { levelId } = req.params;
    const chapters = await Chapter.find({ level: levelId }).sort({ order: 1 });
    res.status(200).json({ chapters });
  } catch (error) {
    console.error('Erreur lors de la récupération des chapitres:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des chapitres' });
  }
};

export const getLessonsByChapter = async (req: Request, res: Response): Promise<void> => {
  try {
    const { chapterId } = req.params;
    const lessons = await Lesson.find({ chapter: chapterId }).sort({ order: 1 });
    res.status(200).json({ lessons });
  } catch (error) {
    console.error('Erreur lors de la récupération des leçons:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des leçons' });
  }
};

// Dans contentController.ts ou progressController.ts
export const getChaptersWithProgress = async (req: Request, res: Response) => {
  try {
    const { levelId } = req.params;
    const userId = (req as any).userId;

    // 1. Récupérer tous les chapitres du niveau
    const chapters = await Chapter.find({ level: levelId }).sort('order');

    // 2. Pour chaque chapitre, vérifier la progression
    const chaptersWithStatus = await Promise.all(chapters.map(async (chapter) => {
      const lessons = await Lesson.find({ chapter: chapter._id });
      const lessonIds = lessons.map(l => l._id);

      // Compter combien de leçons de ce chapitre l'utilisateur a terminé
      const completedCount = await UserProgress.countDocuments({
        user: userId,
        lesson: { $in: lessonIds },
        status: 'completed'
      });

      return {
        ...chapter.toObject(),
        totalLessons: lessons.length,
        completedLessons: completedCount,
        isFullyCompleted: lessons.length > 0 && completedCount === lessons.length
      };
    }));

    res.json({ success: true, data: chaptersWithStatus });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des chapitres" });
  }
};

export const getExercisesByLesson = async (req: Request, res: Response): Promise<void> => {
  try {
    const { lessonId } = req.params;
    const exercises = await Exercise.find({ lesson: lessonId }).sort({ order: 1 });
    res.status(200).json({ exercises });
  } catch (error) {
    console.error('Erreur lors de la récupération des exercices:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des exercices' });
  }
};

export const getQuizByLevel = async (req: Request, res: Response): Promise<void> => {
  try {
    const { levelId } = req.params;
    const quiz = await Quiz.findOne({ level: levelId }).populate('exercises');
    if (!quiz) {
      res.status(404).json({ message: 'Quiz non trouvé' });
      return;
    }
    res.status(200).json({ quiz });
  } catch (error) {
    console.error('Erreur lors de la récupération du quiz:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération du quiz' });
  }
};
