'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import type { LearningPath, PathsData, UserProgress } from '@/types';
import { loadProgress, saveProgress, getLastLessonForPath } from '@/lib/progressManager';
import { logPathStarted } from '@/lib/progressUtils';
import LoadingSpinner, { CardSkeleton } from '@/components/LoadingSpinner';

export default function PathPage() {
  const params = useParams();
  const router = useRouter();
  const pathId = params.id as string;

  const [path, setPath] = useState<LearningPath | null>(null);
  const [allPaths, setAllPaths] = useState<LearningPath[]>([]);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load progress using progress manager
    const userProgress = loadProgress();
    setProgress(userProgress);

    // Load path data
    fetch('/api/paths')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load paths');
        return res.json();
      })
      .then((data: PathsData) => {
        setAllPaths(data.paths);
        const foundPath = data.paths.find(p => p.id === pathId);
        setPath(foundPath || null);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [pathId]);

  const startPath = () => {
    if (!path || path.lessons.length === 0) return;

    // Load current progress and update
    let currentProgress = loadProgress();

    // Get the next lesson to continue from
    const nextLesson = getLastLessonForPath(path.lessons) || path.lessons[0];

    // Update progress with current path
    currentProgress = {
      ...currentProgress,
      currentPath: pathId,
      lastActivity: new Date().toISOString(),
    };

    // Log path started if it's a new path
    if (currentProgress.currentPath !== pathId) {
      currentProgress = logPathStarted(currentProgress, pathId, path.name);
    }

    saveProgress(currentProgress);
    router.push(`/lesson/${nextLesson}`);
  };

  if (loading) {
    return (
      <main className="min-h-screen">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="h-4 bg-slate-700 rounded w-24 mb-6 animate-pulse" />
          <div className="h-6 bg-slate-700 rounded w-32 mb-4 animate-pulse" />
          <div className="h-10 bg-slate-700 rounded w-2/3 mb-4 animate-pulse" />
          <div className="h-6 bg-slate-700 rounded w-full mb-6 animate-pulse" />
          <div className="flex gap-6 mb-8">
            <div className="h-5 bg-slate-700 rounded w-24 animate-pulse" />
            <div className="h-5 bg-slate-700 rounded w-20 animate-pulse" />
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="h-8 bg-slate-700 rounded w-32 mb-6 animate-pulse" />
          <CardSkeleton count={5} />
          <div className="flex justify-center mt-8">
            <LoadingSpinner text="Loading learning path..." />
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <Link href="/" className="btn-primary">Back to Home</Link>
        </div>
      </div>
    );
  }

  if (!path) {
    return (
      <div className="min-h-screen py-12">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20 text-red-400 mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Path Not Found</h1>
          <p className="text-slate-400 mb-6">The learning path you&apos;re looking for doesn&apos;t exist.</p>

          {allPaths.length > 0 && (
            <div className="mb-6">
              <p className="text-slate-400 text-sm mb-3">Available paths:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {allPaths.map(p => (
                  <Link
                    key={p.id}
                    href={`/path/${p.id}`}
                    className="px-4 py-2 rounded-lg text-sm transition-colors"
                    style={{ backgroundColor: `${p.color}20`, color: p.color }}
                  >
                    {p.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          <Link href="/" className="btn-primary">Back to Home</Link>
        </div>
      </div>
    );
  }

  const completedLessons = progress?.completedLessons || [];
  const completedCount = path.lessons.filter(l => completedLessons.includes(l)).length;
  const progressPercent = Math.round((completedCount / path.lessons.length) * 100);

  return (
    <main className="min-h-screen">
      {/* Header */}
      <div
        className="relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${path.color}20, transparent)` }}
      >
        <div className="max-w-4xl mx-auto px-4 py-12">
          <Link href="/" className="text-blue-400 hover:text-blue-300 text-sm mb-6 inline-block">
            &larr; Back to Paths
          </Link>

          <div className="flex items-start justify-between">
            <div>
              <span
                className="inline-block px-3 py-1 rounded-full text-sm font-medium mb-4"
                style={{ backgroundColor: `${path.color}20`, color: path.color }}
              >
                {path.difficulty}
              </span>
              <h1 className="text-4xl font-bold text-white mb-4">{path.name}</h1>
              <p className="text-xl text-slate-300 mb-6">{path.description}</p>

              <div className="flex items-center gap-6 text-slate-400">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span>{path.lessonCount} lessons</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{path.duration}</span>
                </div>
              </div>
            </div>

            <button onClick={startPath} className="btn-primary text-lg">
              {completedCount > 0 ? 'Continue' : 'Start Path'}
            </button>
          </div>

          {/* Progress Bar */}
          {completedCount > 0 && (
            <div className="mt-8">
              <div className="flex justify-between text-sm text-slate-400 mb-2">
                <span>{completedCount} of {path.lessons.length} completed</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-3">
                <div
                  className="h-3 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%`, backgroundColor: path.color }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lesson List */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-white mb-6">Lessons</h2>

        <div className="space-y-3">
          {path.lessons.map((lessonId, index) => {
            const isCompleted = completedLessons.includes(lessonId);
            const isNext = !isCompleted && path.lessons.findIndex(l => !completedLessons.includes(l)) === index;

            // Check for milestone after this lesson
            const milestone = path.milestones.find(m => m.afterLesson === index + 1);

            return (
              <div key={lessonId}>
                <Link href={`/lesson/${lessonId}`}>
                  <div className={`
                    flex items-center gap-4 p-4 rounded-lg border transition-all
                    ${isCompleted
                      ? 'bg-green-500/10 border-green-500/30'
                      : isNext
                        ? 'bg-blue-500/10 border-blue-500/50 ring-2 ring-blue-500/20'
                        : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                    }
                  `}>
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold
                      ${isCompleted
                        ? 'bg-green-500 text-white'
                        : isNext
                          ? 'bg-blue-500 text-white'
                          : 'bg-slate-700 text-slate-400'
                      }
                    `}>
                      {isCompleted ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        index + 1
                      )}
                    </div>

                    <div className="flex-1">
                      <p className={`font-medium ${isCompleted ? 'text-green-400' : 'text-white'}`}>
                        {lessonId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </p>
                      {isNext && <p className="text-blue-400 text-sm">Up next</p>}
                    </div>

                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>

                {/* Milestone */}
                {milestone && (
                  <div className="ml-5 mt-3 mb-3 pl-8 border-l-2 border-yellow-500/30">
                    <div className="flex items-center gap-2 text-yellow-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                      <span className="font-medium">{milestone.title}</span>
                    </div>
                    <p className="text-slate-400 text-sm mt-1">{milestone.message}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
