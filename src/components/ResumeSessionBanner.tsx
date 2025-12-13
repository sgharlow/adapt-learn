'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { loadProgress, hasStartedLearning, getLastLessonForPath } from '@/lib/progressManager';
import type { LearningPath } from '@/types';

interface ResumeSessionBannerProps {
  paths: LearningPath[];
}

export default function ResumeSessionBanner({ paths }: ResumeSessionBannerProps) {
  const [showBanner, setShowBanner] = useState(false);
  const [currentPath, setCurrentPath] = useState<LearningPath | null>(null);
  const [nextLesson, setNextLesson] = useState<string | null>(null);
  const [progressPercent, setProgressPercent] = useState(0);

  useEffect(() => {
    if (!hasStartedLearning()) {
      setShowBanner(false);
      return;
    }

    const progress = loadProgress();

    if (!progress.currentPath) {
      setShowBanner(false);
      return;
    }

    const path = paths.find(p => p.id === progress.currentPath);
    if (!path) {
      setShowBanner(false);
      return;
    }

    setCurrentPath(path);

    // Calculate progress
    const completedInPath = path.lessons.filter(l => progress.completedLessons.includes(l)).length;
    const percent = Math.round((completedInPath / path.lessons.length) * 100);
    setProgressPercent(percent);

    // Get next lesson
    const next = getLastLessonForPath(path.lessons);
    setNextLesson(next);

    // Show banner if not 100% complete
    setShowBanner(percent < 100);
  }, [paths]);

  if (!showBanner || !currentPath) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/30 rounded-xl p-5 mb-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${currentPath.color}30`, color: currentPath.color }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-slate-400 text-sm">Continue where you left off</p>
            <p className="text-white font-medium">{currentPath.name}</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-24 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${progressPercent}%`, backgroundColor: currentPath.color }}
                />
              </div>
              <span className="text-xs text-slate-500">{progressPercent}% complete</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3 w-full sm:w-auto">
          {nextLesson && (
            <Link
              href={`/lesson/${nextLesson}`}
              className="flex-1 sm:flex-none btn-primary text-center"
            >
              Continue Learning
            </Link>
          )}
          <Link
            href="/dashboard"
            className="flex-1 sm:flex-none btn-secondary text-center"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

// Compact version for headers
export function ResumeSessionChip({ paths }: { paths: LearningPath[] }) {
  const [currentPath, setCurrentPath] = useState<LearningPath | null>(null);
  const [nextLesson, setNextLesson] = useState<string | null>(null);

  useEffect(() => {
    if (!hasStartedLearning()) return;

    const progress = loadProgress();
    if (!progress.currentPath) return;

    const path = paths.find(p => p.id === progress.currentPath);
    if (!path) return;

    const completedInPath = path.lessons.filter(l => progress.completedLessons.includes(l)).length;
    if (completedInPath >= path.lessons.length) return;

    setCurrentPath(path);
    setNextLesson(getLastLessonForPath(path.lessons));
  }, [paths]);

  if (!currentPath || !nextLesson) {
    return null;
  }

  return (
    <Link
      href={`/lesson/${nextLesson}`}
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors hover:bg-blue-500/20"
      style={{ backgroundColor: `${currentPath.color}15`, color: currentPath.color }}
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>Continue {currentPath.name}</span>
    </Link>
  );
}
