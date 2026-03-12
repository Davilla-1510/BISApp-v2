import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/context/AuthContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { api } from '@/services/api';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState, useCallback } from 'react';
import * as Speech from 'expo-speech';
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Platform
} from 'react-native';

interface Lesson {
  _id: string;
  title: string;
  content: string;
  audioUrl?: string;
  order: number;
  completed?: boolean;
}

export default function LessonsScreen() {
  const router = useRouter();
  const { isAccessibleMode } = useAuth(); 
  const params = useLocalSearchParams<{ chapterId: string; chapterTitle: string }>();
  
  const chapterId = params.chapterId || (params as any).chapterId;
  const chapterTitle = params.chapterTitle || (params as any).chapterTitle || 'Leçons';
  
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const tintColor = useThemeColor({}, 'tint');

  // Fonction pour lire le contenu en audio (utilise expo-speech par défaut)
  const handlePlayAudio = () => {
    if (selectedLesson?.audioUrl) {
      // TODO: Implémenter la lecture audio avec expo-av
      // Pour l'instant on utilise la synthèse vocale
      Speech.speak(selectedLesson.content || "", { language: 'fr' });
    } else {
      Speech.speak(selectedLesson?.content || "", { language: 'fr' });
    }
  };

  const fetchLessons = useCallback(async () => {
    try {
      setLoading(true);
      if (!chapterId) {
        console.warn('Chapter ID missing');
        setLessons([]);
        return;
      }
      
      console.log('Fetching lessons for chapterId:', chapterId);
      
      const response = await api.getLessonsByChapter(chapterId);
      console.log('API Response:', response);
      
      // L'API retourne { lessons: [...] } - extraire correctement
      let lessonsData: Lesson[] = [];
      if (response && response.lessons) {
        lessonsData = response.lessons;
      } else if (response && Array.isArray(response)) {
        lessonsData = response;
      } else if (response && response.data && response.data.lessons) {
        lessonsData = response.data.lessons;
      }
      
      console.log('Lessons found:', lessonsData.length);
      
      // Trier par ordre
      const sortedLessons = lessonsData.sort((a: Lesson, b: Lesson) => a.order - b.order);
      setLessons(sortedLessons);
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Impossible de charger les leçons';
      Alert.alert('Erreur', errorMsg);
      console.error('Fetch lessons error:', error);
      setLessons([]);
    } finally {
      setLoading(false);
    }
  }, [chapterId]);

  useEffect(() => {
    fetchLessons();
    if (isAccessibleMode && chapterTitle) {
      Speech.speak(`Chapitre : ${chapterTitle}. Voici la liste des leçons.`);
    }
  }, [fetchLessons, isAccessibleMode, chapterTitle]);

  const handleLessonPress = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setShowLessonModal(true);
    if (isAccessibleMode) {
      Speech.speak(`Leçon sélectionnée : ${lesson.title}.`);
    }
  };

  const handleCloseModal = () => {
    setShowLessonModal(false);
    Speech.stop();
  };

  const handleGoToExercises = (lessonId: string, lessonTitle: string) => {
    handleCloseModal();
    router.push({
      pathname: '/exercise',
      params: { lessonId, lessonTitle, chapterTitle },
    });
  };

  if (loading) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator size="large" color={tintColor} />
      </ThemedView>
    );
  }

  // Trier les leçons pour l'affichage
  const sortedLessons = [...lessons].sort((a, b) => a.order - b.order);

  return (
    <ThemedView style={styles.container}>
      {/* Header personnalisé */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButtonContainer}>
          <Text style={[styles.backButton, { color: tintColor }]}>← Retour</Text>
        </TouchableOpacity>
        <ThemedText type="title" style={styles.headerTitle}>{chapterTitle}</ThemedText>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {sortedLessons.length === 0 ? (
          <View style={styles.emptyState}>
            <ThemedText style={styles.emptyText}>Aucune leçon trouvée pour ce chapitre.</ThemedText>
            <Text style={styles.debugText}>Chapter ID: {chapterId}</Text>
          </View>
        ) : (
          sortedLessons.map((lesson) => (
            <TouchableOpacity
              key={lesson._id}
              style={[styles.lessonCard, { borderLeftColor: tintColor }]}
              onPress={() => handleLessonPress(lesson)}
              accessibilityRole="button"
              accessibilityLabel={`Leçon: ${lesson.title}`}
            >
              <View style={styles.lessonHeader}>
                <ThemedText type="subtitle" style={styles.lessonTitle}>{lesson.title}</ThemedText>
                {lesson.completed && (
                  <View style={[styles.completedBadge, { backgroundColor: tintColor }]}>
                    <Text style={styles.badgeText}>✓</Text>
                  </View>
                )}
              </View>
              <ThemedText numberOfLines={2} style={styles.lessonPreview}>{lesson.content}</ThemedText>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Modal de Leçon */}
      <Modal visible={showLessonModal} animationType="slide" transparent={false}>
        <ThemedView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={handleCloseModal} style={styles.closeBtn}>
              <Text style={[styles.closeButtonText, { color: tintColor }]}>✕ Fermer</Text>
            </TouchableOpacity>
            <ThemedText type="title" style={styles.modalTitle}>{selectedLesson?.title}</ThemedText>
          </View>

          <ScrollView style={styles.modalContent} contentContainerStyle={styles.modalContentContainer}>
            <TouchableOpacity 
              style={[styles.audioButton, { backgroundColor: tintColor }]} 
              onPress={handlePlayAudio}
            >
              <Text style={styles.audioButtonText}>
                {selectedLesson?.audioUrl ? "🔊 Écouter l'enregistrement" : "🗣️ Lire par synthèse vocale"}
              </Text>
            </TouchableOpacity>

            <ThemedText style={styles.lessonContent}>{selectedLesson?.content}</ThemedText>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={[styles.footerBtn, { backgroundColor: tintColor }]} 
              onPress={() => selectedLesson && handleGoToExercises(selectedLesson._id, selectedLesson.title)}
            >
              <Text style={styles.footerBtnText}>S'ENTRAÎNER (EXERCICES) →</Text>
            </TouchableOpacity>
          </View>
        </ThemedView>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { 
    paddingTop: Platform.OS === 'ios' ? 60 : 40, 
    paddingHorizontal: 20, 
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1, 
    borderBottomColor: '#f0f0f0' 
  },
  backButtonContainer: { marginBottom: 10 },
  backButton: { fontSize: 16, fontWeight: '600' },
  headerTitle: { fontSize: 24, fontWeight: '800' },
  content: { flex: 1 },
  contentContainer: { padding: 20 },
  emptyState: { alignItems: 'center', marginTop: 50 },
  emptyText: { color: '#999', fontSize: 16 },
  debugText: { color: '#ccc', fontSize: 12, marginTop: 10 },
  lessonCard: { 
    backgroundColor: '#fff', 
    padding: 20, 
    borderRadius: 16, 
    marginBottom: 16,
    borderLeftWidth: 5,
    // Styles pour l'ombre (Shadows) compatibles
    ...Platform.select({
        ios: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
        },
        android: {
            elevation: 3,
        },
    }),
  },
  lessonHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  lessonTitle: { fontSize: 18, fontWeight: '700' },
  completedBadge: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  lessonPreview: { color: '#6B7280', fontSize: 14, lineHeight: 20 },
  modalContainer: { flex: 1 },
  modalHeader: { 
    paddingTop: 50, 
    paddingHorizontal: 20, 
    paddingBottom: 20, 
    borderBottomWidth: 1, 
    borderBottomColor: '#eee',
    alignItems: 'center'
  },
  closeBtn: { alignSelf: 'flex-start', marginBottom: 10 },
  closeButtonText: { fontSize: 16, fontWeight: 'bold' },
  modalTitle: { fontSize: 22, fontWeight: 'bold', textAlign: 'center' },
  modalContent: { flex: 1 },
  modalContentContainer: { padding: 25 },
  audioButton: { 
    padding: 18, 
    borderRadius: 12, 
    alignItems: 'center', 
    marginBottom: 25,
    flexDirection: 'row',
    justifyContent: 'center'
  },
  audioButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  lessonContent: { fontSize: 17, lineHeight: 28, color: '#374151' },
  modalFooter: { padding: 20, borderTopWidth: 1, borderTopColor: '#eee' },
  footerBtn: { padding: 20, borderRadius: 16, alignItems: 'center' },
  footerBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 }
});
