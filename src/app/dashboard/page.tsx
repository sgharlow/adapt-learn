'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { UserProgress, PathsData, LearningPath, Lesson } from '@/types';
import PathProgress from '@/components/PathProgress';
import TopicMasteryHeatmap from '@/components/TopicMasteryHeatmap';
import RecommendationCard from '@/components/RecommendationCard';
import ActivityTimeline from '@/components/ActivityTimeline';
import StreakDisplay, { StreakBadge } from '@/components/StreakDisplay';
import { analyzeGaps, extractTopicsFromLessons, GapAnalysis } from '@/lib/gapDetection';
import { calculateStats } from '@/lib/progressUtils';
import { VoiceCommandButton } from '@/hooks/useVoiceCommands';

// Type for enhanced recommendation from API
interface EnhancedRecommendation {
  nextLesson: string;
  lessonTitle: string;
  lessonTopic: string;
  reasoning: string;
  reasoningType: 'review' | 'continue' | 'advance' | 'fill-gap' | 'complete';
  priority: 'high' | 'medium' | 'low';
  pathProgress: number;
  topicMastery: number | null;
  alternativeLessons: { lessonId: string; title: string; topic: string; reason: string }[];
  voiceAnnouncement: string;
}

export default function Dashboard() {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [pathsData, setPathsData] = useState<PathsData | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [gapAnalysis, setGapAnalysis] = useState<GapAnalysis | null>(null);
  const [recommendation, setRecommendation] = useState<EnhancedRecommendation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load progress from localStorage
    const savedProgress = localStorage.getItem('adaptlearn-progress');
    let userProgress: UserProgress;
    if (savedProgress) {
      userProgress = JSON.parse(savedProgress);
      setProgress(userProgress);
    } else {
      // Initialize empty progress
      userProgress = {
        currentPath: null,
        completedLessons: [],
        quizResults: {},
        topicMastery: {},
        lastActivity: null,
      };
      setProgress(userProgress);
    }

    // Load paths data and lessons for gap analysis
    Promise.all([
      fetch('/api/paths').then(res => res.json()),
      loadAllLessons(),
    ])
      .then(async ([pathData, lessonData]) => {
        setPathsData(pathData);
        setLessons(lessonData);

        // Analyze gaps
        if (lessonData.length > 0) {
          const { allTopics, lessonTopicMap } = extractTopicsFromLessons(lessonData);
          const analysis = analyzeGaps(userProgress, allTopics, lessonTopicMap);
          setGapAnalysis(analysis);
        }

        // Fetch recommendation if user has a current path
        if (userProgress.currentPath) {
          try {
            const recRes = await fetch('/api/adapt/recommend', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userProgress,
                currentPath: userProgress.currentPath,
              }),
            });
            if (recRes.ok) {
              const recData = await recRes.json();
              setRecommendation(recData);
            }
          } catch (error) {
            console.error('Failed to fetch recommendation:', error);
          }
        }

        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Load all lessons from the current path
  async function loadAllLessons(): Promise<Lesson[]> {
    try {
      // Get list of lesson IDs from all paths
      const pathsRes = await fetch('/api/paths');
      const pathsData = await pathsRes.json();
      const allLessonIds = new Set<string>();

      for (const path of pathsData.paths) {
        for (const lessonId of path.lessons) {
          allLessonIds.add(lessonId);
        }
      }

      // Fetch each lesson
      const lessonPromises = Array.from(allLessonIds).map(async (id) => {
        try {
          const res = await fetch(`/api/lessons/${id}`);
          if (res.ok) return res.json();
          return null;
        } catch {
          return null;
        }
      });

      const lessons = await Promise.all(lessonPromises);
      return lessons.filter((l): l is Lesson => l !== null);
    } catch {
      return [];
    }
  }

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
          <div className="flex items-center gap-3">
            <VoiceCommandButton />
            <Link href="/" className="btn-secondary">
              Back to Home
            </Link>
          </div>
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
        {progress && (
          <StatsOverview progress={progress} />
        )}

        {/* Smart Recommendation */}
        {recommendation && currentPath && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Recommended Next</h3>
              <span className="text-xs text-slate-500">Powered by adaptive learning</span>
            </div>
            <RecommendationCard recommendation={recommendation} />
          </div>
        )}

        {/* Activity and Learning Options */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Activity Timeline */}
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
            <ActivityTimeline activities={progress?.activityLog || []} maxItems={6} />
          </div>

          {/* Learning Options or Quick Quiz Results */}
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">
              {recommendation ? 'Alternative Options' : 'Continue Learning'}
            </h3>
            {currentPath && progress ? (
              recommendation ? (
                <QuickLessonOptions path={currentPath} progress={progress} excludeLesson={recommendation.nextLesson} />
              ) : (
                <NextLessonCard path={currentPath} progress={progress} />
              )
            ) : (
              <p className="text-slate-400">Start a learning path to get recommendations.</p>
            )}
          </div>
        </div>

        {/* Streak and Quiz Performance */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Learning Streak */}
          <StreakDisplay streak={progress?.streak} />

          {/* Recent Quiz Results */}
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Quiz Scores</h3>
            {Object.keys(progress?.quizResults || {}).length > 0 ? (
              <RecentQuizResults results={progress?.quizResults || {}} />
            ) : (
              <div className="text-center py-6">
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

        {/* Knowledge Gaps & Topic Mastery */}
        {gapAnalysis && (
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">Knowledge Gaps & Mastery</h3>
            <TopicMasteryHeatmap analysis={gapAnalysis} />
          </div>
        )}

        {/* Legacy Knowledge Insights - shown when no gap analysis but has quiz results */}
        {!gapAnalysis && progress && Object.keys(progress.quizResults).length > 0 && (
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">Knowledge Insights</h3>
            <KnowledgeInsights progress={progress} />
          </div>
        )}
      </div>
    </main>
  );
}

