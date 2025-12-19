import { NextRequest, NextResponse } from 'next/server';
import type { ChatRequest, ChatResponse, ChatMessage } from '@/types';

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { message, lessonContext, conversationHistory } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    if (!GOOGLE_API_KEY) {
      return NextResponse.json(
        { error: 'Google API key not configured' },
        { status: 500 }
      );
    }

    const systemPrompt = buildSystemPrompt(lessonContext);
    const contents = buildContents(systemPrompt, conversationHistory || [], message);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GOOGLE_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Gemini API error:', error);
      return NextResponse.json(
        { error: 'Failed to generate response' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    const result: ChatResponse = {
      response: responseText,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Chat response error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function buildSystemPrompt(lessonContext?: string): string {
  let prompt = `You are an AI learning tutor for AdaptLearn, a voice-first adaptive learning platform.
Your role is to help learners understand AI and machine learning concepts.

Guidelines:
- Be concise and clear - responses will be read aloud
- Use simple language and avoid jargon when possible
- If using technical terms, briefly explain them
- Provide examples to illustrate concepts
- Be encouraging and supportive
- Keep responses under 200 words for better audio experience`;

  if (lessonContext) {
    prompt += `\n\nCurrent lesson context:\n${lessonContext}`;
  }

  return prompt;
}

function buildContents(
  systemPrompt: string,
  history: ChatMessage[],
  currentMessage: string
) {
  const contents = [];

  // Add system context as first user message
  contents.push({
    role: 'user',
    parts: [{ text: systemPrompt + '\n\nPlease acknowledge you understand your role.' }],
  });
  contents.push({
    role: 'model',
    parts: [{ text: 'I understand. I am your AI learning tutor, ready to help you understand AI and machine learning concepts in a clear, concise way.' }],
  });

  // Add conversation history
  for (const msg of history) {
    contents.push({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    });
  }

  // Add current message
  contents.push({
    role: 'user',
    parts: [{ text: currentMessage }],
  });

  return contents;
}
