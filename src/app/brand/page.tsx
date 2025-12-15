'use client';

/**
 * Brand/Thumbnail Page
 * Screenshot this page at 1280x720 for a professional thumbnail
 * URL: /brand
 */

export default function BrandPage() {
  return (
    <div
      className="w-[1280px] h-[720px] bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex flex-col items-center justify-center relative overflow-hidden"
      style={{ minWidth: '1280px', minHeight: '720px' }}
    >
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Waveform decoration */}
        <svg
          className="absolute bottom-20 left-1/2 -translate-x-1/2 w-[800px] h-32 opacity-20"
          viewBox="0 0 800 100"
          preserveAspectRatio="none"
        >
          <path
            d="M0,50 Q50,20 100,50 T200,50 T300,50 T400,50 T500,50 T600,50 T700,50 T800,50"
            stroke="url(#waveGradient)"
            strokeWidth="3"
            fill="none"
          />
          <path
            d="M0,50 Q50,80 100,50 T200,50 T300,50 T400,50 T500,50 T600,50 T700,50 T800,50"
            stroke="url(#waveGradient)"
            strokeWidth="2"
            fill="none"
            opacity="0.5"
          />
          <defs>
            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="50%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#EC4899" />
            </linearGradient>
          </defs>
        </svg>

        {/* Decorative circles */}
        <div className="absolute top-10 left-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/4 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl" />
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center">
        {/* Icon */}
        <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-purple-500/30">
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </div>

        {/* App name */}
        <h1 className="text-7xl font-bold text-white mb-4 tracking-tight">
          Adapt<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">Learn</span>
        </h1>

        {/* Tagline */}
        <p className="text-2xl text-slate-300 mb-8 font-light">
          Voice-First Adaptive AI Learning Platform
        </p>

        {/* Subtagline */}
        <p className="text-xl text-slate-400 mb-12">
          Learn AI like you listen to podcasts
        </p>

        {/* Tech badges */}
        <div className="flex items-center justify-center gap-6">
          <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full backdrop-blur-sm border border-white/10">
            <div className="w-3 h-3 bg-blue-400 rounded-full" />
            <span className="text-white text-sm font-medium">ElevenLabs</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full backdrop-blur-sm border border-white/10">
            <div className="w-3 h-3 bg-green-400 rounded-full" />
            <span className="text-white text-sm font-medium">Google Gemini</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full backdrop-blur-sm border border-white/10">
            <div className="w-3 h-3 bg-purple-400 rounded-full" />
            <span className="text-white text-sm font-medium">Next.js</span>
          </div>
        </div>
      </div>

      {/* Hackathon badge */}
      <div className="absolute bottom-8 right-8 text-right">
        <p className="text-slate-500 text-sm">AI Partner Catalyst Hackathon</p>
        <p className="text-slate-400 text-sm font-medium">ElevenLabs Track</p>
      </div>

      {/* Audio waveform bars (animated feel) */}
      <div className="absolute bottom-8 left-8 flex items-end gap-1">
        {[40, 65, 45, 80, 55, 70, 50, 85, 60, 75, 45, 90, 55, 70, 40].map((height, i) => (
          <div
            key={i}
            className="w-2 bg-gradient-to-t from-blue-500 to-purple-500 rounded-full opacity-60"
            style={{ height: `${height * 0.5}px` }}
          />
        ))}
      </div>
    </div>
  );
}
