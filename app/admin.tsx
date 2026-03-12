/**
 * =====================================================
 * ECRAN D'ADMINISTRATION - BISApp
 * =====================================================
 * 
 * Cet écran permet aux administrateurs de gérer:
 * - Modules
 * - Niveaux
 * - Chapitres
 * - Leçons
 * - Exercices
 * - Quiz
 * 
 * Accessible uniquement pour les utilisateurs avec role: 'admin'
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Alert,
  TextInput,
  Modal,
  FlatList,
  Platform
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

// Types
interface Module {
  _id: string;
  name: string;
  title: string;
  description: string;
  icon: string;
}

interface Level {
  _id: string;
  module: string;
  name: string;
  title: string;
  description: string;
  order: number;
}

interface Chapter {
  _id: string;
  level: string;
  title: string;
  description: string;
  order: number;
}

interface Lesson {
  _id: string;
  chapter: string;
  title: string;
  content: string;
  order: number;
}

interface Exercise {
  _id: string;
  lesson: string;
  title: string;
  type: string;
  question: string;
  order: number;
}

interface Quiz {
  _id: string;
  level: string;
  title: string;
  description: string;
  passingScore: number;
}

interface Stats {
  totalUsers: number;
  totalModules: number;
  totalChapters: number;
  totalLessons: number;
  totalExercises: number;
}

type TabType = 'stats' | 'modules' | 'levels' | 'chapters' | 'lessons' | 'exercises' | 'quiz';

const AdminScreen = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('stats');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  
  // Data states
  const [modules, setModules] = useState<Module[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);

  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});

  // Check if user is admin
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      Alert.alert(
        'Accès refusé',
        'Vous devez être administrateur pour accéder à cette page.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    }
  }, [user]);

  // Load data based on active tab
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case 'stats':
          const statsRes = await api.getAdminStats();
          setStats(statsRes.data?.stats || statsRes.stats);
          break;
        case 'modules':
          const modsRes = await api.getModules();
          setModules(modsRes.modules || []);
          break;
        case 'levels':
          if (modules.length > 0) {
            const levsRes = await api.getLevelsByModule(modules[0]._id);
            setLevels(levsRes.levels || []);
          }
          break;
        case 'chapters':
          if (levels.length > 0) {
            const chapRes = await api.getChaptersByLevel(levels[0]._id);
            setChapters(chapRes.chapters || []);
          }
          break;
        case 'lessons':
          if (chapters.length > 0) {
            const lessRes = await api.getLessonsByChapter(chapters[0]._id);
            setLessons(lessRes.lessons || []);
          }
          break;
        case 'exercises':
          if (lessons.length > 0) {
            const exoRes = await api.getExercisesByLesson(lessons[0]._id);
            setExercises(exoRes.exercises || []);
          }
          break;
        case 'quiz':
          if (levels.length > 0) {
            const quizRes = await api.getQuizByLevel(levels[0]._id);
            setQuizzes(quizRes.quiz ? [quizRes.quiz] : []);
          }
          break;
      }
    } catch (error) {
      console.error('Erreur chargement:', error);
    } finally {
      setLoading(false);
    }
  }, [activeTab, modules, levels, chapters, lessons]);

  useEffect(() => {
    if (user?.role === 'admin') {
      loadData();
    }
  }, [loadData, user]);

  // CRUD Operations
  const handleCreate = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case 'modules':
          await api.createModule(formData);
          break;
        case 'levels':
          await api.createLevel(formData);
          break;
        case 'chapters':
          await api.createChapter(formData);
          break;
        case 'lessons':
          await api.createLesson(formData);
          break;
        case 'exercises':
          await api.createExercise(formData);
          break;
        case 'quiz':
          await api.createQuiz(formData);
          break;
      }
      Alert.alert('Succès', 'Élément créé avec succès');
      setModalVisible(false);
      loadData();
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const id = editingItem._id;
      switch (activeTab) {
        case 'modules':
          await api.updateModule(id, formData);
          break;
        case 'levels':
          await api.updateLevel(id, formData);
          break;
        case 'chapters':
          await api.updateChapter(id, formData);
          break;
        case 'lessons':
          await api.updateLesson(id, formData);
          break;
        case 'exercises':
          await api.updateExercise(id, formData);
          break;
        case 'quiz':
          await api.updateQuiz(id, formData);
          break;
      }
      Alert.alert('Succès', 'Élément mis à jour');
      setModalVisible(false);
      loadData();
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (item: any) => {
    Alert.alert(
      'Confirmer la suppression',
      'Êtes-vous sûr de vouloir supprimer cet élément?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              const id = item._id;
              switch (activeTab) {
                case 'modules':
                  await api.deleteModule(id);
                  break;
                case 'levels':
                  await api.deleteLevel(id);
                  break;
                case 'chapters':
                  await api.deleteChapter(id);
                  break;
                case 'lessons':
                  await api.deleteLesson(id);
                  break;
                case 'exercises':
                  await api.deleteExercise(id);
                  break;
                case 'quiz':
                  await api.deleteQuiz(id);
                  break;
              }
              Alert.alert('Succès', 'Élément supprimé');
              loadData();
            } catch (error: any) {
              Alert.alert('Erreur', error.message || 'Erreur lors de la suppression');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const openModal = (item?: any) => {
    if (item) {
      setEditingItem(item);
      setFormData(item);
    } else {
      setEditingItem(null);
      setFormData({});
    }
    setModalVisible(true);
  };

  const getFormFields = () => {
    switch (activeTab) {
      case 'modules':
        return [
          { key: 'name', label: 'Nom (braille/informatique)', placeholder: 'braille' },
          { key: 'title', label: 'Titre', placeholder: 'Alphabet Braille' },
          { key: 'description', label: 'Description', placeholder: 'Description du module' },
          { key: 'icon', label: 'Icône', placeholder: 'book' }
        ];
      case 'levels':
        return [
          { key: 'module', label: 'ID Module', placeholder: 'ID du module parent' },
          { key: 'name', label: 'Nom (basique/moyen/avance)', placeholder: 'basique' },
          { key: 'title', label: 'Titre', placeholder: 'Titre du niveau' },
          { key: 'description', label: 'Description', placeholder: 'Description' },
          { key: 'order', label: 'Ordre', placeholder: '1', keyboardType: 'numeric' }
        ];
      case 'chapters':
        return [
          { key: 'level', label: 'ID Niveau', placeholder: 'ID du niveau parent' },
          { key: 'title', label: 'Titre', placeholder: 'Titre du chapitre' },
          { key: 'description', label: 'Description', placeholder: 'Description' },
          { key: 'order', label: 'Ordre', placeholder: '1', keyboardType: 'numeric' }
        ];
      case 'lessons':
        return [
          { key: 'chapter', label: 'ID Chapitre', placeholder: 'ID du chapitre parent' },
          { key: 'title', label: 'Titre', placeholder: 'Titre de la leçon' },
          { key: 'content', label: 'Contenu', placeholder: 'Contenu de la leçon', multiline: true },
          { key: 'order', label: 'Ordre', placeholder: '1', keyboardType: 'numeric' }
        ];
      case 'exercises':
        return [
          { key: 'lesson', label: 'ID Leçon', placeholder: 'ID de la leçon parente' },
          { key: 'title', label: 'Titre', placeholder: 'Titre de l\'exercice' },
          { key: 'type', label: 'Type', placeholder: 'multiple-choice' },
          { key: 'question', label: 'Question', placeholder: 'La question' },
          { key: 'correctAnswer', label: 'Réponse', placeholder: 'La réponse correcte' },
          { key: 'order', label: 'Ordre', placeholder: '1', keyboardType: 'numeric' }
        ];
      case 'quiz':
        return [
          { key: 'level', label: 'ID Niveau', placeholder: 'ID du niveau' },
          { key: 'title', label: 'Titre', placeholder: 'Titre du quiz' },
          { key: 'description', label: 'Description', placeholder: 'Description' },
          { key: 'passingScore', label: 'Score de passage', placeholder: '70', keyboardType: 'numeric' }
        ];
      default:
        return [];
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.itemCard}>
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle}>{item.title || item.name || item.question}</Text>
        <Text style={styles.itemSubtitle}>{item.description || item.content?.substring(0, 50) + '...'}</Text>
      </View>
      <View style={styles.itemActions}>
        <TouchableOpacity onPress={() => openModal(item)} style={styles.actionButton}>
          <MaterialCommunityIcons name="pencil" size={20} color="#6366F1" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item)} style={styles.actionButton}>
          <MaterialCommunityIcons name="delete" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStats = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statBox}>
        <Text style={styles.statNumber}>{stats?.totalUsers || 0}</Text>
        <Text style={styles.statLabel}>Utilisateurs</Text>
      </View>
      <View style={styles.statBox}>
        <Text style={styles.statNumber}>{stats?.totalModules || 0}</Text>
        <Text style={styles.statLabel}>Modules</Text>
      </View>
      <View style={styles.statBox}>
        <Text style={styles.statNumber}>{stats?.totalChapters || 0}</Text>
        <Text style={styles.statLabel}>Chapitres</Text>
      </View>
      <View style={styles.statBox}>
        <Text style={styles.statNumber}>{stats?.totalLessons || 0}</Text>
        <Text style={styles.statLabel}>Leçons</Text>
      </View>
      <View style={styles.statBox}>
        <Text style={styles.statNumber}>{stats?.totalExercises || 0}</Text>
        <Text style={styles.statLabel}>Exercices</Text>
      </View>
    </View>
  );

  const tabs = [
    { key: 'stats', label: '📊 Stats', icon: 'chart-bar' },
    { key: 'modules', label: '📚 Modules', icon: 'book' },
    { key: 'levels', label: '🎯 Niveaux', icon: 'layers' },
    { key: 'chapters', label: '📖 Chapitres', icon: 'book-open-page-variant' },
    { key: 'lessons', label: '📝 Leçons', icon: 'note-text' },
    { key: 'exercises', label: '✏️ Exercices', icon: 'pencil' },
    { key: 'quiz', label: '❓ Quiz', icon: 'help-circle' },
  ];

  const getCurrentData = () => {
    switch (activeTab) {
      case 'modules': return modules;
      case 'levels': return levels;
      case 'chapters': return chapters;
      case 'lessons': return lessons;
      case 'exercises': return exercises;
      case 'quiz': return quizzes;
      default: return [];
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#6366F1" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Administration</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.activeTab]}
            onPress={() => setActiveTab(tab.key as TabType)}
          >
            <MaterialCommunityIcons
              name={tab.icon as any}
              size={18}
              color={activeTab === tab.key ? '#6366F1' : '#666'}
            />
            <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content */}
      <View style={styles.content}>
        {activeTab === 'stats' ? (
          renderStats()
        ) : (
          <>
            <TouchableOpacity style={styles.addButton} onPress={() => openModal()}>
              <MaterialCommunityIcons name="plus" size={20} color="#fff" />
              <Text style={styles.addButtonText}>Ajouter</Text>
            </TouchableOpacity>

            {loading ? (
              <ActivityIndicator size="large" color="#6366F1" style={styles.loader} />
            ) : (
              <FlatList
                data={getCurrentData()}
                keyExtractor={(item) => item._id}
                renderItem={renderItem}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>Aucun élément</Text>
                }
              />
            )}
          </>
        )}
      </View>

      {/* Modal Form */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingItem ? 'Modifier' : 'Créer'} - {activeTab}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView>
              {getFormFields().map((field) => (
                <View key={field.key} style={styles.formGroup}>
                  <Text style={styles.formLabel}>{field.label}</Text>
                  <TextInput
                    style={[styles.formInput, field.multiline && styles.formTextArea]}
                    value={formData[field.key] || ''}
                    onChangeText={(text) => setFormData({ ...formData, [field.key]: text })}
                    placeholder={field.placeholder}
                    placeholderTextColor="#999"
                    keyboardType={field.keyboardType as any}
                    multiline={field.multiline}
                  />
                </View>
              ))}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={editingItem ? handleUpdate : handleCreate}
              >
                <Text style={styles.submitButtonText}>
                  {editingItem ? 'Mettre à jour' : 'Créer'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#6366F1',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  tabsContainer: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  activeTab: {
    backgroundColor: '#EEF2FF',
  },
  tabText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 5,
  },
  activeTabText: {
    color: '#6366F1',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statBox: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#6366F1',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366F1',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  loader: {
    marginTop: 20,
  },
  itemCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  itemSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 3,
  },
  itemActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 5,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 30,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  formGroup: {
    marginBottom: 15,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
    color: '#374151',
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
  },
  formTextArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
  },
  submitButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#6366F1',
    marginLeft: 10,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default AdminScreen;
