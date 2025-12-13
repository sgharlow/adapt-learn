import { NextRequest, NextResponse } from 'next/server';
import type { RecommendationRequest, UserProgress, LearningPath, Lesson } from '@/types';
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';
import { analyzeGaps, extractTopicsFromLessons, MASTERY_THRESHOLD, GAP_THRESHOLD } from '@/lib/gapDetection';

// Extended recommendation response with more details
export interface EnhancedRecommendation {
  nextLesson: string;
  lessonTitle: string;
  lessonTopic: string;
  reasoning: string;
  reasoningType: 'review' | 'continue' | 'advance' | 'fill-gap' | 'complete';
  priority: 'high' | 'medium' | 'low';
  pathProgress: number;
  topicMastery: number | null;
  alternativeLessons: AlternativeLesson[];
  voiceAnnouncement: string;
}

export interface AlternativeLesson {
  lessonId: string;
  title: string;
  topic: string;
  reason: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: RecommendationRequest = await request.json();
    const { userProgress, currentPath } = body;

    if (!currentPath) {
      return NextResponse.json(
        { error: 'currentPath is required' },
        { status: 400 }
      );
    }

    // Load paths data
    const pathsPath = join(process.cwd(), 'content', 'paths', 'index.json');
    let pathsData;

    try {
      const pathsFile = readFileSync(pathsPath, 'utf-8');
      pathsData = JSON.parse(pathsFile);
    } catch {
      return NextResponse.json(
        { error: 'Paths data not found' },
        { status: 500 }
      );
    }

    // Find the current learning path
    const path = pathsData.paths.find((p: LearningPath) => p.id === currentPath);

    if (!path) {
      return NextResponse.json(
        { error: 'Learning path not found' },
        { status: 404 }
      );
    }

    // Load all lessons for gap analysis
    const lessonsDir = join(process.cwd(), 'content', 'lessons');
    const lessonFiles = readdirSync(lessonsDir).filter(f => f.endsWith('.json'));
    const allLessons: { id: string; topic: string; title: string; prerequisites: string[] }[] = [];
    const lessonDetailsMap: Record<string, { title: string; topic: string; prerequisites: string[] }> = {};

    for (const file of lessonFiles) {
      try {
        const lessonPath = join(lessonsDir, file);
        const lessonData: Lesson = JSON.parse(readFileSync(lessonPath, 'utf-8'));
        allLessons.push({
          id: lessonData.id,
          topic: lessonData.topic,
          title: lessonData.title,
          prerequisites: lessonData.prerequisites || [],
        });
        lessonDetailsMap[lessonData.id] = {
          title: lessonData.title,
          topic: lessonData.topic,
          prerequisites: lessonData.prerequisites || [],
        };
      } catch {
        // Skip invalid lesson files
      }
    }

    // Get gap analysis
    const { allTopics, lessonTopicMap } = extractTopicsFromLessons(allLessons);
    const gapAnalysis = analyzeGaps(userProgress, allTopics, lessonTopicMap);

    // Get enhanced recommendation
    const recommendation = getEnhancedRecommendation(
      path,
      userProgress,
      gapAnalysis,
      lessonDetailsMap,
      lessonTopicMap
    );

