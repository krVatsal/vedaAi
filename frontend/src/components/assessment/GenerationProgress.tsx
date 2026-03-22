'use client';

import { useEffect, useState } from 'react';
import { Sparkles, AlertTriangle, RefreshCw } from 'lucide-react';
import clsx from 'clsx';

interface GenerationProgressProps {
  status: 'pending' | 'active' | 'processing' | 'completed' | 'failed';
  progress: number;
  message: string;
  title: string;
  error?: string;
  onRetry?: () => void;
}

const STATUS_STEPS = [
  { label: 'Queued', threshold: 0 },
  { label: 'Building Prompt', threshold: 10 },
  { label: 'AI Processing', threshold: 20 },
  { label: 'Structuring Paper', threshold: 80 },
  { label: 'Finalizing', threshold: 95 },
  { label: 'Complete', threshold: 100 },
];

export function GenerationProgress({
  status,
  progress,
  message,
  title,
  error,
  onRetry,
}: GenerationProgressProps) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    if (status === 'failed') return;
    const interval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? '' : d + '.'));
    }, 500);
    return () => clearInterval(interval);
  }, [status]);

  const isFailed = status === 'failed';
  const currentStep = STATUS_STEPS.findIndex((s) => s.threshold > progress) - 1;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Card */}
      <div className={clsx(
        'section-card text-center relative overflow-hidden',
        isFailed && 'border-coral-500/30'
      )}>
        {/* Ambient glow */}
        {!isFailed && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-jade/10 rounded-full blur-3xl" />
          </div>
        )}

        <div className="relative z-10">
          {/* Icon */}
          <div className={clsx(
            'w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg',
            isFailed
              ? 'bg-coral-500/15 border border-coral-500/30 shadow-coral-500/20'
              : 'bg-jade/15 border border-jade/30 shadow-jade/20'
          )}>
            {isFailed ? (
              <AlertTriangle size={28} className="text-coral-500" />
            ) : (
              <Sparkles
                size={28}
                className="text-jade animate-spin-slow"
              />
            )}
          </div>

          {/* Title */}
          <h1 className="font-display text-2xl font-bold text-ink-50 mb-1">
            {isFailed ? 'Generation Failed' : `Generating: ${title}`}
          </h1>

          <p className="text-ink-300 text-sm mb-8">
            {isFailed ? (error || 'An unexpected error occurred') : `${message}${dots}`}
          </p>

          {/* Progress bar */}
          {!isFailed && (
            <div className="mb-6">
              <div className="flex justify-between text-xs text-ink-400 mb-2">
                <span>{message}</span>
                <span className="font-mono text-jade">{progress}%</span>
              </div>
              <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-jade-700 to-jade rounded-full transition-all duration-700 ease-out relative"
                  style={{ width: `${Math.max(progress, 3)}%` }}
                >
                  <div className="absolute inset-0 progress-animated rounded-full opacity-50" />
                </div>
              </div>
            </div>
          )}

          {/* Step indicators */}
          {!isFailed && (
            <div className="flex items-center justify-center gap-1 mb-6">
              {STATUS_STEPS.slice(0, -1).map((step, i) => {
                const done = progress >= step.threshold;
                const active = i === currentStep;
                return (
                  <div key={i} className="flex items-center gap-1">
                    <div className={clsx(
                      'w-2 h-2 rounded-full transition-all duration-300',
                      done
                        ? 'bg-jade'
                        : active
                        ? 'bg-jade/50 animate-pulse-dot'
                        : 'bg-white/10'
                    )} />
                    {i < STATUS_STEPS.length - 2 && (
                      <div className={clsx(
                        'w-6 h-px transition-all duration-500',
                        done ? 'bg-jade/50' : 'bg-white/10'
                      )} />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Step labels */}
          {!isFailed && (
            <div className="grid grid-cols-5 gap-1 text-center mb-6">
              {STATUS_STEPS.slice(0, 5).map((step, i) => (
                <div
                  key={i}
                  className={clsx(
                    'text-[10px] transition-colors',
                    progress >= step.threshold ? 'text-jade' : 'text-ink-600'
                  )}
                >
                  {step.label}
                </div>
              ))}
            </div>
          )}

          {/* Retry button */}
          {isFailed && onRetry && (
            <button
              onClick={onRetry}
              className="btn-primary flex items-center gap-2 mx-auto"
            >
              <RefreshCw size={16} />
              Try Again
            </button>
          )}

          {/* Estimated time */}
          {!isFailed && (
            <p className="text-xs text-ink-500">
              ✨ Estimated time: 15–30 seconds depending on complexity
            </p>
          )}
        </div>
      </div>

      {/* Tips */}
      {!isFailed && (
        <div className="mt-4 glass rounded-xl p-4 border border-white/[0.05]">
          <p className="text-xs text-ink-400 text-center">
            💡 The AI is carefully structuring questions by difficulty, marks distribution, and pedagogical balance.
          </p>
        </div>
      )}
    </div>
  );
}
