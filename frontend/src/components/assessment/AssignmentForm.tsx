'use client';

import { useState, useRef } from 'react';
import { useAssessmentStore } from '@/store/assessmentStore';
import { AssignmentFormData, QuestionType, QUESTION_TYPE_LABELS, GRADE_LEVELS, SUBJECTS, QuestionTypeName } from '@/types';
import { QuestionTypeRow } from './QuestionTypeRow';
import { Plus, Upload, X, FileText, ChevronRight, BookOpen, Clock, Star, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';

interface AssignmentFormProps {
  onSubmit: (data: AssignmentFormData) => Promise<void>;
  isSubmitting: boolean;
}

const DIFFICULTY_OPTIONS = [
  { value: 'easy', label: 'Easy', color: 'jade' },
  { value: 'medium', label: 'Medium', color: 'amber' },
  { value: 'hard', label: 'Hard', color: 'coral' },
  { value: 'mixed', label: 'Mixed', color: 'ink' },
] as const;

export function AssignmentForm({ onSubmit, isSubmitting }: AssignmentFormProps) {
  const { formData, setFormData, addQuestionType, removeQuestionType, updateQuestionType } = useAssessmentStore();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const calculatedTotal = formData.questionTypes.reduce(
    (sum, qt) => sum + qt.count * qt.marks,
    0
  );

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!formData.title.trim() || formData.title.length < 3) e.title = 'Title must be at least 3 characters';
    if (!formData.subject) e.subject = 'Please select a subject';
    if (!formData.gradeLevel) e.gradeLevel = 'Please select a grade level';
    if (!formData.dueDate) e.dueDate = 'Due date is required';
    if (formData.questionTypes.length === 0) e.questionTypes = 'Add at least one question type';
    if (formData.totalMarks < 1) e.totalMarks = 'Total marks must be positive';
    if (formData.duration < 10) e.duration = 'Duration must be at least 10 minutes';
    if (calculatedTotal !== formData.totalMarks) {
      e.totalMarks = `Question marks total (${calculatedTotal}) must equal total marks (${formData.totalMarks})`;
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please fix the errors before submitting');
      return;
    }
    await onSubmit(formData);
  };

  const addDefaultQuestionType = () => {
    const usedTypes = formData.questionTypes.map((qt) => qt.type);
    const available = (Object.keys(QUESTION_TYPE_LABELS) as QuestionTypeName[]).find(
      (t) => !usedTypes.includes(t)
    );
    if (!available) {
      toast.error('All question types have been added');
      return;
    }
    addQuestionType({ type: available, count: 5, marks: 2 });
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.type === 'application/pdf' || file.type === 'text/plain')) {
      setFormData({ file });
    } else {
      toast.error('Only PDF and .txt files supported');
    }
  };

  const totalQCount = formData.questionTypes.reduce((s, qt) => s + qt.count, 0);

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-up" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
      {/* ── Basic Info ── */}
      <div className="section-card space-y-5">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-jade/15 border border-jade/25 flex items-center justify-center">
            <BookOpen size={14} className="text-jade" />
          </div>
          <h2 className="font-display font-semibold text-lg text-ink-50">Assessment Details</h2>
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-ink-300 uppercase tracking-wider mb-2">
            Assessment Title <span className="text-coral-500">*</span>
          </label>
          <input
            type="text"
            className={clsx('input-field', errors.title && 'border-coral-500/50 focus:border-coral-500/70')}
            placeholder="e.g. Mid-Term Physics Examination 2024"
            value={formData.title}
            onChange={(e) => { setFormData({ title: e.target.value }); setErrors((p) => ({ ...p, title: '' })); }}
          />
          {errors.title && <p className="text-coral-500 text-xs mt-1">{errors.title}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Subject */}
          <div>
            <label className="block text-xs font-semibold text-ink-300 uppercase tracking-wider mb-2">
              Subject <span className="text-coral-500">*</span>
            </label>
            <select
              className={clsx('input-field', errors.subject && 'border-coral-500/50')}
              value={formData.subject}
              onChange={(e) => { setFormData({ subject: e.target.value }); setErrors((p) => ({ ...p, subject: '' })); }}
            >
              <option value="">Select subject...</option>
              {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            {errors.subject && <p className="text-coral-500 text-xs mt-1">{errors.subject}</p>}
          </div>

          {/* Grade Level */}
          <div>
            <label className="block text-xs font-semibold text-ink-300 uppercase tracking-wider mb-2">
              Grade Level <span className="text-coral-500">*</span>
            </label>
            <select
              className={clsx('input-field', errors.gradeLevel && 'border-coral-500/50')}
              value={formData.gradeLevel}
              onChange={(e) => { setFormData({ gradeLevel: e.target.value }); setErrors((p) => ({ ...p, gradeLevel: '' })); }}
            >
              <option value="">Select grade...</option>
              {GRADE_LEVELS.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
            {errors.gradeLevel && <p className="text-coral-500 text-xs mt-1">{errors.gradeLevel}</p>}
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-xs font-semibold text-ink-300 uppercase tracking-wider mb-2">
              Due Date <span className="text-coral-500">*</span>
            </label>
            <input
              type="date"
              className={clsx('input-field', errors.dueDate && 'border-coral-500/50')}
              value={formData.dueDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => { setFormData({ dueDate: e.target.value }); setErrors((p) => ({ ...p, dueDate: '' })); }}
            />
            {errors.dueDate && <p className="text-coral-500 text-xs mt-1">{errors.dueDate}</p>}
          </div>

          {/* Duration */}
          <div>
            <label className="block text-xs font-semibold text-ink-300 uppercase tracking-wider mb-2">
              Duration (minutes) <span className="text-coral-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                className={clsx('input-field pr-14', errors.duration && 'border-coral-500/50')}
                min={10}
                max={300}
                value={formData.duration}
                onChange={(e) => { setFormData({ duration: parseInt(e.target.value) || 0 }); setErrors((p) => ({ ...p, duration: '' })); }}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-ink-400">
                <Clock size={12} />
                <span className="text-xs">min</span>
              </div>
            </div>
            {errors.duration && <p className="text-coral-500 text-xs mt-1">{errors.duration}</p>}
          </div>
        </div>
      </div>

      {/* ── Question Types ── */}
      <div className="section-card space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber/15 border border-amber/25 flex items-center justify-center">
              <Star size={14} className="text-amber" />
            </div>
            <div>
              <h2 className="font-display font-semibold text-lg text-ink-50">Question Types</h2>
              {formData.questionTypes.length > 0 && (
                <p className="text-xs text-ink-400">
                  {totalQCount} questions · {calculatedTotal}/{formData.totalMarks} marks assigned
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={addDefaultQuestionType}
            className="flex items-center gap-1.5 text-jade text-sm font-semibold hover:text-jade-400 transition-colors"
          >
            <Plus size={16} />
            Add Type
          </button>
        </div>

        {errors.questionTypes && (
          <div className="flex items-center gap-2 text-coral-500 text-sm bg-coral-500/10 rounded-lg p-3 border border-coral-500/20">
            <AlertTriangle size={14} />
            {errors.questionTypes}
          </div>
        )}

        {formData.questionTypes.length === 0 ? (
          <div
            className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center cursor-pointer hover:border-white/20 transition-colors"
            onClick={addDefaultQuestionType}
          >
            <Plus size={24} className="text-ink-500 mx-auto mb-2" />
            <p className="text-ink-400 text-sm">Click to add question types</p>
          </div>
        ) : (
          <div className="space-y-3">
            {formData.questionTypes.map((qt, i) => (
              <QuestionTypeRow
                key={i}
                index={i}
                questionType={qt}
                onUpdate={(updates) => updateQuestionType(i, updates)}
                onRemove={() => removeQuestionType(i)}
              />
            ))}
          </div>
        )}

        {/* Total marks input */}
        <div className="border-t border-white/[0.06] pt-4 flex items-center justify-between">
          <div>
            <label className="block text-xs font-semibold text-ink-300 uppercase tracking-wider mb-1">
              Total Marks
            </label>
            {calculatedTotal > 0 && calculatedTotal !== formData.totalMarks && (
              <p className="text-amber text-xs">
                ⚠ Currently {calculatedTotal} marks from questions
              </p>
            )}
          </div>
          <input
            type="number"
            className={clsx(
              'w-28 input-field text-center text-lg font-semibold',
              errors.totalMarks && 'border-coral-500/50'
            )}
            min={1}
            max={1000}
            value={formData.totalMarks}
            onChange={(e) => { setFormData({ totalMarks: parseInt(e.target.value) || 0 }); setErrors((p) => ({ ...p, totalMarks: '' })); }}
          />
        </div>
        {errors.totalMarks && (
          <p className="text-coral-500 text-xs -mt-2">{errors.totalMarks}</p>
        )}
      </div>

      {/* ── Difficulty + Instructions ── */}
      <div className="section-card space-y-5">
        <h2 className="font-display font-semibold text-lg text-ink-50">Configuration</h2>

        {/* Difficulty */}
        <div>
          <label className="block text-xs font-semibold text-ink-300 uppercase tracking-wider mb-3">
            Overall Difficulty
          </label>
          <div className="grid grid-cols-4 gap-2">
            {DIFFICULTY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setFormData({ difficulty: opt.value })}
                className={clsx(
                  'py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 border',
                  formData.difficulty === opt.value
                    ? opt.value === 'easy'
                      ? 'bg-jade/20 border-jade/50 text-jade'
                      : opt.value === 'medium'
                      ? 'bg-amber/20 border-amber/50 text-amber'
                      : opt.value === 'hard'
                      ? 'bg-coral-500/20 border-coral-500/50 text-coral-500'
                      : 'bg-white/10 border-white/30 text-ink-50'
                    : 'bg-white/[0.03] border-white/[0.08] text-ink-400 hover:border-white/20'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Additional instructions */}
        <div>
          <label className="block text-xs font-semibold text-ink-300 uppercase tracking-wider mb-2">
            Additional Instructions
            <span className="ml-2 text-ink-500 normal-case tracking-normal font-normal">(optional)</span>
          </label>
          <textarea
            className="input-field min-h-[100px] resize-y"
            placeholder="e.g. Focus on thermodynamics chapters 3-5. Include at least 2 diagram-based questions..."
            value={formData.additionalInstructions}
            onChange={(e) => setFormData({ additionalInstructions: e.target.value })}
          />
        </div>

        {/* File upload */}
        <div>
          <label className="block text-xs font-semibold text-ink-300 uppercase tracking-wider mb-2">
            Reference Material
            <span className="ml-2 text-ink-500 normal-case tracking-normal font-normal">(PDF or .txt, optional)</span>
          </label>
          <div
            className={clsx(
              'relative border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all duration-200',
              dragOver
                ? 'border-jade/60 bg-jade/5'
                : 'border-white/10 hover:border-white/20',
              formData.file && 'border-jade/40 bg-jade/5'
            )}
            onClick={() => !formData.file && fileRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleFileDrop}
          >
            {formData.file ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-jade/15 border border-jade/25 flex items-center justify-center">
                    <FileText size={18} className="text-jade" />
                  </div>
                  <div className="text-left">
                    <p className="text-ink-50 text-sm font-medium">{formData.file.name}</p>
                    <p className="text-ink-400 text-xs">
                      {(formData.file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setFormData({ file: null }); }}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-ink-400 hover:text-ink-50 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <>
                <Upload size={20} className="text-ink-500 mx-auto mb-2" />
                <p className="text-ink-400 text-sm">
                  Drop PDF/TXT here or{' '}
                  <span className="text-jade underline underline-offset-2">browse</span>
                </p>
                <p className="text-ink-600 text-xs mt-1">Max 10MB</p>
              </>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.txt,application/pdf,text/plain"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) setFormData({ file: f });
            }}
          />
        </div>
      </div>

      {/* ── Submit ── */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-primary w-full flex items-center justify-center gap-3 py-4 text-base"
      >
        {isSubmitting ? (
          <>
            <div className="w-5 h-5 border-2 border-ink-900/30 border-t-ink-900 rounded-full animate-spin" />
            Generating Assessment...
          </>
        ) : (
          <>
            Generate Assessment Paper
            <ChevronRight size={18} />
          </>
        )}
      </button>
    </form>
  );
}
