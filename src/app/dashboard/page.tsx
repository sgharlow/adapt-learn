'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import type { UserProgress, PathsData, LearningPath, Lesson } from '@/types';
import PathProgress from '@/components/PathProgress';
import TopicMasteryHeatmap from '@/components/TopicMasteryHeatmap';
import RecommendationCard from '@/components/RecommendationCard';
import ActivityTimeline from '@/components/ActivityTimeline';
import StreakDisplay from '@/components/StreakDisplay';
import DemoModeBanner from '@/components/DemoModeBanner';
import { analyzeGaps, extractTopicsFromLessons, GapAnalysis } from '@/lib/gapDetection';
import { calculateStats } from '@/lib/progressUtils';
import { loadProgress } from '@/lib/progressManager';
import { VoiceCommandButton } from '@/hooks/useVoiceCommands';
import { useDemoMode } from '@/hooks/useDemoMode';
import LoadingSpinner, { CardSkeleton, ProgressBarSkeleton } from '@/components/LoadingSpinner';

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
  const [lessonTitlesMap, setLessonTitlesMap] = useState<Record<string, string>>({});
  const [gapAnalysis, setGapAnalysis] = useState<GapAnalysis | null>(null);
  const [recommendation, setRecommendation] = useState<EnhancedRecommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const { isDemoMode, scenario } = useDemoMode();

  useEffect(() => {
    // Load progress using the progress manager
    const userProgress = loadProgress();
    setProgress(userProgress);

    // Load paths data and lessons for gap analysis
    Promise.all([
      fetch('/api/paths').then(res => res.json()),
      loadAllLessons(),
    ])
      .then(async ([pathData, lessonData]) => {
        setPathsData(pathData);
        setLessons(lessonData);

        // Build lesson titles map
        const titlesMap: Record<string, string> = {};
        lessonData.forEach((lesson: Lesson) => {
          titlesMap[lesson.id] = lesson.title;
        });
        setLessonTitlesMap(titlesMap);

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
      const pathsRes = await fetch('/api/paths');
      const pathsData = await pathsRes.json();
      const allLessonIds = new Set<string>();

      for (const path of pathsData.paths) {
        for (const lessonId of path.lessons) {
          allLessonIds.add(lessonId);
        }
      }

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

  // Helper function to get lesson title
  const getLessonTitle = (lessonId: string): string => {
    return lessonTitlesMap[lessonId] || lessonId.replace(/-/g, ' ').replace(/(\d+)$/, ' $1').replace(/\b\w/g, l => l.toUpperCase()).trim();
  };

  if (loading) {
    return (
      <main className="min-h-screen">
        <div className="glass border-b border-slate-700/50">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <div className="h-8 bg-slate-700 rounded w-48 mb-2 animate-pulse" />
            <div className="h-4 bg-slate-700 rounded w-64 animate-pulse" />
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="card mb-8">
            <ProgressBarSkeleton />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <CardSkeleton count={4} />
          </div>
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" text="Loading your progress..." />
          </div>
        </div>
      </main>
    );
  }

  const currentPath = pathsData?.paths.find(p => p.id === progress?.currentPath);
  const stats = progress ? calculateStats(progress) : null;

  return (
    <main className="min-h-screen pb-12">
      {/* Header */}
      <div className="glass border-b border-slate-700/50 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
            >
              <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-sm font-medium">Home</span>
            </Link>
            <VoiceCommandButton />
          </div>
        </div>
      </div>

      {/* Welcome Section */}
      <div className="bg-gradient-to-b from-slate-800/50 to-transparent">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <WelcomeHeader stats={stats} currentPath={currentPath} />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4">
        {/* Current Path Progress */}
        {currentPath && progress ? (
          <div className="card mb-8 relative overflow-hidden">
            <div
              className="absolute top-0 left-0 right-0 h-1"
              style={{ background: `linear-gradient(90deg, ${currentPath.color}, ${currentPath.color}80)` }}
            />
            <div className="pt-2">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${currentPath.color}20` }}
                  >
                    <svg className="w-6 h-6" style={{ color: currentPath.color }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">{currentPath.name}</h2>
                    <p className="text-slate-400 text-sm">Your current learning path</p>
                  </div>
                </div>
                <Link
                  href={`/path/${currentPath.id}`}
                  className="btn-ghost text-sm flex items-center gap-2 group"
                  style={{ color: currentPath.color }}
                >
                  <span>View Path</span>
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
              <PathProgress path={currentPath} progress={progress} compact />
            </div>
          </div>
        ) : (
          <EmptyStateCard />
        )}

        {/* Stats Grid */}
        {stats && <StatsOverview stats={stats} />}

        {/* Smart Recommendation */}
        {recommendation && currentPath && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                Recommended Next
              </h3>
              <span className="badge badge-blue">AI Powered</span>
            </div>
            <RecommendationCard recommendation={recommendation} />
          </div>
        )}

        {/* Activity and Learning Options */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Activity Timeline */}
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
            </div>
            <ActivityTimeline activities={progress?.activityLog || []} maxItems={6} />
          </div>

          {/* Learning Options or Quick Quiz Results */}
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white">
                {recommendation ? 'Alternative Options' : 'Continue Learning'}
              </h3>
            </div>
            {currentPath && progress ? (
              recommendation ? (
                <QuickLessonOptions path={currentPath} progress={progress} excludeLesson={recommendation.nextLesson} getLessonTitle={getLessonTitle} />
              ) : (
                <NextLessonCard path={currentPath} progress={progress} getLessonTitle={getLessonTitle} />
              )
            ) : (
              <div className="text-center py-6">
                <p className="text-slate-400">Start a learning path to get recommendations.</p>
              </div>
            )}
          </div>
        </div>

        {/* Streak and Quiz Performance */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Learning Streak */}
          <StreakDisplay streak={progress?.streak} />

          {/* Recent Quiz Results */}
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white">Recent Quiz Scores</h3>
            </div>
            {Object.keys(progress?.quizResults || {}).length > 0 ? (
              <RecentQuizResults results={progress?.quizResults || {}} getLessonTitle={getLessonTitle} />
            ) : (
              <div className="text-center py-8">
                <div className="w-14 h-14 rounded-2xl bg-slate-700/50 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <p className="text-slate-400 text-sm">Complete lessons and take quizzes</p>
                <p className="text-slate-500 text-xs mt-1">Your scores will appear here</p>
              </div>
            )}
          </div>
        </div>

        {/* Knowledge Gaps & Topic Mastery */}
        {gapAnalysis && (
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Knowledge Map</h3>
                <p className="text-slate-400 text-sm">Your topic mastery at a glance</p>
              </div>
            </div>
            <TopicMasteryHeatmap analysis={gapAnalysis} />
          </div>
        )}

        {/* Legacy Knowledge Insights */}
        {!gapAnalysis && progress && Object.keys(progress.quizResults).length > 0 && (
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white">Knowledge Insights</h3>
            </div>
            <KnowledgeInsights progress={progress} getLessonTitle={getLessonTitle} />
          </div>
        )}
      </div>

      {/* Demo Mode Banner */}
      {isDemoMode && scenario && <DemoModeBanner scenario={scenario} />}
    </main>
  );
}

function WelcomeHeader({ stats, currentPath }: { stats: ReturnType<typeof calculateStats> | null; currentPath?: LearningPath }) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getMotivation = () => {
    if (!stats) return 'Ready to start your AI learning journey?';
    if (stats.currentStreak > 0) return `${stats.currentStreak} day streak! Keep it going!`;
    if (stats.lessonsCompleted > 0) return 'Welcome back! Continue where you left off.';
    return 'Ready to start your AI learning journey?';
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{getGreeting()}!</h1>
        <p className="text-slate-400">{getMotivation()}</p>
      </div>

      {stats && stats.overallMastery > 0 && (
        <div className="flex items-center gap-6">
          {/* Progress Ring */}
          <div className="relative">
            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
              <circle
                cx="18"
                cy="18"
                r="16"
                fill="none"
                className="stroke-slate-700"
                strokeWidth="3"
              />
              <circle
                cx="18"
                cy="18"
                r="16"
                fill="none"
                stroke={currentPath?.color || '#3b82f6'}
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={`${stats.overallMastery}, 100`}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold text-white">{stats.overallMastery}%</span>
            </div>
          </div>
          <div className="hidden sm:block">
            <p className="text-white font-medium">Overall Mastery</p>
            <p className="text-slate-400 text-sm">{stats.topicsMastered} of {stats.totalTopics} topics</p>
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyStateCard() {
  return (
    <div className="card mb-8 text-center py-12 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/25">
        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">Start Your Learning Journey</h3>
      <p className="text-slate-400 mb-6 max-w-md mx-auto">
        Take a quick assessment to find the perfect learning path for you, or browse all available paths.
      </p>
      <div className="flex gap-4 justify-center">
        <Link href="/assessment" className="btn-primary">
          Take Assessment
        </Link>
        <Link href="/#paths" className="btn-secondary">
          Browse Paths
        </Link>
      </div>
    </div>
  );
}

function StatsOverview({ stats }: { stats: ReturnType<typeof calculateStats> }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
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
        icon={<span className="text-xl">🔥</span>}
        color="orange"
        subtitle={stats.longestStreak > stats.currentStreak ? `Best: ${stats.longestStreak}` : undefined}
      />
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
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    green: 'bg-green-500/10 text-green-400 border-green-500/20',
    yellow: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    orange: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    red: 'bg-red-500/10 text-red-400 border-red-500/20',
  };

  return (
    <div className="card card-hover group">
      <div className="flex items-center gap-3">
        <div className={`p-3 rounded-xl border ${colorClasses[color]} group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-white">{value}</p>
          <p className="text-slate-400 text-sm">{title}</p>
          {subtitle && <p className="text-slate-500 text-xs">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}

function NextLessonCard({ path, progress, getLessonTitle }: { path: LearningPath; progress: UserProgress; getLessonTitle: (id: string) => string }) {
  const nextLesson = path.lessons.find(l => !progress.completedLessons.includes(l));
  const nextIndex = nextLesson ? path.lessons.indexOf(nextLesson) + 1 : 0;

  if (!nextLesson) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/25">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-green-400 font-semibold text-lg">Path Completed!</p>
        <p className="text-slate-400 text-sm mt-1">Great job mastering this path</p>
      </div>
    );
  }

  return (
    <Link href={`/lesson/${nextLesson}`} className="block group">
      <div
        className="p-5 rounded-xl border-2 border-dashed transition-all group-hover:border-solid group-hover:shadow-lg"
        style={{ borderColor: `${path.color}50`, backgroundColor: `${path.color}08` }}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold group-hover:scale-110 transition-transform"
            style={{ backgroundColor: `${path.color}30`, color: path.color }}
          >
            {nextIndex}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-medium truncate group-hover:text-blue-400 transition-colors">
              {getLessonTitle(nextLesson)}
            </p>
            <p className="text-sm" style={{ color: path.color }}>Up next in your path</p>
          </div>
          <svg className="w-6 h-6 text-slate-400 group-hover:translate-x-1 group-hover:text-blue-400 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

function RecentQuizResults({ results, getLessonTitle }: { results: Record<string, { lessonId: string; score: number; totalQuestions: number; completedAt: string }>; getLessonTitle: (id: string) => string }) {
  const sortedResults = Object.values(results)
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
    .slice(0, 4);

  return (
    <div className="space-y-3">
      {sortedResults.map(result => {
        const percentage = Math.min(100, Math.round((Math.min(result.score, result.totalQuestions) / result.totalQuestions) * 100));
        const isPassing = percentage >= 70;
        return (
          <Link key={result.lessonId} href={`/lesson/${result.lessonId}`} className="block group">
            <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-xl hover:bg-slate-700/50 transition-all group-hover:translate-x-1">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold ${
                  isPassing ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                }`}
              >
                {percentage}%
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-slate-200 text-sm font-medium truncate group-hover:text-white transition-colors">
                  {getLessonTitle(result.lessonId)}
                </p>
                <p className="text-slate-500 text-xs">
                  {Math.min(result.score, result.totalQuestions)}/{result.totalQuestions} correct
                </p>
              </div>
              {isPassing ? (
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <span className="badge badge-yellow">Review</span>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function KnowledgeInsights({ progress, getLessonTitle }: { progress: UserProgress; getLessonTitle: (id: string) => string }) {
  const results = Object.values(progress.quizResults);
  const totalQuizzes = results.length;

  if (totalQuizzes === 0) return null;

  const totalScore = results.reduce((sum, r) => sum + Math.min(r.score, r.totalQuestions), 0);
  const totalQuestions = results.reduce((sum, r) => sum + r.totalQuestions, 0);
  const averageScore = Math.min(100, Math.round((totalScore / totalQuestions) * 100));

  const needsReview = results.filter(r => (Math.min(r.score, r.totalQuestions) / r.totalQuestions) < 0.7);
  const mastered = results.filter(r => (Math.min(r.score, r.totalQuestions) / r.totalQuestions) >= 0.9);

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="text-center p-4 bg-gradient-to-br from-blue-900/30 to-transparent rounded-xl border border-blue-500/20">
          <p className="text-3xl font-bold text-blue-400">{averageScore}%</p>
          <p className="text-slate-400 text-sm">Average Score</p>
        </div>
        <div className="text-center p-4 bg-gradient-to-br from-green-900/30 to-transparent rounded-xl border border-green-500/20">
          <p className="text-3xl font-bold text-green-400">{mastered.length}</p>
          <p className="text-slate-400 text-sm">Mastered (90%+)</p>
        </div>
        <div className="text-center p-4 bg-gradient-to-br from-yellow-900/30 to-transparent rounded-xl border border-yellow-500/20">
          <p className={`text-3xl font-bold ${needsReview.length > 0 ? 'text-yellow-400' : 'text-green-400'}`}>
            {needsReview.length}
          </p>
          <p className="text-slate-400 text-sm">Need Review</p>
        </div>
      </div>

      {needsReview.length > 0 && (
        <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
          <p className="text-yellow-400 text-sm font-medium mb-3">Recommended for Review:</p>
          <div className="flex flex-wrap gap-2">
            {needsReview.slice(0, 3).map(r => (
              <Link
                key={r.lessonId}
                href={`/lesson/${r.lessonId}`}
                className="badge badge-yellow hover:bg-yellow-500/30 transition-colors"
              >
                {getLessonTitle(r.lessonId)}
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
  getLessonTitle,
}: {
  path: LearningPath;
  progress: UserProgress;
  excludeLesson: string;
  getLessonTitle: (id: string) => string;
}) {
  const availableLessons = path.lessons.filter(
    l => !progress.completedLessons.includes(l) && l !== excludeLesson
  ).slice(0, 3);

  const reviewLessons = progress.completedLessons
    .filter(l => {
      if (l === excludeLesson) return false;
      const result = progress.quizResults[l];
      if (!result) return false;
      return (Math.min(result.score, result.totalQuestions) / result.totalQuestions) < 0.7;
    })
    .slice(0, 2);

  if (availableLessons.length === 0 && reviewLessons.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-slate-400 text-sm">No alternative options available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviewLessons.length > 0 && (
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wide mb-2 font-medium">Review Opportunities</p>
          <div className="space-y-2">
            {reviewLessons.map(lessonId => {
              const result = progress.quizResults[lessonId];
              const score = result ? Math.min(100, Math.round((Math.min(result.score, result.totalQuestions) / result.totalQuestions) * 100)) : 0;
              return (
                <Link
                  key={lessonId}
                  href={`/lesson/${lessonId}`}
                  className="flex items-center justify-between p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl hover:bg-amber-500/20 transition-all group"
                >
                  <div>
                    <p className="text-sm text-white group-hover:text-amber-300 transition-colors">
                      {getLessonTitle(lessonId)}
                    </p>
                    <p className="text-xs text-amber-500">Quiz score: {score}%</p>
                  </div>
                  <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {availableLessons.length > 0 && (
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wide mb-2 font-medium">Continue Path</p>
          <div className="space-y-2">
            {availableLessons.map((lessonId) => (
              <Link
                key={lessonId}
                href={`/lesson/${lessonId}`}
                className="flex items-center justify-between p-3 bg-slate-700/30 rounded-xl hover:bg-slate-700/50 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium"
                    style={{ backgroundColor: `${path.color}30`, color: path.color }}
                  >
                    {path.lessons.indexOf(lessonId) + 1}
                  </div>
                  <p className="text-sm text-slate-200 group-hover:text-white transition-colors">
                    {getLessonTitle(lessonId)}
                  </p>
                </div>
                <svg className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
