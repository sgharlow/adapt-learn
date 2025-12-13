import { NextRequest, NextResponse } from 'next/server';
import type { RecommendationRequest, RecommendationResponse, UserProgress, LearningPath } from '@/types';
import { readFileSync } from 'fs';
import { join } from 'path';

const MASTERY_THRESHOLD = 0.7; // 70% mastery required

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

    // Get recommendation
    const recommendation = getNextLesson(path, userProgress);

    return NextResponse.json(recommendation);
  } catch (error) {
    console.error('Recommendation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function getNextLesson(
  path: LearningPath,
  progress: UserProgress
): RecommendationResponse {
  const completedLessons = progress.completedLessons || [];
  const quizResults = progress.quizResults || {};
  const topicMastery = progress.topicMastery || {};

  // Find lessons with low mastery that need review
  const lessonsNeedingReview: string[] = [];

  for (const lessonId of completedLessons) {
    const result = quizResults[lessonId];
    if (result) {
      const score = result.score / result.totalQuestions;
      if (score < MASTERY_THRESHOLD) {
        lessonsNeedingReview.push(lessonId);
      }
    }
  }

  // If there are lessons needing review, recommend the first one
  if (lessonsNeedingReview.length > 0) {
    const reviewLesson = lessonsNeedingReview[0];
    const result = quizResults[reviewLesson];
    const score = result ? Math.round((result.score / result.totalQuestions) * 100) : 0;

    return {
      nextLesson: reviewLesson,
      reasoning: `Based on your quiz performance (${score}%), I recommend reviewing this lesson to strengthen your understanding.`,
      alternativeLessons: lessonsNeedingReview.slice(1, 3),
    };
  }

  // Find the next uncompleted lesson in the path
  for (const lessonId of path.lessons) {
    if (!completedLessons.includes(lessonId)) {
      // Check if prerequisites are met
      // For now, we assume lessons are in order and the previous lesson is the prerequisite
      const lessonIndex = path.lessons.indexOf(lessonId);
      const previousLesson = lessonIndex > 0 ? path.lessons[lessonIndex - 1] : null;

      if (!previousLesson || completedLessons.includes(previousLesson)) {
        const completionPercentage = Math.round((completedLessons.length / path.lessons.length) * 100);

        return {
          nextLesson: lessonId,
          reasoning: `You're ${completionPercentage}% through the ${path.name} path. This is the next lesson in your learning journey.`,
          alternativeLessons: path.lessons
            .filter(l => !completedLessons.includes(l) && l !== lessonId)
            .slice(0, 2),
        };
      }
    }
  }

  // All lessons completed
  return {
    nextLesson: path.lessons[0],
    reasoning: `Congratulations! You've completed all lessons in the ${path.name} path. Consider reviewing earlier lessons or exploring a more advanced path.`,
    alternativeLessons: path.lessons.slice(0, 3),
  };
}
