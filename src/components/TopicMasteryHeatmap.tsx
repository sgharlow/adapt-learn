'use client';

import Link from 'next/link';
import {
  TopicGap,
  GapAnalysis,
  GapRecommendation,
  getMasteryColor,
  getMasteryBgColor,
  MASTERY_THRESHOLD,
} from '@/lib/gapDetection';

interface TopicMasteryHeatmapProps {
  analysis: GapAnalysis;
}

export default function TopicMasteryHeatmap({ analysis }: TopicMasteryHeatmapProps) {
  const allTopics = [...analysis.strengths, ...analysis.gaps];

  return (
    <div className="space-y-6">
      {/* Overall Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatBadge
          value={Math.min(100, analysis.overallMastery)}
          label="Overall Mastery"
          suffix="%"
          color={Math.min(100, analysis.overallMastery) >= MASTERY_THRESHOLD ? '#10B981' : '#F59E0B'}
        />
        <StatBadge
          value={analysis.masteredTopics}
          label="Mastered"
          color="#10B981"
        />
        <StatBadge
          value={analysis.proficientTopics}
          label="Proficient"
          color="#F59E0B"
        />
        <StatBadge
          value={analysis.gapTopics + analysis.notStartedTopics}
          label="Need Work"
          color="#EF4444"
        />
      </div>

      {/* Topic Heatmap */}
      <div>
        <h4 className="text-sm font-medium text-slate-400 mb-3">Topic Mastery</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {allTopics.map((topic) => (
            <TopicCard key={topic.topic} topic={topic} />
          ))}
          {allTopics.length === 0 && (
            <p className="text-slate-500 text-sm col-span-2 text-center py-4">
              Complete lessons to see your topic mastery.
            </p>
          )}
        </div>
      </div>

      {/* Recommendations */}
      {analysis.recommendations.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-slate-400 mb-3">Recommended Actions</h4>
          <div className="space-y-2">
            {analysis.recommendations.map((rec, i) => (
              <RecommendationCard key={i} recommendation={rec} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatBadge({
  value,
  label,
  suffix = '',
  color,
}: {
  value: number;
  label: string;
  suffix?: string;
  color: string;
}) {
  return (
    <div
      className="p-3 rounded-lg text-center"
      style={{ backgroundColor: `${color}15` }}
    >
      <p className="text-2xl font-bold" style={{ color }}>
        {value}{suffix}
      </p>
      <p className="text-xs text-slate-400">{label}</p>
    </div>
  );
}

function TopicCard({ topic }: { topic: TopicGap }) {
  const color = getMasteryColor(topic.level);
  const bgColor = getMasteryBgColor(topic.level);

  const levelLabel = {
    'mastered': 'Mastered',
    'proficient': 'Proficient',
    'needs-work': 'Needs Work',
    'not-started': 'Not Started',
  }[topic.level];

  return (
    <div
      className="p-4 rounded-lg border transition-all hover:scale-[1.02]"
      style={{
        backgroundColor: bgColor,
        borderColor: `${color}30`,
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <h5 className="font-medium text-white">{topic.topic}</h5>
        <span
          className="text-xs px-2 py-1 rounded-full"
          style={{ backgroundColor: `${color}20`, color }}
        >
          {levelLabel}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-slate-700 rounded-full overflow-hidden mb-2">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${Math.min(100, topic.score)}%`,
            backgroundColor: color,
          }}
        />
      </div>

      <div className="flex justify-between text-xs">
        <span className="text-slate-400">
          {topic.lessonsCompleted} lesson{topic.lessonsCompleted !== 1 ? 's' : ''} completed
        </span>
        <span style={{ color }}>{Math.min(100, topic.score)}%</span>
      </div>

      {/* Review Links */}
      {topic.lessonsNeededForReview.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-700">
          <p className="text-xs text-slate-400 mb-2">Review recommended:</p>
          <div className="flex flex-wrap gap-1">
            {topic.lessonsNeededForReview.slice(0, 2).map((lessonId) => (
              <Link
                key={lessonId}
                href={`/lesson/${lessonId}`}
                className="text-xs px-2 py-1 rounded bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
              >
                {formatLessonName(lessonId)}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function RecommendationCard({ recommendation }: { recommendation: GapRecommendation }) {
  const priorityColors = {
    high: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400' },
    medium: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400' },
    low: { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400' },
  };

  const typeIcons = {
    review: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
    practice: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    advance: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
      </svg>
    ),
  };

  const colors = priorityColors[recommendation.priority];

  return (
    <Link href={`/lesson/${recommendation.lessonId}`}>
      <div
        className={`p-3 rounded-lg border ${colors.bg} ${colors.border} hover:scale-[1.01] transition-all`}
      >
        <div className="flex items-start gap-3">
          <div className={colors.text}>{typeIcons[recommendation.type]}</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white">{recommendation.reason}</p>
            <p className={`text-xs mt-1 ${colors.text}`}>
              {recommendation.type === 'review' ? 'Review' : recommendation.type === 'practice' ? 'Start' : 'Continue'}: {formatLessonName(recommendation.lessonId)}
            </p>
          </div>
          <svg className="w-5 h-5 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    .replace(/\b\w/g, (l) => l.toUpperCase())
    .trim();
}
