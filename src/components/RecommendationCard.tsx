'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';

// Types matching the API response
interface AlternativeLesson {
  lessonId: string;
  title: string;
  topic: string;
  reason: string;
}

interface EnhancedRecommendation {
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

interface RecommendationCardProps {
  recommendation: EnhancedRecommendation;
  onAccept?: (lessonId: string) => void;
  onSelectAlternative?: (lessonId: string) => void;
  showVoice?: boolean;
}

export default function RecommendationCard({
  recommendation,
  onAccept,
  onSelectAlternative,
  showVoice = true,
}: RecommendationCardProps) {
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [showAlternatives, setShowAlternatives] = useState(false);

  // Priority colors and icons
  const priorityConfig = {
    high: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      text: 'text-red-400',
      badge: 'bg-red-500/20 text-red-300',
      label: 'Urgent Review',
    },
    medium: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      text: 'text-amber-400',
      badge: 'bg-amber-500/20 text-amber-300',
      label: 'Recommended',
    },
    low: {
      bg: 'bg-green-500/10',
      border: 'border-green-500/30',
      text: 'text-green-400',
      badge: 'bg-green-500/20 text-green-300',
      label: 'Optional',
    },
  };

  // Reasoning type icons
  const reasoningIcons = {
    review: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
    continue: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
      </svg>
    ),
    advance: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
      </svg>
    ),
    'fill-gap': (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    complete: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  // Check if Web Speech API is available (no ElevenLabs API fallback - text-only if unavailable)
  const canPlayVoice = typeof window !== 'undefined' && 'speechSynthesis' in window;

  const playVoiceAnnouncement = useCallback(() => {
    if (isPlayingVoice || !canPlayVoice) return;

    setIsPlayingVoice(true);
    const utterance = new SpeechSynthesisUtterance(recommendation.voiceAnnouncement);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsPlayingVoice(false);
    utterance.onerror = () => setIsPlayingVoice(false);
    speechSynthesis.speak(utterance);
  }, [recommendation.voiceAnnouncement, isPlayingVoice, canPlayVoice]);

  const config = priorityConfig[recommendation.priority];
  const icon = reasoningIcons[recommendation.reasoningType];

  return (
    <div className={`rounded-xl border ${config.bg} ${config.border} p-5 space-y-4`}>
      {/* Header with priority badge */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${config.bg} ${config.text}`}>
            {icon}
          </div>
          <div>
            <span className={`text-xs px-2 py-1 rounded-full ${config.badge}`}>
              {config.label}
            </span>
            <h3 className="text-lg font-semibold text-white mt-1">
              {recommendation.lessonTitle}
            </h3>
            <p className="text-sm text-slate-400">{recommendation.lessonTopic}</p>
          </div>
        </div>

        {/* Voice button - only show if Web Speech API available */}
        {showVoice && canPlayVoice && (
          <button
            onClick={playVoiceAnnouncement}
            disabled={isPlayingVoice}
            className={`p-2 rounded-lg transition-colors ${
              isPlayingVoice
                ? 'bg-blue-500/20 text-blue-400'
                : 'bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-white'
            }`}
            title="Listen to recommendation"
          >
            {isPlayingVoice ? (
              <svg className="w-5 h-5 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            )}
          </button>
        )}
      </div>

      {/* Progress bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-slate-400">
          <span>Path Progress</span>
          <span>{recommendation.pathProgress}%</span>
        </div>
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
            style={{ width: `${recommendation.pathProgress}%` }}
          />
        </div>
      </div>

      {/* Reasoning */}
      <p className="text-sm text-slate-300 leading-relaxed">
        {recommendation.reasoning}
      </p>

      {/* Topic mastery if available */}
      {recommendation.topicMastery !== null && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-400">Topic Mastery:</span>
          <span className={
            recommendation.topicMastery >= 70
              ? 'text-green-400'
              : recommendation.topicMastery >= 50
                ? 'text-amber-400'
                : 'text-red-400'
          }>
            {recommendation.topicMastery}%
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Link
          href={`/lesson/${recommendation.nextLesson}`}
          onClick={() => onAccept?.(recommendation.nextLesson)}
          className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-medium rounded-lg text-center transition-all hover:scale-[1.02]"
        >
          {recommendation.reasoningType === 'review' ? 'Review Lesson' : 'Start Lesson'}
        </Link>

        {recommendation.alternativeLessons.length > 0 && (
          <button
            onClick={() => setShowAlternatives(!showAlternatives)}
            className="py-3 px-4 bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <span>Other Options</span>
            <svg
              className={`w-4 h-4 transition-transform ${showAlternatives ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
      </div>

      {/* Alternative lessons */}
      {showAlternatives && recommendation.alternativeLessons.length > 0 && (
        <div className="border-t border-slate-700 pt-4 mt-2 space-y-2">
          <p className="text-xs text-slate-400 uppercase tracking-wide">Alternative Lessons</p>
          {recommendation.alternativeLessons.map((alt) => (
            <Link
              key={alt.lessonId}
              href={`/lesson/${alt.lessonId}`}
              onClick={() => onSelectAlternative?.(alt.lessonId)}
              className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-colors group"
            >
              <div>
                <p className="text-sm text-white group-hover:text-blue-400 transition-colors">
                  {alt.title}
                </p>
                <p className="text-xs text-slate-500">{alt.reason}</p>
              </div>
              <svg
                className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// Compact version for dashboard
export function RecommendationBadge({
  recommendation,
}: {
  recommendation: EnhancedRecommendation;
}) {
  const priorityColors = {
    high: 'border-red-500/50 bg-red-500/10',
    medium: 'border-amber-500/50 bg-amber-500/10',
    low: 'border-green-500/50 bg-green-500/10',
  };

  return (
    <Link
      href={`/lesson/${recommendation.nextLesson}`}
      className={`block p-4 rounded-lg border ${priorityColors[recommendation.priority]} hover:scale-[1.02] transition-all`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-400 mb-1">Recommended Next</p>
          <p className="font-medium text-white">{recommendation.lessonTitle}</p>
          <p className="text-xs text-slate-500">{recommendation.lessonTopic}</p>
        </div>
        <svg
          className="w-5 h-5 text-slate-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
}
