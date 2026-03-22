'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/ui/Sidebar';
import { TopBar } from '@/components/ui/TopBar';
import { MobileTopBar } from '@/components/ui/MobileTopBar';
import { MobileBottomNav } from '@/components/ui/MobileBottomNav';
import {
  createAssignment,
  subscribeToAssignment,
  type CreateAssignmentPayload,
  type QuestionType as ApiQT,
} from '@/lib/api';
import {
  UploadCloud,
  Calendar,
  ChevronDown,
  X,
  Minus,
  Plus,
  ArrowLeft,
  ArrowRight,
  Mic,
  Loader2,
} from 'lucide-react';

interface QuestionType {
  id: string;
  label: string;
  count: number;
  marks: number;
}

const QUESTION_TYPE_OPTIONS = [
  'Multiple Choice Questions',
  'Short Questions',
  'Diagram/Graph-Based Questions',
  'Numerical Problems',
  'Long Answer Questions',
  'True/False',
  'Fill in the Blanks',
  'Match the Following',
];

// Map UI labels → backend enum values
const LABEL_TO_TYPE: Record<string, ApiQT['type']> = {
  'Multiple Choice Questions': 'mcq',
  'Short Questions': 'short_answer',
  'Diagram/Graph-Based Questions': 'short_answer',
  'Numerical Problems': 'short_answer',
  'Long Answer Questions': 'long_answer',
  'True/False': 'true_false',
  'Fill in the Blanks': 'fill_blanks',
  'Match the Following': 'short_answer',
};

