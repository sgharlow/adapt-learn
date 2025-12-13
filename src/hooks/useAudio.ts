'use client';

import { useState, useCallback } from 'react';
import { getCachedAudio, setCachedAudio, generateCacheKey } from '@/lib/audioCache';

interface UseAudioOptions {
  text: string;
  voice?: string;
  cacheEnabled?: boolean;
}

interface UseAudioReturn {
  audioUrl: string | null;
  isGenerating: boolean;
  error: string | null;
  generateAudio: () => Promise<string>;
}

export function useAudio({ text, voice, cacheEnabled = true }: UseAudioOptions): UseAudioReturn {
  const [audioUrl, setAudioUrl] = useState<string | null>(() => {
    if (cacheEnabled) {
      const cacheKey = generateCacheKey(text, voice);
      return getCachedAudio(cacheKey);
    }
    return null;
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateAudio = useCallback(async (): Promise<string> => {
    // Check cache first
    if (cacheEnabled) {
      const cacheKey = generateCacheKey(text, voice);
      const cached = getCachedAudio(cacheKey);
      if (cached) {
        setAudioUrl(cached);
        return cached;
      }
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/audio/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, voice }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate audio');
      }

      const data = await response.json();
      const url = data.audioUrl;

      // Cache the result
      if (cacheEnabled) {
        const cacheKey = generateCacheKey(text, voice);
        setCachedAudio(cacheKey, url);
      }

      setAudioUrl(url);
      setIsGenerating(false);
      return url;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate audio';
      setError(message);
      setIsGenerating(false);
      throw err;
    }
  }, [text, voice, cacheEnabled]);

  return {
    audioUrl,
    isGenerating,
    error,
    generateAudio,
  };
}

// Simpler hook for one-off audio generation
export function useAudioGenerate() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (text: string, voice?: string): Promise<string> => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/audio/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, voice }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate audio');
      }

      const data = await response.json();
      setIsGenerating(false);
      return data.audioUrl;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate audio';
      setError(message);
      setIsGenerating(false);
      throw err;
    }
  }, []);

  return { generate, isGenerating, error };
}
