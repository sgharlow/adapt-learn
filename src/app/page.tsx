'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { PathsData, LearningPath, UserProgress } from '@/types';

export default function Home() {
  const [pathsData, setPathsData] = useState<PathsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasProgress, setHasProgress] = useState(false);

  useEffect(() => {
    // Check if user has existing progress
    const savedProgress = localStorage.getItem('adaptlearn-progress');
    if (savedProgress) {
      const progress: UserProgress = JSON.parse(savedProgress);
      if (progress.currentPath || progress.completedLessons?.length) {
        setHasProgress(true);
      }
    }

    fetch('/api/paths')
      .then(res => res.json())
      .then(data => {
        setPathsData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-lg border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <span className="text-white font-bold text-xl">AdaptLearn</span>
          </Link>

          <nav className="flex items-center gap-6">
            <Link href="#how-it-works" className="text-slate-400 hover:text-white transition-colors text-sm">
              How it Works
            </Link>
            <Link href="#paths" className="text-slate-400 hover:text-white transition-colors text-sm">
              Learning Paths
            </Link>
            {hasProgress ? (
              <Link href="/dashboard" className="btn-primary text-sm py-2">
                Continue Learning
              </Link>
            ) : (
              <Link href="/assessment" className="btn-primary text-sm py-2">
                Get Started
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute top-40 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />

        <div className="max-w-6xl mx-auto px-4 pt-16 pb-20 text-center relative">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <span className="text-blue-400 text-sm font-medium">Voice-First AI Learning Platform</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
            Learn AI Like You
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Listen to Podcasts
            </span>
          </h1>

          <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            Personalized audio lessons that adapt to your knowledge gaps.
            Learn during your commute, at the gym, or while cooking dinner.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/assessment" className="btn-primary text-lg px-8 py-4 shadow-lg shadow-blue-500/25">
              Start Learning Free
            </Link>
            <Link href="#how-it-works" className="btn-secondary text-lg px-8 py-4">
              See How It Works
            </Link>
          </div>

          {/* Tech Badges */}
          <div className="flex items-center justify-center gap-8 text-slate-500 text-sm">
            <span>Powered by</span>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-slate-400">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
                <span className="font-medium">ElevenLabs</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span className="font-medium">Google Gemini</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Three simple steps to start your AI learning journey
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <StepCard
              number={1}
              title="Choose Your Path"
              description="Take a quick assessment or pick a learning path that matches your experience level and goals."
            />
            <StepCard
              number={2}
              title="Listen & Learn"
              description="Audio lessons play like podcasts. Ask questions anytime and get instant voice answers from your AI tutor."
            />
            <StepCard
              number={3}
              title="Adapt & Grow"
              description="Take quizzes to check understanding. Our AI identifies gaps and recommends what to learn next."
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 border-t border-slate-800 bg-slate-800/20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Why AdaptLearn?</h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Built for busy professionals who want to learn AI without sitting at a desk
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon="headphones"
              title="Audio-First"
              description="Listen to lessons while commuting, exercising, or doing chores. Learning fits your life."
            />
            <FeatureCard
              icon="brain"
              title="Adaptive"
              description="AI identifies your knowledge gaps and creates a personalized learning path just for you."
            />
            <FeatureCard
              icon="mic"
              title="Interactive"
              description="Ask questions in natural language and get instant, contextual audio answers."
            />
          </div>
        </div>
      </section>

      {/* Learning Paths */}
      <section id="paths" className="py-20 border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Choose Your Path</h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Three carefully crafted learning paths for different experience levels
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center">
              <div className="animate-pulse text-slate-400">Loading paths...</div>
            </div>
          ) : pathsData ? (
            <div className="grid md:grid-cols-3 gap-8">
              {pathsData.paths.map((path) => (
                <PathCard key={path.id} path={path} />
              ))}
            </div>
          ) : (
            <div className="text-center text-slate-400">
              <p>Unable to load learning paths. Please refresh the page.</p>
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              href="/assessment"
              className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
            >
              <span>Not sure which path? Take our 2-minute assessment</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Start Learning AI?
          </h2>
          <p className="text-xl text-slate-400 mb-10">
            Join thousands of professionals learning AI through personalized audio lessons.
          </p>
          <Link href="/assessment" className="btn-primary text-lg px-10 py-4 shadow-lg shadow-blue-500/25">
            Start Learning Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-4 text-center text-slate-500 text-sm">
          <p>Built for the AI Partner Catalyst Hackathon</p>
          <p className="mt-2">Powered by ElevenLabs and Google Gemini</p>
        </div>
      </footer>
    </main>
  );
}

function StepCard({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white text-2xl font-bold mb-6">
        {number}
      </div>
      <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
      <p className="text-slate-400">{description}</p>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  const iconMap: Record<string, JSX.Element> = {
    headphones: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
      </svg>
    ),
    brain: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    mic: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
    ),
  };

  return (
    <div className="card card-hover text-center p-8">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-blue-400 mb-6">
        {iconMap[icon]}
      </div>
      <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
      <p className="text-slate-400">{description}</p>
    </div>
  );
}

function PathCard({ path }: { path: LearningPath }) {
  const difficultyConfig = {
    beginner: { label: 'Beginner', class: 'text-green-400 bg-green-500/10 border-green-500/30' },
    intermediate: { label: 'Intermediate', class: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
    advanced: { label: 'Advanced', class: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
  };

  const config = difficultyConfig[path.difficulty];

  return (
    <Link href={`/path/${path.id}`}>
      <div className="group card card-hover cursor-pointer h-full relative overflow-hidden">
        {/* Gradient accent */}
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{ background: `linear-gradient(90deg, ${path.color}, ${path.color}80)` }}
        />

        <div className="pt-2">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
              {path.name}
            </h3>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${config.class}`}>
              {config.label}
            </span>
          </div>

          <p className="text-slate-400 text-sm mb-6 leading-relaxed">{path.description}</p>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-slate-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span>{path.lessonCount} lessons</span>
            </div>
            <div className="flex items-center gap-2 text-slate-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{path.duration}</span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-700/50">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-sm">{path.targetAudience.split(',')[0]}</span>
              <svg className="w-5 h-5 text-slate-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