export default function CreateAssignmentPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentStep] = useState(1);
  const [dueDate, setDueDate] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMsg, setProgressMsg] = useState('');
  const [questionTypes, setQuestionTypes] = useState<QuestionType[]>([
    { id: '1', label: 'Multiple Choice Questions', count: 4, marks: 1 },
    { id: '2', label: 'Short Questions', count: 3, marks: 2 },
    { id: '3', label: 'Diagram/Graph-Based Questions', count: 5, marks: 5 },
    { id: '4', label: 'Numerical Problems', count: 5, marks: 5 },
  ]);

  const totalQuestions = questionTypes.reduce((sum, qt) => sum + qt.count, 0);
  const totalMarks = questionTypes.reduce((sum, qt) => sum + qt.count * qt.marks, 0);

  const updateQuestionType = (id: string, field: 'count' | 'marks', delta: number) => {
    setQuestionTypes((prev) =>
      prev.map((qt) =>
        qt.id === id
          ? { ...qt, [field]: Math.max(1, qt[field] + delta) }
          : qt
      )
    );
  };

  const removeQuestionType = (id: string) => {
    setQuestionTypes((prev) => prev.filter((qt) => qt.id !== id));
  };

  const addQuestionType = () => {
    const usedLabels = questionTypes.map((qt) => qt.label);
    const available = QUESTION_TYPE_OPTIONS.find((opt) => !usedLabels.includes(opt));
    if (available) {
      setQuestionTypes((prev) => [
        ...prev,
        { id: Date.now().toString(), label: available, count: 4, marks: 1 },
      ]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setUploadedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) setUploadedFile(file);
  };

  const handleSubmit = async () => {
    if (submitting || questionTypes.length === 0) return;

    setSubmitting(true);
    setProgress(5);
    setProgressMsg('Submitting assignment...');

    try {
      const apiQuestionTypes: ApiQT[] = questionTypes.map((qt) => ({
        type: LABEL_TO_TYPE[qt.label] || 'short_answer',
        count: qt.count,
        marks: qt.marks,
      }));

      const payload: CreateAssignmentPayload = {
        title: 'Question Paper',
        subject: 'Science',
        gradeLevel: '8th',
        dueDate: dueDate || undefined,
        questionTypes: apiQuestionTypes,
        totalMarks,
        duration: 60,
        additionalInstructions: additionalInfo || undefined,
        difficulty: 'mixed',
      };

      const result = await createAssignment(payload, uploadedFile || undefined);

      setProgress(15);
      setProgressMsg('Generating with AI...');

      // Subscribe to WebSocket for real-time updates
      const unsubscribe = subscribeToAssignment(
        result.assignmentId,
        (update) => {
          if (update.progress) setProgress(update.progress);
          if (update.message) setProgressMsg(update.message);

          if (update.status === 'completed') {
            unsubscribe();
            router.push(`/result/${result.assignmentId}`);
          } else if (update.status === 'failed') {
            unsubscribe();
            setSubmitting(false);
            setProgress(0);
            setProgressMsg('');
            alert(update.error || 'Generation failed. Please try again.');
          }
        },
        () => {
          // WebSocket error — fall back to polling
          pollForCompletion(result.assignmentId);
        }
      );

      // Also start polling as fallback in case WS doesn't connect
      setTimeout(() => {
        if (submitting) {
          pollForCompletion(result.assignmentId);
        }
      }, 3000);
    } catch (err: any) {
      setSubmitting(false);
      setProgress(0);
      setProgressMsg('');
      alert(err.message || 'Failed to create assignment');
    }
  };

  const pollForCompletion = async (assignmentId: string) => {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const maxAttempts = 60; // 2 minutes
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise((r) => setTimeout(r, 2000));
      try {
        const res = await fetch(`${API_BASE}/api/assignments/${assignmentId}`);
        const data = await res.json();
        
        if (data.status === 'completed') {
          router.push(`/result/${assignmentId}`);
          return;
        } else if (data.status === 'failed') {
          setSubmitting(false);
          setProgress(0);
          alert(data.error || 'Generation failed');
          return;
        }

        // Update progress
        setProgress(Math.min(90, 15 + i * 2));
        if (data.status === 'processing') {
          setProgressMsg('AI is generating your question paper...');
        }
      } catch {
        // ignore fetch errors, keep polling
      }
    }
    setSubmitting(false);
    setProgress(0);
    alert('Generation timed out. Check back later.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-bg-gradient-top to-bg-gradient-bottom relative">
      {/* Desktop Sidebar */}
      <Sidebar assignmentCount={32} />

      {/* Mobile Top Bar */}
      <MobileTopBar />

      {/* Main Content Area */}
      <div className="lg:ml-[327px]">
        {/* Desktop Top Bar */}
        <div className="px-0 pt-3 lg:px-0">
          <TopBar />
        </div>

        {/* Content */}
        <main className="px-4 lg:px-6 py-6 pb-44 lg:pb-8">
          <div className="max-w-[1103px] mx-auto flex flex-col items-center gap-8">
            {/* ═══ Page Header ═══ */}
            <div className="w-full flex items-center gap-4 px-2">
              <div className="w-3 h-3 rounded-full bg-[#4BC26D] border-[4px] border-[rgba(75,194,109,0.4)] shadow-realistic flex-shrink-0" />
              <div className="flex flex-col gap-0.5">
                <h1 className="text-xl font-bold tracking-[-0.04em] text-text-primary leading-[140%]">
                  Create Assignment
                </h1>
                <p className="text-sm tracking-[-0.04em] text-text-muted leading-[140%]">
                  Set up a new assignment for your students
                </p>
              </div>
            </div>

            {/* ═══ Progress Bar ═══ */}
            <div className="w-full max-w-[815px] flex items-center gap-3">
              <div className="flex-1 h-[5px] rounded-full bg-[#5E5E5E]" />
              <div
                className={`flex-1 h-[5px] rounded-full ${
                  currentStep >= 2 ? 'bg-[#5E5E5E]' : 'bg-[#DADADA]'
                }`}
              />
            </div>

            {/* ═══ Form Card ═══ */}
            <div className="w-full max-w-[810px] bg-white/50 rounded-[32px] p-4 lg:p-8 flex flex-col gap-8">
              {/* Card Header */}
              <div className="flex flex-col gap-0.5">
                <h2 className="text-xl font-bold tracking-[-0.04em] text-text-primary leading-[140%]">
                  Assignment Details
                </h2>
                <p className="text-sm tracking-[-0.04em] text-text-secondary leading-[140%]">
                  Basic information about your assignment
                </p>
              </div>

              {/* Form Fields */}
              <div className="flex flex-col gap-4">
                {/* ─── File Upload ─── */}
                <div className="flex flex-col gap-3">
                  <div
                    className="w-full bg-white lg:bg-white border-[1.75px] border-dashed border-black/20 rounded-3xl flex flex-col items-center justify-center py-6 px-8 gap-4 cursor-pointer hover:border-black/30 transition-colors"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".jpeg,.jpg,.png,.pdf,.txt"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                      <UploadCloud size={24} className="text-[#1E1E1E]" strokeWidth={2.5} />
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-base font-medium tracking-[-0.04em] text-text-primary text-center leading-[140%]">
                        {uploadedFile ? uploadedFile.name : 'Choose a file or drag & drop it here'}
                      </span>
                      <span className="text-sm tracking-[-0.04em] text-disabled text-center leading-[140%]">
                        JPEG, PNG, PDF up to 10MB
                      </span>
                    </div>
                    <button
                      type="button"
                      className="px-6 py-2 bg-[#F6F6F6] rounded-full text-sm font-medium tracking-[-0.04em] text-text-primary leading-[140%] hover:bg-[#EDEDED] transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                    >
                      Browse Files
                    </button>
                  </div>
                  <p className="text-base font-medium tracking-[-0.04em] text-[rgba(48,48,48,0.6)] leading-[140%] text-center">
                    Upload images of your preferred document/image
                  </p>
                </div>

                {/* ─── Due Date ─── */}
                <div className="flex flex-col gap-2">
                  <label className="text-base font-bold tracking-[-0.04em] text-text-primary leading-[140%]">
                    Due Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full h-11 border border-[#DADADA] rounded-full px-4 text-base font-medium tracking-[-0.04em] text-text-primary leading-[140%] bg-transparent placeholder:text-disabled focus:outline-none focus:border-text-secondary transition-colors appearance-none"
                      placeholder="DD-MM-YYYY"
                    />
                    <Calendar
                      size={24}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#2B2B2B] pointer-events-none"
                      strokeWidth={2}
                    />
                  </div>
                </div>

                {/* ─── Question Types ─── */}
                <div className="flex flex-col gap-4">
                  {/* Desktop Layout */}
                  <div className="hidden lg:flex flex-col gap-4">
                    <div className="flex items-start gap-16">
                      {/* Left: Question Type Column */}
                      <div className="flex flex-col gap-4 flex-1 max-w-[471px]">
                        <h3 className="text-base font-bold tracking-[-0.04em] text-text-primary leading-[140%]">
                          Question Type
                        </h3>
                        {questionTypes.map((qt) => (
                          <div key={qt.id} className="flex items-center gap-3">
                            <div className="flex items-center gap-2 flex-1">
                              <div className="flex items-center justify-between px-4 py-[11px] bg-white rounded-full flex-1">
                                <span className="text-base font-medium tracking-[-0.04em] text-text-primary leading-[140%]">
                                  {qt.label}
                                </span>
                                <ChevronDown size={16} className="text-text-primary" strokeWidth={1.5} />
                              </div>
                            </div>
                            <button
                              onClick={() => removeQuestionType(qt.id)}
                              className="p-0.5 hover:bg-gray-100 rounded transition-colors"
                            >
                              <X size={16} className="text-text-primary" strokeWidth={1.5} />
                            </button>
                          </div>
                        ))}
                        {/* Add Question Type */}
                        <button
                          onClick={addQuestionType}
                          className="flex items-center gap-2"
                        >
                          <div className="w-9 h-9 bg-[#2B2B2B] rounded-full flex items-center justify-center">
                            <Plus size={20} className="text-white" strokeWidth={2} />
                          </div>
                          <span className="text-sm font-bold tracking-[-0.04em] text-text-primary leading-[140%]">
                            Add Question Type
                          </span>
                        </button>
                      </div>

                      {/* Right: Counters */}
                      <div className="flex gap-4">
                        {/* No. of Questions Column */}
                        <div className="flex flex-col items-center gap-4 w-[116px]">
                          <span className="text-base font-medium tracking-[-0.04em] text-text-primary text-center leading-[140%]">
                            No. of Questions
                          </span>
                          {questionTypes.map((qt) => (
                            <div
                              key={qt.id}
                              className="flex items-center justify-between px-2 py-[11px] bg-white rounded-full w-[100px] h-11"
                            >
                              <button
                                onClick={() => updateQuestionType(qt.id, 'count', -1)}
                                className="text-[#DADADA] hover:text-text-secondary transition-colors"
                              >
                                <Minus size={16} strokeWidth={1.5} />
                              </button>
                              <span className="text-base font-medium tracking-[-0.04em] text-text-primary leading-[140%]">
                                {qt.count}
                              </span>
                              <button
                                onClick={() => updateQuestionType(qt.id, 'count', 1)}
                                className="text-[#DADADA] hover:text-text-secondary transition-colors"
                              >
                                <Plus size={16} strokeWidth={1.5} />
                              </button>
                            </div>
                          ))}
                        </div>

                        {/* Marks Column */}
                        <div className="flex flex-col items-center gap-4 w-[100px]">
                          <span className="text-base font-medium tracking-[-0.04em] text-text-primary text-center leading-[140%]">
                            Marks
                          </span>
                          {questionTypes.map((qt) => (
                            <div
                              key={qt.id}
                              className="flex items-center justify-between px-2 py-[11px] bg-white rounded-full w-[100px] h-11"
                            >
                              <button
                                onClick={() => updateQuestionType(qt.id, 'marks', -1)}
                                className="text-[#DADADA] hover:text-text-secondary transition-colors"
                              >
                                <Minus size={16} strokeWidth={1.5} />
                              </button>
                              <span className="text-base font-medium tracking-[-0.04em] text-text-primary leading-[140%]">
                                {qt.marks}
                              </span>
                              <button
                                onClick={() => updateQuestionType(qt.id, 'marks', 1)}
                                className="text-[#DADADA] hover:text-text-secondary transition-colors"
                              >
                                <Plus size={16} strokeWidth={1.5} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Totals */}
                    <div className="flex justify-end">
                      <div className="flex flex-col gap-2 text-right">
                        <span className="text-base font-medium tracking-[-0.04em] text-text-primary leading-[110%]">
                          Total Questions : {totalQuestions}
                        </span>
                        <span className="text-base font-medium tracking-[-0.04em] text-text-primary leading-[110%]">
                          Total Marks : {totalMarks}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Mobile Layout: Question Type Cards */}
                  <div className="flex lg:hidden flex-col gap-4">
                    <h3 className="text-base font-bold tracking-[-0.04em] text-text-primary leading-[140%]">
                      Question Type
                    </h3>
                    {questionTypes.map((qt) => (
                      <div
                        key={qt.id}
                        className="bg-white rounded-3xl p-3 flex flex-col gap-3"
                      >
                        {/* Type header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-6">
                            <span className="text-sm font-medium tracking-[-0.04em] text-text-primary leading-[140%]">
                              {qt.label}
                            </span>
                            <ChevronDown size={16} className="text-text-primary" strokeWidth={1.5} />
                          </div>
                          <button onClick={() => removeQuestionType(qt.id)}>
                            <X size={16} className="text-text-primary" strokeWidth={1.5} />
                          </button>
                        </div>
                        {/* Counters */}
                        <div className="flex gap-3 bg-[#F0F0F0] rounded-3xl p-2">
                          <div className="flex-1 flex flex-col items-center gap-2">
                            <span className="text-sm font-medium tracking-[-0.04em] text-text-primary text-center leading-[140%]">
                              No. of Questions
                            </span>
                            <div className="flex items-center justify-between px-2 py-2 bg-white rounded-full w-full h-[38px]">
                              <button onClick={() => updateQuestionType(qt.id, 'count', -1)}>
                                <Minus size={16} className="text-[#5E5E5E]" strokeWidth={1.5} />
                              </button>
                              <span className="text-base font-medium tracking-[-0.04em] text-text-primary leading-[140%]">
                                {qt.count}
                              </span>
                              <button onClick={() => updateQuestionType(qt.id, 'count', 1)}>
                                <Plus size={16} className="text-[#5E5E5E]" strokeWidth={1.5} />
                              </button>
                            </div>
                          </div>
                          <div className="flex-1 flex flex-col items-center gap-2">
                            <span className="text-sm font-medium tracking-[-0.04em] text-text-primary text-center leading-[140%]">
                              Marks
                            </span>
                            <div className="flex items-center justify-between px-2 py-2 bg-white rounded-full w-full h-[38px]">
                              <button onClick={() => updateQuestionType(qt.id, 'marks', -1)}>
                                <Minus size={16} className="text-[#5E5E5E]" strokeWidth={1.5} />
                              </button>
                              <span className="text-base font-medium tracking-[-0.04em] text-text-primary leading-[140%]">
                                {qt.marks}
                              </span>
                              <button onClick={() => updateQuestionType(qt.id, 'marks', 1)}>
                                <Plus size={16} className="text-[#5E5E5E]" strokeWidth={1.5} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {/* Add Question Type */}
                    <button
                      onClick={addQuestionType}
                      className="flex items-center gap-2"
                    >
                      <div className="w-9 h-9 bg-[#2B2B2B] rounded-full flex items-center justify-center">
                        <Plus size={20} className="text-white" strokeWidth={2} />
                      </div>
                      <span className="text-sm font-bold tracking-[-0.04em] text-text-primary leading-[140%]">
                        Add Question Type
                      </span>
                    </button>
                    {/* Totals */}
                    <div className="flex justify-end">
                      <div className="flex flex-col gap-2 text-right">
                        <span className="text-base font-medium tracking-[-0.04em] text-text-primary leading-[110%]">
                          Total Questions : {totalQuestions}
                        </span>
                        <span className="text-base font-medium tracking-[-0.04em] text-text-primary leading-[110%]">
                          Total Marks : {totalMarks}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ─── Additional Information ─── */}
                <div className="flex flex-col gap-2">
                  <h3 className="text-base font-bold tracking-[-0.04em] text-text-primary leading-[140%]">
                    Additional Information (For better output)
                  </h3>
                  <div className="relative bg-white/25 border border-dashed border-[#DADADA] rounded-2xl p-4 flex flex-col justify-between min-h-[102px]">
                    <textarea
                      value={additionalInfo}
                      onChange={(e) => setAdditionalInfo(e.target.value)}
                      placeholder="e.g Generate a question paper for 3 hour exam duration..."
                      className="w-full bg-transparent text-sm font-medium tracking-[-0.04em] text-text-primary leading-[140%] placeholder:text-[rgba(48,48,48,0.6)] resize-none focus:outline-none min-h-[40px]"
                      rows={2}
                    />
                    <div className="flex justify-end mt-2">
                      <button className="w-9 h-9 bg-[#F0F0F0] rounded-full flex items-center justify-center hover:bg-[#E5E5E5] transition-colors">
                        <Mic size={16} className="text-text-primary" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ═══ Generating Overlay ═══ */}
            {submitting && (
              <div className="w-full max-w-[810px] bg-btn-primary rounded-[32px] p-8 flex flex-col items-center gap-4 animate-fade-in">
                <Loader2 size={40} className="text-white animate-spin" />
                <p className="text-white text-lg font-semibold tracking-[-0.04em]">
                  {progressMsg || 'Generating...'}
                </p>
                <div className="w-full max-w-[300px] h-2 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent-green rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-white/60 text-sm tracking-[-0.04em]">{progress}%</p>
              </div>
            )}

            {/* ═══ Navigation Buttons (Desktop) ═══ */}
            {!submitting && (
              <div className="hidden lg:flex w-full max-w-[810px] items-center justify-between">
                <button
                  onClick={() => router.push('/')}
                  className="flex items-center gap-1 px-6 py-3 bg-white rounded-full hover:bg-gray-50 transition-colors"
                >
                  <ArrowLeft size={20} className="text-text-primary" />
                  <span className="text-base font-medium tracking-[-0.04em] text-text-primary leading-[140%]">
                    Previous
                  </span>
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={questionTypes.length === 0}
                  className="flex items-center gap-1 px-6 py-3 bg-[#181818] rounded-full hover:bg-[#2a2a2a] transition-colors disabled:opacity-50"
                >
                  <span className="text-base font-medium tracking-[-0.04em] text-white leading-[140%]">
                    Generate Paper
                  </span>
                  <ArrowRight size={20} className="text-white" />
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ═══ Mobile Bottom Fixed Bar ═══ */}
      {!submitting && (
        <div className="fixed bottom-0 left-0 right-0 lg:hidden z-40">
          {/* Navigation Buttons */}
          <div className="flex items-center justify-center gap-3 px-10 py-2 bg-white/[0.01] backdrop-blur-[12px]">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-1 px-6 py-3 bg-white rounded-full"
            >
              <ArrowLeft size={20} className="text-text-primary" />
              <span className="text-base font-medium tracking-[-0.04em] text-text-primary leading-[140%]">
                Previous
              </span>
            </button>
            <button
              onClick={handleSubmit}
              disabled={questionTypes.length === 0}
              className="flex items-center gap-1 px-6 py-3 bg-[#181818] rounded-full shadow-realistic disabled:opacity-50"
            >
              <span className="text-base font-medium tracking-[-0.04em] text-white leading-[140%]">
                Generate
              </span>
              <ArrowRight size={20} className="text-white" />
            </button>
          </div>
          {/* Bottom Nav */}
          <MobileBottomNav />
        </div>
      )}
    </div>
  );
}
