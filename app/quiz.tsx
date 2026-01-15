import React, { useEffect, useState, useCallback } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Platform
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/context/AuthContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { api } from '@/services/api';

// --- Interfaces ---
interface QuizQuestion {
    _id: string;
    question: string;
    options: string[];
    correctAnswer: string;
    explanation?: string;
}

interface Quiz {
    _id: string;
    title: string;
    description: string;
    questions: QuizQuestion[];
    passingScore: number;
}

export default function QuizScreen() {
    const router = useRouter();
    const { levelId } = useLocalSearchParams<{ levelId: string }>();
    const tintColor = useThemeColor({}, 'tint');

    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string }>({});
    const [showReview, setShowReview] = useState(false);
    const [score, setScore] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchQuiz();
    }, [levelId]);

    const fetchQuiz = async () => {
        try {
            setLoading(true);
            if (!levelId) throw new Error('ID du niveau manquant');
            const response = await api.getQuizByLevel(levelId);
            setQuiz(response);
        } catch (error: any) {
            Alert.alert('Erreur', 'Impossible de charger le quiz');
            router.back();
        } finally {
            setLoading(false);
        }
    };

    const handleSelectAnswer = (answer: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSelectedAnswers(prev => ({ ...prev, [currentQuestionIndex]: answer }));
    };

    const handleNext = () => {
        if (!selectedAnswers[currentQuestionIndex]) {
            Alert.alert('Attention', 'Sélectionnez une réponse');
            return;
        }
        if (currentQuestionIndex < (quiz?.questions.length || 0) - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const handleSubmitQuiz = async () => {
        if (!quiz) return;
        
        setIsSubmitting(true);
        try {
            let correctCount = 0;
            quiz.questions.forEach((q, i) => {
                if (selectedAnswers[i] === q.correctAnswer) correctCount++;
            });

            const finalScore = (correctCount / quiz.questions.length) * 100;
            setScore(finalScore);

            await api.submitQuiz({
                quizId: quiz._id,
                levelId: levelId as string,
                answers: selectedAnswers,
                score: finalScore,
                passed: finalScore >= (quiz.passingScore || 70),
            });

            if (finalScore >= (quiz.passingScore || 70)) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } else {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            }
            
            setShowReview(true);
        } catch (error) {
            Alert.alert('Erreur', 'Échec de la soumission');
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetQuiz = () => {
        setSelectedAnswers({});
        setCurrentQuestionIndex(0);
        setShowReview(false);
        setScore(0);
    };

    if (loading) return (
        <ThemedView style={styles.center}><ActivityIndicator size="large" color={tintColor} /></ThemedView>
    );

    if (!quiz) return (
        <ThemedView style={styles.center}><ThemedText>Quiz introuvable</ThemedText></ThemedView>
    );

    const currentQuestion = quiz.questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;

    // --- Rendu des Résultats (Review) ---
    if (showReview) {
        return (
            <ThemedView style={styles.container}>
                <ScrollView contentContainerStyle={styles.reviewScroll}>
                    <View style={styles.resultHeader}>
                        <View style={[styles.scoreCircle, { borderColor: score >= quiz.passingScore ? '#4ADE80' : '#F87171' }]}>
                            <Text style={styles.scoreText}>{score.toFixed(0)}%</Text>
                        </View>
                        <ThemedText type="title">{score >= quiz.passingScore ? 'Félicitations !' : 'Continuez d\'apprendre'}</ThemedText>
                    </View>

                    {quiz.questions.map((q, i) => (
                        <View key={q._id} style={[styles.reviewCard, { borderLeftColor: selectedAnswers[i] === q.correctAnswer ? '#4ADE80' : '#F87171' }]}>
                            <Text style={styles.reviewQuestionText}>{i + 1}. {q.question}</Text>
                            <Text style={{ color: selectedAnswers[i] === q.correctAnswer ? '#166534' : '#991B1B' }}>
                                Votre réponse : {selectedAnswers[i]}
                            </Text>
                            {selectedAnswers[i] !== q.correctAnswer && (
                                <Text style={styles.correctAnswerText}>Correct : {q.correctAnswer}</Text>
                            )}
                        </View>
                    ))}
                </ScrollView>
                <View style={styles.footer}>
                    <TouchableOpacity style={[styles.btn, { backgroundColor: tintColor }]} onPress={() => score >= quiz.passingScore ? router.back() : resetQuiz()}>
                        <Text style={styles.btnText}>{score >= quiz.passingScore ? 'Terminer' : 'Réessayer'}</Text>
                    </TouchableOpacity>
                </View>
            </ThemedView>
        );
    }

    // --- Rendu du Quiz en cours ---
    return (
        <ThemedView style={styles.container}>
            <View style={styles.header}>
                <ThemedText type="subtitle">{quiz.title}</ThemedText>
                <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%`, backgroundColor: tintColor }]} />
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.quizContent}>
                <ThemedText style={styles.questionText}>{currentQuestion.question}</ThemedText>
                
                {currentQuestion.options.map((option, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[styles.optionBtn, selectedAnswers[currentQuestionIndex] === option && { borderColor: tintColor, backgroundColor: tintColor + '10' }]}
                        onPress={() => handleSelectAnswer(option)}
                    >
                        <View style={[styles.radio, selectedAnswers[currentQuestionIndex] === option && { borderColor: tintColor }]}>
                            {selectedAnswers[currentQuestionIndex] === option && <View style={[styles.radioInner, { backgroundColor: tintColor }]} />}
                        </View>
                        <Text style={styles.optionText}>{option}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity 
                    style={[styles.navBtn, currentQuestionIndex === 0 && { opacity: 0 }]} 
                    onPress={() => setCurrentQuestionIndex(prev => prev - 1)}
                    disabled={currentQuestionIndex === 0}
                >
                    <Text>Précédent</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={[styles.btn, { backgroundColor: tintColor }, isSubmitting && { opacity: 0.7 }]} 
                    onPress={isLastQuestion ? handleSubmitQuiz : handleNext}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>{isLastQuestion ? 'Terminer' : 'Suivant'}</Text>}
                </TouchableOpacity>
            </View>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { padding: 20, paddingTop: 60, backgroundColor: '#fff' },
    progressBarBg: { height: 8, backgroundColor: '#E5E7EB', borderRadius: 4, marginTop: 15 },
    progressBarFill: { height: '100%', borderRadius: 4 },
    quizContent: { padding: 20 },
    questionText: { fontSize: 20, fontWeight: 'bold', marginBottom: 25, lineHeight: 28 },
    optionBtn: { 
        flexDirection: 'row', alignItems: 'center', padding: 18, 
        borderRadius: 12, borderWidth: 2, borderColor: '#F3F4F6', marginBottom: 12 
    },
    optionText: { fontSize: 16, color: '#374151', marginLeft: 12, flex: 1 },
    radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#D1D5DB', justifyContent: 'center', alignItems: 'center' },
    radioInner: { width: 12, height: 12, borderRadius: 6 },
    footer: { 
        flexDirection: 'row', padding: 20, paddingBottom: Platform.OS === 'ios' ? 40 : 20,
        borderTopWidth: 1, borderTopColor: '#F3F4F6', alignItems: 'center'
    },
    btn: { flex: 2, height: 55, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
    navBtn: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    // Review Styles
    reviewScroll: { padding: 20, paddingTop: 50 },
    resultHeader: { alignItems: 'center', marginBottom: 30 },
    scoreCircle: { width: 100, height: 100, borderRadius: 50, borderWidth: 5, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
    scoreText: { fontSize: 28, fontWeight: 'bold' },
    reviewCard: { backgroundColor: '#F9FAFB', padding: 15, borderRadius: 12, marginBottom: 10, borderLeftWidth: 5 },
    reviewQuestionText: { fontWeight: 'bold', marginBottom: 5 },
    correctAnswerText: { color: '#166534', fontWeight: '600', marginTop: 2 }
});