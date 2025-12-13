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

    // Limit text length to avoid excessive API usage
    const maxLength = 5000;
    const trimmedText = text.length > maxLength ? text.substring(0, maxLength) + '...' : text;

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
