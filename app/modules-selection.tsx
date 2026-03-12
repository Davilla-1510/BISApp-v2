
import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
    ActivityIndicator,
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { api } from '@/services/api';
import * as Haptics from 'expo-haptics';
import useContentCache from '@/hooks/useContentCache';

interface Module {
  _id: string;
  name: 'braille' | 'informatique';
  title: string;
  description: string;
  icon: string;
}

const ModulesSelectionScreen = () => {
  const router = useRouter();
  const [modules, setModules] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Cache hook
  const { getCache, setCache, CACHE_KEYS } = useContentCache();
  
  // Use ref to track if we've fetched
  const hasFetchedRef = useRef(false);

  const loadModules = useCallback(async () => {
    // Prevent multiple fetches
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    
    try {
      setIsLoading(true);
      
      // Try to get from cache first
      const cachedModules = await getCache<Module[]>(CACHE_KEYS.MODULES);
      if (cachedModules && cachedModules.length > 0) {
        console.log('Using cached modules:', cachedModules.length);
        setModules(cachedModules);
        setIsLoading(false);
        return;
      }
      
      // Fetch from API if not in cache
      const response = await api.getModules();
      console.log('Modules API Response:', response);
      
      // Extraire correctement les modules - l'API retourne { modules: [...] }
      let modulesData: Module[] = [];
      if (response && response.modules) {
        modulesData = response.modules;
      } else if (response && Array.isArray(response)) {
        modulesData = response;
      } else if (response && response.data && response.data.modules) {
        modulesData = response.data.modules;
      }
      
      console.log('Modules found:', modulesData.length);
      setModules(modulesData);
      
      // Save to cache
      await setCache(CACHE_KEYS.MODULES, modulesData);
    } catch (error: any) {
      Alert.alert('Erreur', 'Impossible de charger les modules');
      console.error('Erreur API Modules:', error);
      setModules([]);
    } finally {
      setIsLoading(false);
    }
  }, [getCache, setCache, CACHE_KEYS]);

  useEffect(() => {
    if (!hasFetchedRef.current) {
      loadModules();
    }
  }, [loadModules]);

  const handleModuleSelect = (module: Module) => {
    Haptics.selectionAsync();
    router.push({
      pathname: '/levels-selection',
      params: { 
        moduleId: module._id,
        moduleTitle: module.title 
      }
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Préparation des modules...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Header avec bouton retour typé Expo Router */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            accessibilityLabel="Retour à l'accueil"
            accessibilityRole="button"
          >
            <Text style={styles.backButtonText}>← Retour</Text>
          </TouchableOpacity>
          <Text style={styles.title} accessibilityRole="header">Choisir un Module</Text>
          <Text style={styles.subtitle}>
            Sélectionnez le domaine que vous souhaitez explorer aujourd'hui.
          </Text>
        </View>

        {/* Liste des Modules */}
        <View style={styles.modulesContainer}>
          {modules.length > 0 ? (
            modules.map((module) => (
              <TouchableOpacity
                key={module._id}
                style={styles.moduleCard}
                onPress={() => handleModuleSelect(module)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={`Module ${module.title}. ${module.description}`}
                accessibilityHint="Double-cliquez pour voir les niveaux de ce module"
              >
                <View style={styles.moduleIconContainer}>
                  <Text style={styles.moduleIcon}>{module.icon || '📚'}</Text>
                </View>
                
                <View style={styles.moduleContent}>
                  <Text style={styles.moduleTitle}>{module.title}</Text>
                  <Text style={styles.moduleDescription} numberOfLines={2}>
                    {module.description}
                  </Text>
                </View>

                <View style={styles.arrowContainer}>
                   <Text style={styles.arrow}>→</Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Aucun module n'est disponible pour le moment.</Text>
              <TouchableOpacity onPress={loadModules} style={styles.retryButton}>
                <Text style={styles.retryText}>Actualiser</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB'
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  scrollContent: {
    paddingBottom: 30
  },
  header: {
    paddingHorizontal: 25,
    paddingVertical: 30,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10 },
      android: { elevation: 3 }
    })
  },
  backButton: {
    marginBottom: 15
  },
  backButtonText: {
    fontSize: 16,
    color: '#6366F1',
    fontWeight: 'bold'
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 22
  },
  modulesContainer: {
    paddingHorizontal: 20,
    paddingTop: 25
  },
  moduleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 },
      android: { elevation: 2 }
    })
  },
  moduleIconContainer: {
    width: 65,
    height: 65,
    borderRadius: 16,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16
  },
  moduleIcon: {
    fontSize: 32
  },
  moduleContent: {
    flex: 1
  },
  moduleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4
  },
  moduleDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18
  },
  arrowContainer: {
    marginLeft: 10
  },
  arrow: {
    fontSize: 20,
    color: '#6366F1',
    fontWeight: 'bold'
  },
  loadingText: {
    marginTop: 15,
    fontSize: 15,
    color: '#6366F1',
    fontWeight: '600'
  },
  emptyContainer: {
    marginTop: 60,
    alignItems: 'center'
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center'
  },
  retryButton: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#EEF2FF',
    borderRadius: 10
  },
  retryText: {
    color: '#6366F1',
    fontWeight: 'bold'
  }
});

export default ModulesSelectionScreen;

