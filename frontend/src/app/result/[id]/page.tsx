'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Sidebar } from '@/components/ui/Sidebar';
import { TopBar } from '@/components/ui/TopBar';
import { MobileTopBar } from '@/components/ui/MobileTopBar';
import { getAssignment, regenerateAssessment, type Assignment } from '@/lib/api';
import { Download, Loader2, RefreshCw } from 'lucide-react';

function DifficultyBadge({ level }: { level: string }) {
  const colorMap: Record<string, string> = {
    easy: 'text-green-600',
    medium: 'text-amber-600',
    hard: 'text-red-500',
  };
  const label = level.charAt(0).toUpperCase() + level.slice(1);
  return (
    <span className={`font-semibold ${colorMap[level] || 'text-text-secondary'}`}>
      [{label}]
    </span>
  );
}

export default function ResultPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isRegenerating, setIsRegenerating] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const data = await getAssignment(id);
        setAssignment(data);

        // If still processing, poll
        if (data.status === 'pending' || data.status === 'processing') {
          pollForResult();
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load assignment');
      } finally {
        setLoading(false);
      }
    };

    const pollForResult = async () => {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      for (let i = 0; i < 60; i++) {
        await new Promise((r) => setTimeout(r, 2000));
        try {
          const res = await fetch(`${API_BASE}/api/assignments/${id}`);
          const data = await res.json();
          if (data.status === 'completed') {
            setAssignment(data);
            return;
          } else if (data.status === 'failed') {
            setError(data.error || 'Generation failed');
            return;
          }
        } catch {
          // keep polling
        }
      }
    };

    fetchData();
  }, [id]);

  const handleRegenerate = async () => {
    if (!id || isRegenerating) return;
    setIsRegenerating(true);
    setError('');
    
    try {
      await regenerateAssessment(id);
      window.location.reload();
    } catch (err: any) {
      setError(err.message || 'Failed to trigger regeneration');
      setIsRegenerating(false);
    }
  };

  const paper = assignment?.result;

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-bg-gradient-top to-bg-gradient-bottom flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={48} className="text-text-primary animate-spin" />
          <p className="text-text-secondary text-base">Loading assignment...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !assignment) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-bg-gradient-top to-bg-gradient-bottom flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 max-w-md text-center">
          <p className="text-accent-red text-lg font-semibold">{error || 'Assignment not found'}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-btn-primary text-white rounded-full hover:bg-[#2a2a2a] transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // Still processing
  if (assignment.status !== 'completed' || !paper) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-bg-gradient-top to-bg-gradient-bottom flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={48} className="text-btn-primary animate-spin" />
          <p className="text-text-primary text-lg font-semibold">Generating your question paper...</p>
          <p className="text-text-secondary text-sm">This may take 15-30 seconds</p>
        </div>
      </div>
    );
  }

  // Build AI message
  const aiMessage = `Certainly! Here is your customized ${paper.title} for ${paper.subject} — Grade ${paper.gradeLevel}:`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-bg-gradient-top to-bg-gradient-bottom relative">
      {/* Desktop Sidebar */}
      <Sidebar activePage="home" buttonLabel="AI Teacher's Toolkit" />

      {/* Mobile Top Bar */}
      <MobileTopBar />

      {/* Main Content */}
      <div className="lg:ml-[327px]">
        {/* Desktop Top Bar */}
        <div className="px-0 pt-3 lg:px-0">
          <TopBar />
        </div>

        {/* Content */}
        <main className="px-4 lg:px-5 py-4 pb-8">
          {/* Dark Container */}
          <div className="bg-[#5E5E5E] rounded-[32px] p-3 lg:p-5 flex flex-col items-center gap-3 lg:gap-6">
            {/* ═══ AI Message Card ═══ */}
            <div className="w-full bg-[rgba(24,24,24,0.8)] rounded-[32px] px-4 lg:px-8 py-6 flex flex-col gap-4">
              <p className="text-sm lg:text-xl font-bold tracking-[-0.04em] leading-[140%] text-white">
                {aiMessage}
              </p>
              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1 px-6 py-2.5 bg-white rounded-full hover:bg-gray-50 transition-colors"
                >
                  <Download size={24} className="text-text-primary" strokeWidth={2} />
                  <span className="text-base font-medium tracking-[-0.04em] text-text-primary leading-[22px]">
                    Download as PDF
                  </span>
                </button>
                <button
                  onClick={handleRegenerate}
                  disabled={isRegenerating}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#181818] rounded-full hover:bg-[#2a2a2a] transition-colors disabled:opacity-50"
                >
                  <RefreshCw size={20} className={`text-white ${isRegenerating ? 'animate-spin' : ''}`} strokeWidth={2} />
                  <span className="text-base font-medium tracking-[-0.04em] text-white leading-[22px]">
                    {isRegenerating ? 'Regenerating...' : 'Regenerate Paper'}
                  </span>
                </button>
              </div>
            </div>

            {/* ═══ Question Paper ═══ */}
            <div id="question-paper" className="w-full bg-white rounded-[32px] px-4 lg:px-8 py-6 lg:py-8 flex flex-col items-center gap-6">
              {/* School Header */}
              <div className="text-center">
                <h1 className="text-xl lg:text-[32px] font-bold font-inter tracking-[-0.04em] leading-[160%] text-text-primary">
                  {paper.title}
                </h1>
                <p className="text-sm lg:text-[32px] font-bold font-inter tracking-[-0.04em] leading-[160%] text-text-primary">
                  Subject: {paper.subject}
                </p>
                <p className="text-sm lg:text-[32px] font-bold font-inter tracking-[-0.04em] leading-[160%] text-text-primary">
                  Class: {paper.gradeLevel}
                </p>
              </div>

              {/* Time & Marks */}
              <div className="w-full flex justify-between items-center">
                <span className="text-sm lg:text-lg font-semibold font-inter tracking-[-0.04em] leading-[160%] text-text-primary">
                  Time Allowed: {paper.duration} minutes
                </span>
                <span className="text-sm lg:text-lg font-semibold font-inter tracking-[-0.04em] leading-[160%] text-text-primary">
                  Maximum Marks: {paper.totalMarks}
                </span>
              </div>

              {/* Instructions */}
              {paper.instructions.map((instr, i) => (
                <div key={i} className="w-full">
                  <p className="text-sm lg:text-lg font-semibold font-inter tracking-[-0.04em] leading-[160%] text-text-primary">
                    {instr}
                  </p>
                </div>
              ))}

              {/* Student Fields */}
              <div className="w-full flex flex-col">
                <span className="text-sm lg:text-lg font-semibold font-inter tracking-[-0.04em] leading-[160%] text-text-primary">
                  Name: ______________________
                </span>
                <span className="text-sm lg:text-lg font-semibold font-inter tracking-[-0.04em] leading-[160%] text-text-primary">
                  Roll Number: ________________
                </span>
                <span className="text-sm lg:text-lg font-semibold font-inter tracking-[-0.04em] leading-[160%] text-text-primary">
                  Class: {paper.gradeLevel} Section: __________
                </span>
              </div>

              {/* Sections */}
              {paper.sections.map((section) => (
                <div key={section.id} className="w-full flex flex-col gap-4">
                  {/* Section Title */}
                  <h2 className="text-base lg:text-2xl font-semibold font-inter tracking-[-0.04em] leading-[160%] text-text-primary text-center">
                    {section.title}
                  </h2>

                  {/* Section Instruction */}
                  <p className="text-sm lg:text-lg font-semibold font-inter tracking-[-0.04em] leading-[160%] text-text-primary">
                    {section.instruction}
                  </p>

                  {/* Questions */}
                  <div className="flex flex-col gap-2">
                    {section.questions.map((q, qi) => (
                      <div key={q.id} className="text-sm lg:text-base font-normal font-inter tracking-[-0.04em] leading-[240%] text-text-primary">
                        <p>
                          {qi + 1}.{' '}
                          <DifficultyBadge level={q.difficulty} />{' '}
                          {q.text} [{q.marks} Marks]
                        </p>
                        {q.options && q.options.length > 0 && (
                          <div className="ml-6 leading-[200%]">
                            {q.options.map((opt, oi) => (
                              <p key={oi}>({String.fromCharCode(97 + oi)}) {opt}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* End */}
              <p className="text-sm lg:text-base font-semibold font-inter tracking-[-0.04em] leading-[240%] text-text-primary text-center w-full">
                End of Question Paper
              </p>

              {/* Answer Key */}
              <div className="w-full flex flex-col gap-2 border-t border-gray-200 pt-6">
                <h3 className="text-base lg:text-lg font-bold font-inter tracking-[-0.04em] leading-[160%] text-text-primary">
                  Answer Key:
                </h3>
                {paper.sections.map((section) => (
                  <div key={section.id} className="flex flex-col gap-2">
                    {section.questions.map((q, qi) =>
                      q.answer ? (
                        <p
                          key={q.id}
                          className="text-sm lg:text-base font-normal font-inter tracking-[-0.04em] leading-[150%] lg:leading-[200%] text-text-primary"
                        >
                          <strong>Q{qi + 1}:</strong> {q.answer}
                        </p>
                      ) : null
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
