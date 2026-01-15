import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/context/AuthContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { api } from '@/services/api';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
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

interface Exercise {
    _id: string;
    type: 'text' | 'multiple-choice' | 'braille-conversion' | 'matching';
    question: string;
    content: string;
    options?: string[];
    correctAnswer: string | string[];
    maxAttempts: number;
    order: number;
}

export default function ExerciseScreen() {
    const router = useRouter();
    const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
    
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

    const tintColor = useThemeColor({}, 'tint');

    useEffect(() => {
        fetchExercises();
    }, [lessonId]);

    const fetchExercises = async () => {
        try {
            setLoading(true);
            const response = await api.getExercisesByLesson(lessonId);
            setExercises(response || []);
        } catch (error) {
            Alert.alert('Erreur', 'Impossible de charger les exercices');
        } finally {
            setLoading(false);
        }
    };

    const currentExercise = exercises[currentExerciseIndex];

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
            const checkCorrect = (uAns: string, cAns: string | string[]) => {
                if (Array.isArray(cAns)) {
                    return cAns.some(a => a.toLowerCase() === uAns.toLowerCase());
                }
                return uAns.toLowerCase() === cAns.toLowerCase();
            };

            const isCorrect = checkCorrect(finalAnswer, currentExercise.correctAnswer);
            const newAttempts = attempts + 1;
            setAttempts(newAttempts);

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
        setShowResult(false);
        if (currentExerciseIndex < exercises.length - 1) {
            setCurrentExerciseIndex(prev => prev + 1);
            setUserAnswer('');
            setSelectedOptions([]);
            setAttempts(0);
        } else {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            Alert.alert('Félicitations !', 'Leçon terminée.', [{ text: 'OK', onPress: () => router.back() }]);
        }
    };

    if (loading) return <ThemedView style={styles.center}><ActivityIndicator size="large" color={tintColor} /></ThemedView>;

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
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                    <ThemedText style={styles.typeLabel}>{currentExercise?.type.toUpperCase()}</ThemedText>
                    <ThemedText type="subtitle" style={styles.questionText}>{currentExercise?.question}</ThemedText>
                    
                    <View style={styles.contentCard}>
                        <Text style={styles.mainDisplay}>{currentExercise?.content}</Text>
                        
                        {/* ✅ CORRECTION ICI : Pas de parenthèses vides */}
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
                                            setSelectedOptions([opt]);
                                        }}
                                        style={[
                                            styles.optionBtn, 
                                            selectedOptions.includes(opt) && { borderColor: tintColor, backgroundColor: tintColor + '10' }
                                        ]}
                                    >
                                        <Text style={[styles.optionText, selectedOptions.includes(opt) && { color: tintColor }]}>{opt}</Text>
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
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { paddingTop: 60, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 15 },
    closeButton: { padding: 5 },
    progressTrack: { flex: 1, height: 8, backgroundColor: '#eee', borderRadius: 4, overflow: 'hidden' },
    progressFill: { height: '100%' },
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
    
    // ✅ CORRECTION DES STYLES ICI
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
    resultMsg: { fontSize: 15, textAlign: 'center', color: '#666' }
});