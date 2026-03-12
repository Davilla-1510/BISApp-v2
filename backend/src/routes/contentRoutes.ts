import express, { Router } from 'express';
import {
  getChaptersByLevel,
  getExercisesByLesson,
  getLessonsByChapter,
  getLevelsByModule,
  getModules,
  getQuizByLevel
} from '../controllers/contentController';
// import { authenticate } from '../middleware/auth'; // Temporairement désactivé pour test

const router: Router = express.Router();

// Routes de contenu publiques (sans authentification pour le moment)
router.get('/modules', getModules);
router.get('/modules/:moduleId/levels', getLevelsByModule);
router.get('/levels/:levelId/chapters', getChaptersByLevel);
router.get('/chapters/:chapterId/lessons', getLessonsByChapter);
router.get('/lessons/:lessonId/exercises', getExercisesByLesson);
router.get('/levels/:levelId/quiz', getQuizByLevel);

export default router;
