'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import type { PathsData, LearningPath, UserProgress } from '@/types';
import { useLessonTitles } from '@/hooks/useLessonTitles';

interface LessonNavigationProps {
  currentLessonId: string;
}

export default function LessonNavigation({ currentLessonId }: LessonNavigationProps) {
  const [pathData, setPathData] = useState<{ path: LearningPath; index: number } | null>(null);
  const [progress, setProgress] = useState<UserProgress | null>(null);

  // Get all lesson IDs from the path for title fetching
  const allLessonIds = useMemo(() => {
    return pathData?.path.lessons || [];
  }, [pathData]);

  // Fetch lesson titles
  const { getTitle } = useLessonTitles(allLessonIds);

  useEffect(() => {
    // Load user progress to get current path
    const savedProgress = localStorage.getItem('adaptlearn-progress');
    if (savedProgress) {
      setProgress(JSON.parse(savedProgress));
    }

    // Load paths data
    fetch('/api/paths')
      .then(res => res.json())
      .then((data: PathsData) => {
        // First, try to find the path from user progress
        let currentPath: LearningPath | undefined;
        const prog = savedProgress ? JSON.parse(savedProgress) : null;

        if (prog?.currentPath) {
          currentPath = data.paths.find(p => p.id === prog.currentPath);
        }

        // If not found, search all paths for this lesson
        if (!currentPath) {
          currentPath = data.paths.find(p => p.lessons.includes(currentLessonId));
        }

        if (currentPath) {
          const index = currentPath.lessons.indexOf(currentLessonId);
          if (index !== -1) {
            setPathData({ path: currentPath, index });
          }
        }
      })
      .catch(console.error);
  }, [currentLessonId]);

  if (!pathData) {
    return null;
  }

  const { path, index } = pathData;
  const prevLesson = index > 0 ? path.lessons[index - 1] : null;
  const nextLesson = index < path.lessons.length - 1 ? path.lessons[index + 1] : null;
  const isCompleted = progress?.completedLessons?.includes(currentLessonId);

  // Check for milestone after this lesson
  const milestone = path.milestones.find(m => m.afterLesson === index + 1);
  const isMilestoneReached = isCompleted && milestone;

  return (
    <div className="border-t border-slate-700 mt-8 pt-8">
      {/* Milestone celebration */}
      {isMilestoneReached && (
        <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-center">
          <div className="flex items-center justify-center gap-2 text-yellow-400 mb-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            <span className="font-bold text-lg">{milestone.title}</span>
          </div>
          <p className="text-slate-300">{milestone.message}</p>
        </div>
      )}

      {/* Progress indicator */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-slate-400 text-sm">
          Lesson {index + 1} of {path.lessons.length} in {path.name}
        </span>
        <Link
          href={`/path/${path.id}`}
          className="text-blue-400 hover:text-blue-300 text-sm"
        >
          View Full Path -&gt;
        </Link>
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between gap-4">
        {prevLesson ? (
          <Link
            href={`/lesson/${prevLesson}`}
            className="flex-1 flex items-center gap-3 p-4 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg border border-slate-700 transition-colors group"
          >
            <svg className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <div className="text-left">
              <p className="text-xs text-slate-500 uppercase">Previous</p>
              <p className="text-slate-300 group-hover:text-white transition-colors font-medium truncate">
                {getTitle(prevLesson)}
              </p>
            </div>
          </Link>
        ) : (
          <div className="flex-1" />
        )}

        {nextLesson ? (
          <Link
            href={`/lesson/${nextLesson}`}
            className="flex-1 flex items-center justify-end gap-3 p-4 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg border border-slate-700 transition-colors group"
          >
            <div className="text-right">
              <p className="text-xs text-slate-500 uppercase">Next</p>
              <p className="text-slate-300 group-hover:text-white transition-colors font-medium truncate">
                {getTitle(nextLesson)}
              </p>
            </div>
            <svg className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ) : (
          <Link
            href="/dashboard"
            className="flex-1 flex items-center justify-end gap-3 p-4 bg-green-500/20 hover:bg-green-500/30 rounded-lg border border-green-500/30 transition-colors group"
          >
            <div className="text-right">
              <p className="text-xs text-green-400 uppercase">Path Complete!</p>
              <p className="text-green-300 font-medium">View Dashboard</p>
            </div>
            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </Link>
        )}
      </div>

      {/* Mini progress bar */}
      <div className="mt-4">
        <div className="flex gap-1">
          {path.lessons.map((lessonId, i) => {
            const isCurrentLesson = lessonId === currentLessonId;
            const isLessonCompleted = progress?.completedLessons?.includes(lessonId);

            return (
              <Link
                key={lessonId}
                href={`/lesson/${lessonId}`}
                className={`
                  flex-1 h-2 rounded-full transition-all
                  ${isCurrentLesson
                    ? 'ring-2 ring-white ring-offset-1 ring-offset-slate-900'
                    : ''
                  }
                `}
                style={{
                  backgroundColor: isLessonCompleted
                    ? path.color
                    : isCurrentLesson
                      ? `${path.color}80`
                      : '#334155',
                }}
                title={getTitle(lessonId)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
