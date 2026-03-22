'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, SlidersHorizontal, Plus } from 'lucide-react';
import { AssignmentCard } from '@/components/ui/AssignmentCard';
import type { Assignment } from '@/lib/api';

interface AssignmentsListProps {
  assignments: Assignment[];
  onDelete: (id: string) => void;
}

export function AssignmentsList({ assignments, onDelete }: AssignmentsListProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAssignments = assignments.filter((a) =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="flex flex-col gap-5 w-full animate-fade-up">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-accent-green" />
          <h1 className="text-2xl lg:text-[28px] font-bold tracking-[-0.04em] text-text-primary leading-[140%]">
            Assignments
          </h1>
        </div>
        <p className="text-sm tracking-[-0.04em] text-text-secondary leading-[140%] ml-[18px]">
          Manage and create assignments for your classes.
        </p>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 justify-between">
        {/* Filter Button */}
        <button className="flex items-center gap-2 px-4 py-2.5 border border-[#e0e0e0] rounded-xl bg-white hover:bg-bg-offwhite transition-colors text-sm text-text-secondary">
          <SlidersHorizontal size={16} className="text-text-secondary" />
          Filter By
        </button>

        {/* Search */}
        <div className="relative w-full sm:w-[280px]">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-bg-disabled" />
          <input
            type="text"
            placeholder="Search Assignment"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-[#e0e0e0] rounded-xl bg-white text-sm text-text-primary placeholder:text-bg-disabled focus:outline-none focus:border-[#c0c0c0] transition-colors"
          />
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredAssignments.map((assignment) => (
          <AssignmentCard
            key={assignment._id}
            title={assignment.title}
            assignedOn={formatDate(assignment.createdAt)}
            dueDate={assignment.dueDate ? formatDate(assignment.dueDate) : undefined}
            status={assignment.status}
            onView={() => {
              if (assignment.status === 'completed') {
                router.push(`/result/${assignment._id}`);
              }
            }}
            onDelete={() => onDelete(assignment._id)}
          />
        ))}
      </div>

      {/* Floating Create Button - desktop only */}
      <div className="hidden lg:flex justify-center sticky bottom-6 z-20">
        <button
          onClick={() => router.push('/create')}
          className="flex items-center gap-1.5 bg-btn-primary text-white rounded-full px-6 py-3 shadow-realistic hover:bg-[#2a2a2a] transition-colors"
        >
          <Plus size={20} className="text-white" strokeWidth={2} />
          <span className="text-base font-medium tracking-[-0.04em]">
            Create Assignment
          </span>
        </button>
      </div>
    </div>
  );
}
