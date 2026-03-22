'use client';

import { useState, useRef, useEffect } from 'react';
import { MoreVertical, Eye, Trash2 } from 'lucide-react';

interface AssignmentCardProps {
  title: string;
  assignedOn: string;
  dueDate?: string;
  status?: 'pending' | 'processing' | 'completed' | 'failed';
  onView?: () => void;
  onDelete?: () => void;
}

export function AssignmentCard({
  title,
  assignedOn,
  dueDate,
  status,
  onView,
  onDelete,
}: AssignmentCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="bg-white rounded-2xl p-5 flex flex-col gap-3 relative hover:shadow-md transition-shadow">
      {/* Top row */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold tracking-[-0.04em] text-text-primary leading-[140%]">
            {title}
          </h3>
          {status && status !== 'completed' && (
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              status === 'processing' ? 'bg-amber-100 text-amber-700' :
              status === 'pending' ? 'bg-blue-100 text-blue-700' :
              'bg-red-100 text-red-600'
            }`}>
              {status === 'processing' ? 'Generating...' : status}
            </span>
          )}
        </div>
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-bg-offwhite transition-colors"
          >
            <MoreVertical size={18} className="text-text-secondary" />
          </button>

          {/* Dropdown Menu */}
          {menuOpen && (
            <div className="absolute right-0 top-9 bg-white rounded-xl shadow-realistic border border-[#f0f0f0] py-1.5 z-20 min-w-[160px] animate-fade-in">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onView?.();
                }}
                className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-text-primary hover:bg-bg-offwhite transition-colors"
              >
                <Eye size={16} className="text-text-secondary" />
                View Assignment
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onDelete?.();
                }}
                className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-accent-red hover:bg-red-50 transition-colors"
              >
                <Trash2 size={16} className="text-accent-red" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom row - dates */}
      <div className="flex items-center justify-between text-sm tracking-[-0.04em]">
        <span className="text-text-secondary">
          <span className="font-medium text-btn-orange">Assigned on</span> : {assignedOn}
        </span>
        {dueDate && (
          <span className="text-text-secondary">
            <span className="font-medium text-btn-orange">Due</span> : {dueDate}
          </span>
        )}
      </div>
    </div>
  );
}
