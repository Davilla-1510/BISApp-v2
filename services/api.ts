import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosInstance } from 'axios';

// Pour le web: localhost
// Pour mobile: adresse IP locale
const isWeb = typeof window !== 'undefined' && typeof navigator !== 'undefined';

const API_BASE_URL = process.env.REACT_APP_API_URL || (isWeb ? 'http://localhost:3000/api' : 'http://192.168.56.1:3000/api');

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    this.client.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          await AsyncStorage.removeItem('authToken');
        }
        return Promise.reject(error);
      }
    );
  }

  // ============ AUTH ENDPOINTS ============
  async signup(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
    accessibilityLevel: 'no-visual-impairment' | 'partial' | 'total';
    audioMode: boolean;
  }) {
    const response = await this.client.post('/auth/signup', data);
    return response.data;
  }

  async login(email: string, password: string) {
    const response = await this.client.post('/auth/login', { email, password });
    return response.data;
  }

  async adminLogin(email: string, password: string, adminSecret: string) {
    const response = await this.client.post('/auth/admin-login', { email, password, adminSecret });
    return response.data;
  }

  async getProfile() {
    const response = await this.client.get('/auth/profile');
    return response.data;
  }

  async updateProfile(data: any) {
    const response = await this.client.put('/auth/profile', data);
    return response.data;
  }

  // ============ CONTENT ENDPOINTS ============
  async getModules() {
    const response = await this.client.get('/content/modules');
    return response.data;
  }

  async getLevelsByModule(moduleId: string) {
    const response = await this.client.get(`/content/modules/${moduleId}/levels`);
    return response.data;
  }

  async getChaptersByLevel(levelId: string) {
    const response = await this.client.get(`/content/levels/${levelId}/chapters`);
    return response.data;
  }

  async getLessonsByChapter(chapterId: string) {
    const response = await this.client.get(`/content/chapters/${chapterId}/lessons`);
    return response.data;
  }

  async getExercisesByLesson(lessonId: string) {
    const response = await this.client.get(`/content/lessons/${lessonId}/exercises`);
    return response.data;
  }

  async getQuizByLevel(levelId: string) {
    const response = await this.client.get(`/content/levels/${levelId}/quiz`);
    return response.data;
  }

  async getExercise(exerciseId: string) {
    const response = await this.client.get(`/content/exercises/${exerciseId}`);
    return response.data;
  }

  async getQuiz(quizId: string) {
    const response = await this.client.get(`/content/quiz/${quizId}`);
    return response.data;
  }

  // ============ PROGRESS ENDPOINTS ============
  async getUserProgress() {
    const response = await this.client.get('/progress');
    return response.data;
  }

  async getUserStats() {
    const response = await this.client.get('/progress/stats');
    return response.data;
  }

  async updateLessonProgress(lessonId: string, data: any) {
    const response = await this.client.post('/progress/lesson', { lessonId, ...data });
    return response.data;
  }

  async updateExerciseProgress(exerciseId: string, data: any) {
    const response = await this.client.post('/progress/exercise', { exerciseId, ...data });
    return response.data;
  }

  // Submit exercise answer (used in exercise.tsx)
  async submitExerciseAnswer(data: {
    exerciseId: string;
    answer: string;
    isCorrect: boolean;
    attempts: number;
  }) {
    const response = await this.client.post('/progress/exercise', {
      exerciseId: data.exerciseId,
      answer: data.answer,
      isCorrect: data.isCorrect,
      attempts: data.attempts
    });
    return response.data;
  }

  async updateQuizProgress(quizId: string, data: any) {
    const response = await this.client.post('/progress/quiz', { quizId, ...data });
    return response.data;
  }

  // Submit quiz results
  async submitQuiz(data: {
    quizId: string;
    levelId: string;
    answers: { [key: number]: string };
    score: number;
    passed: boolean;
  }) {
    const response = await this.client.post('/progress/quiz', {
      quizId: data.quizId,
      levelId: data.levelId,
      answers: data.answers,
      score: data.score,
      passed: data.passed
    });
    return response.data;
  }

  // ============ BADGE ENDPOINTS ============
  async getBadges() {
    const response = await this.client.get('/admin/badges');
    return response.data;
  }

  async getUserBadges() {
    const response = await this.client.get('/admin/badges/user');
    return response.data;
  }

  // ============ ADMIN ENDPOINTS ============
  async createModule(data: any) {
    const response = await this.client.post('/admin/modules', data);
    return response.data;
  }

  async updateModule(moduleId: string, data: any) {
    const response = await this.client.put(`/admin/modules/${moduleId}`, data);
    return response.data;
  }

  async deleteModule(moduleId: string) {
    const response = await this.client.delete(`/admin/modules/${moduleId}`);
    return response.data;
  }

  async createLevel(data: any) {
    const response = await this.client.post('/admin/levels', data);
    return response.data;
  }

  async updateLevel(levelId: string, data: any) {
    const response = await this.client.put(`/admin/levels/${levelId}`, data);
    return response.data;
  }

  async deleteLevel(levelId: string) {
    const response = await this.client.delete(`/admin/levels/${levelId}`);
    return response.data;
  }

  async createChapter(data: any) {
    const response = await this.client.post('/admin/chapters', data);
    return response.data;
  }

  async updateChapter(chapterId: string, data: any) {
    const response = await this.client.put(`/admin/chapters/${chapterId}`, data);
    return response.data;
  }

  async deleteChapter(chapterId: string) {
    const response = await this.client.delete(`/admin/chapters/${chapterId}`);
    return response.data;
  }

  async createLesson(data: any) {
    const response = await this.client.post('/admin/lessons', data);
    return response.data;
  }

  async updateLesson(lessonId: string, data: any) {
    const response = await this.client.put(`/admin/lessons/${lessonId}`, data);
    return response.data;
  }

  async deleteLesson(lessonId: string) {
    const response = await this.client.delete(`/admin/lessons/${lessonId}`);
    return response.data;
  }

  async createExercise(data: any) {
    const response = await this.client.post('/admin/exercises', data);
    return response.data;
  }

  async updateExercise(exerciseId: string, data: any) {
    const response = await this.client.put(`/admin/exercises/${exerciseId}`, data);
    return response.data;
  }

  async deleteExercise(exerciseId: string) {
    const response = await this.client.delete(`/admin/exercises/${exerciseId}`);
    return response.data;
  }

  async createQuiz(data: any) {
    const response = await this.client.post('/admin/quiz', data);
    return response.data;
  }

  async updateQuiz(quizId: string, data: any) {
    const response = await this.client.put(`/admin/quiz/${quizId}`, data);
    return response.data;
  }

  async deleteQuiz(quizId: string) {
    const response = await this.client.delete(`/admin/quiz/${quizId}`);
    return response.data;
  }

  async getAdminStats() {
    const response = await this.client.get('/admin/stats');
    return response.data;
  }
}

export const api = new ApiClient();
export default api;
