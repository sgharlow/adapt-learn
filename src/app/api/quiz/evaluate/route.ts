import { NextRequest, NextResponse } from 'next/server';
import type { QuizEvaluateRequest, QuizEvaluateResponse } from '@/types';
import { readFileSync } from 'fs';
import { join } from 'path';

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

interface ExtendedQuizEvaluateRequest extends QuizEvaluateRequest {
  enhancedFeedback?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body: ExtendedQuizEvaluateRequest = await request.json();
    const { lessonId, questionId, answer, enhancedFeedback } = body;

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

    let explanation = question.explanation;

    // Generate enhanced AI feedback for wrong answers
    if (!isCorrect && enhancedFeedback && GOOGLE_API_KEY) {
      try {
        const aiExplanation = await generateAIFeedback(
          question,
          answer,
          lessonData.title,
          lessonData.topic
        );
        if (aiExplanation) {
          explanation = aiExplanation;
        }
      } catch (error) {
        console.error('AI feedback generation failed, using default explanation:', error);
        // Fall back to default explanation
      }
    }

    const result: QuizEvaluateResponse = {
      isCorrect,
      explanation,
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

interface QuizQuestionData {
  question: string;
  options: string[];
  correct: string;
  explanation: string;
}

async function generateAIFeedback(
  question: QuizQuestionData,
  userAnswer: string,
  lessonTitle: string,
  topic: string
): Promise<string | null> {
  const userAnswerText = question.options.find(opt => opt.startsWith(userAnswer)) || userAnswer;
  const correctAnswerText = question.options.find(opt => opt.startsWith(question.correct)) || question.correct;

  const prompt = `You are an AI tutor helping a student learn about ${topic}.

The student just answered a quiz question incorrectly. Help them understand why their answer was wrong and guide them to the correct understanding.

Lesson: ${lessonTitle}

Question: ${question.question}

Student's Answer: ${userAnswerText}

Correct Answer: ${correctAnswerText}

Provide a brief, encouraging explanation (2-3 sentences) that:
1. Acknowledges their thinking
2. Explains why their specific answer is incorrect
3. Clarifies why the correct answer is right

Keep it concise and supportive - this will be read aloud.`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GOOGLE_API_KEY}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 256,
        },
      }),
    }
  );

  if (!response.ok) {
    console.error('Gemini API error:', await response.text());
    return null;
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
}
