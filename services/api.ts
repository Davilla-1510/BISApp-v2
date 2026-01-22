
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Intercepteur pour ajouter le token à chaque requête
    this.client.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Intercepteur pour gérer les erreurs
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expiré, supprimer le token
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

  // ============ ADMIN ENDPOINTS ============
  
  // Modules Admin
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

  // Levels Admin
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

  // Chapters Admin
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

  // Lessons Admin
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

  // Exercises Admin
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

  // Quiz Admin
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

  // Statistics
  async getAdminStats() {
    const response = await this.client.get('/admin/stats');
    return response.data;
  }

  // ============ PROGRESS / USER STATS ============
  async getUserProgress() {
    const response = await this.client.get('/progress');
    return response; // return full response to keep callers able to access .data
  }

  async getUserStats() {
    const response = await this.client.get('/progress/stats');
    return response; // return full response
  }

  async submitExerciseAnswer(payload: { exerciseId: string; answer: string; isCorrect: boolean; attempts: number; }) {
    const response = await this.client.post('/progress/exercise', payload);
    return response.data;
  }

  async submitQuiz(payload: { quizId: string; levelId: string; answers: any; score: number; passed: boolean; }) {
    const response = await this.client.post('/progress/quiz', payload);
    return response.data;
  }

  async completeLesson(lessonId: string) {
    const response = await this.client.post(`/progress/lesson/${lessonId}`);
    return response.data;
  }
}

export const api = new ApiClient();
export default api;
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import axios, { AxiosInstance } from 'axios';

// const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

// class ApiClient {
//   private client: AxiosInstance;

//   constructor() {
//     this.client = axios.create({
//       baseURL: API_BASE_URL,
//       timeout: 10000,
//       headers: {
//         'Content-Type': 'application/json'
//       }
//     });

//     // Intercepteur pour ajouter le token à chaque requête
//     this.client.interceptors.request.use(
//       async (config) => {
//         const token = await AsyncStorage.getItem('authToken');
//         if (token && config.headers) {
//           config.headers.Authorization = `Bearer ${token}`;
//         }
//         return config;
//       },
//       (error) => Promise.reject(error)
//     );

//     // Intercepteur pour gérer les erreurs globales (ex: 401 Unauthorized)
//     this.client.interceptors.response.use(
//       (response) => response,
//       async (error) => {
//         if (error.response?.status === 401) {
//           await AsyncStorage.removeItem('authToken');
//         }
//         return Promise.reject(error);
//       }
//     );
//   }

//   // ============ AUTH ENDPOINTS ============
//   async signup(data: {
//     firstName: string;
//     lastName: string;
//     email: string;
//     password: string;
//     confirmPassword: string;
//     accessibilityLevel: 'no-visual-impairment' | 'partial' | 'total';
//     audioMode: boolean;
//   }) {
//     const response = await this.client.post('/auth/signup', data);
//     return response.data;
//   }

//   async login(email: string, password: string) {
//     const response = await this.client.post('/auth/login', { email, password });
//     return response.data;
//   }

//   async adminLogin(email: string, password: string, adminSecret: string) {
//     const response = await this.client.post('/auth/admin-login', { email, password, adminSecret });
//     return response.data;
//   }

//   async getProfile() {
//     const response = await this.client.get('/auth/profile');
//     return response.data;
//   }

//   async updateProfile(data: any) {
//     const response = await this.client.put('/auth/profile', data);
//     return response.data;
//   }

//   // ============ CONTENT ENDPOINTS ============
//   async getModules() {
//     const response = await this.client.get('/content/modules');
//     return response.data;
//   }

//   async getLevelsByModule(moduleId: string) {
//     const response = await this.client.get(`/content/modules/${moduleId}/levels`);
//     return response.data;
//   }

//   async getChaptersByLevel(levelId: string) {
//     const response = await this.client.get(`/content/levels/${levelId}/chapters`);
//     return response.data;
//   }

//   async getLessonsByChapter(chapterId: string) {
//     const response = await this.client.get(`/content/chapters/${chapterId}/lessons`);
//     return response.data;
//   }

//   async getExercisesByLesson(lessonId: string) {
//     const response = await this.client.get(`/content/lessons/${lessonId}/exercises`);
//     return response.data;
//   }

//   async getQuizByLevel(levelId: string) {
//     const response = await this.client.get(`/content/levels/${levelId}/quiz`);
//     return response.data;
//   }

//   // ============ PROGRESS / STATS ============
//   async getUserProgress() {
//     const response = await this.client.get('/progress');
//     return response.data;
//   }

//   async getUserStats() {
//     const response = await this.client.get('/progress/stats');
//     return response.data;
//   }

//   async getMyBadges() {
//     const response = await this.client.get('/progress/my-badges');
//     return response.data;
//   }

//   async getAllBadges() {
//     const response = await this.client.get('/admin/badges/all');
//     return response.data;
//   }

//   async checkLevelUnlock(levelId: string) {
//     const response = await this.client.get(`/progress/check-unlock/${levelId}`);
//     return response.data;
//   }

//   async submitExerciseAnswer(payload: { exerciseId: string; answer: string; isCorrect: boolean; attempts: number; }) {
//     const response = await this.client.post('/progress/exercise', payload);
//     return response.data;
//   }

//   async submitQuiz(payload: { quizId: string; levelId: string; answers: any; score: number; passed: boolean; }) {
//     const response = await this.client.post('/progress/quiz', payload);
//     return response.data;
//   }

//   async completeLesson(lessonId: string) {
//     const response = await this.client.post(`/progress/lesson/${lessonId}`);
//     return response.data;
//   }

//   // ============ ADMIN ENDPOINTS ============
//   async createModule(data: any) {
//     const response = await this.client.post('/admin/modules', data);
//     return response.data;
//   }

//   async updateModule(moduleId: string, data: any) {
//     const response = await this.client.put(`/admin/modules/${moduleId}`, data);
//     return response.data;
//   }

//   async deleteModule(moduleId: string) {
//     const response = await this.client.delete(`/admin/modules/${moduleId}`);
//     return response.data;
//   }

//   async getAdminStats() {
//     const response = await this.client.get('/admin/stats');
//     return response.data;
//   }
// } // Fin de la classe ApiClient

// export const api = new ApiClient();
// export default api;