/**
 * Demo Data Utilities
 * Pre-configured learner profiles for demo purposes
 */

import type { UserProgress } from '@/types';

// Demo scenarios
export type DemoScenario = 'fresh' | 'progress' | 'gaps' | 'complete';

// Fresh start - no progress
export const DEMO_FRESH: UserProgress = {
  currentPath: null,
  completedLessons: [],
  quizResults: {},
  topicMastery: {},
  lastActivity: new Date().toISOString(),
  streak: {
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: '',
    totalDaysActive: 0,
  },
  activityLog: [],
};

// Mid-progress - shows dashboard features
export const DEMO_PROGRESS: UserProgress = {
  currentPath: 'nlp-focus',
  completedLessons: [
    'ml-fundamentals-01',
    'ml-fundamentals-02',
    'ml-fundamentals-03',
  ],
  quizResults: {
    'ml-fundamentals-01': {
      lessonId: 'ml-fundamentals-01',
      score: 4,
      totalQuestions: 4,
      completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    'ml-fundamentals-02': {
      lessonId: 'ml-fundamentals-02',
      score: 3,
      totalQuestions: 4,
      completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    'ml-fundamentals-03': {
      lessonId: 'ml-fundamentals-03',
      score: 4,
      totalQuestions: 4,
      completedAt: new Date().toISOString(),
    },
  },
  topicMastery: {
    'ML Fundamentals': {
      topic: 'ML Fundamentals',
      score: 85,
      lessonsCompleted: 3,
      totalLessons: 5,
      lastUpdated: new Date().toISOString()
    },
    'Training Concepts': {
      topic: 'Training Concepts',
      score: 75,
      lessonsCompleted: 2,
      totalLessons: 4,
      lastUpdated: new Date().toISOString()
    },
  },
  lastActivity: new Date().toISOString(),
  streak: {
    currentStreak: 3,
    longestStreak: 3,
    lastActiveDate: new Date().toISOString().split('T')[0],
    totalDaysActive: 3,
  },
  activityLog: [
    {
      id: 'demo-1',
      type: 'lesson_completed',
      lessonId: 'ml-fundamentals-03',
      lessonTitle: 'Supervised vs Unsupervised Learning',
      timestamp: new Date().toISOString(),
    },
    {
      id: 'demo-2',
      type: 'quiz_completed',
      lessonId: 'ml-fundamentals-03',
      score: 100,
      totalQuestions: 4,
      timestamp: new Date().toISOString(),
    },
    {
      id: 'demo-3',
      type: 'lesson_completed',
      lessonId: 'ml-fundamentals-02',
      lessonTitle: 'How Machines Learn',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'demo-4',
      type: 'quiz_completed',
      lessonId: 'ml-fundamentals-02',
      score: 75,
      totalQuestions: 4,
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'demo-5',
      type: 'path_started',
      pathId: 'nlp-focus',
      pathName: 'NLP Focus',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ],
};

// Gap detection demo - shows knowledge gaps
export const DEMO_GAPS: UserProgress = {
  currentPath: 'specialist',
  completedLessons: [
    'ml-fundamentals-01',
    'ml-fundamentals-02',
    'ml-fundamentals-03',
    'ml-fundamentals-04',
    'ml-fundamentals-05',
    'deep-learning-01',
  ],
  quizResults: {
    'ml-fundamentals-01': {
      lessonId: 'ml-fundamentals-01',
      score: 4,
      totalQuestions: 4,
      completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    'ml-fundamentals-02': {
      lessonId: 'ml-fundamentals-02',
      score: 2, // Low score - gap
      totalQuestions: 4,
      completedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    },
    'ml-fundamentals-03': {
      lessonId: 'ml-fundamentals-03',
      score: 4,
      totalQuestions: 4,
      completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    'ml-fundamentals-04': {
      lessonId: 'ml-fundamentals-04',
      score: 2, // Low score - gap
      totalQuestions: 4,
      completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    'ml-fundamentals-05': {
      lessonId: 'ml-fundamentals-05',
      score: 3,
      totalQuestions: 4,
      completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    'deep-learning-01': {
      lessonId: 'deep-learning-01',
      score: 4,
      totalQuestions: 4,
      completedAt: new Date().toISOString(),
    },
  },
  topicMastery: {
    'ML Fundamentals': {
      topic: 'ML Fundamentals',
      score: 60,
      lessonsCompleted: 5,
      totalLessons: 5,
      lastUpdated: new Date().toISOString()
    },
    'Training Concepts': {
      topic: 'Training Concepts',
      score: 50,
      lessonsCompleted: 3,
      totalLessons: 4,
      lastUpdated: new Date().toISOString()
    },
    'Model Evaluation': {
      topic: 'Model Evaluation',
      score: 50,
      lessonsCompleted: 2,
      totalLessons: 4,
      lastUpdated: new Date().toISOString()
    },
    'Deep Learning': {
      topic: 'Deep Learning',
      score: 90,
      lessonsCompleted: 1,
      totalLessons: 5,
      lastUpdated: new Date().toISOString()
    },
  },
  lastActivity: new Date().toISOString(),
  streak: {
    currentStreak: 5,
    longestStreak: 7,
    lastActiveDate: new Date().toISOString().split('T')[0],
    totalDaysActive: 10,
  },
  activityLog: [
    {
      id: 'gaps-1',
      type: 'quiz_completed',
      lessonId: 'deep-learning-01',
      score: 100,
      totalQuestions: 4,
      timestamp: new Date().toISOString(),
    },
    {
      id: 'gaps-2',
      type: 'lesson_completed',
      lessonId: 'deep-learning-01',
      lessonTitle: 'Introduction to Neural Networks',
      timestamp: new Date().toISOString(),
    },
    {
      id: 'gaps-3',
      type: 'quiz_completed',
      lessonId: 'ml-fundamentals-05',
      score: 75,
      totalQuestions: 4,
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'gaps-4',
      type: 'quiz_completed',
      lessonId: 'ml-fundamentals-04',
      score: 50,
      totalQuestions: 4,
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'gaps-5',
      type: 'quiz_completed',
      lessonId: 'ml-fundamentals-02',
      score: 50,
      totalQuestions: 4,
      timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ],
};

// Complete path demo
export const DEMO_COMPLETE: UserProgress = {
  currentPath: 'explorer',
  completedLessons: [
    'ml-fundamentals-01',
    'ml-fundamentals-02',
    'ml-fundamentals-03',
    'ml-fundamentals-04',
    'ml-fundamentals-05',
  ],
  quizResults: {
    'ml-fundamentals-01': {
      lessonId: 'ml-fundamentals-01',
      score: 4,
      totalQuestions: 4,
      completedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    },
    'ml-fundamentals-02': {
      lessonId: 'ml-fundamentals-02',
      score: 4,
      totalQuestions: 4,
      completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    'ml-fundamentals-03': {
      lessonId: 'ml-fundamentals-03',
      score: 4,
      totalQuestions: 4,
      completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    'ml-fundamentals-04': {
      lessonId: 'ml-fundamentals-04',
      score: 3,
      totalQuestions: 4,
      completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    'ml-fundamentals-05': {
      lessonId: 'ml-fundamentals-05',
      score: 4,
      totalQuestions: 4,
      completedAt: new Date().toISOString(),
    },
  },
  topicMastery: {
    'ML Fundamentals': {
      topic: 'ML Fundamentals',
      score: 95,
      lessonsCompleted: 5,
      totalLessons: 5,
      lastUpdated: new Date().toISOString()
    },
    'Training Concepts': {
      topic: 'Training Concepts',
      score: 90,
      lessonsCompleted: 4,
      totalLessons: 4,
      lastUpdated: new Date().toISOString()
    },
    'Model Evaluation': {
      topic: 'Model Evaluation',
      score: 85,
      lessonsCompleted: 4,
      totalLessons: 4,
      lastUpdated: new Date().toISOString()
    },
  },
  lastActivity: new Date().toISOString(),
  streak: {
    currentStreak: 5,
    longestStreak: 5,
    lastActiveDate: new Date().toISOString().split('T')[0],
    totalDaysActive: 5,
  },
  activityLog: [
    {
      id: 'complete-1',
      type: 'milestone_reached',
      pathId: 'explorer',
      pathName: 'AI Explorer',
      milestoneTitle: 'Path Completed',
      timestamp: new Date().toISOString(),
    },
    {
      id: 'complete-2',
      type: 'milestone_reached',
      milestoneTitle: 'AI Explorer Graduate',
      timestamp: new Date().toISOString(),
    },
    {
      id: 'complete-3',
      type: 'quiz_completed',
      lessonId: 'ml-fundamentals-05',
      score: 100,
      totalQuestions: 4,
      timestamp: new Date().toISOString(),
    },
  ],
};

// Get demo data by scenario
export function getDemoData(scenario: DemoScenario): UserProgress {
  switch (scenario) {
    case 'fresh':
      return DEMO_FRESH;
    case 'progress':
      return DEMO_PROGRESS;
    case 'gaps':
      return DEMO_GAPS;
    case 'complete':
      return DEMO_COMPLETE;
    default:
      return DEMO_FRESH;
  }
}

// Load demo data into localStorage
export function loadDemoData(scenario: DemoScenario): void {
  const data = getDemoData(scenario);
  localStorage.setItem('adaptlearn_progress', JSON.stringify(data));
  console.log(`[Demo] Loaded ${scenario} demo data`);
}

// Check if demo mode is active from URL
export function checkDemoMode(): DemoScenario | null {
  if (typeof window === 'undefined') return null;

  const params = new URLSearchParams(window.location.search);
  const demoParam = params.get('demo');

  if (demoParam && ['fresh', 'progress', 'gaps', 'complete'].includes(demoParam)) {
    return demoParam as DemoScenario;
  }

  return null;
}

// Initialize demo mode if URL parameter is present
export function initDemoMode(): boolean {
  const scenario = checkDemoMode();
  if (scenario) {
    loadDemoData(scenario);
    return true;
  }
  return false;
}
