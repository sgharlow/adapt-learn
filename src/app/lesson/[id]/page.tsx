'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import type { Lesson } from '@/types';
import AudioPlayer from '@/components/AudioPlayer';
import LessonNavigation from '@/components/LessonNavigation';
import VoiceChat from '@/components/VoiceChat';
import { getCachedAudio, setCachedAudio, generateCacheKey } from '@/lib/audioCache';

export default function LessonPage() {
  const params = useParams();
  const lessonId = params.id as string;

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);

  useEffect(() => {
    fetch(`/api/lessons/${lessonId}`)
      .then(res => {
        if (!res.ok) throw new Error('Lesson not found');
        return res.json();
      })
      .then(data => {
        setLesson(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [lessonId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-slate-400">Loading lesson...</div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || 'Lesson not found'}</p>
          <Link href="/" className="btn-primary">Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen">
      {/* Header */}
      <div className="bg-slate-800/50 border-b border-slate-700">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link href="/dashboard" className="text-blue-400 hover:text-blue-300 text-sm mb-4 inline-block">
            &larr; Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">{lesson.title}</h1>
          <div className="flex items-center gap-4 text-sm text-slate-400">
            <span className="px-2 py-1 bg-slate-700 rounded">{lesson.topic}</span>
            <span>{lesson.duration} min</span>
            <span className="capitalize">{lesson.difficulty}</span>
          </div>
        </div>
      </div>

      {/* Audio Player */}
      <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-b border-slate-700">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <LessonAudioPlayer lesson={lesson} />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {!showQuiz ? (
          <>
            {/* Learning Objectives */}
            <div className="card mb-8">
              <h2 className="text-lg font-semibold text-white mb-3">Learning Objectives</h2>
              <ul className="space-y-2">
                {lesson.objectives.map((obj, i) => (
                  <li key={i} className="flex items-start gap-2 text-slate-300">
                    <svg className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {obj}
                  </li>
                ))}
              </ul>
            </div>

            {/* Introduction */}
            <div className="mb-8">
              <p className="text-lg text-slate-300 leading-relaxed">{lesson.content.introduction}</p>
            </div>

            {/* Sections */}
            {lesson.content.sections.map((section, i) => (
              <div key={i} className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">{section.title}</h2>
                <div className="text-slate-300 leading-relaxed whitespace-pre-line">
                  {section.content}
                </div>
              </div>
            ))}

            {/* Summary */}
            <div className="card mb-8 bg-blue-900/20 border-blue-500/30">
              <h2 className="text-lg font-semibold text-white mb-3">Summary</h2>
              <p className="text-slate-300">{lesson.content.summary}</p>
            </div>

            {/* Key Takeaways */}
            <div className="card mb-8">
              <h2 className="text-lg font-semibold text-white mb-3">Key Takeaways</h2>
              <ul className="space-y-2">
                {lesson.content.keyTakeaways.map((takeaway, i) => (
                  <li key={i} className="flex items-start gap-2 text-slate-300">
                    <span className="text-yellow-400">•</span>
                    {takeaway}
                  </li>
                ))}
              </ul>
            </div>

            {/* Quiz CTA */}
            <div className="text-center py-8">
              <button
                onClick={() => setShowQuiz(true)}
                className="btn-primary text-lg"
              >
                Take the Quiz
              </button>
            </div>

            {/* Lesson Navigation */}
            <LessonNavigation currentLessonId={lessonId} />
          </>
        ) : (
          <Quiz lesson={lesson} onComplete={() => setShowQuiz(false)} lessonId={lessonId} />
        )}
      </div>

      {/* Floating Ask AI Button */}
      {!showChat && (
        <button
          onClick={() => setShowChat(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center z-40"
          title="Ask AI Tutor"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </button>
      )}

      {/* Chat Panel */}
      {showChat && (
        <div className="fixed bottom-0 right-0 w-full sm:w-[400px] h-[500px] sm:h-[600px] sm:bottom-6 sm:right-6 z-50 shadow-2xl sm:rounded-xl overflow-hidden">
          <VoiceChat
            lessonContext={`Lesson: ${lesson.title}\n\nTopic: ${lesson.topic}\n\nIntroduction: ${lesson.content.introduction}\n\nKey concepts: ${lesson.content.sections.map(s => s.title).join(', ')}`}
            lessonTitle={lesson.title}
            onClose={() => setShowChat(false)}
          />
        </div>
      )}
    </main>
  );
}

function LessonAudioPlayer({ lesson }: { lesson: Lesson }) {
  const [isGenerating, setIsGenerating] = useState(false);

  // Build the full lesson text for audio
  const getLessonText = useCallback(() => {
    const parts = [
      `Lesson: ${lesson.title}.`,
      lesson.content.introduction,
      ...lesson.content.sections.map(s => `${s.title}. ${s.content}`),
      `Summary: ${lesson.content.summary}`,
      `Key takeaways: ${lesson.content.keyTakeaways.join('. ')}.`,
    ];
    return parts.join(' ');
  }, [lesson]);

  // Check for cached audio
  const cacheKey = generateCacheKey(lesson.id);
  const cachedUrl = getCachedAudio(cacheKey);

  const handleGenerateAudio = useCallback(async (): Promise<string> => {
    // Check cache first
    if (cachedUrl) return cachedUrl;

    setIsGenerating(true);
    try {
      const response = await fetch('/api/audio/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: getLessonText() }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate audio');
      }

      const data = await response.json();
      setCachedAudio(cacheKey, data.audioUrl);
      setIsGenerating(false);
      return data.audioUrl;
    } catch (error) {
      setIsGenerating(false);
      throw error;
    }
  }, [getLessonText, cacheKey, cachedUrl]);

  return (
    <AudioPlayer
      audioUrl={cachedUrl}
      title={`Listen: ${lesson.title}`}
      onGenerateAudio={handleGenerateAudio}
      isGenerating={isGenerating}
    />
  );
}

function Quiz({ lesson, onComplete, lessonId }: { lesson: Lesson; onComplete: () => void; lessonId: string }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const question = lesson.quiz[currentQuestion];

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer);
    setShowResult(true);

    if (answer === question.correct) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < lesson.quiz.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setFinished(true);
      // Save progress to localStorage
      const progress = JSON.parse(localStorage.getItem('adaptlearn-progress') || '{}');
      if (!progress.completedLessons) progress.completedLessons = [];
      if (!progress.completedLessons.includes(lesson.id)) {
        progress.completedLessons.push(lesson.id);
      }

      const finalScore = score + (selectedAnswer === question.correct ? 1 : 0);
      const percentage = Math.round((finalScore / lesson.quiz.length) * 100);

      // Save quiz results
      progress.quizResults = progress.quizResults || {};
      progress.quizResults[lesson.id] = {
        lessonId: lesson.id,
        score: finalScore,
        totalQuestions: lesson.quiz.length,
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
          lastUpdated: new Date().toISOString(),
        };
      } else {
        progress.topicMastery[topic] = {
          topic,
          score: percentage,
          lessonsCompleted: 1,
          lastUpdated: new Date().toISOString(),
        };
      }

      // Update last activity
      progress.lastActivity = new Date().toISOString();

      localStorage.setItem('adaptlearn-progress', JSON.stringify(progress));
    }
  };

  if (finished) {
    const finalScore = score;
    const percentage = Math.round((finalScore / lesson.quiz.length) * 100);

    return (
      <div>
        <div className="card text-center py-12">
          <h2 className="text-2xl font-bold text-white mb-4">Quiz Complete!</h2>
          <p className="text-5xl font-bold mb-4">
            <span className={percentage >= 70 ? 'text-green-400' : 'text-yellow-400'}>
              {percentage}%
            </span>
          </p>
          <p className="text-slate-400 mb-8">
            You got {finalScore} out of {lesson.quiz.length} questions correct.
          </p>
          {percentage < 70 && (
            <p className="text-yellow-400/80 text-sm mb-6">
              Consider reviewing this lesson to strengthen your understanding.
            </p>
          )}
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-white">Quiz</h2>
        <span className="text-slate-400">
          Question {currentQuestion + 1} of {lesson.quiz.length}
        </span>
      </div>

      <p className="text-xl text-white mb-6">{question.question}</p>

      <div className="space-y-3 mb-6">
        {question.options.map((option, i) => {
          const letter = option.charAt(0);
          const isSelected = selectedAnswer === letter;
          const isCorrect = letter === question.correct;

          let bgColor = 'bg-slate-700 hover:bg-slate-600';
          if (showResult) {
            if (isCorrect) bgColor = 'bg-green-500/20 border-green-500';
            else if (isSelected) bgColor = 'bg-red-500/20 border-red-500';
          } else if (isSelected) {
            bgColor = 'bg-blue-500/20 border-blue-500';
          }

          return (
            <button
              key={i}
              onClick={() => !showResult && handleAnswer(letter)}
              disabled={showResult}
              className={`w-full text-left p-4 rounded-lg border border-slate-600 transition-colors ${bgColor}`}
            >
              <span className="text-slate-300">{option}</span>
            </button>
          );
        })}
      </div>

      {showResult && (
        <div className={`p-4 rounded-lg mb-6 ${selectedAnswer === question.correct ? 'bg-green-500/10 border border-green-500/30' : 'bg-yellow-500/10 border border-yellow-500/30'}`}>
          <p className={`font-medium mb-2 ${selectedAnswer === question.correct ? 'text-green-400' : 'text-yellow-400'}`}>
            {selectedAnswer === question.correct ? 'Correct!' : 'Not quite right'}
          </p>
          <p className="text-slate-300 text-sm">{question.explanation}</p>
        </div>
      )}

      {showResult && (
        <button onClick={handleNext} className="btn-primary w-full">
          {currentQuestion < lesson.quiz.length - 1 ? 'Next Question' : 'See Results'}
        </button>
      )}
    </div>
  );
}
