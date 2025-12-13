import type { UserProgress, ActivityLogEntry, LearningStreak } from '@/types';

// Generate unique ID for activity entries
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Get today's date in YYYY-MM-DD format
function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

// Calculate days between two dates
function daysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

// Update streak based on current activity
export function updateStreak(currentStreak?: LearningStreak): LearningStreak {
  const today = getToday();

  if (!currentStreak) {
    return {
      currentStreak: 1,
      longestStreak: 1,
      lastActiveDate: today,
      totalDaysActive: 1,
    };
  }

  const lastActive = currentStreak.lastActiveDate;
  const daysDiff = daysBetween(lastActive, today);

  // Already active today
  if (daysDiff === 0) {
    return currentStreak;
  }

  // Consecutive day - extend streak
  if (daysDiff === 1) {
    const newStreak = currentStreak.currentStreak + 1;
    return {
      currentStreak: newStreak,
      longestStreak: Math.max(newStreak, currentStreak.longestStreak),
      lastActiveDate: today,
      totalDaysActive: currentStreak.totalDaysActive + 1,
    };
  }

  // Streak broken - reset to 1
  return {
    currentStreak: 1,
    longestStreak: currentStreak.longestStreak,
    lastActiveDate: today,
    totalDaysActive: currentStreak.totalDaysActive + 1,
  };
}

// Add activity to log
export function addActivity(
  progress: UserProgress,
  activity: Omit<ActivityLogEntry, 'id' | 'timestamp'>
): UserProgress {
  const newActivity: ActivityLogEntry = {
    ...activity,
    id: generateId(),
    timestamp: new Date().toISOString(),
  };

  const existingLog = progress.activityLog || [];

  // Keep only last 50 activities to prevent localStorage bloat
  const updatedLog = [newActivity, ...existingLog].slice(0, 50);

  return {
    ...progress,
    activityLog: updatedLog,
    lastActivity: newActivity.timestamp,
    streak: updateStreak(progress.streak),
  };
}

// Log lesson started
export function logLessonStarted(
  progress: UserProgress,
  lessonId: string,
  lessonTitle: string
): UserProgress {
  return addActivity(progress, {
    type: 'lesson_started',
    lessonId,
    lessonTitle,
  });
}

// Log lesson completed
export function logLessonCompleted(
  progress: UserProgress,
  lessonId: string,
  lessonTitle: string
): UserProgress {
  return addActivity(progress, {
    type: 'lesson_completed',
    lessonId,
    lessonTitle,
  });
}

// Log quiz completed
export function logQuizCompleted(
  progress: UserProgress,
  lessonId: string,
  lessonTitle: string,
  score: number,
  totalQuestions: number
): UserProgress {
  return addActivity(progress, {
    type: 'quiz_completed',
    lessonId,
    lessonTitle,
    score,
    totalQuestions,
  });
}

// Log path started
export function logPathStarted(
  progress: UserProgress,
  pathId: string,
  pathName: string
): UserProgress {
  return addActivity(progress, {
    type: 'path_started',
    pathId,
    pathName,
  });
}

// Log milestone reached
export function logMilestoneReached(
  progress: UserProgress,
  milestoneTitle: string,
  pathId: string,
  pathName: string
): UserProgress {
  return addActivity(progress, {
    type: 'milestone_reached',
    milestoneTitle,
    pathId,
    pathName,
  });
}

// Get streak status message
export function getStreakMessage(streak?: LearningStreak): string {
  if (!streak || streak.currentStreak === 0) {
    return 'Start learning to build your streak!';
  }

  if (streak.currentStreak === 1) {
    return 'Great start! Come back tomorrow to continue your streak.';
  }

  if (streak.currentStreak < 7) {
    return `${streak.currentStreak} day streak! Keep it up!`;
  }

  if (streak.currentStreak < 30) {
    return `${streak.currentStreak} day streak! You're on fire! 🔥`;
  }

  return `${streak.currentStreak} day streak! Incredible dedication! 🏆`;
}

// Format relative time
export function formatRelativeTime(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;

  return then.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Calculate overall stats
export function calculateStats(progress: UserProgress) {
  const lessonsCompleted = progress.completedLessons.length;
  const quizzesTaken = Object.keys(progress.quizResults).length;

  // Calculate average quiz score
  const quizResults = Object.values(progress.quizResults);
  let averageScore = 0;
  if (quizResults.length > 0) {
    const totalScore = quizResults.reduce((sum, r) => sum + (r.score / r.totalQuestions) * 100, 0);
    averageScore = Math.round(totalScore / quizResults.length);
  }

  // Calculate topics mastered (70%+ score)
  const topicsMastered = Object.values(progress.topicMastery)
    .filter(t => t.score >= 70).length;
  const totalTopics = Object.keys(progress.topicMastery).length;

  // Overall mastery percentage
  const overallMastery = totalTopics > 0
    ? Math.round(Object.values(progress.topicMastery).reduce((sum, t) => sum + t.score, 0) / totalTopics)
    : 0;

  return {
    lessonsCompleted,
    quizzesTaken,
    averageScore,
    topicsMastered,
    totalTopics,
    overallMastery,
    currentStreak: progress.streak?.currentStreak || 0,
    longestStreak: progress.streak?.longestStreak || 0,
    totalDaysActive: progress.streak?.totalDaysActive || 0,
  };
}
