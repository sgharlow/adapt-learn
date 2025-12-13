'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { PathsData, LearningPath } from '@/types';
import { hasStartedLearning } from '@/lib/progressManager';
import ResumeSessionBanner from '@/components/ResumeSessionBanner';
import DemoModeBanner from '@/components/DemoModeBanner';
import { useDemoMode } from '@/hooks/useDemoMode';

export default function Home() {
  const [pathsData, setPathsData] = useState<PathsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasProgress, setHasProgress] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isDemoMode, scenario } = useDemoMode();

  useEffect(() => {
    // Re-check progress after demo mode loads
    setHasProgress(hasStartedLearning());

    fetch('/api/paths')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load paths');
        return res.json();
      })
      .then(data => {
        setPathsData(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-shadow">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <span className="text-white font-bold text-xl">AdaptLearn</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#how-it-works" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">
              How it Works
            </Link>
            <Link href="#paths" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">
              Learning Paths
            </Link>
            {hasProgress ? (
              <Link href="/dashboard" className="btn-primary text-sm py-2.5">
                Continue Learning
              </Link>
            ) : (
              <Link href="/assessment" className="btn-primary text-sm py-2.5">
                Get Started
              </Link>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-slate-400 hover:text-white transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden glass border-t border-slate-700/50">
            <div className="px-4 py-4 space-y-3">
              <Link
                href="#how-it-works"
                className="block text-slate-300 hover:text-white py-2 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                How it Works
              </Link>
              <Link
                href="#paths"
                className="block text-slate-300 hover:text-white py-2 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Learning Paths
              </Link>
              <Link
                href={hasProgress ? "/dashboard" : "/assessment"}
                className="block btn-primary text-center mt-4"
                onClick={() => setMobileMenuOpen(false)}
              >
                {hasProgress ? "Continue Learning" : "Get Started"}
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-16 md:pt-28 md:pb-24">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-40 right-1/4 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />

        <div className="max-w-6xl mx-auto px-4 pt-12 md:pt-16 text-center relative">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-6 fade-in-up">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <span className="text-blue-400 text-sm font-medium">Voice-First AI Learning Platform</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight leading-tight">
            Learn AI Like You
            <br />
            <span className="gradient-text">Listen to Podcasts</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed px-4">
            Personalized audio lessons that adapt to your knowledge gaps.
            Learn during your commute, at the gym, or while cooking dinner.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 px-4">
            <Link href="/assessment" className="btn-primary text-lg px-8 py-4 glow-blue">
              Start Learning Free
            </Link>
            <Link href="#how-it-works" className="btn-secondary text-lg px-8 py-4">
              See How It Works
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-3xl mx-auto px-4">
            <StatItem value="30+" label="Audio Lessons" />
            <StatItem value="4" label="Learning Paths" />
            <StatItem value="AI" label="Powered Tutoring" />
            <StatItem value="100%" label="Free to Use" />
          </div>

          {/* Tech Badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 mt-12 text-slate-500 text-sm">
            <span className="hidden sm:inline">Powered by</span>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-slate-400 hover:text-slate-300 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                </div>
                <span className="font-medium">ElevenLabs</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400 hover:text-slate-300 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                </div>
                <span className="font-medium">Google Gemini</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Resume Session Banner (for returning users) */}
      {hasProgress && pathsData && (
        <section className="py-4">
          <div className="max-w-4xl mx-auto px-4">
            <ResumeSessionBanner paths={pathsData.paths} />
          </div>
        </section>
      )}

      {/* How It Works */}
      <section id="how-it-works" className="py-20 md:py-24 border-t border-slate-800/50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="badge badge-blue mb-4">Simple Process</span>
            <h2 className="section-heading">How It Works</h2>
            <p className="section-subheading">
              Three simple steps to start your AI learning journey
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            <StepCard
              number={1}
              title="Choose Your Path"
              description="Take a quick assessment or pick a learning path that matches your experience level and goals."
              icon="route"
            />
            <StepCard
              number={2}
              title="Listen & Learn"
              description="Audio lessons play like podcasts. Ask questions anytime and get instant voice answers from your AI tutor."
              icon="headphones"
            />
            <StepCard
              number={3}
              title="Adapt & Grow"
              description="Take quizzes to check understanding. Our AI identifies gaps and recommends what to learn next."
              icon="chart"
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 md:py-24 border-t border-slate-800/50 bg-gradient-to-b from-slate-800/20 to-transparent">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="badge badge-purple mb-4">Core Features</span>
            <h2 className="section-heading">Why AdaptLearn?</h2>
            <p className="section-subheading">
              Built for busy professionals who want to learn AI without sitting at a desk
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            <FeatureCard
              icon="audio"
              title="Audio-First Learning"
              description="Listen to lessons while commuting, exercising, or doing chores. Learning fits your life, not the other way around."
              gradient="from-blue-500 to-cyan-500"
            />
            <FeatureCard
              icon="brain"
              title="Adaptive Intelligence"
              description="AI identifies your knowledge gaps and creates a personalized learning path that evolves with your progress."
              gradient="from-purple-500 to-pink-500"
            />
            <FeatureCard
              icon="mic"
              title="Voice Interaction"
              description="Ask questions in natural language and get instant, contextual audio answers from your AI tutor."
              gradient="from-orange-500 to-red-500"
            />
          </div>
        </div>
      </section>

      {/* Learning Paths */}
      <section id="paths" className="py-20 md:py-24 border-t border-slate-800/50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="badge badge-green mb-4">Learning Paths</span>
            <h2 className="section-heading">Choose Your Path</h2>
            <p className="section-subheading">
              Four carefully crafted learning paths for different experience levels
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="flex items-center gap-3 text-slate-400">
                <div className="w-5 h-5 border-2 border-slate-600 border-t-blue-500 rounded-full animate-spin" />
                <span>Loading paths...</span>
              </div>
            </div>
          ) : pathsData ? (
            <div className="grid md:grid-cols-3 gap-6 md:gap-8">
              {pathsData.paths.map((path, index) => (
                <PathCard key={path.id} path={path} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center text-slate-400 py-12">
              <p>Unable to load learning paths. Please refresh the page.</p>
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              href="/assessment"
              className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors group"
            >
              <span>Not sure which path? Take our 2-minute assessment</span>
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-24 border-t border-slate-800/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-blue-500/5 to-transparent" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl" />

        <div className="max-w-4xl mx-auto px-4 text-center relative">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Start Learning AI?
          </h2>
          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
            Join learners mastering AI through personalized audio lessons.
            No credit card required.
          </p>
          <Link href="/assessment" className="btn-primary text-lg px-10 py-4 glow-blue">
            Start Learning Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-800/50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <span className="text-slate-400 font-medium">AdaptLearn</span>
            </div>
            <div className="text-slate-500 text-sm text-center">
              Built for the AI Partner Catalyst Hackathon • Powered by ElevenLabs & Google Gemini
            </div>
          </div>
        </div>
      </footer>

      {/* Demo Mode Banner */}
      {isDemoMode && scenario && <DemoModeBanner scenario={scenario} />}
    </main>
  );
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-2xl md:text-3xl font-bold text-white mb-1">{value}</div>
      <div className="text-xs md:text-sm text-slate-500">{label}</div>
    </div>
  );
}

function StepCard({ number, title, description, icon }: { number: number; title: string; description: string; icon: string }) {
  const iconMap: Record<string, JSX.Element> = {
    route: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    ),
    headphones: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
      </svg>
    ),
    chart: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  };

  return (
    <div className="relative text-center group">
      {/* Connector line (hidden on mobile, shown on md+) */}
      {number < 3 && (
        <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-px bg-gradient-to-r from-slate-700 to-transparent" />
      )}

      <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white mb-6 shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-shadow">
        <span className="text-2xl font-bold">{number}</span>
      </div>

      <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
      <p className="text-slate-400 leading-relaxed">{description}</p>
    </div>
  );
}

function FeatureCard({ icon, title, description, gradient }: { icon: string; title: string; description: string; gradient: string }) {
  const iconMap: Record<string, JSX.Element> = {
    audio: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
      </svg>
    ),
    brain: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    mic: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
    ),
  };

  return (
    <div className="card card-hover card-highlight group">
      <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} text-white mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
        {iconMap[icon]}
      </div>
      <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-blue-400 transition-colors">{title}</h3>
      <p className="text-slate-400 leading-relaxed">{description}</p>
    </div>
  );
}

