'use client';

import { QuestionType, QUESTION_TYPE_LABELS, QuestionTypeName } from '@/types';
import { Trash2 } from 'lucide-react';
import clsx from 'clsx';

interface QuestionTypeRowProps {
  index: number;
  questionType: QuestionType;
  onUpdate: (updates: Partial<QuestionType>) => void;
  onRemove: () => void;
}

const TYPE_COLORS: Record<QuestionTypeName, string> = {
  mcq: 'jade',
  short_answer: 'amber',
  long_answer: 'coral',
  true_false: 'amber',
  fill_blanks: 'jade',
};

export function QuestionTypeRow({ index, questionType, onUpdate, onRemove }: QuestionTypeRowProps) {
  const color = TYPE_COLORS[questionType.type];
  const subtotal = questionType.count * questionType.marks;

  return (
    <div className={clsx(
      'flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 rounded-xl border transition-all',
      'bg-white/[0.03] border-white/[0.07] hover:border-white/[0.12]'
    )}>
      {/* Type indicator */}
      <div className={clsx(
        'w-2 h-2 rounded-full flex-shrink-0 mt-1 sm:mt-0',
        color === 'jade' ? 'bg-jade' : color === 'amber' ? 'bg-amber' : 'bg-coral-500'
      )} />

      {/* Type selector */}
      <select
        className="input-field flex-1 min-w-0 py-2"
        value={questionType.type}
        onChange={(e) => onUpdate({ type: e.target.value as QuestionTypeName })}
      >
        {(Object.entries(QUESTION_TYPE_LABELS) as [QuestionTypeName, string][]).map(
          ([val, label]) => (
            <option key={val} value={val}>{label}</option>
          )
        )}
      </select>

      {/* Count */}
      <div className="flex items-center gap-2">
        <label className="text-xs text-ink-400 whitespace-nowrap">Questions</label>
        <input
          type="number"
          className="input-field w-20 py-2 text-center"
          min={1}
          max={50}
          value={questionType.count}
          onChange={(e) => {
            const v = parseInt(e.target.value) || 1;
            onUpdate({ count: Math.max(1, v) });
          }}
        />
      </div>

      {/* Marks */}
      <div className="flex items-center gap-2">
        <label className="text-xs text-ink-400 whitespace-nowrap">Marks ea.</label>
        <input
          type="number"
          className="input-field w-20 py-2 text-center"
          min={1}
          max={100}
          step={0.5}
          value={questionType.marks}
          onChange={(e) => {
            const v = parseFloat(e.target.value) || 1;
            onUpdate({ marks: Math.max(0.5, v) });
          }}
        />
      </div>

      {/* Subtotal */}
      <div className="text-right min-w-[60px]">
        <span className="text-xs text-ink-400">Total</span>
        <div className={clsx(
          'text-sm font-semibold',
          color === 'jade' ? 'text-jade' : color === 'amber' ? 'text-amber' : 'text-coral-500'
        )}>
          {subtotal}
        </div>
      </div>

      {/* Remove */}
      <button
        type="button"
        onClick={onRemove}
        className="p-2 rounded-lg hover:bg-coral-500/15 text-ink-500 hover:text-coral-500 transition-colors flex-shrink-0"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
