import React, { useEffect, useState, useCallback } from 'react';
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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { api } from '@/services/api';
import * as Haptics from 'expo-haptics';

interface Level {
    _id: string;
    name: 'basique' | 'moyen' | 'avance';
    title: string;
    description: string;
    order: number;
}

interface LevelProgress {
    levelId: string;
    quizPassed: boolean;
    quizScore: number;
}

export default function LevelsSelectionScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    
    // Recuperation securisee du module depuis les params
    const moduleId = params.moduleId as string;
    const moduleTitle = params.moduleTitle as string;

    const [levels, setLevels] = useState<Level[]>([]);
    const [levelProgresses, setLevelProgresses] = useState<LevelProgress[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Verifier si un niveau est debloque
    const isLevelUnlocked = (level: Level): { unlocked: boolean; score: number } => {
        // Le premier niveau est toujours debloque
        if (level.order <= 1) {
            return { unlocked: true, score: 0 };
        }
        
        // Trouver le niveau precedent
        const prevLevel = levels.find(l => l.order === level.order - 1);
        if (!prevLevel) {
            return { unlocked: true, score: 0 };
        }
        
        // Verifier la progression du niveau precedent
        const prevProgress = levelProgresses.find(p => p.levelId === prevLevel._id);
        
        // Le niveau est debloque si le quiz precedent est reussi avec >= 70%
        if (prevProgress && prevProgress.quizPassed && prevProgress.quizScore >= 70) {
            return { unlocked: true, score: prevProgress.quizScore };
        }
        
        return { unlocked: false, score: prevProgress?.quizScore || 0 };
    };

    const loadLevels = useCallback(async () => {
        try {
            setIsLoading(true);
            if (!moduleId) {
                console.warn('Module ID missing');
                setLevels([]);
                return;
            }
            
            console.log('Fetching levels for moduleId:', moduleId);
            
            const response = await api.getLevelsByModule(moduleId);
            console.log('Levels API Response:', response);
            
            // Extraire correctement les niveaux - l'API retourne { levels: [...] }
            let levelsData: Level[] = [];
            if (response && response.levels) {
                levelsData = response.levels;
            } else if (response && Array.isArray(response)) {
                levelsData = response;
            } else if (response && response.data && response.data.levels) {
                levelsData = response.data.levels;
            }
            
            console.log('Levels found:', levelsData.length);
            
            // Trier par ordre
            const sortedLevels = levelsData.sort((a: Level, b: Level) => a.order - b.order);
            setLevels(sortedLevels);
            
            // Charger la progression de l'utilisateur
            try {
                const progressResponse = await api.getUserProgress();
                const progresses = progressResponse?.data?.levels || [];
                setLevelProgresses(progresses);
            } catch (progressError) {
                console.log('No progress found yet');
                setLevelProgresses([]);
            }
            
        } catch (error: any) {
            Alert.alert('Erreur', 'Impossible de charger les niveaux');
            console.error('Erreur:', error);
            setLevels([]);
        } finally {
            setIsLoading(false);
        }
    }, [moduleId]);

    useEffect(() => {
        if (moduleId) {
            loadLevels();
        }
    }, [loadLevels]);

    const handleLevelSelect = (level: Level) => {
        const { unlocked, score } = isLevelUnlocked(level);
        
        if (!unlocked) {
            Alert.alert(
                'Niveau verouille',
                `Vous devez obtenir au moins 70% au quiz du niveau precedent pour debloquer ce niveau.\n\nScore actuel: ${score}%`,
                [{ text: 'OK' }]
            );
            return;
        }
        
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        
        // Demander a l'utilisateur ce qu'il veut faire
        Alert.alert(
            level.title,
            'Voulez-vous passer le quiz de validation ou commencer les lecons?',
            [
                {
                    text: 'Lecons',
                    onPress: () => {
                        router.push({
                            pathname: '/chapters-selection',
                            params: { 
                                levelId: level._id, 
                                levelTitle: level.title,
                                moduleId: moduleId,
                                moduleTitle: moduleTitle
                            }
                        });
                    }
                },
                {
                    text: 'Passer le Quiz',
                    onPress: () => {
                        router.push({
                            pathname: '/quiz',
                            params: { 
                                levelId: level._id, 
                                levelTitle: level.title,
                                moduleId: moduleId,
                                moduleTitle: moduleTitle
                            }
                        });
                    }
                },
                { text: 'Annuler', style: 'cancel' }
            ]
        );
    };

    const getLevelIcon = (levelName: string) => {
        switch (levelName) {
            case 'basique': return '🟢';
            case 'moyen': return '🟡';
            case 'avance': return '🔴';
            default: return '📚';
        }
    };

    const getLevelColor = (name: string) => {
        switch (name) {
            case 'basique': return '#4ADE80';
            case 'moyen': return '#FACC15';
            case 'avance': return '#F87171';
            default: return '#6366F1';
        }
    };

    // Obtenir le badge de progression pour un niveau
    const getLevelBadge = (level: Level): { text: string; color: string } | null => {
        const progress = levelProgresses.find(p => p.levelId === level._id);
        
        if (!progress) {
            return { text: 'Non commence', color: '#9CA3AF' };
        }
        
        if (progress.quizPassed && progress.quizScore >= 70) {
            return { text: `Reussi: ${progress.quizScore}%`, color: '#10B981' };
        }
        
        if (progress.quizScore > 0) {
            return { text: `Score: ${progress.quizScore}%`, color: '#F59E0B' };
        }
        
        return { text: 'En cours', color: '#6366F1' };
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.center}>
                <ActivityIndicator size="large" color="#6366F1" />
                <Text style={styles.loadingText}>Chargement des parcours...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={styles.backButton}
                        accessibilityLabel="Retourner a la selection des modules"
                    >
                        <Text style={styles.backButtonText}>← Retour</Text>
                    </TouchableOpacity>
                    
                    <Text style={styles.moduleName}>{moduleTitle?.toUpperCase()}</Text>
                    <Text style={styles.title}>Choisissez votre niveau</Text>
                    <Text style={styles.subtitle}>
                        Completez le quiz avec 70% pour debloquer le niveau suivant.
                    </Text>
                </View>

                {/* Level Cards */}
                <View style={styles.levelsContainer}>
                    {levels.length > 0 ? (
                        levels.map((level) => {
                            const { unlocked } = isLevelUnlocked(level);
                            const badge = getLevelBadge(level);
                            
                            return (
                                <TouchableOpacity
                                    key={level._id}
                                    style={[
                                        styles.levelCard, 
                                        { borderLeftColor: getLevelColor(level.name), borderLeftWidth: 6 },
                                        !unlocked && styles.levelCardLocked
                                    ]}
                                    onPress={() => handleLevelSelect(level)}
                                    activeOpacity={unlocked ? 0.8 : 1}
                                    accessibilityRole="button"
                                    accessibilityLabel={`${level.title}, ${badge?.text || ''}`}
                                    accessibilityHint={unlocked ? `Ouvre les chapitres du niveau ${level.title}` : 'Niveau verouille'}
                                >
                                    <View style={styles.levelHeader}>
                                        <View style={[styles.iconCircle, !unlocked && styles.iconCircleLocked]}>
                                            <Text style={styles.levelIcon}>
                                                {unlocked ? getLevelIcon(level.name) : '🔒'}
                                            </Text>
                                        </View>
                                        <View style={styles.titleArea}>
                                            <Text style={[styles.levelTitle, !unlocked && styles.textLocked]}>
                                                {level.title}
                                            </Text>
                                            <Text style={styles.difficultyTag}>
                                                {level.name.toUpperCase()}
                                            </Text>
                                        </View>
                                    </View>
                                    
                                    <Text style={[styles.levelDescription, !unlocked && styles.textLocked]}>
                                        {level.description}
                                    </Text>
                                    
                                    <View style={styles.levelFooter}>
                                        <View style={[styles.badgeStatus, { backgroundColor: badge?.color || '#9CA3AF' }]}>
                                            <Text style={styles.badgeStatusText}>{badge?.text}</Text>
                                        </View>
                                        {unlocked && (
                                            <Text style={styles.arrowText}>Commencer →</Text>
                                        )}
                                    </View>
                                </TouchableOpacity>
                            );
                        })
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>Aucun niveau disponible pour ce module.</Text>
                            <Text style={styles.debugText}>Module ID: {moduleId}</Text>
                            <TouchableOpacity onPress={loadLevels} style={styles.retryBtn}>
                                <Text style={styles.retryBtnText}>Reessayer</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' },
    header: {
        paddingHorizontal: 25,
        paddingTop: Platform.OS === 'ios' ? 20 : 40,
        paddingBottom: 25,
        backgroundColor: '#FFFFFF',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    backButton: { marginBottom: 15 },
    backButtonText: { fontSize: 16, color: '#6366F1', fontWeight: 'bold' },
    moduleName: { fontSize: 12, color: '#888', fontWeight: '800', letterSpacing: 1.5, marginBottom: 5 },
    title: { fontSize: 26, fontWeight: 'bold', color: '#1F2937', marginBottom: 8 },
    subtitle: { fontSize: 15, color: '#6B7280', lineHeight: 22 },
    levelsContainer: { padding: 20 },
    levelCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12 },
            android: { elevation: 4 }
        })
    },
    levelCardLocked: {
        backgroundColor: '#F3F4F6',
        borderLeftColor: '#9CA3AF',
    },
    levelHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    iconCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    iconCircleLocked: { backgroundColor: '#E5E7EB' },
    levelIcon: { fontSize: 24 },
    titleArea: { flex: 1 },
    levelTitle: { fontSize: 20, fontWeight: '800', color: '#1F2937' },
    textLocked: { color: '#9CA3AF' },
    difficultyTag: { fontSize: 10, color: '#9CA3AF', fontWeight: 'bold', marginTop: 2 },
    levelDescription: { fontSize: 14, color: '#4B5563', lineHeight: 22, marginBottom: 20 },
    levelFooter: { borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    badgeStatus: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
    badgeStatusText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
    arrowText: { fontSize: 14, color: '#6366F1', fontWeight: 'bold' },
    loadingText: { marginTop: 15, fontSize: 16, color: '#6366F1', fontWeight: '600' },
    emptyContainer: { marginTop: 50, alignItems: 'center' },
    emptyText: { fontSize: 16, color: '#6B7280', textAlign: 'center', marginBottom: 10 },
    debugText: { fontSize: 12, color: '#ccc', marginBottom: 15 },
    retryBtn: { padding: 12, backgroundColor: '#6366F1', borderRadius: 10 },
    retryBtnText: { color: '#fff', fontWeight: 'bold' }
});

