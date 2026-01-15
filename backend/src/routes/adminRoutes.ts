import express, { Router } from 'express';
import {
    createChapter,
    createExercise,
    createLesson,
    createLevel,
    createModule,
    createQuiz,
    deleteChapter,
    deleteExercise,
    deleteLesson,
    deleteLevel,
    deleteModule,
    deleteQuiz,
    getAdminStats,
    updateChapter,
    updateExercise,
    updateLesson,
    updateLevel,
    updateModule,
    updateQuiz
} from '../controllers/adminController';
import { authenticate, authorizeAdmin } from '../middleware/auth';

const router: Router = express.Router();

// Toutes les routes admin nécessitent l'authentification ET rôle admin
router.use(authenticate, authorizeAdmin);

// ========== MODULES ==========
router.post('/modules', createModule);
router.put('/modules/:moduleId', updateModule);
router.delete('/modules/:moduleId', deleteModule);

// ========== LEVELS ==========
router.post('/levels', createLevel);
router.put('/levels/:levelId', updateLevel);
router.delete('/levels/:levelId', deleteLevel);

// ========== CHAPTERS ==========
router.post('/chapters', createChapter);
router.put('/chapters/:chapterId', updateChapter);
router.delete('/chapters/:chapterId', deleteChapter);

// ========== LESSONS ==========
router.post('/lessons', createLesson);
router.put('/lessons/:lessonId', updateLesson);
router.delete('/lessons/:lessonId', deleteLesson);

// ========== EXERCISES ==========
router.post('/exercises', createExercise);
router.put('/exercises/:exerciseId', updateExercise);
router.delete('/exercises/:exerciseId', deleteExercise);

// ========== QUIZ ==========
router.post('/quiz', createQuiz);
router.put('/quiz/:quizId', updateQuiz);
router.delete('/quiz/:quizId', deleteQuiz);

// ========== STATISTICS ==========
router.get('/stats', getAdminStats);

export default router;
