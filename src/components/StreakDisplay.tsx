'use client';

import type { LearningStreak } from '@/types';
import { getStreakMessage } from '@/lib/progressUtils';

interface StreakDisplayProps {
  streak?: LearningStreak;
  compact?: boolean;
}

export default function StreakDisplay({ streak, compact = false }: StreakDisplayProps) {
  const currentStreak = streak?.currentStreak || 0;
  const longestStreak = streak?.longestStreak || 0;
  const totalDays = streak?.totalDaysActive || 0;

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${
          currentStreak > 0 ? 'bg-orange-500/20' : 'bg-slate-700'
        }`}>
          <span className="text-lg">🔥</span>
          <span className={`font-bold ${currentStreak > 0 ? 'text-orange-400' : 'text-slate-400'}`}>
            {currentStreak}
          </span>
        </div>
        {currentStreak > 0 && (
          <span className="text-xs text-slate-500">day streak</span>
        )}
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-orange-500/10 to-amber-500/10 border border-orange-500/20 rounded-xl p-5">
      {/* Main streak display */}
      <div className="flex items-center gap-4 mb-4">
        <div className={`relative ${currentStreak > 0 ? 'animate-pulse' : ''}`}>
          <div className="text-5xl">🔥</div>
          {currentStreak >= 7 && (
            <div className="absolute -top-1 -right-1 text-lg">⭐</div>
          )}
        </div>
        <div>
          <div className="flex items-baseline gap-2">
            <span className={`text-4xl font-bold ${currentStreak > 0 ? 'text-orange-400' : 'text-slate-400'}`}>
              {currentStreak}
            </span>
            <span className="text-slate-400 text-sm">
              {currentStreak === 1 ? 'day' : 'days'}
            </span>
          </div>
          <p className="text-sm text-slate-400">Current Streak</p>
        </div>
      </div>

      {/* Streak message */}
      <p className="text-sm text-slate-300 mb-4">
        {getStreakMessage(streak)}
      </p>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-orange-500/20">
        <div>
          <p className="text-2xl font-bold text-amber-400">{longestStreak}</p>
          <p className="text-xs text-slate-500">Longest Streak</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-300">{totalDays}</p>
          <p className="text-xs text-slate-500">Total Days Active</p>
        </div>
      </div>

      {/* Streak calendar preview (last 7 days) */}
      <div className="mt-4 pt-4 border-t border-orange-500/20">
        <p className="text-xs text-slate-500 mb-2">Last 7 days</p>
        <div className="flex gap-1">
          {generateWeekPreview(streak).map((active, i) => (
            <div
              key={i}
              className={`flex-1 h-2 rounded-full ${
                active ? 'bg-orange-400' : 'bg-slate-700'
              }`}
              title={getDayLabel(i)}
            />
          ))}
        </div>
        <div className="flex justify-between mt-1 text-xs text-slate-600">
          <span>6d ago</span>
          <span>Today</span>
        </div>
      </div>
    </div>
  );
}

// Generate a simple preview of the last 7 days
function generateWeekPreview(streak?: LearningStreak): boolean[] {
  if (!streak || streak.currentStreak === 0) {
    return [false, false, false, false, false, false, false];
  }

  const today = new Date();
  const lastActive = new Date(streak.lastActiveDate);

  // Check if last active was today
  const isActiveToday =
    lastActive.toISOString().split('T')[0] === today.toISOString().split('T')[0];

  if (!isActiveToday) {
    // Streak might be broken
    return [false, false, false, false, false, false, false];
  }

  // Fill in streak days (simplified - shows consecutive days)
  const days: boolean[] = [];
  const streakDays = Math.min(streak.currentStreak, 7);

  for (let i = 0; i < 7; i++) {
    days.push(i >= 7 - streakDays);
  }

  return days;
}

function getDayLabel(index: number): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  const dayOffset = 6 - index;
  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() - dayOffset);
  return days[targetDate.getDay()];
}

// Mini version for stat cards
export function StreakBadge({ streak }: { streak?: LearningStreak }) {
  const currentStreak = streak?.currentStreak || 0;

  return (
    <div className="flex items-center gap-1.5">
      <span className={currentStreak > 0 ? '' : 'grayscale opacity-50'}>🔥</span>
      <span className={`font-bold ${
        currentStreak > 0 ? 'text-orange-400' : 'text-slate-500'
      }`}>
        {currentStreak}
      </span>
    </div>
  );
}
