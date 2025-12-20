'use client';

import Link from 'next/link';
import type { ActivityLogEntry } from '@/types';
import { formatRelativeTime } from '@/lib/progressUtils';

interface ActivityTimelineProps {
  activities: ActivityLogEntry[];
  maxItems?: number;
}

export default function ActivityTimeline({ activities, maxItems = 8 }: ActivityTimelineProps) {
  const displayActivities = activities.slice(0, maxItems);

  if (displayActivities.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-700 mb-3">
          <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-slate-400 text-sm">No activity yet.</p>
        <p className="text-slate-500 text-xs">Start a lesson to see your progress here!</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-4 top-3 bottom-3 w-0.5 bg-slate-700" />

      <div className="space-y-1">
        {displayActivities.map((activity, index) => (
          <ActivityItem key={activity.id} activity={activity} isLast={index === displayActivities.length - 1} />
        ))}
      </div>
    </div>
  );
}

function ActivityItem({ activity, isLast }: { activity: ActivityLogEntry; isLast: boolean }) {
  const config = getActivityConfig(activity);

  const content = (
    <div className={`flex items-start gap-3 p-2 rounded-lg transition-colors ${config.hoverable ? 'hover:bg-slate-700/30 cursor-pointer' : ''}`}>
      {/* Icon */}
      <div className={`relative z-10 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${config.iconBg}`}>
        {config.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pt-0.5">
        <p className="text-sm text-slate-200 truncate">
          {config.title}
        </p>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>{formatRelativeTime(activity.timestamp)}</span>
          {activity.score !== undefined && activity.totalQuestions && (
            <>
              <span>•</span>
              <span className={Math.min(activity.score, activity.totalQuestions) / activity.totalQuestions >= 0.7 ? 'text-green-400' : 'text-yellow-400'}>
                {Math.min(100, Math.round((Math.min(activity.score, activity.totalQuestions) / activity.totalQuestions) * 100))}%
              </span>
            </>
          )}
        </div>
      </div>

      {/* Badge/Arrow */}
      {config.badge && (
        <span className={`text-xs px-2 py-0.5 rounded-full ${config.badgeClass}`}>
          {config.badge}
        </span>
      )}
    </div>
  );

  if (activity.lessonId && config.hoverable) {
    return (
      <Link href={`/lesson/${activity.lessonId}`}>
        {content}
      </Link>
    );
  }

  return content;
}

function getActivityConfig(activity: ActivityLogEntry) {
  switch (activity.type) {
    case 'lesson_started':
      return {
        title: `Started "${activity.lessonTitle}"`,
        icon: (
          <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        iconBg: 'bg-blue-500/20',
        hoverable: true,
      };

    case 'lesson_completed':
      return {
        title: `Completed "${activity.lessonTitle}"`,
        icon: (
          <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        iconBg: 'bg-green-500/20',
        badge: 'Done',
        badgeClass: 'bg-green-500/20 text-green-400',
        hoverable: true,
      };

    case 'quiz_completed':
      const score = activity.score && activity.totalQuestions
        ? Math.min(100, Math.round((Math.min(activity.score, activity.totalQuestions) / activity.totalQuestions) * 100))
        : 0;
      const isPassing = score >= 70;
      return {
        title: `Quiz: "${activity.lessonTitle}"`,
        icon: (
          <svg className={`w-4 h-4 ${isPassing ? 'text-green-400' : 'text-yellow-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        ),
        iconBg: isPassing ? 'bg-green-500/20' : 'bg-yellow-500/20',
        badge: `${score}%`,
        badgeClass: isPassing ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400',
        hoverable: true,
      };

    case 'path_started':
      return {
        title: `Started "${activity.pathName}" path`,
        icon: (
          <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
        ),
        iconBg: 'bg-purple-500/20',
        hoverable: false,
      };

    case 'milestone_reached':
      return {
        title: `Milestone: ${activity.milestoneTitle}`,
        icon: (
          <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        ),
        iconBg: 'bg-amber-500/20',
        badge: '🎉',
        badgeClass: 'bg-amber-500/20',
        hoverable: false,
      };

    default:
      return {
        title: 'Activity',
        icon: (
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        iconBg: 'bg-slate-500/20',
        hoverable: false,
      };
  }
}

// Compact version for smaller spaces
export function ActivityBadges({ activities }: { activities: ActivityLogEntry[] }) {
  const recentByType = {
    lessons: activities.filter(a => a.type === 'lesson_completed').length,
    quizzes: activities.filter(a => a.type === 'quiz_completed').length,
    milestones: activities.filter(a => a.type === 'milestone_reached').length,
  };

  return (
    <div className="flex gap-4 text-sm">
      <div className="flex items-center gap-1.5 text-green-400">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        <span>{recentByType.lessons}</span>
      </div>
      <div className="flex items-center gap-1.5 text-blue-400">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
        <span>{recentByType.quizzes}</span>
      </div>
      {recentByType.milestones > 0 && (
        <div className="flex items-center gap-1.5 text-amber-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
          <span>{recentByType.milestones}</span>
        </div>
      )}
    </div>
  );
}
