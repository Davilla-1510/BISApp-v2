import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/context/AuthContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { api } from '@/services/api';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState, useCallback } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    RefreshControl // ✅ Ajouté pour permettre de rafraîchir la liste
} from 'react-native';

interface Chapter {
  _id: string;
  title: string;
  description: string;
  order: number;
  lessonsCount?: number;
}

export default function ChaptersSelectionScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { levelId, levelName } = useLocalSearchParams<{ levelId: string; levelName: string }>();
  
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); // ✅ État pour le "Pull to refresh"
  const tintColor = useThemeColor({}, 'tint');

  // ✅ Utilisation de useCallback pour éviter les re-renders inutiles
  const fetchChapters = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      if (!levelId) {
        console.warn('Level ID missing');
        return;
      }
      const response = await api.getChaptersByLevel(levelId);
      // ✅ Tri des chapitres directement à la réception
      const sortedChapters = (response || []).sort((a: Chapter, b: Chapter) => a.order - b.order);
      setChapters(sortedChapters);
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Impossible de charger les chapitres';
      Alert.alert('Erreur', errorMsg);
      console.error('Fetch chapters error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [levelId]);

  useEffect(() => {
    fetchChapters();
  }, [fetchChapters]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchChapters(true);
  };

  const handleChapterSelect = (chapterId: string, chapterTitle: string) => {
    router.push({
      pathname: '/lessons', // ✅ Assure-toi que le fichier est bien app/lessons.tsx ou app/lessons/index.tsx
      params: {
        chapterId,
        chapterTitle,
        levelName,
      },
    });
  };

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={tintColor} />
        <ThemedText style={{ marginTop: 10 }}>Chargement des chapitres...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Retour"
        >
          <Text style={[styles.backButton, { color: tintColor }]}>← Retour</Text>
        </TouchableOpacity>
        <ThemedText type="title" style={styles.headerTitle}>
          {levelName || 'Chapitres'}
        </ThemedText>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={tintColor} />
        }
      >
        {chapters.length === 0 ? (
          <View style={styles.emptyState}>
            <ThemedText style={styles.emptyText}>Aucun chapitre trouvé pour ce niveau.</ThemedText>
            <TouchableOpacity onPress={() => fetchChapters()} style={styles.retryButton}>
                <Text style={{color: tintColor}}>Réessayer</Text>
            </TouchableOpacity>
          </View>
        ) : (
          chapters.map((chapter) => (
            <TouchableOpacity
              key={chapter._id}
              style={[styles.chapterCard, { borderLeftColor: tintColor }]}
              onPress={() => handleChapterSelect(chapter._id, chapter.title)}
              accessibilityRole="button"
              accessibilityLabel={`${chapter.title}, ${chapter.lessonsCount || 0} leçons`}
            >
              <View style={styles.chapterHeader}>
                <ThemedText type="subtitle" style={styles.chapterTitle}>
                  {chapter.title}
                </ThemedText>
                <View style={[styles.badge, { backgroundColor: tintColor }]}>
                  <Text style={styles.badgeText}>
                    {chapter.lessonsCount || 0} leçons
                  </Text>
                </View>
              </View>
              
              <ThemedText style={styles.chapterDescription} numberOfLines={2}>
                {chapter.description}
              </ThemedText>
              
              <Text style={[styles.arrow, { color: tintColor }]}>›</Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    paddingHorizontal: 20,
    paddingTop: 50, // ✅ Ajusté pour éviter l'encoche (Notch)
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: { fontSize: 22, fontWeight: '700', marginTop: 10 },
  backButton: { fontSize: 16, fontWeight: '600' },
  content: { flex: 1 },
  contentContainer: { padding: 16, paddingBottom: 30 },
  chapterCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 5,
    // Ombre pour iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Ombre pour Android
    elevation: 3,
  },
  chapterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    paddingRight: 20,
  },
  chapterTitle: { fontSize: 18, fontWeight: 'bold', flex: 1 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  chapterDescription: { fontSize: 14, color: '#666', lineHeight: 20 },
  arrow: { position: 'absolute', right: 15, bottom: 15, fontSize: 24 },
  emptyState: { alignItems: 'center', marginTop: 50 },
  emptyText: { color: '#999', fontSize: 16 },
  retryButton: { marginTop: 15, padding: 10 }
});