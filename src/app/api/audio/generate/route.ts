import { NextRequest, NextResponse } from 'next/server';
import type { AudioGenerateRequest, AudioGenerateResponse } from '@/types';

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'EXAVITQu4vr4xnSDxMaL'; // Default: Sarah

// Optimized voice settings for educational content
const DEFAULT_VOICE_SETTINGS = {
  stability: 0.65,          // Higher stability for clear pronunciation
  similarity_boost: 0.75,   // Good voice consistency
  style: 0.35,              // Moderate expressiveness for engagement
  use_speaker_boost: true,  // Enhanced clarity
};

// For conversational responses (chat)
const CONVERSATIONAL_VOICE_SETTINGS = {
  stability: 0.5,           // More natural variation
  similarity_boost: 0.75,
  style: 0.45,              // More expressive for dialogue
  use_speaker_boost: true,
};

interface ExtendedAudioRequest extends AudioGenerateRequest {
  voiceSettings?: {
    stability?: number;
    similarity_boost?: number;
    style?: number;
  };
  isConversational?: boolean;
}

/**
 * PROTECTED ENDPOINT: AI Tutor Text-to-Speech Only
 *
 * This endpoint is ONLY for generating audio for short AI tutor responses.
 * Full lesson audio must be pre-generated using: npm run generate:audio
 *
 * Protection measures:
 * 1. Requires isConversational=true (tutor responses only)
 * 2. Max text length of 2000 characters (tutor responses are short)
 * 3. Blocks requests that look like full lesson content
 */
export async function POST(request: NextRequest) {
  try {
    const body: ExtendedAudioRequest = await request.json();
    const { text, voice, voiceSettings, isConversational } = body;

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    // PROTECTION 1: Only allow conversational/tutor audio generation
    // Full lesson audio must be pre-generated via npm run generate:audio
    if (!isConversational) {
      return NextResponse.json(
        { error: 'Real-time audio generation is only available for AI tutor responses. Lesson audio must be pre-generated.' },
        { status: 403 }
      );
    }

    // PROTECTION 2: Block requests that look like full lesson content
    // Full lessons start with "Lesson:" prefix from buildLessonText()
    if (text.startsWith('Lesson:') || text.includes('\n\nSummary:') || text.includes('\n\nKey takeaways:')) {
      return NextResponse.json(
        { error: 'Full lesson audio generation is not allowed via API. Use npm run generate:audio instead.' },
        { status: 403 }
      );
    }

    // PROTECTION 3: Strict length limit for tutor responses (2000 chars max)
    // This prevents generating expensive long-form audio
    const maxLength = 2000;
    if (text.length > maxLength) {
      return NextResponse.json(
        { error: `Text too long for real-time generation. Maximum ${maxLength} characters for tutor responses.` },
        { status: 400 }
      );
    }

    const trimmedText = text;

    if (!ELEVENLABS_API_KEY) {
      return NextResponse.json(
        { error: 'ElevenLabs API key not configured' },
        { status: 500 }
      );
    }

    const voiceId = voice || ELEVENLABS_VOICE_ID;

    // Merge settings: default -> conversational (if applicable) -> custom
    const baseSettings = isConversational ? CONVERSATIONAL_VOICE_SETTINGS : DEFAULT_VOICE_SETTINGS;
    const finalSettings = {
      ...baseSettings,
      ...voiceSettings,
    };

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text: trimmedText,
          // Use multilingual v2 for better quality and natural speech
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: finalSettings.stability,
            similarity_boost: finalSettings.similarity_boost,
            style: finalSettings.style,
            use_speaker_boost: finalSettings.use_speaker_boost,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API error:', response.status, errorText);

      // Provide more specific error messages
      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Invalid API key' },
          { status: 401 }
        );
      }
      if (response.status === 429) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again in a moment.' },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to generate audio' },
        { status: response.status }
      );
    }

    const audioBuffer = await response.arrayBuffer();
    const base64Audio = Buffer.from(audioBuffer).toString('base64');
    const audioUrl = `data:audio/mpeg;base64,${base64Audio}`;

    const result: AudioGenerateResponse = {
      audioUrl,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Audio generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
