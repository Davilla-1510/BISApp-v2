import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/context/AuthContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { api } from '@/services/api';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';


interface ModuleProgress {

  moduleId: string;

  moduleName: string;

  completionPercentage: number;

  chaptersCompleted: number;

  chaptersTotal: number;

  lessonsCompleted: number;

  lessonsTotal: number;

  exercisesCompleted: number;

  exercisesTotal: number;

}


interface LevelProgress {

  levelId: string;

  levelName: string;

  completed: boolean;

  quizPassed: boolean;

  quizScore?: number;

}



interface UserStats {

  totalLessonsCompleted: number;

  totalExercisesCompleted: number;

  totalQuizzesCompleted: number;

  averageScore: number;

  timeSpentHours: number;

}

export default function DashboardScreen() {
    const router = useRouter();
    const { user, logout } = useAuth();
     const [moduleProgresses, setModuleProgresses] = useState<ModuleProgress[]>([]);
    const [levelProgresses, setLevelProgresses] = useState<LevelProgress[]>([]);
    const [userStats, setUserStats] = useState<UserStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const tintColor = useThemeColor({}, 'tint');

    const fetchDashboardData = async (isRefreshing = false) => {
        try {
            if (!isRefreshing) setLoading(true);
            const [progresses, stats] = await Promise.all([
                api.getUserProgress(),
                api.getUserStats(),
            ]);
            
            // Sécurité pour éviter de mapper sur du undefined
            setModuleProgresses(progresses?.data?.modules || []);
            setLevelProgresses(progresses?.data?.levels || []);
            setUserStats(stats?.data || null);
        } catch (error: any) {
            console.error('Fetch dashboard error:', error);
            // On ne déclenche l'alerte que si ce n'est pas un rafraîchissement silencieux
            if (!isRefreshing) {
                Alert.alert('Erreur', 'Impossible de charger votre tableau de bord');
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchDashboardData();
        }, [])
    );

    const handleRefresh = () => {
        setRefreshing(true);
        fetchDashboardData(true);
    };

    const handleLogout = () => {
        Alert.alert('Déconnexion', 'Êtes-vous sûr de vouloir vous déconnecter?', [
            { text: 'Annuler', style: 'cancel' },
            {
                text: 'Déconnecter',
                onPress: async () => {
                    try {
                        await logout();
                        // ✅ Correction du chemin de navigation
                        router.replace('/login'); 
                    } catch (error) {
                        Alert.alert('Erreur', 'Impossible de se déconnecter');
                    }
                },
                style: 'destructive',
            },
        ]);
    };

    const getProgressColor = (percentage: number) => {
        if (percentage >= 100) return '#51cf66';
        if (percentage >= 70) return '#ffd43b';
        if (percentage >= 40) return '#ff922b';
        return '#ff6b6b';
    };

    if (loading && !refreshing) {
        return (
            <ThemedView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={tintColor} />
            </ThemedView>
        );
    }

    return (
        <ThemedView style={styles.container}>
            {/* Header avec Padding Top pour Notch */}
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <ThemedText type="title" style={styles.headerTitle}>
                        Bonjour, {user?.firstName || 'Ami'}
                    </ThemedText>
                    <ThemedText style={styles.headerSubtitle}>
                        Heureux de vous revoir !
                    </ThemedText>
                </View>
                <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                    <Text style={{ color: tintColor, fontWeight: '600' }}>Quitter</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.contentContainer}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={tintColor} />
                }
            >
                {/* Section Stats - Plus visuelle */}
                {userStats && (
                    <View style={styles.statsGrid}>
                        <StatCard icon="📚" label="Leçons" value={userStats.totalLessonsCompleted} color={tintColor} />
                        <StatCard icon="✏️" label="Exercices" value={userStats.totalExercisesCompleted} color={tintColor} />
                        <StatCard icon="📋" label="Quiz" value={userStats.totalQuizzesCompleted} color={tintColor} />
                        <StatCard icon="⏱️" label="Heures" value={`${userStats.timeSpentHours}h`} color={tintColor} />
                    </View>
                )}

                {/* Modules Progress */}
                <ThemedText type="subtitle" style={styles.sectionTitle}>Votre Progression</ThemedText>
                
                {moduleProgresses.length === 0 ? (
                    <View style={styles.emptyCard}>
                        <ThemedText>Aucune activité récente. Commencez un module !</ThemedText>
                    </View>
                ) : (
                    moduleProgresses.map((module) => (
                        <TouchableOpacity 
                            key={module.moduleId} 
                            style={styles.moduleCard}
                            onPress={() => router.push('/levels-selection')}
                        >
                            <View style={styles.moduleHeader}>
                                <ThemedText style={styles.moduleTitle}>{module.moduleName}</ThemedText>
                                <View style={[styles.badge, { backgroundColor: getProgressColor(module.completionPercentage) }]}>
                                    <Text style={styles.badgeText}>{Math.round(module.completionPercentage)}%</Text>
                                </View>
                            </View>
                            <View style={styles.progressBar}>
                                <View style={[styles.progressFill, { 
                                    width: `${module.completionPercentage}%`, 
                                    backgroundColor: getProgressColor(module.completionPercentage) 
                                }]} />
                            </View>
                        </TouchableOpacity>
                    ))
                )}

                <TouchableOpacity
                    style={[styles.ctaButton, { backgroundColor: tintColor }]}
                    onPress={() => router.push('/modules-selection')}
                >
                    <Text style={styles.ctaButtonText}>Continuer l'Apprentissage</Text>
                </TouchableOpacity>
            </ScrollView>
        </ThemedView>
    );
}

// Composant interne pour les petites cartes de stats
const StatCard = ({ icon, label, value, color }: any) => (
    <View style={[styles.statCard, { borderTopColor: color }]}>
        <Text style={styles.statIcon}>{icon}</Text>
        <ThemedText style={styles.statValue}>{value}</ThemedText>
        <ThemedText style={styles.statLabel}>{label}</ThemedText>
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 20,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0'
    },
    headerContent: { flex: 1 },
    headerTitle: { fontSize: 22, fontWeight: 'bold' },
    headerSubtitle: { fontSize: 14, color: '#666' },
    logoutButton: { padding: 10 },
    content: { flex: 1 },
    contentContainer: { padding: 20, gap: 20 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    statCard: {
        flex: 1,
        minWidth: '45%',
        backgroundColor: '#F8F9FA',
        padding: 15,
        borderRadius: 15,
        alignItems: 'center',
        borderTopWidth: 4,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5,
    },
    statIcon: { fontSize: 24, marginBottom: 5 },
    statValue: { fontSize: 18, fontWeight: 'bold' },
    statLabel: { fontSize: 12, color: '#888' },
    moduleCard: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#eee',
        marginBottom: 10
    },
    moduleHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    moduleTitle: { fontWeight: 'bold', flex: 1 },
    badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
    badgeText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
    progressBar: { height: 6, backgroundColor: '#eee', borderRadius: 3, overflow: 'hidden' },
    progressFill: { height: '100%' },
    ctaButton: { padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
    ctaButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    emptyCard: { padding: 20, alignItems: 'center', backgroundColor: '#f9f9f9', borderRadius: 10 }
});