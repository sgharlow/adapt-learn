'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { DemoScenario } from '@/lib/demoData';

interface DemoModeBannerProps {
  scenario: DemoScenario;
}

const scenarioDescriptions: Record<DemoScenario, string> = {
  fresh: 'Fresh start - no progress',
  progress: 'Mid-progress - 3 lessons completed',
  gaps: 'Gap detection - mixed quiz scores',
  complete: 'Path completed - all lessons done',
};

export default function DemoModeBanner({ scenario }: DemoModeBannerProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-black rounded-xl shadow-lg overflow-hidden">
        {/* Collapsed state */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 px-4 py-2 font-medium text-sm hover:bg-white/10 transition-colors w-full"
        >
          <span className="text-lg">🎬</span>
          <span>Demo Mode: {scenario}</span>
          <svg
            className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>

        {/* Expanded state */}
        {isExpanded && (
          <div className="px-4 pb-4 space-y-3 border-t border-black/10">
            <p className="text-xs pt-2 opacity-80">{scenarioDescriptions[scenario]}</p>

            <div className="flex flex-wrap gap-2">
              <Link
                href="/?demo=fresh"
                className={`px-2 py-1 text-xs rounded-full transition-colors ${
                  scenario === 'fresh'
                    ? 'bg-black text-white'
                    : 'bg-black/10 hover:bg-black/20'
                }`}
              >
                Fresh
              </Link>
              <Link
                href="/?demo=progress"
                className={`px-2 py-1 text-xs rounded-full transition-colors ${
                  scenario === 'progress'
                    ? 'bg-black text-white'
                    : 'bg-black/10 hover:bg-black/20'
                }`}
              >
                Progress
              </Link>
              <Link
                href="/?demo=gaps"
                className={`px-2 py-1 text-xs rounded-full transition-colors ${
                  scenario === 'gaps'
                    ? 'bg-black text-white'
                    : 'bg-black/10 hover:bg-black/20'
                }`}
              >
                Gaps
              </Link>
              <Link
                href="/?demo=complete"
                className={`px-2 py-1 text-xs rounded-full transition-colors ${
                  scenario === 'complete'
                    ? 'bg-black text-white'
                    : 'bg-black/10 hover:bg-black/20'
                }`}
              >
                Complete
              </Link>
            </div>

            <div className="flex gap-2">
              <Link
                href="/"
                onClick={() => {
                  localStorage.clear();
                }}
                className="flex-1 px-2 py-1.5 text-xs bg-black/10 hover:bg-black/20 rounded-lg text-center transition-colors"
              >
                Exit Demo
              </Link>
              <button
                onClick={() => {
                  window.location.reload();
                }}
                className="flex-1 px-2 py-1.5 text-xs bg-black/10 hover:bg-black/20 rounded-lg transition-colors"
              >
                Reload
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
