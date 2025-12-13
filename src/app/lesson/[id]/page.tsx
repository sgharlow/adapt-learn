'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import type { Lesson, UserProgress } from '@/types';
import AudioPlayer from '@/components/AudioPlayer';
import LessonNavigation from '@/components/LessonNavigation';
import VoiceChat from '@/components/VoiceChat';
import Quiz from '@/components/Quiz';
import { getCachedAudio, setCachedAudio, generateCacheKey } from '@/lib/audioCache';
import { logLessonStarted } from '@/lib/progressUtils';
import { VoiceCommandButton } from '@/hooks/useVoiceCommands';

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

        // Log lesson started activity
        try {
          const savedProgress = localStorage.getItem('adaptlearn-progress');
          if (savedProgress) {
            const progress: UserProgress = JSON.parse(savedProgress);
            const updatedProgress = logLessonStarted(progress, lessonId, data.title);
            localStorage.setItem('adaptlearn-progress', JSON.stringify(updatedProgress));
          }
        } catch (err) {
          console.error('Failed to log lesson start:', err);
        }
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
          <div className="flex items-center justify-between mb-4">
            <Link href="/dashboard" className="text-blue-400 hover:text-blue-300 text-sm">
              &larr; Back to Dashboard
            </Link>
            <VoiceCommandButton />
          </div>
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

