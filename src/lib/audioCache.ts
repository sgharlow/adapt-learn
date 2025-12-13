const CACHE_PREFIX = 'adaptlearn-audio-';
const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

interface CacheEntry {
  audioUrl: string;
  timestamp: number;
}

export function getCachedAudio(key: string): string | null {
  try {
    const cached = localStorage.getItem(CACHE_PREFIX + key);
    if (!cached) return null;

    const entry: CacheEntry = JSON.parse(cached);
    const now = Date.now();

    if (now - entry.timestamp > CACHE_EXPIRY) {
      localStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }

    return entry.audioUrl;
  } catch {
    return null;
  }
}

export function setCachedAudio(key: string, audioUrl: string): void {
  try {
    const entry: CacheEntry = {
      audioUrl,
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
  } catch {
    // localStorage might be full, ignore
    console.warn('Failed to cache audio');
  }
}

export function clearAudioCache(): void {
  try {
    const keys = Object.keys(localStorage).filter(k => k.startsWith(CACHE_PREFIX));
    keys.forEach(k => localStorage.removeItem(k));
  } catch {
    // ignore
  }
}

export function generateCacheKey(text: string, voice?: string): string {
  // Create a simple hash of the text for the cache key
  const hash = text.split('').reduce((acc, char) => {
    return ((acc << 5) - acc) + char.charCodeAt(0);
  }, 0);
  return `${voice || 'default'}-${Math.abs(hash).toString(36)}`;
}