function StatsOverview({ progress }: { progress: UserProgress }) {
  const stats = calculateStats(progress);

  return (
    <div className="mb-8">
      {/* Main stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <StatCard
          title="Lessons"
          value={stats.lessonsCompleted}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          }
          color="blue"
        />
        <StatCard
          title="Quizzes"
          value={stats.quizzesTaken}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          }
          color="green"
        />
        <StatCard
          title="Avg Score"
          value={stats.quizzesTaken > 0 ? `${stats.averageScore}%` : '-'}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
          color={stats.averageScore >= 70 ? 'green' : stats.averageScore >= 50 ? 'yellow' : 'red'}
        />
        <StatCard
          title="Streak"
          value={stats.currentStreak}
          icon={<span className="text-lg">🔥</span>}
          color="orange"
          subtitle={stats.longestStreak > stats.currentStreak ? `Best: ${stats.longestStreak}` : undefined}
        />
      </div>

      {/* Overall mastery bar */}
      {stats.totalTopics > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Overall Mastery</span>
            <span className="text-sm font-medium text-white">{stats.overallMastery}%</span>
          </div>
          <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${stats.overallMastery}%`,
                background: stats.overallMastery >= 70
                  ? 'linear-gradient(to right, #10B981, #34D399)'
                  : stats.overallMastery >= 50
                    ? 'linear-gradient(to right, #F59E0B, #FBBF24)'
                    : 'linear-gradient(to right, #EF4444, #F87171)',
              }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-slate-500">
            <span>{stats.topicsMastered} of {stats.totalTopics} topics mastered</span>
            <span>{stats.totalDaysActive} days learning</span>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
  subtitle,
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'yellow' | 'orange' | 'red';
  subtitle?: string;
}) {
  const colorClasses = {
    blue: 'bg-blue-500/10 text-blue-400',
    green: 'bg-green-500/10 text-green-400',
    yellow: 'bg-yellow-500/10 text-yellow-400',
    orange: 'bg-orange-500/10 text-orange-400',
    red: 'bg-red-500/10 text-red-400',
  };

  return (
    <div className="card">
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-white">{value}</p>
          <p className="text-slate-400 text-xs">{title}</p>
          {subtitle && <p className="text-slate-500 text-xs">{subtitle}</p>}
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

function QuickLessonOptions({
  path,
  progress,
  excludeLesson,
}: {
  path: LearningPath;
  progress: UserProgress;
  excludeLesson: string;
}) {
  // Get uncompleted lessons excluding the recommended one
  const availableLessons = path.lessons.filter(
    l => !progress.completedLessons.includes(l) && l !== excludeLesson
  ).slice(0, 3);

  // Get lessons that need review
  const reviewLessons = progress.completedLessons
    .filter(l => {
      if (l === excludeLesson) return false;
      const result = progress.quizResults[l];
      if (!result) return false;
      return (result.score / result.totalQuestions) < 0.7;
    })
    .slice(0, 2);

  if (availableLessons.length === 0 && reviewLessons.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-slate-400 text-sm">No alternative options available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {reviewLessons.length > 0 && (
        <>
          <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Review Opportunities</p>
          {reviewLessons.map(lessonId => {
            const result = progress.quizResults[lessonId];
            const score = result ? Math.round((result.score / result.totalQuestions) * 100) : 0;
            return (
              <Link
                key={lessonId}
                href={`/lesson/${lessonId}`}
                className="flex items-center justify-between p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg hover:bg-amber-500/20 transition-colors group"
              >
                <div>
                  <p className="text-sm text-white group-hover:text-amber-300 transition-colors">
                    {formatLessonName(lessonId)}
                  </p>
                  <p className="text-xs text-amber-500">Quiz score: {score}%</p>
                </div>
                <svg
                  className="w-4 h-4 text-amber-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </Link>
            );
          })}
        </>
      )}

      {availableLessons.length > 0 && (
        <>
          <p className="text-xs text-slate-500 uppercase tracking-wide mb-2 mt-4">Continue Path</p>
          {availableLessons.map((lessonId, index) => (
            <Link
              key={lessonId}
              href={`/lesson/${lessonId}`}
              className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium"
                  style={{ backgroundColor: `${path.color}30`, color: path.color }}
                >
                  {path.lessons.indexOf(lessonId) + 1}
                </div>
                <p className="text-sm text-slate-200 group-hover:text-white transition-colors">
                  {formatLessonName(lessonId)}
                </p>
              </div>
              <svg
                className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </>
      )}
    </div>
  );
}
