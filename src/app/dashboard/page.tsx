'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { UserProgress, PathsData, LearningPath } from '@/types';
import PathProgress from '@/components/PathProgress';

export default function Dashboard() {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [pathsData, setPathsData] = useState<PathsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load progress from localStorage
    const savedProgress = localStorage.getItem('adaptlearn-progress');
    if (savedProgress) {
      setProgress(JSON.parse(savedProgress));
    } else {
      // Initialize empty progress
      const initialProgress: UserProgress = {
        currentPath: null,
        completedLessons: [],
        quizResults: {},
        topicMastery: {},
        lastActivity: null,
      };
      setProgress(initialProgress);
    }

    // Load paths data
    fetch('/api/paths')
      .then(res => res.json())
      .then(data => {
        setPathsData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-slate-400">Loading dashboard...</div>
      </div>
    );
  }

  const currentPath = pathsData?.paths.find(p => p.id === progress?.currentPath);
  const completedCount = progress?.completedLessons.length || 0;
  const totalLessons = currentPath?.lessonCount || 0;
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Your Dashboard</h1>
            <p className="text-slate-400">Track your learning progress</p>
          </div>
          <Link href="/" className="btn-secondary">
            Back to Home
          </Link>
        </div>

        {/* Current Path Progress */}
        {currentPath && progress ? (
          <div className="card mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-white">Current Path</h2>
                <p className="text-slate-400 text-sm">Your learning journey</p>
              </div>
              <Link
                href={`/path/${currentPath.id}`}
                className="text-sm px-4 py-2 rounded-lg transition-colors"
                style={{ backgroundColor: `${currentPath.color}20`, color: currentPath.color }}
              >
                View Full Path →
              </Link>
            </div>
            <PathProgress path={currentPath} progress={progress} compact />
          </div>
        ) : (
          <div className="card mb-8 text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-700 mb-4">
              <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <p className="text-slate-400 mb-2">You haven&apos;t started a learning path yet.</p>
            <p className="text-slate-500 text-sm mb-6">Take the assessment to find your perfect path</p>
            <div className="flex gap-4 justify-center">
              <Link href="/assessment" className="btn-primary">
                Take Assessment
              </Link>
              <Link href="/#paths" className="btn-secondary">
                Browse Paths
              </Link>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Lessons Completed"
            value={completedCount.toString()}
            icon="book"
          />
          <StatCard
            title="Quizzes Taken"
            value={Object.keys(progress?.quizResults || {}).length.toString()}
            icon="quiz"
          />
          <StatCard
            title="Topics Mastered"
            value={Object.values(progress?.topicMastery || {}).filter(t => t.score >= 70).length.toString()}
            icon="star"
          />
        </div>

        {/* Recent Activity / Recommendations */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">Continue Learning</h3>
            {currentPath && progress ? (
              <NextLessonCard path={currentPath} progress={progress} />
            ) : (
              <p className="text-slate-400">Start a learning path to get recommendations.</p>
            )}
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Quiz Results</h3>
            {Object.keys(progress?.quizResults || {}).length > 0 ? (
              <RecentQuizResults results={progress?.quizResults || {}} />
            ) : (
              <div className="text-center py-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-700 mb-3">
                  <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <p className="text-slate-400 text-sm">Complete lessons to see your quiz scores.</p>
              </div>
            )}
          </div>
        </div>

        {/* Knowledge Gaps */}
        {progress && Object.keys(progress.quizResults).length > 0 && (
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">Knowledge Insights</h3>
            <KnowledgeInsights progress={progress} />
          </div>
        )}
      </div>
    </main>
  );
}

function StatCard({ title, value, icon }: { title: string; value: string; icon: string }) {
  const iconMap: Record<string, JSX.Element> = {
    book: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    quiz: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    star: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
  };

  return (
    <div className="card">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400">
          {iconMap[icon]}
        </div>
        <div>
          <p className="text-3xl font-bold text-white">{value}</p>
          <p className="text-slate-400 text-sm">{title}</p>
        </div>
      </div>
    </div>
  );
}

function NextLessonCard({ path, progress }: { path: LearningPath; progress: UserProgress }) {
  const nextLesson = path.lessons.find(l => !progress.completedLessons.includes(l));
  const nextIndex = nextLesson ? path.lessons.indexOf(nextLesson) + 1 : 0;

  if (!nextLesson) {
    return (
      <div className="text-center py-4">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-500/20 mb-3">
          <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-green-400 font-medium">Path Completed!</p>
        <p className="text-slate-500 text-sm">Great job mastering this path</p>
      </div>
    );
  }

  return (
    <Link href={`/lesson/${nextLesson}`} className="block">
      <div
        className="p-4 rounded-lg border-2 border-dashed transition-all hover:border-solid"
        style={{ borderColor: `${path.color}50`, backgroundColor: `${path.color}10` }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
            style={{ backgroundColor: `${path.color}30`, color: path.color }}
          >
            {nextIndex}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-medium truncate">{formatLessonName(nextLesson)}</p>
            <p className="text-sm" style={{ color: path.color }}>Up next in your path</p>
          </div>
          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}

function formatLessonName(lessonId: string): string {
  return lessonId
    .replace(/-/g, ' ')
    .replace(/(\d+)$/, ' $1')
    .replace(/\b\w/g, l => l.toUpperCase())
    .trim();
}

function RecentQuizResults({ results }: { results: Record<string, { lessonId: string; score: number; totalQuestions: number; completedAt: string }> }) {
  const sortedResults = Object.values(results)
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
    .slice(0, 4);

  return (
    <div className="space-y-3">
      {sortedResults.map(result => {
        const percentage = Math.round((result.score / result.totalQuestions) * 100);
        const isPassing = percentage >= 70;
        return (
          <Link key={result.lessonId} href={`/lesson/${result.lessonId}`} className="block">
            <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                  isPassing ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                }`}
              >
                {percentage}%
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-slate-200 text-sm font-medium truncate">{formatLessonName(result.lessonId)}</p>
                <p className="text-slate-500 text-xs">
                  {result.score}/{result.totalQuestions} correct
                </p>
              </div>
              {isPassing ? (
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <span className="text-xs text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded">Review</span>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function KnowledgeInsights({ progress }: { progress: UserProgress }) {
  const results = Object.values(progress.quizResults);
  const totalQuizzes = results.length;

  if (totalQuizzes === 0) return null;

  const totalScore = results.reduce((sum, r) => sum + r.score, 0);
  const totalQuestions = results.reduce((sum, r) => sum + r.totalQuestions, 0);
  const averageScore = Math.round((totalScore / totalQuestions) * 100);

  const needsReview = results.filter(r => (r.score / r.totalQuestions) < 0.7);
  const mastered = results.filter(r => (r.score / r.totalQuestions) >= 0.9);

  return (
    <div className="grid sm:grid-cols-3 gap-4">
      <div className="text-center p-4 bg-slate-700/30 rounded-lg">
        <p className="text-3xl font-bold text-blue-400">{averageScore}%</p>
        <p className="text-slate-400 text-sm">Average Score</p>
      </div>
      <div className="text-center p-4 bg-slate-700/30 rounded-lg">
        <p className="text-3xl font-bold text-green-400">{mastered.length}</p>
        <p className="text-slate-400 text-sm">Lessons Mastered (90%+)</p>
      </div>
      <div className="text-center p-4 bg-slate-700/30 rounded-lg">
        <p className={`text-3xl font-bold ${needsReview.length > 0 ? 'text-yellow-400' : 'text-green-400'}`}>
          {needsReview.length}
        </p>
        <p className="text-slate-400 text-sm">Need Review (&lt;70%)</p>
      </div>

      {needsReview.length > 0 && (
        <div className="sm:col-span-3 mt-2 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <p className="text-yellow-400 text-sm font-medium mb-2">Recommended for Review:</p>
          <div className="flex flex-wrap gap-2">
            {needsReview.slice(0, 3).map(r => (
              <Link
                key={r.lessonId}
                href={`/lesson/${r.lessonId}`}
                className="text-xs bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full hover:bg-yellow-500/30 transition-colors"
              >
                {formatLessonName(r.lessonId)}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
