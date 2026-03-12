//Controller pour la gestion des modules, niveaux, chapitres, leçons, exercices et quiz par les administrateurs

import { Request, Response } from 'express';
import Chapter from '../models/Chapter';
import Exercise from '../models/Exercise';
import Lesson from '../models/Lesson';
import Level from '../models/Level';
import Module from '../models/Module';
import Quiz from '../models/Quiz';
import User from '../models/User';


// ========== MODULES ==========
interface CreateModuleBody {
  name: string;
  title: string;
  description: string;
  icon: string;
}

export const createModule = async (req: Request<{}, {}, CreateModuleBody>, res: Response) => {
  try {
    const { name, title, description, icon } = req.body;
    const module = await Module.create({ name, title, description, icon });
    res.status(201).json({ message: 'Module créé', module });
  } catch (error) {
    console.error('Erreur lors de la création du module:', error);
    res.status(500).json({ message: 'Erreur lors de la création du module' });
  }
};

export const updateModule = async (req: Request, res: Response): Promise<void> => {
  try {
    const { moduleId } = req.params;
    const module = await Module.findByIdAndUpdate(moduleId, req.body, {
      new: true,
      runValidators: true
    });
    if (!module) {
      res.status(404).json({ message: 'Module non trouvé' });
      return;
    }
    res.status(200).json({ message: 'Module mis à jour', module });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du module:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour du module' });
  }
};

export const deleteModule = async (req: Request, res: Response): Promise<void> => {
  try {
    const { moduleId } = req.params;
    const module = await Module.findByIdAndDelete(moduleId);
    if (!module) {
      res.status(404).json({ message: 'Module non trouvé' });
      return;
    }
    res.status(200).json({ message: 'Module supprimé' });
  } catch (error) {
    console.error('Erreur lors de la suppression du module:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression du module' });
  }
};

// ========== LEVELS ==========
export const createLevel = async (req: Request, res: Response): Promise<void> => {
  try {
    const { module, name, title, description, order } = req.body;
    const level = await Level.create({ module, name, title, description, order });
    res.status(201).json({ message: 'Niveau créé', level });
  } catch (error) {
    console.error('Erreur lors de la création du niveau:', error);
    res.status(500).json({ message: 'Erreur lors de la création du niveau' });
  }
};

export const updateLevel = async (req: Request, res: Response): Promise<void> => {
  try {
    const { levelId } = req.params;
    const level = await Level.findByIdAndUpdate(levelId, req.body, {
      new: true,
      runValidators: true
    });
    if (!level) {
      res.status(404).json({ message: 'Niveau non trouvé' });
      return;
    }
    res.status(200).json({ message: 'Niveau mis à jour', level });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du niveau:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour du niveau' });
  }
};

export const deleteLevel = async (req: Request, res: Response): Promise<void> => {
  try {
    const { levelId } = req.params;
    const level = await Level.findByIdAndDelete(levelId);
    if (!level) {
      res.status(404).json({ message: 'Niveau non trouvé' });
      return;
    }
    res.status(200).json({ message: 'Niveau supprimé' });
  } catch (error) {
    console.error('Erreur lors de la suppression du niveau:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression du niveau' });
  }
};

// ========== CHAPTERS ==========
export const createChapter = async (req: Request, res: Response): Promise<void> => {
  try {
    const { level, title, description, order } = req.body;
    const chapter = await Chapter.create({ level, title, description, order });
    res.status(201).json({ message: 'Chapitre créé', chapter });
  } catch (error) {
    console.error('Erreur lors de la création du chapitre:', error);
    res.status(500).json({ message: 'Erreur lors de la création du chapitre' });
  }
};

export const updateChapter = async (req: Request, res: Response): Promise<void> => {
  try {
    const { chapterId } = req.params;
    const chapter = await Chapter.findByIdAndUpdate(chapterId, req.body, {
      new: true,
      runValidators: true
    });
    if (!chapter) {
      res.status(404).json({ message: 'Chapitre non trouvé' });
      return;
    }
    res.status(200).json({ message: 'Chapitre mis à jour', chapter });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du chapitre:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour du chapitre' });
  }
};

export const deleteChapter = async (req: Request, res: Response): Promise<void> => {
  try {
    const { chapterId } = req.params;
    const chapter = await Chapter.findByIdAndDelete(chapterId);
    if (!chapter) {
      res.status(404).json({ message: 'Chapitre non trouvé' });
      return;
    }
    res.status(200).json({ message: 'Chapitre supprimé' });
  } catch (error) {
    console.error('Erreur lors de la suppression du chapitre:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression du chapitre' });
  }
};

