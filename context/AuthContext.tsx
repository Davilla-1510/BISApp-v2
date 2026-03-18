import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosError } from 'axios';
import React, { createContext, ReactNode, useContext, useEffect, useState, useCallback } from 'react';

// Pour le web: localhost
// Pour mobile: adresse IP locale
const isWeb = typeof window !== 'undefined' && typeof navigator !== 'undefined';

const API_URL = process.env.REACT_APP_API_URL || (isWeb ? 'http://localhost:3000/api' : 'http://192.168.56.1:3000/api');

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  profilePhoto?: string;
  bio?: string;
  accessibilityLevel: 'no-visual-impairment' | 'partial' | 'total';
  audioMode: boolean;
  role: 'student' | 'admin';
  subscriptionStatus: 'free' | 'premium';
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isSignedIn: boolean;
  token: string | null;
  isAccessibleMode: boolean;
  setIsAccessibleMode: (value: boolean) => void;
  isVisuallyImpaired: boolean;
  refreshUser: () => Promise<void>;
  
  signup: (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    accessibilityLevel: 'no-visual-impairment' | 'partial' | 'total';
    audioMode: boolean;
  }) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  adminLogin: (email: string, password: string, adminSecret: string) => Promise<void>;
  logout: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

// Create axios instance OUTSIDE the component - singleton pattern
const createAxiosInstance = () => {
  const axiosInstance = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json'
    }
  });

  // Request interceptor to add token
  axiosInstance.interceptors.request.use(
    async (config) => {
      const token = await AsyncStorage.getItem('authToken');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor for error handling
  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      if (error.response?.status === 401) {
        // Token expired or invalid - clear storage
        await AsyncStorage.multiRemove(['authToken', 'refreshToken']);
      }
      return Promise.reject(error);
    }
  );

  return axiosInstance;
};

// Create SINGLETON instance outside component - this is the key fix!
const api = createAxiosInstance();

export function AuthProvider({ children }: AuthProviderProps): React.JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccessibleMode, setIsAccessibleMode] = useState(false);
  const [isVisuallyImpaired, setIsVisuallyImpaired] = useState(false);
  
  // Use the singleton api instance - don't recreate it!

  // Refresh user data - use ref to avoid dependency issues
  const refreshUser = useCallback(async () => {
    try {
      const response = await api.get<{ user: User }>('/auth/profile');
      setUser(response.data.user);
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  }, []); // Empty deps - api is now a singleton

  // Restore token and user on startup
  useEffect(() => {
    const restoreSession = async () => {
      try {
        // Load visual impairment mode
        const visualImpairmentMode = await AsyncStorage.getItem('visualImpairmentMode');
        const impaired = visualImpairmentMode === 'true';
        setIsVisuallyImpaired(impaired);
        setIsAccessibleMode(impaired); // Enable TTS when visually impaired

        const storedToken = await AsyncStorage.getItem('authToken');
        if (storedToken) {
          setToken(storedToken);
          
          // Validate token by fetching profile with timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
          
          try {
            const response = await api.get<{ user: User }>('/auth/profile', {
              signal: controller.signal
            });
            setUser(response.data.user);
          } catch (fetchError: any) {
            clearTimeout(timeoutId);
            console.log('Token validation failed or timeout:', fetchError.message);
            // Clear invalid tokens
            await AsyncStorage.multiRemove(['authToken', 'refreshToken']);
            setToken(null);
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Error restoring session:', error);
        // Clear tokens on any error
        await AsyncStorage.multiRemove(['authToken', 'refreshToken']);
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []); // Empty deps - only run once on mount

  const signup = async (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    accessibilityLevel: 'no-visual-impairment' | 'partial' | 'total';
    audioMode: boolean;
  }) => {
    try {
      const response = await api.post('/auth/signup', {
        ...data,
        confirmPassword: data.password
      });

      const { user: newUser, token: newToken } = response.data;
      setToken(newToken);
      setUser(newUser);
      await AsyncStorage.setItem('authToken', newToken);
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Erreur lors de l\'inscription';
      throw new Error(message);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user: loggedInUser, token: newToken } = response.data;
      
      setToken(newToken);
      setUser(loggedInUser);
      await AsyncStorage.setItem('authToken', newToken);
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Erreur lors de la connexion';
      throw new Error(message);
    }
  };

  const adminLogin = async (email: string, password: string, adminSecret: string) => {
    try {
      const response = await api.post('/auth/admin-login', { email, password, adminSecret });
      const { user: adminUser, token: newToken } = response.data;
      
      setToken(newToken);
      setUser(adminUser);
      await AsyncStorage.setItem('authToken', newToken);
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Erreur lors de la connexion admin';
      throw new Error(message);
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      setToken(null);
      await AsyncStorage.multiRemove(['authToken', 'refreshToken', 'isAccessibleMode']);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!token) throw new Error('Pas de token');

    try {
      const response = await api.put('/auth/profile', data);
      setUser(response.data.user);
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Erreur lors de la mise à jour';
      throw new Error(message);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isSignedIn: !!user,
    token,
    isAccessibleMode,
    setIsAccessibleMode,
    isVisuallyImpaired,
    refreshUser,
    signup,
    login,
    signIn: login,
    adminLogin,
    logout,
    signOut: logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
