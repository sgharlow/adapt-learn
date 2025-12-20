'use client';

import Link from 'next/link';
import type { LearningPath, UserProgress } from '@/types';

interface PathProgressProps {
  path: LearningPath;
  progress: UserProgress;
  compact?: boolean;
}

export default function PathProgress({ path, progress, compact = false }: PathProgressProps) {
  const completedLessons = progress.completedLessons || [];
  const completedCount = path.lessons.filter(l => completedLessons.includes(l)).length;
  const progressPercent = Math.round((completedCount / path.lessons.length) * 100);

  // Find milestones and their positions
  const getMilestoneAt = (index: number) => {
    return path.milestones.find(m => m.afterLesson === index + 1);
  };

  if (compact) {
    return (
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-white">{path.name}</h3>
          <span className="text-2xl font-bold" style={{ color: path.color }}>
            {progressPercent}%
          </span>
        </div>

        {/* Compact Progress Bar */}
        <div className="relative mb-3">
          <div className="w-full bg-slate-700 rounded-full h-3">
            <div
              className="h-3 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%`, backgroundColor: path.color }}
            />
          </div>
          {/* Milestone markers */}
          {path.milestones.map(milestone => {
            const position = (milestone.afterLesson / path.lessons.length) * 100;
            const isReached = completedCount >= milestone.afterLesson;
            return (
              <div
                key={milestone.afterLesson}
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 transition-colors"
                style={{
                  left: `${position}%`,
                  transform: 'translate(-50%, -50%)',
                  backgroundColor: isReached ? path.color : '#334155',
                  borderColor: isReached ? path.color : '#475569',
                }}
                title={milestone.title}
              />
            );
          })}
        </div>

        <p className="text-slate-400 text-sm">
          {completedCount} of {path.lessons.length} lessons completed
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold text-white">{path.name}</h3>
          <p className="text-slate-400 text-sm">{completedCount} of {path.lessons.length} lessons</p>
        </div>
        <div className="text-right">
          <span className="text-3xl font-bold" style={{ color: path.color }}>
            {progressPercent}%
          </span>
          <p className="text-slate-400 text-sm">complete</p>
        </div>
      </div>

      {/* Visual Path */}
      <div className="relative">
        {path.lessons.map((lessonId, index) => {
          const isCompleted = completedLessons.includes(lessonId);
          const isNext = !isCompleted && path.lessons.findIndex(l => !completedLessons.includes(l)) === index;
          const milestone = getMilestoneAt(index);

          return (
            <div key={lessonId} className="relative">
              {/* Connector Line */}
              {index > 0 && (
                <div
                  className="absolute left-5 -top-2 w-0.5 h-4"
                  style={{
                    backgroundColor: completedLessons.includes(path.lessons[index - 1])
                      ? path.color
                      : '#475569',
                  }}
                />
              )}

              {/* Lesson Node */}
              <Link href={`/lesson/${lessonId}`}>
                <div
                  className={`
                    flex items-center gap-4 p-3 rounded-lg transition-all
                    ${isNext ? 'bg-slate-700/50 ring-2 ring-offset-2 ring-offset-slate-900' : 'hover:bg-slate-800/50'}
                  `}
                  style={isNext ? { '--tw-ring-color': path.color } as React.CSSProperties : {}}
                >
                  {/* Node Circle */}
                  <div
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                      transition-all text-sm font-bold
                    `}
                    style={{
                      backgroundColor: isCompleted ? path.color : isNext ? `${path.color}30` : '#334155',
                      color: isCompleted ? 'white' : isNext ? path.color : '#94a3b8',
                      border: isNext ? `2px solid ${path.color}` : 'none',
                    }}
                  >
                    {isCompleted ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      index + 1
                    )}
                  </div>

                  {/* Lesson Info */}
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium truncate ${isCompleted ? 'text-slate-300' : isNext ? 'text-white' : 'text-slate-400'}`}>
                      {formatLessonName(lessonId)}
                    </p>
                    {isNext && (
                      <p className="text-sm" style={{ color: path.color }}>Up next</p>
                    )}
                    {isCompleted && progress.quizResults?.[lessonId] && (
                      <p className="text-sm text-slate-500">
                        Quiz: {Math.min(100, Math.round((Math.min(progress.quizResults[lessonId].score, progress.quizResults[lessonId].totalQuestions) / progress.quizResults[lessonId].totalQuestions) * 100))}%
                      </p>
                    )}
                  </div>

                  {/* Arrow */}
                  <svg className="w-5 h-5 text-slate-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>

              {/* Milestone Badge */}
              {milestone && (
                <div className="ml-14 my-2 flex items-center gap-2">
                  <div
                    className={`
                      flex items-center gap-2 px-3 py-1.5 rounded-full text-sm
                      ${completedCount >= milestone.afterLesson
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-slate-700/50 text-slate-500'
                      }
                    `}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                    <span className="font-medium">{milestone.title}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function formatLessonName(lessonId: string): string {
  return lessonId
    .replace(/-/g, ' ')
    .replace(/(\d+)$/, ' $1')
    .replace(/\b\w/g, l => l.toUpperCase())
    .trim();
}

// Horizontal progress bar variant for dashboard
export function PathProgressBar({ path, progress }: { path: LearningPath; progress: UserProgress }) {
  const completedLessons = progress.completedLessons || [];
  const completedCount = path.lessons.filter(l => completedLessons.includes(l)).length;
  const progressPercent = Math.round((completedCount / path.lessons.length) * 100);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-white font-medium">{path.name}</span>
        <span className="text-slate-400 text-sm">{completedCount}/{path.lessons.length}</span>
      </div>
      <div className="relative h-8 bg-slate-700 rounded-lg overflow-hidden">
        {/* Progress fill */}
        <div
          className="absolute inset-y-0 left-0 transition-all duration-500 rounded-lg"
          style={{ width: `${progressPercent}%`, backgroundColor: path.color }}
        />

        {/* Lesson dots */}
        <div className="absolute inset-0 flex items-center justify-between px-1">
          {path.lessons.map((lessonId, index) => {
            const isCompleted = completedLessons.includes(lessonId);
            const position = ((index + 0.5) / path.lessons.length) * 100;

            return (
              <div
                key={lessonId}
                className={`
                  w-2 h-2 rounded-full transition-all
                  ${isCompleted ? 'bg-white' : 'bg-slate-600'}
                `}
                style={{ position: 'absolute', left: `${position}%`, transform: 'translateX(-50%)' }}
                title={formatLessonName(lessonId)}
              />
            );
          })}
        </div>

        {/* Percentage label */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-sm font-bold ${progressPercent > 50 ? 'text-white' : 'text-slate-300'}`}>
            {progressPercent}%
          </span>
        </div>
      </div>
    </div>
  );
}
