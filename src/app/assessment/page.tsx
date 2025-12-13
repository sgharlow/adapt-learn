'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { PathsData, AssessmentQuestion, LearningPath } from '@/types';

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-slate-400">Loading assessment...</div>
      </div>
    );
  }

  if (!pathsData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">Failed to load assessment</p>
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
    // Save assessment result and set current path
    const progress = {
      currentPath: pathId,
      completedLessons: [],
      quizResults: {},
      topicMastery: {},
      lastActivity: new Date().toISOString(),
      assessmentResult: {
        scores,
        recommendedPath: pathId,
        completedAt: new Date().toISOString(),
      },
    };
    localStorage.setItem('adaptlearn-progress', JSON.stringify(progress));
    router.push(`/path/${pathId}`);
  };

  if (showResult) {
    const recommendedPath = getRecommendedPath();
    const allPaths = pathsData.paths;

    return (
      <main className="min-h-screen py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 text-green-400 mb-4">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Assessment Complete!</h1>
            <p className="text-slate-400">Based on your answers, here&apos;s our recommendation</p>
          </div>

          {/* Recommended Path */}
          <div
            className="card mb-8 border-2"
            style={{ borderColor: recommendedPath.color }}
          >
            <div className="flex items-center gap-2 mb-4">
              <span
                className="px-3 py-1 rounded-full text-sm font-medium"
                style={{ backgroundColor: `${recommendedPath.color}20`, color: recommendedPath.color }}
              >
                Recommended for you
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">{recommendedPath.name}</h2>
            <p className="text-slate-300 mb-4">{recommendedPath.description}</p>

            <div className="flex items-center gap-6 text-sm text-slate-400 mb-6">
              <span>{recommendedPath.lessonCount} lessons</span>
              <span>{recommendedPath.duration}</span>
              <span className="capitalize">{recommendedPath.difficulty}</span>
            </div>

            <button
              onClick={() => handleStartPath(recommendedPath.id)}
              className="btn-primary w-full text-lg"
            >
              Start {recommendedPath.name} Path
            </button>
          </div>

          {/* Other Paths */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-slate-400">Or choose a different path:</h3>
            {allPaths
              .filter(p => p.id !== recommendedPath.id)
              .map(path => (
                <button
                  key={path.id}
                  onClick={() => handleStartPath(path.id)}
                  className="w-full card card-hover text-left"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">{path.name}</h4>
                      <p className="text-slate-400 text-sm">{path.lessonCount} lessons • {path.duration}</p>
                    </div>
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              ))}
          </div>

          <div className="text-center mt-8">
            <Link href="/" className="text-slate-400 hover:text-white">
              ← Back to Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-blue-400 hover:text-blue-300 text-sm mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Find Your Learning Path</h1>
          <p className="text-slate-400">Answer 5 quick questions to get a personalized recommendation</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-slate-400 mb-2">
            <span>Question {currentQuestion + 1} of {questions.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="card mb-6">
          <h2 className="text-xl text-white mb-6">{question.question}</h2>

          <div className="space-y-3">
            {question.options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelectOption(option.value)}
                className={`w-full text-left p-4 rounded-lg border transition-all ${
                  selectedOption === option.value
                    ? 'bg-blue-500/20 border-blue-500 text-white'
                    : 'bg-slate-700/50 border-slate-600 text-slate-300 hover:border-slate-500'
                }`}
              >
                {option.label}
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
            className="text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>

          <button
            onClick={handleNext}
            disabled={!selectedOption}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentQuestion === questions.length - 1 ? 'See Results' : 'Next →'}
          </button>
        </div>
      </div>
    </main>
  );
}
