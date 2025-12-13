import { NextRequest, NextResponse } from 'next/server';
import type { QuizEvaluateRequest, QuizEvaluateResponse } from '@/types';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const body: QuizEvaluateRequest = await request.json();
    const { lessonId, questionId, answer } = body;

    if (!lessonId || !questionId || !answer) {
      return NextResponse.json(
        { error: 'lessonId, questionId, and answer are required' },
        { status: 400 }
      );
    }

    // Load lesson data to find the question
    const lessonPath = join(process.cwd(), 'content', 'lessons', `${lessonId}.json`);
    let lessonData;

    try {
      const lessonFile = readFileSync(lessonPath, 'utf-8');
      lessonData = JSON.parse(lessonFile);
    } catch {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      );
    }

    // Find the question
    const question = lessonData.quiz?.find((q: { id: string }) => q.id === questionId);

    if (!question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }

    // Evaluate the answer
    const isCorrect = answer.toUpperCase() === question.correct.toUpperCase();

    const result: QuizEvaluateResponse = {
      isCorrect,
      explanation: question.explanation,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Quiz evaluation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