    return NextResponse.json(recommendation);
  } catch (error) {
    console.error('Recommendation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function getEnhancedRecommendation(
  path: LearningPath,
  progress: UserProgress,
  gapAnalysis: ReturnType<typeof analyzeGaps>,
  lessonDetails: Record<string, { title: string; topic: string; prerequisites: string[] }>,
  lessonTopicMap: Record<string, string>
): EnhancedRecommendation {
  const completedLessons = progress.completedLessons || [];
  const quizResults = progress.quizResults || {};
  const pathProgress = Math.round((completedLessons.filter(l => path.lessons.includes(l)).length / path.lessons.length) * 100);

  // Priority 1: High-priority gaps (lessons with score < 50%)
  const urgentReviewLessons = path.lessons.filter(lessonId => {
    if (!completedLessons.includes(lessonId)) return false;
    const result = quizResults[lessonId];
    if (!result) return false;
    const score = (result.score / result.totalQuestions) * 100;
    return score < GAP_THRESHOLD;
  });

  if (urgentReviewLessons.length > 0) {
    const reviewLesson = urgentReviewLessons[0];
    const result = quizResults[reviewLesson];
    const score = Math.round((result.score / result.totalQuestions) * 100);
    const details = lessonDetails[reviewLesson] || { title: reviewLesson, topic: 'General', prerequisites: [] };
    const topicMastery = progress.topicMastery[details.topic]?.score || null;

    return {
      nextLesson: reviewLesson,
      lessonTitle: details.title,
      lessonTopic: details.topic,
      reasoning: `Your quiz score of ${score}% on this lesson shows a significant knowledge gap. Reviewing now will strengthen your foundation before advancing.`,
      reasoningType: 'review',
      priority: 'high',
      pathProgress,
      topicMastery,
      alternativeLessons: getAlternatives(urgentReviewLessons.slice(1, 3), lessonDetails, 'Also needs review'),
      voiceAnnouncement: `I recommend reviewing ${details.title}. Your quiz score of ${score}% indicates this topic needs more attention. Strengthening this foundation will help with future lessons.`,
    };
  }

  // Priority 2: Medium-priority gaps (lessons with score 50-69%)
  const mediumReviewLessons = path.lessons.filter(lessonId => {
    if (!completedLessons.includes(lessonId)) return false;
    const result = quizResults[lessonId];
    if (!result) return false;
    const score = (result.score / result.totalQuestions) * 100;
    return score >= GAP_THRESHOLD && score < MASTERY_THRESHOLD;
  });

  // Priority 3: Next uncompleted lesson in path
  const nextInPath = path.lessons.find(lessonId => {
    if (completedLessons.includes(lessonId)) return false;
    const details = lessonDetails[lessonId];
    if (!details) return true; // If no details, assume no prerequisites
    // Check prerequisites are met
    return details.prerequisites.every(prereq => completedLessons.includes(prereq));
  });

  // If there are medium gaps and we haven't advanced far, recommend review
  if (mediumReviewLessons.length > 0 && pathProgress < 50) {
    const reviewLesson = mediumReviewLessons[0];
    const result = quizResults[reviewLesson];
    const score = Math.round((result.score / result.totalQuestions) * 100);
    const details = lessonDetails[reviewLesson] || { title: reviewLesson, topic: 'General', prerequisites: [] };
    const topicMastery = progress.topicMastery[details.topic]?.score || null;

    // Offer to continue OR review
    const alternatives: AlternativeLesson[] = [];
    if (nextInPath) {
      const nextDetails = lessonDetails[nextInPath] || { title: nextInPath, topic: 'General', prerequisites: [] };
      alternatives.push({
        lessonId: nextInPath,
        title: nextDetails.title,
        topic: nextDetails.topic,
        reason: 'Continue your learning path',
      });
    }
    alternatives.push(...getAlternatives(mediumReviewLessons.slice(1, 2), lessonDetails, 'Could use review'));

    return {
      nextLesson: reviewLesson,
      lessonTitle: details.title,
      lessonTopic: details.topic,
      reasoning: `Your ${score}% score on this lesson suggests some concepts could use reinforcement. A quick review will boost your mastery before moving on.`,
      reasoningType: 'review',
      priority: 'medium',
      pathProgress,
      topicMastery,
      alternativeLessons: alternatives,
      voiceAnnouncement: `I suggest reviewing ${details.title}. Your ${score}% score shows room for improvement. Alternatively, you can continue to the next lesson if you prefer.`,
    };
  }

  // Priority 4: Continue to next lesson in path
  if (nextInPath) {
    const details = lessonDetails[nextInPath] || { title: nextInPath, topic: 'General', prerequisites: [] };
    const topicMastery = progress.topicMastery[details.topic]?.score || null;
    const isNewTopic = !completedLessons.some(l => lessonTopicMap[l] === details.topic);

    const alternatives: AlternativeLesson[] = [];
    // Add any review lessons as alternatives
    if (mediumReviewLessons.length > 0) {
      alternatives.push(...getAlternatives(mediumReviewLessons.slice(0, 2), lessonDetails, 'Optionally review'));
    }
    // Add other uncompleted lessons
    const otherUncompleted = path.lessons.filter(l =>
      l !== nextInPath &&
      !completedLessons.includes(l) &&
      (lessonDetails[l]?.prerequisites || []).every(p => completedLessons.includes(p))
    ).slice(0, 2 - alternatives.length);
    alternatives.push(...getAlternatives(otherUncompleted, lessonDetails, 'Also available'));

    const reasoningType = isNewTopic ? 'advance' : 'continue';
    const reasoning = isNewTopic
      ? `You're ready to explore ${details.topic}! This lesson builds on what you've learned and introduces new concepts.`
      : `Continue your progress in ${details.topic}. You're doing well and ready for the next lesson.`;

    return {
      nextLesson: nextInPath,
      lessonTitle: details.title,
      lessonTopic: details.topic,
      reasoning,
      reasoningType,
      priority: 'medium',
      pathProgress,
      topicMastery,
      alternativeLessons: alternatives,
      voiceAnnouncement: `Great job! You're ${pathProgress}% through the ${path.name} path. I recommend continuing with ${details.title}${isNewTopic ? `, which introduces ${details.topic}` : ''}.`,
    };
  }

  // Priority 5: Check if there are any lessons from gap analysis to fill
  if (gapAnalysis.recommendations.length > 0) {
    const gapRec = gapAnalysis.recommendations[0];
    const details = lessonDetails[gapRec.lessonId] || { title: gapRec.lessonId, topic: gapRec.topic, prerequisites: [] };
    const topicMastery = progress.topicMastery[gapRec.topic]?.score || null;

    return {
      nextLesson: gapRec.lessonId,
      lessonTitle: details.title,
      lessonTopic: details.topic,
      reasoning: gapRec.reason,
      reasoningType: 'fill-gap',
      priority: gapRec.priority,
      pathProgress,
      topicMastery,
      alternativeLessons: getAlternatives(
        gapAnalysis.recommendations.slice(1, 3).map(r => r.lessonId),
        lessonDetails,
        'Alternative focus area'
      ),
      voiceAnnouncement: `Based on your progress, I recommend ${details.title}. ${gapRec.reason}.`,
    };
  }

  // All lessons completed
  const firstLesson = path.lessons[0];
  const details = lessonDetails[firstLesson] || { title: firstLesson, topic: 'General', prerequisites: [] };

  return {
    nextLesson: firstLesson,
    lessonTitle: details.title,
    lessonTopic: details.topic,
    reasoning: `Congratulations! You've completed all lessons in the ${path.name} path. Consider reviewing to reinforce your knowledge or exploring a more advanced learning path.`,
    reasoningType: 'complete',
    priority: 'low',
    pathProgress: 100,
    topicMastery: gapAnalysis.overallMastery,
    alternativeLessons: getAlternatives(
      path.lessons.slice(0, 3),
      lessonDetails,
      'Review for mastery'
    ),
    voiceAnnouncement: `Congratulations! You've completed the ${path.name} learning path. Your overall mastery is ${gapAnalysis.overallMastery}%. Would you like to review any lessons or explore a more advanced path?`,
  };
}

function getAlternatives(
  lessonIds: string[],
  lessonDetails: Record<string, { title: string; topic: string; prerequisites: string[] }>,
  defaultReason: string
): AlternativeLesson[] {
  return lessonIds.map(lessonId => {
    const details = lessonDetails[lessonId] || { title: lessonId, topic: 'General', prerequisites: [] };
    return {
      lessonId,
      title: details.title,
      topic: details.topic,
      reason: defaultReason,
    };
  });
}
