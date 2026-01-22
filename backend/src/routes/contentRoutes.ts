import express, { Router } from 'express';
import {
  getChaptersByLevel,
  getExercisesByLesson,
  getLessonsByChapter,
  getLevelsByModule,
  getModules,
  getQuizByLevel
} from '../controllers/contentController';
import { authenticate } from '../middleware/auth';

const router: Router = express.Router();

// Toutes les routes de contenu sont publiques mais authentifiées
router.get('/modules', authenticate, getModules);
router.get('/modules/:moduleId/levels', authenticate, getLevelsByModule);
router.get('/levels/:levelId/chapters', authenticate, getChaptersByLevel);
router.get('/chapters/:chapterId/lessons', authenticate, getLessonsByChapter);
router.get('/lessons/:lessonId/exercises', authenticate, getExercisesByLesson);
router.get('/levels/:levelId/quiz', authenticate, getQuizByLevel);

export default router;