function PathCard({ path, index }: { path: LearningPath; index: number }) {
  const difficultyConfig = {
    beginner: { label: 'Beginner', class: 'badge-green' },
    intermediate: { label: 'Intermediate', class: 'badge-blue' },
    advanced: { label: 'Advanced', class: 'badge-purple' },
  };

  const config = difficultyConfig[path.difficulty];

  return (
    <Link href={`/path/${path.id}`} className="block group">
      <div className="card card-hover h-full relative overflow-hidden">
        {/* Gradient accent */}
        <div
          className="absolute top-0 left-0 right-0 h-1 transition-all duration-300 group-hover:h-1.5"
          style={{ background: `linear-gradient(90deg, ${path.color}, ${path.color}80)` }}
        />

        <div className="pt-3">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
              {path.name}
            </h3>
            <span className={`badge ${config.class}`}>
              {config.label}
            </span>
          </div>

          <p className="text-slate-400 text-sm mb-6 leading-relaxed line-clamp-3">{path.description}</p>

          <div className="grid grid-cols-2 gap-4 text-sm mb-6">
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

          <div className="pt-4 border-t border-slate-700/50">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-sm line-clamp-1">{path.targetAudience.split(',')[0]}</span>
              <div className="flex items-center gap-2 text-sm font-medium" style={{ color: path.color }}>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity">Start</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