// ========== LESSONS ==========
//========= createLesson ==========
export const createLesson = async (req: Request, res: Response): Promise<void> => {
  try {
    const { chapter, title, content, order, audioUrl } = req.body;
    const lesson = await Lesson.create({ chapter, title, content, order, audioUrl });
    res.status(201).json({ message: 'Leçon créée', lesson });
  } catch (error) {
    console.error('Erreur lors de la création de la leçon:', error);
    res.status(500).json({ message: 'Erreur lors de la création de la leçon' });
  }
};

//========= updateLesson ==========
export const updateLesson = async (req: Request, res: Response): Promise<void> => {
  try {
    const { lessonId } = req.params;
    const lesson = await Lesson.findByIdAndUpdate(lessonId, req.body, {
      new: true,
      runValidators: true
    });
    if (!lesson) {
      res.status(404).json({ message: 'Leçon non trouvée' });
      return;
    }
    res.status(200).json({ message: 'Leçon mise à jour', lesson });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la leçon:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour de la leçon' });
  }
};

//========= deleteLesson ==========
export const deleteLesson = async (req: Request, res: Response): Promise<void> => {
  try {
    const { lessonId } = req.params;
    const lesson = await Lesson.findByIdAndDelete(lessonId);
    if (!lesson) {
      res.status(404).json({ message: 'Leçon non trouvée' });
      return;
    }
    res.status(200).json({ message: 'Leçon supprimée' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la leçon:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression de la leçon' });
  }
};

// ========== EXERCISES ==========
//========= createExercise ==========
export const createExercise = async (req: Request, res: Response): Promise<void> => {
  try {
    const { lesson, title, description, type, question, options, correctAnswer, brailleText, order } =
      req.body;
    const exercise = await Exercise.create({
      lesson,
      title,
      description,
      type,
      question,
      options,
      correctAnswer,
      brailleText,
      order
    });
    res.status(201).json({ message: 'Exercice créé', exercise });
  } catch (error) {
    console.error('Erreur lors de la création de l\'exercice:', error);
    res.status(500).json({ message: 'Erreur lors de la création de l\'exercice' });
  }
};

//========= updateExercise ==========
export const updateExercise = async (req: Request, res: Response): Promise<void> => {
  try {
    const { exerciseId } = req.params;
    const exercise = await Exercise.findByIdAndUpdate(exerciseId, req.body, {
      new: true,
      runValidators: true
    });
    if (!exercise) {
      res.status(404).json({ message: 'Exercice non trouvé' });
      return;
    }
    res.status(200).json({ message: 'Exercice mis à jour', exercise });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'exercice:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'exercice' });
  }
};

//========= deleteExercise ==========
export const deleteExercise = async (req: Request, res: Response): Promise<void> => {
  try {
    const { exerciseId } = req.params;
    const exercise = await Exercise.findByIdAndDelete(exerciseId);
    if (!exercise) {
      res.status(404).json({ message: 'Exercice non trouvé' });
      return;
    }
    res.status(200).json({ message: 'Exercice supprimé' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'exercice:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression de l\'exercice' });
  }
};

// ========== QUIZ ==========
export const createQuiz = async (req: Request, res: Response): Promise<void> => {
  try {
    const { level, title, description, exercises, passingScore } = req.body;
    const quiz = await Quiz.create({ level, title, description, exercises, passingScore });
    res.status(201).json({ message: 'Quiz créé', quiz });
  } catch (error) {
    console.error('Erreur lors de la création du quiz:', error);
    res.status(500).json({ message: 'Erreur lors de la création du quiz' });
  }
};
//========= updateQuiz ==========
export const updateQuiz = async (req: Request, res: Response): Promise<void> => {
  try {
    const { quizId } = req.params;
    const quiz = await Quiz.findByIdAndUpdate(quizId, req.body, {
      new: true,
      runValidators: true
    });
    if (!quiz) {
      res.status(404).json({ message: 'Quiz non trouvé' });
      return;
    }
    res.status(200).json({ message: 'Quiz mis à jour', quiz });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du quiz:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour du quiz' });
  }
};

//========= deleteQuiz ==========
export const deleteQuiz = async (req: Request, res: Response): Promise<void> => {
  try {
    const { quizId } = req.params;
    const quiz = await Quiz.findByIdAndDelete(quizId);
    if (!quiz) {
      res.status(404).json({ message: 'Quiz non trouvé' });
      return;
    }
    res.status(200).json({ message: 'Quiz supprimé' });
  } catch (error) {
    console.error('Erreur lors de la suppression du quiz:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression du quiz' });
  }
};

// ========== STATISTICS ==========
export const getAdminStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const totalUsers = await User.countDocuments();
    const totalModules = await Module.countDocuments();
    const totalChapters = await Chapter.countDocuments();
    const totalLessons = await Lesson.countDocuments();
    const totalExercises = await Exercise.countDocuments();

    res.status(200).json({
      stats: {
        totalUsers,
        totalModules,
        totalChapters,
        totalLessons,
        totalExercises
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des statistiques' });
  }
};
