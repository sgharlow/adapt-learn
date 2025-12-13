'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import LessonNavigation from '@/components/LessonNavigation';
import type { Lesson, QuizQuestion, UserProgress } from '@/types';
import { logQuizCompleted, logLessonCompleted } from '@/lib/progressUtils';

interface QuizProps {
  lesson: Lesson;
  lessonId: string;
  onComplete: () => void;
}

interface QuizStats {
  totalTime: number;
  correctOnFirstTry: number;
  topicStrengths: string[];
  topicWeaknesses: string[];
}

export default function Quiz({ lesson, lessonId, onComplete }: QuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [startTime] = useState(Date.now());
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);

  const question = lesson.quiz[currentQuestion];

  // Voice input for quiz answers
  const handleVoiceResult = useCallback((transcript: string) => {
    if (showResult || isProcessingVoice) return;

    setIsProcessingVoice(true);
    const normalizedTranscript = transcript.toLowerCase().trim();

    // Match spoken answers to options
    let detectedAnswer: string | null = null;

    // Check for letter answers (A, B, C, D)
    if (normalizedTranscript.includes('a') || normalizedTranscript.includes('option a') || normalizedTranscript === 'first') {
      detectedAnswer = 'A';
    } else if (normalizedTranscript.includes('b') || normalizedTranscript.includes('option b') || normalizedTranscript === 'second') {
      detectedAnswer = 'B';
    } else if (normalizedTranscript.includes('c') || normalizedTranscript.includes('option c') || normalizedTranscript === 'third') {
      detectedAnswer = 'C';
    } else if (normalizedTranscript.includes('d') || normalizedTranscript.includes('option d') || normalizedTranscript === 'fourth') {
      detectedAnswer = 'D';
    }
    // Check for true/false
    else if (normalizedTranscript.includes('true')) {
      detectedAnswer = 'A'; // Assuming true is usually first option
    } else if (normalizedTranscript.includes('false')) {
      detectedAnswer = 'B'; // Assuming false is usually second option
    }

    if (detectedAnswer) {
      handleAnswer(detectedAnswer);
    }

    setTimeout(() => setIsProcessingVoice(false), 500);
  }, [showResult, isProcessingVoice]);

  const { isListening, isSupported, startListening, stopListening, resetTranscript } = useVoiceInput({
    onResult: handleVoiceResult,
    continuous: false,
  });

  // Stop listening when showing result
  useEffect(() => {
    if (showResult && isListening) {
      stopListening();
    }
  }, [showResult, isListening, stopListening]);

  const handleAnswer = (answer: string) => {
    if (showResult) return;

    setSelectedAnswer(answer);
    setShowResult(true);

    if (answer === question.correct) {
      setScore(score + 1);
    }

    if (isListening) {
      stopListening();
    }
  };

  const handleNext = () => {
    if (currentQuestion < lesson.quiz.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      resetTranscript();
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    setFinished(true);
    const endTime = Date.now();
    const totalTime = Math.round((endTime - startTime) / 1000);

    // Save progress to localStorage
    let progress: UserProgress = JSON.parse(localStorage.getItem('adaptlearn-progress') || '{}');
    if (!progress.completedLessons) progress.completedLessons = [];

    const isFirstCompletion = !progress.completedLessons.includes(lesson.id);
    if (isFirstCompletion) {
      progress.completedLessons.push(lesson.id);
    }

    const finalScore = score + (selectedAnswer === question.correct ? 1 : 0);
    const percentage = Math.round((finalScore / lesson.quiz.length) * 100);

    // Save quiz results with more details
    progress.quizResults = progress.quizResults || {};
    progress.quizResults[lesson.id] = {
      lessonId: lesson.id,
      score: finalScore,
      totalQuestions: lesson.quiz.length,
      percentage,
      timeSpent: totalTime,
      completedAt: new Date().toISOString(),
    };

    // Update topic mastery
    progress.topicMastery = progress.topicMastery || {};
    const topic = lesson.topic;
    const existingMastery = progress.topicMastery[topic];

    if (existingMastery) {
      // Average with previous score for this topic
      progress.topicMastery[topic] = {
        topic,
        score: Math.round((existingMastery.score + percentage) / 2),
        lessonsCompleted: (existingMastery.lessonsCompleted || 1) + 1,
        totalLessons: existingMastery.totalLessons || 1,
        lastUpdated: new Date().toISOString(),
      };
    } else {
      progress.topicMastery[topic] = {
        topic,
        score: percentage,
        lessonsCompleted: 1,
        totalLessons: 1,
        lastUpdated: new Date().toISOString(),
      };
    }

    // Update last activity
    progress.lastActivity = new Date().toISOString();

    // Log activity: lesson completed (if first time) and quiz completed
    if (isFirstCompletion) {
      progress = logLessonCompleted(progress, lesson.id, lesson.title);
    }
    progress = logQuizCompleted(progress, lesson.id, lesson.title, finalScore, lesson.quiz.length);

    localStorage.setItem('adaptlearn-progress', JSON.stringify(progress));
  };

  const toggleVoiceMode = () => {
    if (voiceEnabled) {
      if (isListening) stopListening();
      setVoiceEnabled(false);
    } else {
      setVoiceEnabled(true);
    }
  };

  const startVoiceAnswer = () => {
    if (!showResult && voiceEnabled) {
      resetTranscript();
      startListening();
    }
  };

  if (finished) {
    const finalScore = score;
    const percentage = Math.round((finalScore / lesson.quiz.length) * 100);
    const totalTime = Math.round((Date.now() - startTime) / 1000);
    const minutes = Math.floor(totalTime / 60);
    const seconds = totalTime % 60;

    return (
      <div>
        <div className="card text-center py-12">
          {/* Score Circle */}
          <div className="relative inline-flex items-center justify-center mb-6">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-slate-700"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeDasharray={`${(percentage / 100) * 352} 352`}
                className={percentage >= 70 ? 'text-green-400' : percentage >= 50 ? 'text-yellow-400' : 'text-red-400'}
              />
            </svg>
            <span className={`absolute text-4xl font-bold ${percentage >= 70 ? 'text-green-400' : percentage >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
              {percentage}%
            </span>
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">Quiz Complete!</h2>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-6">
            <div className="bg-slate-700/50 rounded-lg p-3">
              <p className="text-2xl font-bold text-white">{finalScore}/{lesson.quiz.length}</p>
              <p className="text-xs text-slate-400">Correct</p>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-3">
              <p className="text-2xl font-bold text-white">{minutes}:{seconds.toString().padStart(2, '0')}</p>
              <p className="text-xs text-slate-400">Time</p>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-3">
              <p className="text-2xl font-bold text-white">{lesson.topic}</p>
              <p className="text-xs text-slate-400">Topic</p>
            </div>
          </div>

          {/* Performance Message */}
          <div className={`p-4 rounded-lg mb-6 ${
            percentage >= 70
              ? 'bg-green-500/10 border border-green-500/30'
              : percentage >= 50
                ? 'bg-yellow-500/10 border border-yellow-500/30'
                : 'bg-red-500/10 border border-red-500/30'
          }`}>
            {percentage >= 90 && (
              <p className="text-green-400 font-medium">Excellent work! You've mastered this material.</p>
            )}
            {percentage >= 70 && percentage < 90 && (
              <p className="text-green-400 font-medium">Great job! You have a solid understanding of this topic.</p>
            )}
            {percentage >= 50 && percentage < 70 && (
              <p className="text-yellow-400 font-medium">Good effort! Consider reviewing the material to strengthen your understanding.</p>
            )}
            {percentage < 50 && (
              <p className="text-red-400 font-medium">This topic needs more attention. Review the lesson and try again.</p>
            )}
          </div>

          {/* Mastery Impact */}
          <p className="text-slate-400 text-sm mb-8">
            Your <span className="text-white font-medium">{lesson.topic}</span> mastery has been updated based on this quiz.
          </p>

          <div className="flex gap-4 justify-center">
            <button onClick={onComplete} className="btn-secondary">
              Review Lesson
            </button>
            <Link href="/dashboard" className="btn-primary">
              View Dashboard
            </Link>
          </div>
        </div>

        {/* Navigation after quiz */}
        <LessonNavigation currentLessonId={lessonId} />
      </div>
    );
  }

  return (
    <div className="card">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-white">Quiz</h2>
          {isSupported && (
            <button
              onClick={toggleVoiceMode}
              className={`p-2 rounded-lg transition-colors ${
                voiceEnabled
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'bg-slate-700 text-slate-400 hover:text-white'
              }`}
              title={voiceEnabled ? 'Voice mode enabled' : 'Enable voice answers'}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Progress dots */}
          <div className="flex gap-1">
            {lesson.quiz.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i < currentQuestion
                    ? 'bg-green-400'
                    : i === currentQuestion
                    ? 'bg-blue-400'
                    : 'bg-slate-600'
                }`}
              />
            ))}
          </div>
          <span className="text-slate-400 text-sm ml-2">
            {currentQuestion + 1}/{lesson.quiz.length}
          </span>
        </div>
      </div>

      {/* Question */}
      <p className="text-xl text-white mb-6">{question.question}</p>

      {/* Voice Answer Button */}
      {voiceEnabled && !showResult && (
        <div className="mb-4 text-center">
          <button
            onClick={startVoiceAnswer}
            disabled={isListening}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
              isListening
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            {isListening ? 'Listening... Say A, B, C, or D' : 'Click to answer by voice'}
          </button>
        </div>
      )}

      {/* Options */}
      <div className="space-y-3 mb-6">
        {question.options.map((option, i) => {
          const letter = option.charAt(0);
          const isSelected = selectedAnswer === letter;
          const isCorrect = letter === question.correct;

          let bgColor = 'bg-slate-700 hover:bg-slate-600';
          let borderColor = 'border-slate-600';

          if (showResult) {
            if (isCorrect) {
              bgColor = 'bg-green-500/20';
              borderColor = 'border-green-500';
            } else if (isSelected) {
              bgColor = 'bg-red-500/20';
              borderColor = 'border-red-500';
            }
          } else if (isSelected) {
            bgColor = 'bg-blue-500/20';
            borderColor = 'border-blue-500';
          }

          return (
            <button
              key={i}
              onClick={() => !showResult && handleAnswer(letter)}
              disabled={showResult}
              className={`w-full text-left p-4 rounded-lg border transition-colors ${bgColor} ${borderColor}`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                  showResult && isCorrect
                    ? 'bg-green-500 text-white'
                    : showResult && isSelected && !isCorrect
                    ? 'bg-red-500 text-white'
                    : isSelected
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-600 text-slate-300'
                }`}>
                  {letter}
                </span>
                <span className="text-slate-300">{option.substring(3)}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Feedback */}
      {showResult && (
        <div className={`p-4 rounded-lg mb-6 ${
          selectedAnswer === question.correct
            ? 'bg-green-500/10 border border-green-500/30'
            : 'bg-yellow-500/10 border border-yellow-500/30'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            {selectedAnswer === question.correct ? (
              <>
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="font-medium text-green-400">Correct!</p>
              </>
            ) : (
              <>
                <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="font-medium text-yellow-400">Not quite right</p>
              </>
            )}
          </div>
          <p className="text-slate-300 text-sm">{question.explanation}</p>
        </div>
      )}

      {/* Next Button */}
      {showResult && (
        <button onClick={handleNext} className="btn-primary w-full">
          {currentQuestion < lesson.quiz.length - 1 ? 'Next Question' : 'See Results'}
        </button>
      )}
    </div>
  );
}
