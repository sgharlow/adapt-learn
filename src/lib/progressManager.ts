import type { UserProgress, ActivityLogEntry, LearningStreak } from '@/types';

const PROGRESS_KEY = 'adaptlearn-progress';

// Default empty progress with all required fields
export function createEmptyProgress(): UserProgress {
  return {
    currentPath: null,
    completedLessons: [],
    quizResults: {},
    topicMastery: {},
    lastActivity: null,
    activityLog: [],
    streak: {
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: '',
      totalDaysActive: 0,
    },
  };
}

// Load progress from localStorage with validation
export function loadProgress(): UserProgress {
  if (typeof window === 'undefined') {
    return createEmptyProgress();
  }

  try {
    const saved = localStorage.getItem(PROGRESS_KEY);
    if (!saved) {
      return createEmptyProgress();
    }

    const parsed = JSON.parse(saved);

    // Migrate/validate the progress object
    return migrateProgress(parsed);
  } catch (error) {
    console.error('Failed to load progress:', error);
    return createEmptyProgress();
  }
}

// Save progress to localStorage with error handling
export function saveProgress(progress: UserProgress): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    // Validate before saving
    const validated = migrateProgress(progress);
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(validated));
    return true;
  } catch (error) {
    console.error('Failed to save progress:', error);
    // Handle quota exceeded
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      // Try to clear old activity logs to free space
      const trimmed = { ...progress, activityLog: progress.activityLog?.slice(0, 20) || [] };
      try {
        localStorage.setItem(PROGRESS_KEY, JSON.stringify(trimmed));
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }
}

// Migrate old progress format to new format
function migrateProgress(data: Partial<UserProgress>): UserProgress {
  const empty = createEmptyProgress();

  return {
    currentPath: data.currentPath ?? empty.currentPath,
    completedLessons: Array.isArray(data.completedLessons) ? data.completedLessons : empty.completedLessons,
    quizResults: data.quizResults && typeof data.quizResults === 'object' ? data.quizResults : empty.quizResults,
    topicMastery: data.topicMastery && typeof data.topicMastery === 'object' ? data.topicMastery : empty.topicMastery,
    lastActivity: data.lastActivity ?? empty.lastActivity,
    activityLog: Array.isArray(data.activityLog) ? data.activityLog : empty.activityLog,
    streak: data.streak && typeof data.streak === 'object' ? {
      currentStreak: data.streak.currentStreak ?? 0,
      longestStreak: data.streak.longestStreak ?? 0,
      lastActiveDate: data.streak.lastActiveDate ?? '',
      totalDaysActive: data.streak.totalDaysActive ?? 0,
    } : empty.streak,
  };
}

// Update a specific field and save
export function updateProgress(
  updater: (current: UserProgress) => UserProgress
): UserProgress | null {
  const current = loadProgress();
  const updated = updater(current);
  const success = saveProgress(updated);
  return success ? updated : null;
}

// Set current path
export function setCurrentPath(pathId: string): UserProgress | null {
  return updateProgress(progress => ({
    ...progress,
    currentPath: pathId,
    lastActivity: new Date().toISOString(),
  }));
}

// Clear all progress (for testing/reset)
export function clearProgress(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(PROGRESS_KEY);
  }
}

// Check if user has started learning
export function hasStartedLearning(): boolean {
  const progress = loadProgress();
  return progress.currentPath !== null || progress.completedLessons.length > 0;
}

// Get last lesson for a path
export function getLastLessonForPath(pathLessons: string[]): string | null {
  const progress = loadProgress();

  // Find the last completed lesson in this path
  for (let i = pathLessons.length - 1; i >= 0; i--) {
    if (progress.completedLessons.includes(pathLessons[i])) {
      // Return next lesson if available
      if (i < pathLessons.length - 1) {
        return pathLessons[i + 1];
      }
      return null; // Path completed
    }
  }

  // No lessons completed, return first
  return pathLessons[0] || null;
}

// Check if a lesson belongs to a path
export function lessonBelongsToPath(lessonId: string, pathLessons: string[]): boolean {
  return pathLessons.includes(lessonId);
}
