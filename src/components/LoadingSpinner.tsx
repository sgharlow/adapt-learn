'use client';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
}

export default function LoadingSpinner({
  size = 'md',
  text,
  fullScreen = false,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  const spinner = (
    <div className="flex flex-col items-center gap-3">
      <div
        className={`${sizeClasses[size]} border-slate-700 border-t-blue-500 rounded-full animate-spin`}
      />
      {text && (
        <p className="text-slate-400 text-sm animate-pulse">{text}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {spinner}
      </div>
    );
  }

  return spinner;
}

// Skeleton loader for cards
export function CardSkeleton({ count = 1 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="card animate-pulse"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-700 rounded-lg" />
            <div className="flex-1">
              <div className="h-4 bg-slate-700 rounded w-3/4 mb-2" />
              <div className="h-3 bg-slate-700 rounded w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

// Skeleton loader for lesson content
export function LessonSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-8 bg-slate-700 rounded w-2/3 mb-4" />
      <div className="h-4 bg-slate-700 rounded w-full mb-2" />
      <div className="h-4 bg-slate-700 rounded w-5/6 mb-2" />
      <div className="h-4 bg-slate-700 rounded w-4/5 mb-6" />

      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i}>
            <div className="h-6 bg-slate-700 rounded w-1/3 mb-3" />
            <div className="h-4 bg-slate-700 rounded w-full mb-2" />
            <div className="h-4 bg-slate-700 rounded w-11/12 mb-2" />
            <div className="h-4 bg-slate-700 rounded w-3/4" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Progress bar skeleton
export function ProgressBarSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="flex justify-between mb-2">
        <div className="h-3 bg-slate-700 rounded w-24" />
        <div className="h-3 bg-slate-700 rounded w-8" />
      </div>
      <div className="h-2 bg-slate-700 rounded-full" />
    </div>
  );
}
