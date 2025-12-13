import type { UserProgress, TopicMastery, QuizResult } from '@/types';

// Gap thresholds
export const MASTERY_THRESHOLD = 70; // Score >= 70% = mastered
export const PROFICIENCY_THRESHOLD = 50; // Score 50-69% = proficient but needs work
export const GAP_THRESHOLD = 50; // Score < 50% = significant gap

export type MasteryLevel = 'mastered' | 'proficient' | 'needs-work' | 'not-started';

export interface TopicGap {
  topic: string;
  score: number;
  level: MasteryLevel;
  lessonsCompleted: number;
  lessonsNeededForReview: string[];
  lastUpdated: string | null;
}

export interface GapAnalysis {
  overallMastery: number;
  totalTopics: number;
  masteredTopics: number;
  proficientTopics: number;
  gapTopics: number;
  notStartedTopics: number;
  gaps: TopicGap[];
  strengths: TopicGap[];
  recommendations: GapRecommendation[];
}

export interface GapRecommendation {
  type: 'review' | 'practice' | 'advance';
  topic: string;
  lessonId: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

/**
 * Get mastery level based on score
 */
export function getMasteryLevel(score: number): MasteryLevel {
  if (score >= MASTERY_THRESHOLD) return 'mastered';
  if (score >= PROFICIENCY_THRESHOLD) return 'proficient';
  if (score > 0) return 'needs-work';
  return 'not-started';
}

/**
 * Get color for mastery level (for visualization)
 */
export function getMasteryColor(level: MasteryLevel): string {
  switch (level) {
    case 'mastered': return '#10B981'; // green
    case 'proficient': return '#F59E0B'; // yellow/amber
    case 'needs-work': return '#EF4444'; // red
    case 'not-started': return '#6B7280'; // gray
  }
}

/**
 * Get background color with opacity for cards
 */
export function getMasteryBgColor(level: MasteryLevel): string {
  switch (level) {
    case 'mastered': return 'rgba(16, 185, 129, 0.1)';
    case 'proficient': return 'rgba(245, 158, 11, 0.1)';
    case 'needs-work': return 'rgba(239, 68, 68, 0.1)';
    case 'not-started': return 'rgba(107, 114, 128, 0.1)';
  }
}

/**
 * Calculate topic mastery from quiz results
 */
export function calculateTopicMastery(
  quizResults: Record<string, QuizResult>,
  lessonTopicMap: Record<string, string>
): Record<string, TopicMastery> {
  const topicScores: Record<string, { total: number; count: number; lessons: number }> = {};

  for (const [lessonId, result] of Object.entries(quizResults)) {
    const topic = lessonTopicMap[lessonId] || 'General';
    const percentage = Math.round((result.score / result.totalQuestions) * 100);

    if (!topicScores[topic]) {
      topicScores[topic] = { total: 0, count: 0, lessons: 0 };
    }

    topicScores[topic].total += percentage;
    topicScores[topic].count += 1;
    topicScores[topic].lessons += 1;
  }

  const mastery: Record<string, TopicMastery> = {};
  for (const [topic, data] of Object.entries(topicScores)) {
    mastery[topic] = {
      topic,
      score: Math.round(data.total / data.count),
      lessonsCompleted: data.lessons,
      totalLessons: data.lessons, // Will be updated with actual count
      lastUpdated: new Date().toISOString(),
    };
  }

  return mastery;
}

/**
 * Analyze gaps in user's knowledge
 */
export function analyzeGaps(
  progress: UserProgress,
  allTopics: string[],
  lessonTopicMap: Record<string, string>
): GapAnalysis {
  const gaps: TopicGap[] = [];
  const strengths: TopicGap[] = [];
  const recommendations: GapRecommendation[] = [];

  // Get lessons by topic for review recommendations
  const lessonsByTopic: Record<string, string[]> = {};
  for (const [lessonId, topic] of Object.entries(lessonTopicMap)) {
    if (!lessonsByTopic[topic]) lessonsByTopic[topic] = [];
    lessonsByTopic[topic].push(lessonId);
  }

  // Analyze each topic
  for (const topic of allTopics) {
    const mastery = progress.topicMastery[topic];
    const topicLessons = lessonsByTopic[topic] || [];
    const completedInTopic = topicLessons.filter(l => progress.completedLessons.includes(l));

    const topicGap: TopicGap = {
      topic,
      score: mastery?.score || 0,
      level: mastery ? getMasteryLevel(mastery.score) : 'not-started',
      lessonsCompleted: completedInTopic.length,
      lessonsNeededForReview: [],
      lastUpdated: mastery?.lastUpdated || null,
    };

    // Find lessons needing review in this topic
    if (mastery && mastery.score < MASTERY_THRESHOLD) {
      topicGap.lessonsNeededForReview = topicLessons.filter(lessonId => {
        const result = progress.quizResults[lessonId];
        if (!result) return false;
        const percentage = (result.score / result.totalQuestions) * 100;
        return percentage < MASTERY_THRESHOLD;
      });
    }

    if (topicGap.level === 'mastered') {
      strengths.push(topicGap);
    } else if (topicGap.level !== 'not-started') {
      gaps.push(topicGap);
    } else if (completedInTopic.length === 0) {
      gaps.push(topicGap);
    }
  }

  // Sort gaps by score (lowest first)
  gaps.sort((a, b) => a.score - b.score);
  strengths.sort((a, b) => b.score - a.score);

  // Generate recommendations
  for (const gap of gaps.slice(0, 3)) {
    if (gap.level === 'not-started') {
      const firstLesson = lessonsByTopic[gap.topic]?.[0];
      if (firstLesson) {
        recommendations.push({
          type: 'practice',
          topic: gap.topic,
          lessonId: firstLesson,
          reason: `Start learning ${gap.topic} to fill this knowledge gap`,
          priority: 'medium',
        });
      }
    } else if (gap.lessonsNeededForReview.length > 0) {
      recommendations.push({
        type: 'review',
        topic: gap.topic,
        lessonId: gap.lessonsNeededForReview[0],
        reason: `Review to improve your ${gap.topic} score from ${gap.score}%`,
        priority: gap.score < GAP_THRESHOLD ? 'high' : 'medium',
      });
    }
  }

  // If doing well, recommend advancing
  if (strengths.length > 0 && recommendations.length < 3) {
    const strongTopic = strengths[0];
    const uncompletedLessons = (lessonsByTopic[strongTopic.topic] || [])
      .filter(l => !progress.completedLessons.includes(l));

    if (uncompletedLessons.length > 0) {
      recommendations.push({
        type: 'advance',
        topic: strongTopic.topic,
        lessonId: uncompletedLessons[0],
        reason: `You're doing great in ${strongTopic.topic}! Continue to the next lesson`,
        priority: 'low',
      });
    }
  }

  // Calculate overall stats
  const masteredTopics = strengths.length;
  const proficientTopics = gaps.filter(g => g.level === 'proficient').length;
  const gapTopics = gaps.filter(g => g.level === 'needs-work').length;
  const notStartedTopics = gaps.filter(g => g.level === 'not-started').length;

  const completedTopicScores = [...strengths, ...gaps.filter(g => g.level !== 'not-started')];
  const overallMastery = completedTopicScores.length > 0
    ? Math.round(completedTopicScores.reduce((sum, t) => sum + t.score, 0) / completedTopicScores.length)
    : 0;

  return {
    overallMastery,
    totalTopics: allTopics.length,
    masteredTopics,
    proficientTopics,
    gapTopics,
    notStartedTopics,
    gaps,
    strengths,
    recommendations,
  };
}

/**
 * Get all unique topics from lessons
 */
export function extractTopicsFromLessons(lessons: { id: string; topic: string }[]): {
  allTopics: string[];
  lessonTopicMap: Record<string, string>;
} {
  const lessonTopicMap: Record<string, string> = {};
  const topicSet = new Set<string>();

  for (const lesson of lessons) {
    lessonTopicMap[lesson.id] = lesson.topic;
    topicSet.add(lesson.topic);
  }

  return {
    allTopics: Array.from(topicSet),
    lessonTopicMap,
  };
}
