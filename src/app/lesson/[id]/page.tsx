'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import type { Lesson } from '@/types';
import AudioPlayer from '@/components/AudioPlayer';
import LessonNavigation from '@/components/LessonNavigation';
import VoiceChat from '@/components/VoiceChat';
import Quiz from '@/components/Quiz';
import { logLessonStarted } from '@/lib/progressUtils';
import { loadProgress, saveProgress } from '@/lib/progressManager';
import { VoiceCommandButton } from '@/hooks/useVoiceCommands';
import LoadingSpinner, { LessonSkeleton } from '@/components/LoadingSpinner';

export default function LessonPage() {
  const params = useParams();
  const lessonId = params.id as string;

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    fetch(`/api/lessons/${lessonId}`)
      .then(res => {
        if (!res.ok) throw new Error('Lesson not found');
        return res.json();
      })
      .then(data => {
        setLesson(data);
        setLoading(false);

        // Log lesson started activity using progress manager
        const progress = loadProgress();
        const updatedProgress = logLessonStarted(progress, lessonId, data.title);
        saveProgress(updatedProgress);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [lessonId]);

  if (loading) {
    return (
      <main className="min-h-screen">
        <div className="glass border-b border-slate-700/50">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="h-4 bg-slate-700 rounded w-32 mb-4 animate-pulse" />
            <div className="h-8 bg-slate-700 rounded w-3/4 mb-2 animate-pulse" />
            <div className="flex gap-4">
              <div className="h-6 bg-slate-700 rounded w-20 animate-pulse" />
              <div className="h-6 bg-slate-700 rounded w-16 animate-pulse" />
            </div>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <LessonSkeleton />
          <div className="flex justify-center mt-8">
            <LoadingSpinner text="Loading lesson content..." />
          </div>
        </div>
      </main>
    );
  }

  if (error || !lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Lesson Not Found</h2>
          <p className="text-slate-400 mb-6">{error || 'The lesson you\'re looking for doesn\'t exist.'}</p>
          <div className="flex gap-3 justify-center">
            <Link href="/dashboard" className="btn-secondary">Dashboard</Link>
            <Link href="/" className="btn-primary">Home</Link>
          </div>
        </div>
      </div>
    );
  }

  const difficultyColors = {
    beginner: 'bg-green-500/10 text-green-400 border-green-500/30',
    intermediate: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    advanced: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  };

  return (
    <main className="min-h-screen pb-20">
      {/* Header */}
      <div className="glass border-b border-slate-700/50 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
            >
              <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-sm font-medium">Dashboard</span>
            </Link>
            <VoiceCommandButton />
          </div>
        </div>
      </div>

      {/* Lesson Header */}
      <div className="bg-gradient-to-b from-slate-800/50 to-transparent border-b border-slate-800/50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className={`badge border ${difficultyColors[lesson.difficulty as keyof typeof difficultyColors]}`}>
              {lesson.difficulty}
            </span>
            <span className="badge bg-slate-700/50 text-slate-300">{lesson.topic}</span>
            <span className="flex items-center gap-1.5 text-slate-500 text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {lesson.duration} min
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{lesson.title}</h1>
        </div>
      </div>

      {/* Audio Player */}
      <div className="bg-gradient-to-r from-blue-900/20 via-purple-900/20 to-blue-900/20 border-b border-slate-800/50">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <LessonAudioPlayer lesson={lesson} />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {!showQuiz ? (
          <div className="space-y-8">
            {/* Learning Objectives */}
            <div className="card bg-gradient-to-br from-green-900/20 to-transparent border-green-500/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-white">Learning Objectives</h2>
              </div>
              <ul className="space-y-3 ml-1">
                {lesson.objectives.map((obj, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-300">
                    <svg className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Introduction */}
            <div className="prose prose-invert max-w-none">
              <p className="text-lg text-slate-300 leading-relaxed">{lesson.content.introduction}</p>
            </div>

            {/* Sections */}
            {lesson.content.sections.map((section, i) => (
              <section key={i} className="scroll-mt-20" id={`section-${i}`}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">
                    {i + 1}
                  </div>
                  <h2 className="text-2xl font-semibold text-white">{section.title}</h2>
                </div>
                <div className="pl-14">
                  <div className="text-slate-300 leading-relaxed whitespace-pre-line">
                    {section.content}
                  </div>
                </div>
              </section>
            ))}

            {/* Summary */}
            <div className="card bg-gradient-to-br from-blue-900/30 to-purple-900/20 border-blue-500/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-white">Summary</h2>
              </div>
              <p className="text-slate-300 leading-relaxed">{lesson.content.summary}</p>
            </div>

            {/* Key Takeaways */}
            <div className="card bg-gradient-to-br from-yellow-900/20 to-transparent border-yellow-500/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-white">Key Takeaways</h2>
              </div>
              <ul className="space-y-3 ml-1">
                {lesson.content.keyTakeaways.map((takeaway, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-300">
                    <span className="w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-400 text-sm font-medium flex-shrink-0">
                      {i + 1}
                    </span>
                    <span>{takeaway}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quiz CTA */}
            <div className="card bg-gradient-to-r from-purple-900/30 via-blue-900/30 to-purple-900/30 border-purple-500/30 text-center py-10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/25">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Ready to Test Your Knowledge?</h3>
              <p className="text-slate-400 mb-6 max-w-md mx-auto">
                Take a quick quiz to reinforce what you've learned and track your progress.
              </p>
              <button
                onClick={() => setShowQuiz(true)}
                className="btn-primary text-lg px-8"
              >
                Start Quiz
              </button>
            </div>

            {/* Lesson Navigation */}
            <LessonNavigation currentLessonId={lessonId} />
          </div>
        ) : (
          <Quiz lesson={lesson} onComplete={() => setShowQuiz(false)} lessonId={lessonId} />
        )}
      </div>

      {/* Floating Ask AI Button */}
      {!showChat && (
        <button
          onClick={() => setShowChat(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all hover:scale-110 flex items-center justify-center z-40 group"
          title="Ask AI Tutor"
        >
          <svg className="w-6 h-6 text-white group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          {/* Pulse ring */}
          <span className="absolute inset-0 rounded-full bg-purple-500/30 animate-ping" />
        </button>
      )}

      {/* Chat Panel */}
      {showChat && (
        <div className="fixed bottom-0 right-0 w-full sm:w-[420px] h-[70vh] sm:h-[600px] sm:bottom-6 sm:right-6 z-50 shadow-2xl sm:rounded-2xl overflow-hidden border border-slate-700/50">
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

/**
 * LessonAudioPlayer - Static Audio Only (No Runtime Generation)
 *
 * This component uses ONLY pre-generated static audio files.
 * If no static audio exists, it shows an "Audio Coming Soon" message.
 *
 * Audio files should be pre-generated using: npm run generate:audio
 * Files are stored at: /public/audio/lessons/{lessonId}.mp3
 */
function LessonAudioPlayer({ lesson }: { lesson: Lesson }) {
  // Only use pre-generated static audio from /public/audio/lessons/
  const staticAudioUrl = lesson.audioUrls?.full || null;

  // If no static audio exists, show unavailable message (NO fallback generation)
  if (!staticAudioUrl) {
    return (
      <div className="flex items-center justify-center gap-4 p-6 rounded-xl bg-slate-800/50 border border-slate-700/50">
        <div className="w-12 h-12 rounded-full bg-slate-700/50 flex items-center justify-center">
          <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
        </div>
        <div>
          <p className="text-slate-400 font-medium">Audio Coming Soon</p>
          <p className="text-slate-500 text-sm">This lesson&apos;s audio is being prepared.</p>
        </div>
      </div>
    );
  }

  // Static audio exists - render player with instant playback
  return (
    <AudioPlayer
      audioUrl={staticAudioUrl}
      title={`Listen: ${lesson.title}`}
    />
  );
}
