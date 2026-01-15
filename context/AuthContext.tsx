import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

const API_URL = 'http://localhost:4000/api'; // À adapter pour production

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
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
  // Déplace isAccessibleMode ici, au niveau global du contexte
  isAccessibleMode: boolean; 
  setIsAccessibleMode: (value: boolean) => void;
  
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

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccessibleMode, setIsAccessibleMode] = useState(false); // État global pour le vocal


  // Récupérer le token stocké au démarrage
  useEffect(() => {
    const restoreToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('authToken');
        if (storedToken) {
          setToken(storedToken);
          // Valider le token en récupérant le profil
          const response = await axios.get<{ user: User }>(`${API_URL}/auth/profile`, {
            headers: { Authorization: `Bearer ${storedToken}` }
          }); 

          setUser(response.data.user);
        }
      } catch (error) {
        console.error('Erreur lors de la restauration du token:', error);
        await AsyncStorage.removeItem('authToken');
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    restoreToken();
  }, []);

  const signup = async (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    accessibilityLevel: 'no-visual-impairment' | 'partial' | 'total';
    audioMode: boolean;
  }) => {
    try {
      const response = await axios.post(`${API_URL}/auth/signup`, {
        ...data,
        confirmPassword: data.password
      });

      const { user: newUser, token: newToken } = response.data;
      setToken(newToken);
      setUser(newUser);

      // Stocker le token
      await AsyncStorage.setItem('authToken', newToken);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erreur lors de l\'inscription';
      throw new Error(message);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });

      const { user: loggedInUser, token: newToken } = response.data;
      setToken(newToken);
      setUser(loggedInUser);

      // Stocker le token
      await AsyncStorage.setItem('authToken', newToken);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erreur lors de la connexion';
      throw new Error(message);
    }
  };

  const adminLogin = async (email: string, password: string, adminSecret: string) => {
    try {
      const response = await axios.post(`${API_URL}/auth/admin-login`, {
        email,
        password,
        adminSecret
      });

      const { user: adminUser, token: newToken } = response.data;
      setToken(newToken);
      setUser(adminUser);

      // Stocker le token
      await AsyncStorage.setItem('authToken', newToken);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erreur lors de la connexion admin';
      throw new Error(message);
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      setToken(null);
      await AsyncStorage.removeItem('authToken');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      if (!token) throw new Error('Pas de token');

      const response = await axios.put(`${API_URL}/auth/profile`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUser(response.data.user);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erreur lors de la mise à jour';
      throw new Error(message);
    }
  };

const value: AuthContextType = {
    user,
    isLoading,
    isSignedIn: !!user,
    token,
    isAccessibleMode, // Maintenant reconnu
    setIsAccessibleMode, // Maintenant reconnu
    signup,
    login,
    signIn: login,
    adminLogin,
    logout,
    signOut: logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
