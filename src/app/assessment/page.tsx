'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { PathsData, LearningPath } from '@/types';
import { loadProgress, saveProgress } from '@/lib/progressManager';
import { logPathStarted } from '@/lib/progressUtils';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function AssessmentPage() {
  const router = useRouter();
  const [pathsData, setPathsData] = useState<PathsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [scores, setScores] = useState<Record<string, number>>({
    explorer: 0,
    practitioner: 0,
    specialist: 0,
  });
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/paths')
      .then(res => res.json())
      .then(data => {
        setPathsData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <LoadingSpinner size="lg" text="Loading assessment..." />
      </div>
    );
  }

  if (!pathsData) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Failed to Load</h2>
          <p className="text-slate-400 mb-6">Unable to load assessment questions.</p>
          <Link href="/" className="btn-primary">Back to Home</Link>
        </div>
      </div>
    );
  }

  const questions = pathsData.assessmentQuiz.questions;
  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleSelectOption = (value: string) => {
    setSelectedOption(value);
  };

  const handleNext = () => {
    if (!selectedOption) return;

    // Find the selected option and add its points
    const option = question.options.find(o => o.value === selectedOption);
    if (option) {
      setScores(prev => ({
        explorer: prev.explorer + (option.points.explorer || 0),
        practitioner: prev.practitioner + (option.points.practitioner || 0),
        specialist: prev.specialist + (option.points.specialist || 0),
      }));
      setAnswers(prev => ({ ...prev, [question.id]: selectedOption }));
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(null);
    } else {
      setShowResult(true);
    }
  };

  const getRecommendedPath = (): LearningPath => {
    const finalScores = { ...scores };

    // Add the last question's score if not yet added
    if (selectedOption && !showResult) {
      const option = question.options.find(o => o.value === selectedOption);
      if (option) {
        finalScores.explorer += option.points.explorer || 0;
        finalScores.practitioner += option.points.practitioner || 0;
        finalScores.specialist += option.points.specialist || 0;
      }
    }

    // Find the path with highest score
    let maxScore = 0;
    let recommendedPathId = 'explorer';

    Object.entries(finalScores).forEach(([pathId, score]) => {
      if (score > maxScore) {
        maxScore = score;
        recommendedPathId = pathId;
      }
    });

    return pathsData.paths.find(p => p.id === recommendedPathId) || pathsData.paths[0];
  };

  const handleStartPath = (pathId: string) => {
    // Validate path exists
    const selectedPath = pathsData?.paths.find(p => p.id === pathId);
    if (!selectedPath) {
      console.error('Invalid path selected:', pathId);
      return;
    }

    // Load existing progress (preserves any previous data) and update with new path
    let progress = loadProgress();
    progress = {
      ...progress,
      currentPath: pathId,
      lastActivity: new Date().toISOString(),
    };

    // Log path started activity
    progress = logPathStarted(progress, pathId, selectedPath.name);

    // Save progress
    const saved = saveProgress(progress);
    if (!saved) {
      console.error('Failed to save progress');
    }

    router.push(`/path/${pathId}`);
  };

  if (showResult) {
    const recommendedPath = getRecommendedPath();
    const allPaths = pathsData.paths;

    const difficultyColors = {
      beginner: 'badge-green',
      intermediate: 'badge-blue',
      advanced: 'badge-purple',
    };

    return (
      <main className="min-h-screen py-8 md:py-12">
        <div className="max-w-2xl mx-auto px-4">
          {/* Success Animation */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 text-white mb-6 shadow-lg shadow-green-500/30">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Assessment Complete!</h1>
            <p className="text-slate-400">Based on your answers, here&apos;s our recommendation</p>
          </div>

          {/* Recommended Path */}
          <div
            className="card mb-8 relative overflow-hidden"
            style={{ borderColor: recommendedPath.color, borderWidth: '2px' }}
          >
            {/* Gradient accent */}
            <div
              className="absolute top-0 left-0 right-0 h-1"
              style={{ background: `linear-gradient(90deg, ${recommendedPath.color}, ${recommendedPath.color}80)` }}
            />

            <div className="pt-2">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span
                  className="badge"
                  style={{ backgroundColor: `${recommendedPath.color}20`, color: recommendedPath.color, border: `1px solid ${recommendedPath.color}40` }}
                >
                  Recommended for you
                </span>
                <span className={`badge border ${difficultyColors[recommendedPath.difficulty as keyof typeof difficultyColors]}`}>
                  {recommendedPath.difficulty}
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-white mb-2">{recommendedPath.name}</h2>
              <p className="text-slate-300 mb-4 text-sm md:text-base">{recommendedPath.description}</p>

              <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm text-slate-400 mb-6">
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  {recommendedPath.lessonCount} lessons
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {recommendedPath.duration}
                </span>
              </div>

              <button
                onClick={() => handleStartPath(recommendedPath.id)}
                className="btn-primary w-full text-base md:text-lg"
              >
                Start {recommendedPath.name} Path
              </button>
            </div>
          </div>

          {/* Other Paths */}
          <div className="space-y-4">
            <h3 className="text-base md:text-lg font-medium text-slate-400">Or choose a different path:</h3>
            {allPaths
              .filter(p => p.id !== recommendedPath.id)
              .map(path => (
                <button
                  key={path.id}
                  onClick={() => handleStartPath(path.id)}
                  className="w-full card card-hover text-left group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium group-hover:text-blue-400 transition-colors">{path.name}</h4>
                      <p className="text-slate-400 text-sm">{path.lessonCount} lessons • {path.duration}</p>
                    </div>
                    <svg className="w-5 h-5 text-slate-400 group-hover:translate-x-1 group-hover:text-blue-400 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              ))}
          </div>

          <div className="text-center mt-8">
            <Link href="/" className="text-slate-400 hover:text-white transition-colors inline-flex items-center gap-2 group">
              <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen py-8 md:py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-slate-400 hover:text-white transition-colors text-sm mb-4 inline-flex items-center gap-2 group">
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Find Your Learning Path</h1>
          <p className="text-slate-400">Answer {questions.length} quick questions to get a personalized recommendation</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-slate-400 mb-2">
            <span>Question {currentQuestion + 1} of {questions.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-bar-fill bg-gradient-to-r from-blue-500 to-purple-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="card mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">
              {currentQuestion + 1}
            </div>
            <h2 className="text-lg md:text-xl text-white flex-1">{question.question}</h2>
          </div>

          <div className="space-y-3">
            {question.options.map((option, index) => (
              <button
                key={option.value}
                onClick={() => handleSelectOption(option.value)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all group ${
                  selectedOption === option.value
                    ? 'bg-blue-500/20 border-blue-500 text-white'
                    : 'bg-slate-800/30 border-slate-700 text-slate-300 hover:border-slate-500 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${
                    selectedOption === option.value
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-700 text-slate-400 group-hover:bg-slate-600'
                  }`}>
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="flex-1">{option.label}</span>
                  {selectedOption === option.value && (
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => {
              if (currentQuestion > 0) {
                setCurrentQuestion(currentQuestion - 1);
                setSelectedOption(answers[questions[currentQuestion - 1].id] || null);
              }
            }}
            disabled={currentQuestion === 0}
            className="flex items-center gap-2 text-slate-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors group"
          >
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">Previous</span>
          </button>

          <button
            onClick={handleNext}
            disabled={!selectedOption}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <span>{currentQuestion === questions.length - 1 ? 'See Results' : 'Next'}</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </main>
  );
}
