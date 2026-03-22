'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { getAssignment, regenerateAssessment } from '@/lib/api';
import { useAssessmentStore } from '@/store/assessmentStore';
import { useWebSocket } from '@/hooks/useWebSocket';
import { Assignment, JobUpdate } from '@/types';
import { GenerationProgress } from '@/components/assessment/GenerationProgress';
import { QuestionPaper } from '@/components/assessment/QuestionPaper';
import { Header } from '@/components/ui/Header';
import { ArrowLeft, RefreshCw } from 'lucide-react';

export default function AssessmentPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { setJobUpdate, setGeneratedAssessment } = useAssessmentStore();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [localStatus, setLocalStatus] = useState<string>('pending');
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Initializing...');

  const handleJobUpdate = useCallback(
    (update: JobUpdate) => {
      setLocalStatus(update.status);
      if (update.progress !== undefined) setProgress(update.progress);
      if (update.message) setStatusMessage(update.message);

      if (update.status === 'completed' && update.result) {
        setGeneratedAssessment(update.result);
        setAssignment((prev) =>
          prev ? { ...prev, status: 'completed', result: update.result } : prev
        );
        toast.success('Assessment paper is ready!');
      }

      if (update.status === 'failed') {
        toast.error(update.error || 'Generation failed');
        setAssignment((prev) =>
          prev ? { ...prev, status: 'failed', error: update.error } : prev
        );
      }
    },
    [setGeneratedAssessment]
  );

  const { subscribe } = useWebSocket({ assignmentId: id, onUpdate: handleJobUpdate });

  useEffect(() => {
    subscribe(id);
    loadAssignment();
  }, [id]);

  async function loadAssignment() {
    setIsLoading(true);
    try {
      const data = await getAssignment(id);
      setAssignment(data);
      setLocalStatus(data.status);

      if (data.status === 'completed' && data.result) {
        setGeneratedAssessment(data.result);
        setProgress(100);
        setStatusMessage('Assessment ready!');
      } else if (data.status === 'processing') {
        setStatusMessage('Generating your question paper...');
        setProgress(20);
      } else if (data.status === 'failed') {
        setStatusMessage('Generation failed');
      }
    } catch (err: any) {
      toast.error('Failed to load assessment');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRegenerate() {
    if (!assignment) return;
    setIsRegenerating(true);
    try {
      await regenerateAssessment(id);
      setLocalStatus('pending');
      setProgress(0);
      setStatusMessage('Re-queued for generation...');
      setGeneratedAssessment(null);
      setAssignment((prev) =>
        prev ? { ...prev, status: 'pending', result: undefined } : prev
      );
      subscribe(id);
      toast.success('Regenerating assessment...');
    } catch (err: any) {
      toast.error(err.message || 'Regeneration failed');
    } finally {
      setIsRegenerating(false);
    }
  }

  const isCompleted =
    localStatus === 'completed' && (assignment?.result);

  return (
    <div className="min-h-screen bg-ink-900 relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full bg-jade/4 blur-[100px]" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full bg-amber/4 blur-[80px]" />
        <div className="absolute inset-0 bg-grid-pattern" />
      </div>

      <Header />

      <main className="relative z-10 container mx-auto px-4 py-8 max-w-5xl">
        {/* Breadcrumb nav */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-ink-400 hover:text-ink-50 transition-colors group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm">Back to Create</span>
          </button>

          {isCompleted && (
            <button
              onClick={handleRegenerate}
              disabled={isRegenerating}
              className="flex items-center gap-2 btn-secondary text-sm py-2 px-4"
            >
              <RefreshCw
                size={14}
                className={isRegenerating ? 'animate-spin' : ''}
              />
              Regenerate
            </button>
          )}
        </div>

        {/* Loading skeleton */}
        {isLoading && (
          <div className="space-y-4 animate-pulse">
            <div className="h-10 shimmer-line rounded-xl w-2/3" />
            <div className="h-6 shimmer-line rounded-lg w-1/3" />
            <div className="h-64 shimmer-line rounded-2xl mt-8" />
          </div>
        )}

        {/* Generation progress */}
        {!isLoading && !isCompleted && (
          <GenerationProgress
            status={localStatus as any}
            progress={progress}
            message={statusMessage}
            title={assignment?.title || 'Your Assessment'}
            error={assignment?.error}
            onRetry={handleRegenerate}
          />
        )}

        {/* Generated paper */}
        {!isLoading && isCompleted && assignment?.result && (
          <QuestionPaper
            assessment={assignment.result}
            assignmentMeta={assignment}
            onRegenerate={handleRegenerate}
            isRegenerating={isRegenerating}
          />
        )}
      </main>
    </div>
  );
}
