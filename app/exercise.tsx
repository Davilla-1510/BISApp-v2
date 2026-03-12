import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/context/AuthContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { api } from '@/services/api';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useState, useCallback } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    KeyboardAvoidingView,
    Platform
} from 'react-native';

interface ExerciseOption {
    text: string;
    isCorrect: boolean;
    _id?: string;
}

interface Exercise {
    _id: string;
    type: 'text' | 'multiple-choice' | 'braille-conversion' | 'matching';
    question: string;
    content: string;
    options?: ExerciseOption[];
    correctAnswer: string | string[];
    maxAttempts: number;
    order: number;
}

interface ExerciseResult {
    exerciseId: string;
    correct: boolean;
    attempts: number;
}

export default function ExerciseScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ lessonId: string; lessonTitle: string; chapterId?: string }>();
    
    const lessonId = params.lessonId || (params as any).lessonId;
    const lessonTitle = params.lessonTitle || (params as any).lessonTitle || 'Exercice';
    const chapterId = params.chapterId || (params as any).chapterId;
    
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
    const [userAnswer, setUserAnswer] = useState('');
    const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
    const [attempts, setAttempts] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [showResult, setShowResult] = useState(false);
    const [resultMessage, setResultMessage] = useState('');
    const [resultSuccess, setResultSuccess] = useState(false);
    
    // Score tracking
    const [exerciseResults, setExerciseResults] = useState<ExerciseResult[]>([]);
    const [showLessonSummary, setShowLessonSummary] = useState(false);
    const [nextLessonId, setNextLessonId] = useState<string | null>(null);
    // Add a key to force re-render
    const [exerciseKey, setExerciseKey] = useState(0);

    const tintColor = useThemeColor({}, 'tint');

    const fetchExercises = useCallback(async () => {
        try {
            setLoading(true);
            if (!lessonId) {
                console.warn('Lesson ID missing');
                setExercises([]);
                return;
            }
            
            console.log('Fetching exercises for lessonId:', lessonId);
            
            const response = await api.getExercisesByLesson(lessonId);
            console.log('Exercises API Response:', response);
            
            // L'API retourne { exercises: [...] } - extraire correctement
            let exercisesData: Exercise[] = [];
            if (response && response.exercises) {
                exercisesData = response.exercises;
            } else if (response && Array.isArray(response)) {
                exercisesData = response;
            } else if (response && response.data && response.data.exercises) {
                exercisesData = response.data.exercises;
            }
            
            console.log('Exercises found:', exercisesData.length);
            
            // Trier par ordre
            const sortedExercises = exercisesData.sort((a: Exercise, b: Exercise) => a.order - b.order);
            setExercises(sortedExercises);
            
            // Reset results
            setExerciseResults([]);
            setShowLessonSummary(false);
            setCurrentExerciseIndex(0);
            setAttempts(0);
            setUserAnswer('');
            setSelectedOptions([]);
            setExerciseKey(0);
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || 'Impossible de charger les exercices';
            Alert.alert('Erreur', errorMsg);
            console.error('Fetch exercises error:', error);
            setExercises([]);
        } finally {
            setLoading(false);
        }
    }, [lessonId]);

    useEffect(() => {
        fetchExercises();
    }, [fetchExercises]);

    const currentExercise = exercises[currentExerciseIndex];

    const calculateScore = () => {
        const totalAttempts = exerciseResults.reduce((sum, r) => sum + r.attempts, 0);
        const correctAnswers = exerciseResults.filter(r => r.correct).length;
        return {
            correct: correctAnswers,
            total: exercises.length,
            attempts: totalAttempts,
            percentage: Math.round((correctAnswers / exercises.length) * 100)
        };
    };

    const handleSubmitAnswer = async () => {
        if (isSubmitting || !currentExercise) return;

        const finalAnswer = currentExercise.type === 'multiple-choice' 
            ? selectedOptions[0] 
            : userAnswer.trim();

        if (!finalAnswer) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            Alert.alert('Réponse vide', 'Veuillez saisir ou choisir une réponse.');
            return;
        }

        try {
            setIsSubmitting(true);
            
            // For multiple-choice, check using the isCorrect property in options
            let isCorrect = false;
            if (currentExercise.type === 'multiple-choice') {
                const selectedOption = currentExercise.options?.find(opt => opt.text === finalAnswer);
                isCorrect = selectedOption?.isCorrect || false;
            } else {
                // For text/braille-conversion, check against correctAnswer
                const checkCorrect = (uAns: string, cAns: string | string[]) => {
                    if (Array.isArray(cAns)) {
                        return cAns.some(a => a.toLowerCase() === uAns.toLowerCase());
                    }
                    return uAns.toLowerCase() === cAns.toLowerCase();
                };
                isCorrect = checkCorrect(finalAnswer, currentExercise.correctAnswer);
            }

            const newAttempts = attempts + 1;
            setAttempts(newAttempts);

            // Save result for score calculation
            const result: ExerciseResult = {
                exerciseId: currentExercise._id,
                correct: isCorrect,
                attempts: newAttempts
            };
            setExerciseResults(prev => [...prev, result]);

            await api.submitExerciseAnswer({
                exerciseId: currentExercise._id,
                answer: finalAnswer,
                isCorrect,
                attempts: newAttempts,
            });

            if (isCorrect) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                setResultSuccess(true);
                setResultMessage('✓ Excellent !');
                setShowResult(true);
                setTimeout(handleNext, 1800);
            } else {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                if (newAttempts >= currentExercise.maxAttempts) {
                    setResultSuccess(false);
                    const correctDisplay = Array.isArray(currentExercise.correctAnswer) 
                        ? currentExercise.correctAnswer[0] 
                        : currentExercise.correctAnswer;
                    setResultMessage(`✗ Échec. La réponse était : ${correctDisplay}`);
                    setShowResult(true);
                    setTimeout(handleNext, 3000);
                } else {
                    setResultSuccess(false);
                    setResultMessage(`Incorrect (${newAttempts}/${currentExercise.maxAttempts})`);
                    setShowResult(true);
                    setTimeout(() => setShowResult(false), 1500);
                    if (currentExercise.type !== 'multiple-choice') setUserAnswer('');
                }
            }
        } catch (error) {
            Alert.alert('Erreur', 'Problème de connexion.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleNext = () => {
        // First hide the result modal
        setShowResult(false);
        
        // Small delay to allow the modal to close before changing the exercise
        setTimeout(() => {
            // Check if there are more exercises
            if (currentExerciseIndex < exercises.length - 1) {
                // Move to next exercise and reset all states
                const nextIndex = currentExerciseIndex + 1;
                setCurrentExerciseIndex(nextIndex);
                setUserAnswer('');
                setSelectedOptions([]);
                setAttempts(0);
                // Force re-render to ensure options display properly
                setExerciseKey(prev => prev + 1);
                
                // Log for debugging
                console.log('Moving to exercise:', nextIndex + 1, 'Type:', exercises[nextIndex]?.type);
            } else {
                // All exercises completed - show summary
                const score = calculateScore();
                console.log('Lesson completed! Score:', score);
                setShowLessonSummary(true);
            }
        }, 100);
    };

    const handleContinueToNextLesson = async () => {
        // Mark current lesson as completed
        try {
            await api.updateLessonProgress(lessonId, {
                completed: true,
                score: calculateScore().percentage
            });
        } catch (error) {
            console.error('Error updating lesson progress:', error);
        }
        
        // Try to navigate to next lesson
        if (nextLessonId) {
            router.replace({
                pathname: '/exercise',
                params: {
                    lessonId: nextLessonId,
                    chapterId: chapterId
                }
            });
        } else {
            // No more lessons - go back to lessons list
            router.back();
        }
    };

    const handleRetryLesson = () => {
        setShowLessonSummary(false);
        setExerciseResults([]);
        setCurrentExerciseIndex(0);
        setAttempts(0);
        setUserAnswer('');
        setSelectedOptions([]);
        setExerciseKey(0);
    };

    if (loading) return <ThemedView style={styles.center}><ActivityIndicator size="large" color={tintColor} /></ThemedView>;

    // Afficher un message si aucun exercice
    if (exercises.length === 0) {
        return (
            <ThemedView style={styles.center}>
                <Text style={styles.emptyText}>Aucun exercice disponible pour cette leçon.</Text>
                <Text style={styles.debugText}>Lesson ID: {lessonId}</Text>
                <TouchableOpacity onPress={fetchExercises} style={styles.retryButton}>
                    <Text style={{color: tintColor}}>Réessayer</Text>
                </TouchableOpacity>
            </ThemedView>
        );
    }

    // Show lesson summary when all exercises are done
    if (showLessonSummary) {
        const score = calculateScore();
        return (
            <ThemedView style={styles.container}>
                <View style={styles.summaryContainer}>
                    <Text style={styles.summaryTitle}>🎉 Leçon terminée !</Text>
                    
                    <View style={styles.scoreCard}>
                        <Text style={styles.scoreLabel}>Votre score</Text>
                        <Text style={[styles.scoreValue, { color: tintColor }]}>{score.percentage}%</Text>
                        <Text style={styles.scoreDetail}>
                            {score.correct} réponses correctes sur {score.total} exercices
                        </Text>
                        <Text style={styles.scoreAttempts}>
                            Total des tentatives: {score.attempts}
                        </Text>
                    </View>

                    <View style={styles.summaryButtons}>
                        <TouchableOpacity 
                            style={[styles.summaryButton, { backgroundColor: tintColor }]}
                            onPress={handleContinueToNextLesson}
                        >
                            <Text style={styles.summaryButtonText}>
                                {nextLessonId ? 'Leçon suivante →' : 'Retour aux leçons'}
                            </Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            style={[styles.summaryButton, styles.retryButtonStyle]}
                            onPress={handleRetryLesson}
                        >
                            <Text style={[styles.summaryButtonText, { color: '#666' }]}>
                                Réessayer la leçon
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ThemedView>
        );
    }

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ThemedView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
                        <Text style={{ fontSize: 24, color: '#999' }}>✕</Text>
                    </TouchableOpacity>
                    <View style={styles.progressTrack}>
                        <View style={[styles.progressFill, { 
                            width: `${((currentExerciseIndex + 1) / exercises.length) * 100}%`,
                            backgroundColor: tintColor 
                        }]} />
                    </View>
                    <Text style={styles.progressText}>
                        {currentExerciseIndex + 1}/{exercises.length}
                    </Text>
                </View>

                <ScrollView key={exerciseKey} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                    <ThemedText style={styles.typeLabel}>{currentExercise?.type.toUpperCase()}</ThemedText>
                    <ThemedText type="subtitle" style={styles.questionText}>{currentExercise?.question}</ThemedText>
                    
                    <View style={styles.contentCard}>
                        <Text style={styles.mainDisplay}>{currentExercise?.content}</Text>
                        
                        {currentExercise?.type === 'braille-conversion' && (
                            <View style={styles.brailleHelpContainer}>
                                <Text style={styles.hintText}>Points : 1-2-3 (gauche), 4-5-6 (droite)</Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.inputArea}>
                        {currentExercise?.type === 'multiple-choice' ? (
                            <View style={styles.optionsGrid}>
                                {currentExercise.options?.map((opt, i) => (
                                    <TouchableOpacity 
                                        key={i}
                                        onPress={() => {
                                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                            setSelectedOptions([opt.text]);
                                        }}
                                        style={[
                                            styles.optionBtn, 
                                            selectedOptions.includes(opt.text) && { borderColor: tintColor, backgroundColor: tintColor + '10' }
                                        ]}
                                    >
                                        <Text style={[styles.optionText, selectedOptions.includes(opt.text) && { color: tintColor }]}>{opt.text}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        ) : (
                            <TextInput
                                style={styles.textInput}
                                placeholder="Votre réponse..."
                                value={userAnswer}
                                onChangeText={setUserAnswer}
                                keyboardType={currentExercise?.type === 'braille-conversion' ? 'numeric' : 'default'}
                            />
                        )}
                    </View>
                </ScrollView>

                <View style={styles.footer}>
                    <TouchableOpacity 
                        style={[styles.submitBtn, { backgroundColor: isSubmitting ? '#ccc' : tintColor }]}
                        onPress={handleSubmitAnswer}
                        disabled={isSubmitting}
                    >
                        <Text style={styles.submitBtnText}>VÉRIFIER</Text>
                    </TouchableOpacity>
                </View>

                <Modal visible={showResult} transparent animationType="slide">
                    <View style={styles.modalOverlay}>
                        <View style={[styles.resultCard, { borderTopColor: resultSuccess ? '#51cf66' : '#ff6b6b' }]}>
                            <Text style={[styles.resultIcon, { color: resultSuccess ? '#51cf66' : '#ff6b6b' }]}>
                                {resultSuccess ? '✓ BRAVO' : '✕ INCORRECT'}
                            </Text>
                            <Text style={styles.resultMsg}>{resultMessage}</Text>
                        </View>
                    </View>
                </Modal>
            </ThemedView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    emptyText: { color: '#999', fontSize: 16, textAlign: 'center' },
    debugText: { color: '#ccc', fontSize: 12, marginTop: 10 },
    retryButton: { marginTop: 15, padding: 10 },
    header: { paddingTop: 60, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 15 },
    closeButton: { padding: 5 },
    progressTrack: { flex: 1, height: 8, backgroundColor: '#eee', borderRadius: 4, overflow: 'hidden' },
    progressFill: { height: '100%' },
    progressText: { fontSize: 14, color: '#666', fontWeight: '600', minWidth: 40, textAlign: 'right' },
    scrollContent: { padding: 20 },
    typeLabel: { color: '#888', fontSize: 11, fontWeight: 'bold', letterSpacing: 1, marginBottom: 5 },
    questionText: { fontSize: 20, marginBottom: 20 },
    contentCard: { 
        backgroundColor: '#F8F9FA', 
        borderRadius: 20, 
        padding: 30, 
        alignItems: 'center', 
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#eee'
    },
    mainDisplay: { fontSize: 50, fontWeight: 'bold', color: '#333' },
    brailleHelpContainer: {
        marginTop: 15,
        padding: 10,
        backgroundColor: '#fff',
        borderRadius: 10,
        alignItems: 'center',
        width: '100%',
        borderWidth: 1,
        borderColor: '#eee'
    },
    hintText: {
        fontSize: 12,
        color: '#666',
        marginTop: 5,
        textAlign: 'center'
    },
    inputArea: { marginBottom: 20 },
    textInput: { borderBottomWidth: 2, borderColor: '#ddd', fontSize: 22, padding: 15, textAlign: 'center' },
    optionsGrid: { gap: 10 },
    optionBtn: { padding: 15, borderRadius: 12, borderWidth: 2, borderColor: '#eee' },
    optionText: { fontSize: 16, fontWeight: '600', textAlign: 'center' },
    footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#eee' },
    submitBtn: { padding: 18, borderRadius: 15, alignItems: 'center' },
    submitBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
    resultCard: { 
        backgroundColor: '#fff', 
        padding: 30, 
        borderTopLeftRadius: 30, 
        borderTopRightRadius: 30, 
        borderTopWidth: 8,
        alignItems: 'center'
    },
    resultIcon: { fontSize: 20, fontWeight: 'bold', marginBottom: 5 },
    resultMsg: { fontSize: 15, textAlign: 'center', color: '#666' },
    
    // Summary styles
    summaryContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 30,
    },
    summaryTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 30,
        textAlign: 'center',
    },
    scoreCard: {
        backgroundColor: '#F8F9FA',
        borderRadius: 20,
        padding: 30,
        alignItems: 'center',
        width: '100%',
        marginBottom: 30,
        borderWidth: 1,
        borderColor: '#eee',
    },
    scoreLabel: {
        fontSize: 16,
        color: '#666',
        marginBottom: 10,
    },
    scoreValue: {
        fontSize: 60,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    scoreDetail: {
        fontSize: 16,
        color: '#333',
        marginBottom: 5,
    },
    scoreAttempts: {
        fontSize: 14,
        color: '#999',
    },
    summaryButtons: {
        width: '100%',
        gap: 15,
    },
    summaryButton: {
        padding: 18,
        borderRadius: 15,
        alignItems: 'center',
        width: '100%',
    },
    summaryButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    retryButtonStyle: {
        backgroundColor: '#f0f0f0',
    },
});
