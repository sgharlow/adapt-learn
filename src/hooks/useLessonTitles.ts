'use client';

import { useState, useEffect, useCallback } from 'react';

// Global cache to store lesson titles across components
const lessonTitleCache: Record<string, string> = {};

// Fallback function to format lesson ID
function formatLessonId(lessonId: string): string {
  return lessonId
    .replace(/-/g, ' ')
    .replace(/(\d+)$/, ' $1')
    .replace(/\b\w/g, l => l.toUpperCase())
    .trim();
}

/**
 * Hook to fetch and cache lesson titles
 * Returns a function to get the title for a lesson ID
 */
export function useLessonTitles(lessonIds: string[]) {
  const [titles, setTitles] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTitles = async () => {
      const idsToFetch = lessonIds.filter(id => !lessonTitleCache[id]);

      if (idsToFetch.length === 0) {
        // All titles already cached
        const cached: Record<string, string> = {};
        lessonIds.forEach(id => {
          cached[id] = lessonTitleCache[id] || formatLessonId(id);
        });
        setTitles(cached);
        setLoading(false);
        return;
      }

      // Fetch all uncached titles in parallel
      await Promise.all(
        idsToFetch.map(async (lessonId) => {
          try {
            const res = await fetch(`/api/lessons/${lessonId}`);
            if (res.ok) {
              const lesson = await res.json();
              lessonTitleCache[lessonId] = lesson.title;
            }
          } catch {
            // On error, use formatted ID as fallback
          }
        })
      );

      // Build result from cache
      const result: Record<string, string> = {};
      lessonIds.forEach(id => {
        result[id] = lessonTitleCache[id] || formatLessonId(id);
      });
      setTitles(result);
      setLoading(false);
    };

    if (lessonIds.length > 0) {
      fetchTitles();
    } else {
      setLoading(false);
    }
  }, [lessonIds.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

  const getTitle = useCallback((lessonId: string): string => {
    return titles[lessonId] || lessonTitleCache[lessonId] || formatLessonId(lessonId);
  }, [titles]);

  return { titles, loading, getTitle };
}

/**
 * Synchronous function to get a cached title or fallback to formatted ID
 * Use this when you can't use hooks
 */
export function getLessonTitle(lessonId: string): string {
  return lessonTitleCache[lessonId] || formatLessonId(lessonId);
}

/**
 * Pre-fetch lesson titles and store in cache
 * Call this on page load to populate cache
 */
export async function prefetchLessonTitles(lessonIds: string[]): Promise<void> {
  const idsToFetch = lessonIds.filter(id => !lessonTitleCache[id]);

  await Promise.all(
    idsToFetch.map(async (lessonId) => {
      try {
        const res = await fetch(`/api/lessons/${lessonId}`);
        if (res.ok) {
          const lesson = await res.json();
          lessonTitleCache[lessonId] = lesson.title;
        }
      } catch {
        // Silently fail, will use fallback
      }
    })
  );
}
