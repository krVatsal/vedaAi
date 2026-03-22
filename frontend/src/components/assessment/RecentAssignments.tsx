'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { listAssignments } from '@/lib/api';
import { Assignment } from '@/types';
import { Clock, CheckCircle, XCircle, Loader, ChevronRight, BookOpen } from 'lucide-react';
import clsx from 'clsx';

const STATUS_CONFIG = {
  pending: { icon: Clock, color: 'text-amber', bg: 'bg-amber/10', border: 'border-amber/20', label: 'Queued' },
  processing: { icon: Loader, color: 'text-jade', bg: 'bg-jade/10', border: 'border-jade/20', label: 'Generating' },
  completed: { icon: CheckCircle, color: 'text-jade', bg: 'bg-jade/10', border: 'border-jade/20', label: 'Ready' },
  failed: { icon: XCircle, color: 'text-coral-500', bg: 'bg-coral-500/10', border: 'border-coral-500/20', label: 'Failed' },
};

export function RecentAssignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAssignments();
  }, []);

  async function loadAssignments() {
    try {
      const data = await listAssignments();
      setAssignments(data);
    } catch {
      // silently fail - no assignments yet
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) return null;
  if (assignments.length === 0) return null;

  return (
    <div className="mt-12 animate-fade-up" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl font-semibold text-ink-200">
          Recent Assessments
        </h2>
        <span className="text-xs text-ink-500 glass px-3 py-1 rounded-full border border-white/[0.07]">
          {assignments.length} total
        </span>
      </div>

      <div className="space-y-3">
        {assignments.slice(0, 5).map((a) => {
          const cfg = STATUS_CONFIG[a.status];
          const Icon = cfg.icon;
          return (
            <Link
              key={a._id}
              href={`/assessment/${a._id}`}
              className="flex items-center gap-4 glass glass-hover rounded-xl p-4 group"
            >
              {/* Icon */}
              <div className={clsx(
                'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border',
                cfg.bg, cfg.border
              )}>
                <Icon
                  size={18}
                  className={clsx(cfg.color, a.status === 'processing' && 'animate-spin')}
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-ink-50 font-medium text-sm truncate">{a.title}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-ink-400 text-xs flex items-center gap-1">
                    <BookOpen size={10} />
                    {a.subject}
                  </span>
                  <span className="text-ink-600 text-xs">·</span>
                  <span className="text-ink-400 text-xs">{a.gradeLevel}</span>
                  <span className="text-ink-600 text-xs">·</span>
                  <span className="text-ink-400 text-xs">{a.totalMarks} marks</span>
                </div>
              </div>

              {/* Status */}
              <div className={clsx(
                'text-xs px-2.5 py-1 rounded-full font-semibold border',
                cfg.bg, cfg.border, cfg.color
              )}>
                {cfg.label}
              </div>

              {/* Arrow */}
              <ChevronRight size={16} className="text-ink-600 group-hover:text-ink-300 group-hover:translate-x-0.5 transition-all" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
