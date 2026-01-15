import React, { useEffect, useState } from 'react';
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
import { useRouter, useLocalSearchParams } from 'expo-router'; // ✅ Migration Expo Router
import { api } from '@/services/api'; // ✅ Vérifie le chemin de ton alias @
import * as Haptics from 'expo-haptics'; // ✅ Retour tactile

interface Level {
    _id: string;
    name: 'basique' | 'moyen' | 'avance';
    title: string;
    description: string;
    order: number;
}

export default function LevelsSelectionScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    
    // Récupération sécurisée du module depuis les params
    const moduleId = params.moduleId as string;
    const moduleTitle = params.moduleTitle as string;

    const [levels, setLevels] = useState<Level[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (moduleId) {
            loadLevels();
        }
    }, [moduleId]);

    const loadLevels = async () => {
        try {
            setIsLoading(true);
            const response = await api.getLevelsByModule(moduleId);
            // On s'assure de trier par l'ordre défini en base
            const sortedLevels = (response.levels || []).sort((a: Level, b: Level) => a.order - b.order);
            setLevels(sortedLevels);
        } catch (error: any) {
            Alert.alert('Erreur', 'Impossible de charger les niveaux');
            console.error('Erreur:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLevelSelect = (level: Level) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        router.push({
            pathname: '/chapters-selection', // ✅ Ajuste le chemin selon ton dossier
            params: { 
                levelId: level._id, 
                levelTitle: level.title,
                moduleId: moduleId,
                moduleTitle: moduleTitle
            }
        });
    };

    const getLevelIcon = (levelName: string) => {
        switch (levelName) {
            case 'basique': return '🟢';
            case 'moyen': return '🟡';
            case 'avance': return '🔴';
            default: return '📚';
        }
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.center}>
                <ActivityIndicator size="large" color="#6366F1" />
                <Text style={styles.loadingText}>Chargement des parcours...</Text>
            </SafeAreaView>
        );
    }
    const getLevelColor = (name: string) => {
    switch (name) {
        case 'basique': return '#4ADE80';
        case 'moyen': return '#FACC15';
        case 'avance': return '#F87171';
        default: return '#6366F1';
    }
};

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={styles.backButton}
                        accessibilityLabel="Retourner à la sélection des modules"
                    >
                        <Text style={styles.backButtonText}>← Retour</Text>
                    </TouchableOpacity>
                    
                    <Text style={styles.moduleName}>{moduleTitle?.toUpperCase()}</Text>
                    <Text style={styles.title}>Choisissez votre niveau</Text>
                    <Text style={styles.subtitle}>
                        Chaque niveau contient des chapitres adaptés à votre progression.
                    </Text>
                </View>

                {/* Level Cards */}
                <View style={styles.levelsContainer}>
                    {levels.length > 0 ? (
                        levels.map((level) => (
                           // 2. Dans ton rendu (JSX)
<TouchableOpacity
    key={level._id}
    style={[
        styles.levelCard, 
        { borderLeftColor: getLevelColor(level.name), borderLeftWidth: 6 } // Style dynamique direct
    ]}
    onPress={() => handleLevelSelect(level)}
    activeOpacity={0.8}
    accessibilityRole="button"
    accessibilityHint={`Ouvre les chapitres du niveau ${level.title}`}
>
                                <View style={styles.levelHeader}>
                                    <View style={styles.iconCircle}>
                                        <Text style={styles.levelIcon}>
                                            {getLevelIcon(level.name)}
                                        </Text>
                                    </View>
                                    <View style={styles.titleArea}>
                                        <Text style={styles.levelTitle}>{level.title}</Text>
                                        <Text style={styles.difficultyTag}>
                                            {level.name.toUpperCase()}
                                        </Text>
                                    </View>
                                </View>
                                
                                <Text style={styles.levelDescription}>
                                    {level.description}
                                </Text>
                                
                                <View style={styles.levelFooter}>
                                    <Text style={styles.arrowText}>Explorer ce niveau →</Text>
                                </View>
                            </TouchableOpacity>
                        ))
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>Aucun niveau disponible pour ce module.</Text>
                            <TouchableOpacity onPress={loadLevels} style={styles.retryBtn}>
                                <Text style={styles.retryBtnText}>Réessayer</Text>
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
    // Styles spécifiques par niveau (optionnel pour la couleur de bordure)
    card_basique: { borderLeftWidth: 6, borderLeftColor: '#4ADE80' },
    card_moyen: { borderLeftWidth: 6, borderLeftColor: '#FACC15' },
    card_avance: { borderLeftWidth: 6, borderLeftColor: '#F87171' },
    
    levelHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    iconCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    levelIcon: { fontSize: 24 },
    titleArea: { flex: 1 },
    levelTitle: { fontSize: 20, fontWeight: '800', color: '#1F2937' },
    difficultyTag: { fontSize: 10, color: '#9CA3AF', fontWeight: 'bold', marginTop: 2 },
    levelDescription: { fontSize: 14, color: '#4B5563', lineHeight: 22, marginBottom: 20 },
    levelFooter: { borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 15, alignItems: 'flex-end' },
    arrowText: { fontSize: 14, color: '#6366F1', fontWeight: 'bold' },
    loadingText: { marginTop: 15, fontSize: 16, color: '#6366F1', fontWeight: '600' },
    emptyContainer: { marginTop: 50, alignItems: 'center' },
    emptyText: { fontSize: 16, color: '#6B7280', textAlign: 'center', marginBottom: 20 },
    retryBtn: { padding: 12, backgroundColor: '#6366F1', borderRadius: 10 },
    retryBtnText: { color: '#fff', fontWeight: 'bold' }
});