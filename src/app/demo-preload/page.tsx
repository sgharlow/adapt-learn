'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { setCachedAudio, getCachedAudio, generateCacheKey } from '@/lib/audioCache';

interface PreloadStatus {
  lessonId: string;
  title: string;
  status: 'pending' | 'loading' | 'cached' | 'error';
  error?: string;
}

// Demo lessons to preload (based on DEMO_PROGRESS and DEMO_GAPS scenarios)
const DEMO_LESSONS = [
  { id: 'ml-fundamentals-01', title: 'What is Machine Learning?' },
  { id: 'ml-fundamentals-02', title: 'How Machines Learn' },
  { id: 'ml-fundamentals-03', title: 'Supervised vs Unsupervised Learning' },
  { id: 'ml-fundamentals-04', title: 'Training and Testing Data' },
  { id: 'ml-fundamentals-05', title: 'Model Evaluation Basics' },
  { id: 'deep-learning-01', title: 'Introduction to Neural Networks' },
];

export default function DemoPreloadPage() {
  const [lessons, setLessons] = useState<PreloadStatus[]>([]);
  const [isPreloading, setIsPreloading] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);

  // Check cache status on load
  useEffect(() => {
    const statuses = DEMO_LESSONS.map(lesson => {
      const cacheKey = generateCacheKey(lesson.id);
      const cached = getCachedAudio(cacheKey);
      return {
        lessonId: lesson.id,
        title: lesson.title,
        status: cached ? 'cached' : 'pending',
      } as PreloadStatus;
    });
    setLessons(statuses);
    setCompletedCount(statuses.filter(s => s.status === 'cached').length);
  }, []);

  const preloadLesson = async (lessonId: string): Promise<boolean> => {
    try {
      // Fetch lesson data
      const lessonRes = await fetch(`/api/lessons/${lessonId}`);
      if (!lessonRes.ok) throw new Error('Failed to fetch lesson');
      const lesson = await lessonRes.json();

      // Build lesson text
      const parts = [
        `Lesson: ${lesson.title}.`,
        lesson.content.introduction,
        ...lesson.content.sections.map((s: { title: string; content: string }) => `${s.title}. ${s.content}`),
        `Summary: ${lesson.content.summary}`,
        `Key takeaways: ${lesson.content.keyTakeaways.join('. ')}.`,
      ];
      const text = parts.join(' ');

      // Generate audio
      const audioRes = await fetch('/api/audio/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!audioRes.ok) throw new Error('Failed to generate audio');

      const data = await audioRes.json();
      setCachedAudio(generateCacheKey(lessonId), data.audioUrl);
      return true;
    } catch {
      return false;
    }
  };

  const handlePreloadAll = async () => {
    setIsPreloading(true);

    for (let i = 0; i < lessons.length; i++) {
      const lesson = lessons[i];
      if (lesson.status === 'cached') continue;

      // Update status to loading
      setLessons(prev => prev.map((l, idx) =>
        idx === i ? { ...l, status: 'loading' } : l
      ));

      const success = await preloadLesson(lesson.lessonId);

      // Update status based on result
      setLessons(prev => prev.map((l, idx) =>
        idx === i ? { ...l, status: success ? 'cached' : 'error' } : l
      ));

      if (success) {
        setCompletedCount(prev => prev + 1);
      }

      // Small delay between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    setIsPreloading(false);
  };

  const getStatusIcon = (status: PreloadStatus['status']) => {
    switch (status) {
      case 'cached':
        return (
          <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'loading':
        return (
          <svg className="w-5 h-5 text-blue-400 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full">
        <div className="card">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🎬</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Demo Audio Preloader</h1>
            <p className="text-slate-400">
              Pre-generate audio for demo lessons to ensure smooth playback during the demonstration.
            </p>
          </div>

          {/* Progress */}
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-400">Progress</span>
              <span className="text-white font-medium">{completedCount} / {lessons.length}</span>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-500"
                style={{ width: `${(completedCount / lessons.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Lesson List */}
          <div className="space-y-3 mb-6">
            {lessons.map((lesson) => (
              <div
                key={lesson.lessonId}
                className={`flex items-center gap-3 p-3 rounded-lg ${
                  lesson.status === 'loading' ? 'bg-blue-500/10 border border-blue-500/30' :
                  lesson.status === 'cached' ? 'bg-green-500/10 border border-green-500/30' :
                  lesson.status === 'error' ? 'bg-red-500/10 border border-red-500/30' :
                  'bg-slate-800/50'
                }`}
              >
                {getStatusIcon(lesson.status)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{lesson.title}</p>
                  <p className="text-xs text-slate-500">{lesson.lessonId}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handlePreloadAll}
              disabled={isPreloading || completedCount === lessons.length}
              className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPreloading ? 'Preloading...' : completedCount === lessons.length ? 'All Cached!' : 'Preload All'}
            </button>
            <Link href="/?demo=progress" className="btn-secondary">
              Start Demo
            </Link>
          </div>

          {completedCount === lessons.length && (
            <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-center">
              <p className="text-green-400 text-sm font-medium">
                ✓ All demo audio is cached and ready!
              </p>
            </div>
          )}
        </div>

        <p className="text-center text-slate-500 text-sm mt-6">
          Note: Audio generation requires ElevenLabs API key.
        </p>
      </div>
    </main>
  );
}
