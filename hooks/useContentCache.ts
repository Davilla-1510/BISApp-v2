
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

// Clés pour le cache
const CACHE_KEYS = {
  MODULES: 'cache_modules',
  LEVELS: 'cache_levels',
  CHAPTERS: 'cache_chapters',
  LESSONS: 'cache_lessons',
};

// Durée du cache: 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;

interface CacheData<T> {
  data: T;
  timestamp: number;
}

export function useContentCache() {
  const [isLoading, setIsLoading] = useState(false);

  // Sauvegarder dans le cache
  const setCache = useCallback(async <T,>(key: string, data: T): Promise<void> => {
    try {
      const cacheData: CacheData<T> = {
        data,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(key, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Erreur cache set:', error);
    }
  }, []);

  // Récupérer du cache
  const getCache = useCallback(async <T,>(key: string): Promise<T | null> => {
    try {
      const cached = await AsyncStorage.getItem(key);
      if (!cached) return null;

      const cacheData: CacheData<T> = JSON.parse(cached);
      
      // Vérifier si le cache est expiré
      if (Date.now() - cacheData.timestamp > CACHE_DURATION) {
        await AsyncStorage.removeItem(key);
        return null;
      }

      return cacheData.data;
    } catch (error) {
      console.error('Erreur cache get:', error);
      return null;
    }
  }, []);

  // Effacer tout le cache
  const clearCache = useCallback(async (): Promise<void> => {
    try {
      await AsyncStorage.multiRemove(Object.values(CACHE_KEYS));
    } catch (error) {
      console.error('Erreur cache clear:', error);
    }
  }, []);

  // Effacer une clé spécifique
  const invalidateCache = useCallback(async (key: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Erreur cache invalidation:', error);
    }
  }, []);

  return {
    setCache,
    getCache,
    clearCache,
    invalidateCache,
    isLoading,
    CACHE_KEYS,
  };
}

export default useContentCache;

