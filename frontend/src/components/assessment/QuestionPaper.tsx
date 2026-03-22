'use client';

import { useState } from 'react';
import { GeneratedAssessment, Question, Section, Assignment } from '@/types';
import { exportToPDF } from '@/lib/pdfExport';
import {
  Download, RefreshCw, Clock, Award, BookOpen,
  ChevronDown, ChevronUp, Calendar, Printer
} from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';

interface QuestionPaperProps {
  assessment: GeneratedAssessment;
  assignmentMeta: Assignment;
  onRegenerate: () => void;
  isRegenerating: boolean;
}

const DIFFICULTY_CONFIG = {
  easy: { label: 'Easy', classes: 'badge-easy', dot: 'bg-jade' },
  medium: { label: 'Moderate', classes: 'badge-medium', dot: 'bg-amber' },
  hard: { label: 'Hard', classes: 'badge-hard', dot: 'bg-coral-500' },
};

export function QuestionPaper({
  assessment,
  assignmentMeta,
  onRegenerate,
  isRegenerating,
}: QuestionPaperProps) {
  const [studentName, setStudentName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [sectionLabel, setSectionLabel] = useState('');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(assessment.sections.map((s) => s.id))
  );
  const [isExporting, setIsExporting] = useState(false);

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      await exportToPDF(assessment, {
        name: studentName,
        rollNumber,
        section: sectionLabel,
      });
      toast.success('PDF exported successfully!');
    } catch (err: any) {
      toast.error('PDF export failed: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  const totalQuestions = assessment.sections.reduce(
    (sum, s) => sum + s.questions.length, 0
  );

  const difficultyStats = assessment.sections
    .flatMap((s) => s.questions)
    .reduce((acc, q) => {
      acc[q.difficulty] = (acc[q.difficulty] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  return (
    <div className="animate-fade-up">
      {/* ── Action Bar ── */}
      <div className="glass rounded-2xl p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-jade/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-jade/15 border border-jade/30 flex items-center justify-center">
            <Award size={18} className="text-jade" />
          </div>
          <div>
            <p className="text-xs text-ink-400 font-mono">Assessment Ready</p>
            <p className="text-ink-50 font-semibold text-sm">{assessment.title}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRegenerate}
            disabled={isRegenerating}
            className="btn-secondary flex items-center gap-2 text-sm py-2 px-4"
          >
            <RefreshCw size={14} className={isRegenerating ? 'animate-spin' : ''} />
            Regenerate
          </button>

          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="btn-primary flex items-center gap-2 text-sm py-2 px-4"
          >
            {isExporting ? (
              <div className="w-4 h-4 border-2 border-ink-900/30 border-t-ink-900 rounded-full animate-spin" />
            ) : (
              <Download size={14} />
            )}
            Export PDF
          </button>
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { icon: BookOpen, label: 'Questions', value: totalQuestions, color: 'jade' },
          { icon: Award, label: 'Total Marks', value: assessment.totalMarks, color: 'amber' },
          { icon: Clock, label: 'Duration', value: `${assessment.duration}m`, color: 'jade' },
          { icon: Calendar, label: 'Sections', value: assessment.sections.length, color: 'amber' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="glass rounded-xl p-4 border border-white/[0.07]">
            <div className={clsx(
              'w-7 h-7 rounded-lg flex items-center justify-center mb-2',
              color === 'jade' ? 'bg-jade/15' : 'bg-amber/15'
            )}>
              <Icon size={14} className={color === 'jade' ? 'text-jade' : 'text-amber'} />
            </div>
            <div className="font-display font-bold text-xl text-ink-50">{value}</div>
            <div className="text-xs text-ink-400">{label}</div>
          </div>
        ))}
      </div>

      {/* ── Difficulty Distribution ── */}
      <div className="glass rounded-xl p-4 mb-6 border border-white/[0.07] flex flex-wrap gap-4 items-center">
        <span className="text-xs text-ink-400 uppercase tracking-wider font-semibold">Difficulty</span>
        <div className="flex items-center gap-4">
          {Object.entries(difficultyStats).map(([diff, count]) => {
            const cfg = DIFFICULTY_CONFIG[diff as keyof typeof DIFFICULTY_CONFIG];
            return (
              <div key={diff} className="flex items-center gap-2">
                <span className={cfg.classes}>{cfg.label}</span>
                <span className="text-ink-400 text-xs">{count}q</span>
              </div>
            );
          })}
        </div>
        <div className="ml-auto flex items-center gap-3">
          <div className="h-2 rounded-full overflow-hidden bg-white/[0.06] flex w-40">
            {Object.entries(difficultyStats).map(([diff, count], i) => {
              const colors = { easy: '#00C896', medium: '#F5A623', hard: '#FF6B6B' };
              return (
                <div
                  key={diff}
                  style={{
                    width: `${(count / totalQuestions) * 100}%`,
                    background: colors[diff as keyof typeof colors],
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Exam Paper ── */}
      <div className="rounded-2xl overflow-hidden border border-white/[0.1] shadow-2xl shadow-black/50" id="exam-paper">
        {/* Paper Header */}
        <div className="bg-gradient-to-b from-ink-800 to-ink-700 border-b border-white/[0.1] p-8">
          <div className="text-center">
            <div className="text-xs text-ink-400 uppercase tracking-[0.2em] mb-3 font-mono">
              Examination Paper
            </div>
            <h1 className="font-display text-3xl font-bold text-ink-50 mb-2">
              {assessment.title}
            </h1>
            <div className="text-jade text-sm font-semibold mb-4">
              {assessment.subject} · {assessment.gradeLevel}
            </div>

            <div className="flex items-center justify-center gap-6 text-sm text-ink-300">
              <span className="flex items-center gap-1.5">
                <Clock size={14} className="text-amber" />
                {assessment.duration} Minutes
              </span>
              <span className="text-ink-600">|</span>
              <span className="flex items-center gap-1.5">
                <Award size={14} className="text-jade" />
                Maximum Marks: {assessment.totalMarks}
              </span>
              <span className="text-ink-600">|</span>
              <span className="flex items-center gap-1.5">
                <Calendar size={14} className="text-ink-400" />
                {new Date(assignmentMeta.dueDate).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'long', year: 'numeric'
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Student Info */}
        <div className="bg-ink-800/60 border-b border-white/[0.06] p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Student Name', value: studentName, onChange: setStudentName, placeholder: 'Enter full name' },
              { label: 'Roll Number', value: rollNumber, onChange: setRollNumber, placeholder: 'Enter roll number' },
              { label: 'Section', value: sectionLabel, onChange: setSectionLabel, placeholder: 'e.g. A, B, C' },
            ].map(({ label, value, onChange, placeholder }) => (
              <div key={label}>
                <label className="block text-xs text-ink-400 mb-1 font-semibold uppercase tracking-wider">
                  {label}
                </label>
                <input
                  type="text"
                  className="input-field py-2 text-sm"
                  placeholder={placeholder}
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* General Instructions */}
        {assessment.instructions?.length > 0 && (
          <div className="bg-amber/[0.04] border-b border-amber/20 px-6 py-4">
            <p className="text-xs font-bold text-amber uppercase tracking-wider mb-2">General Instructions</p>
            <ol className="space-y-1">
              {assessment.instructions.map((inst, i) => (
                <li key={i} className="text-ink-300 text-xs flex gap-2">
                  <span className="text-amber font-mono">{i + 1}.</span>
                  {inst}
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Sections */}
        <div className="bg-ink-900/50">
          {assessment.sections.map((section: Section, sIdx) => (
            <div key={section.id} className={clsx(
              'border-b border-white/[0.06] last:border-0'
            )}>
              {/* Section Header */}
              <button
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/[0.02] transition-colors"
                onClick={() => toggleSection(section.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-jade/15 border border-jade/25 flex items-center justify-center font-display font-bold text-jade text-sm">
                    {String.fromCharCode(65 + sIdx)}
                  </div>
                  <div className="text-left">
                    <div className="font-display font-bold text-ink-50 text-lg">
                      {section.title}
                    </div>
                    <div className="text-xs text-ink-400 italic">{section.instruction}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-jade font-semibold text-sm">{section.totalMarks} Marks</div>
                    <div className="text-xs text-ink-500">{section.questions.length} questions</div>
                  </div>
                  {expandedSections.has(section.id) ? (
                    <ChevronUp size={16} className="text-ink-500" />
                  ) : (
                    <ChevronDown size={16} className="text-ink-500" />
                  )}
                </div>
              </button>

              {/* Questions */}
              {expandedSections.has(section.id) && (
                <div className="px-6 pb-6 space-y-4">
                  {section.questions.map((question: Question, qIdx) => (
                    <QuestionCard
                      key={question.id}
                      question={question}
                      index={qIdx + 1}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Paper Footer */}
        <div className="bg-ink-800/40 border-t border-white/[0.06] px-6 py-4 text-center">
          <p className="text-xs text-ink-500">
            Generated by <span className="text-jade font-semibold">VedaAI Assessment Creator</span> ·{' '}
            {new Date(assessment.generatedAt).toLocaleString('en-IN')}
          </p>
        </div>
      </div>
    </div>
  );
}

function QuestionCard({ question, index }: { question: Question; index: number }) {
  const [showAnswer, setShowAnswer] = useState(false);
  const diffCfg = DIFFICULTY_CONFIG[question.difficulty] || DIFFICULTY_CONFIG.medium;

  return (
    <div className="group bg-white/[0.02] border border-white/[0.07] rounded-xl p-5 hover:border-white/[0.12] transition-all duration-200">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-start gap-3 flex-1">
          {/* Question number */}
          <div className="w-7 h-7 rounded-lg bg-jade/10 border border-jade/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-jade text-xs font-bold font-mono">{index}</span>
          </div>

          {/* Question text */}
          <p className="text-ink-100 text-sm leading-relaxed flex-1">{question.text}</p>
        </div>

        {/* Meta */}
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <span className={diffCfg.classes}>
            <span className={clsx('w-1.5 h-1.5 rounded-full', diffCfg.dot)} />
            {diffCfg.label}
          </span>
          <span className="text-xs text-ink-400 font-mono whitespace-nowrap">
            [{question.marks} {question.marks === 1 ? 'mark' : 'marks'}]
          </span>
        </div>
      </div>

      {/* MCQ Options */}
      {question.type === 'mcq' && question.options && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 ml-10 mt-3">
          {question.options.map((opt, i) => (
            <div
              key={i}
              className="flex items-start gap-2.5 p-3 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12] transition-colors"
            >
              <span className="flex-shrink-0 w-5 h-5 rounded-full border border-white/20 flex items-center justify-center text-[10px] text-ink-400 font-mono font-bold">
                {String.fromCharCode(65 + i)}
              </span>
              <span className="text-ink-300 text-sm">{opt}</span>
            </div>
          ))}
        </div>
      )}

      {/* True/False */}
      {question.type === 'true_false' && (
        <div className="flex gap-3 ml-10 mt-3">
          {['True', 'False'].map((opt) => (
            <div
              key={opt}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06]"
            >
              <div className="w-4 h-4 rounded-full border-2 border-white/25" />
              <span className="text-ink-300 text-sm">{opt}</span>
            </div>
          ))}
        </div>
      )}

      {/* Short/Long answer lines */}
      {(question.type === 'short_answer' || question.type === 'fill_blanks') && (
        <div className="ml-10 mt-3 space-y-2">
          {[...Array(question.type === 'short_answer' ? 3 : 1)].map((_, i) => (
            <div
              key={i}
              className="h-px bg-gradient-to-r from-white/10 via-white/5 to-transparent"
            />
          ))}
        </div>
      )}

      {question.type === 'long_answer' && (
        <div className="ml-10 mt-3 space-y-2.5">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-px bg-gradient-to-r from-white/10 via-white/5 to-transparent"
            />
          ))}
        </div>
      )}

      {/* Answer toggle (teacher view) */}
      {question.answer && (
        <div className="ml-10 mt-3 pt-3 border-t border-white/[0.06]">
          <button
            onClick={() => setShowAnswer(!showAnswer)}
            className="text-xs text-ink-500 hover:text-jade transition-colors"
          >
            {showAnswer ? '▼ Hide Answer' : '▶ Show Answer Key'}
          </button>
          {showAnswer && (
            <div className="mt-2 p-3 bg-jade/5 border border-jade/20 rounded-lg">
              <p className="text-jade text-xs font-semibold mb-1">Answer:</p>
              <p className="text-ink-300 text-sm">{question.answer}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
