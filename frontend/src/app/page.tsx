'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/ui/Sidebar';
import { TopBar } from '@/components/ui/TopBar';
import { MobileTopBar } from '@/components/ui/MobileTopBar';
import { MobileBottomNav } from '@/components/ui/MobileBottomNav';
import { EmptyState } from '@/components/ui/EmptyState';
import { AssignmentsList } from '@/components/ui/AssignmentsList';
import { getAssignments, deleteAssignment, type Assignment } from '@/lib/api';

export default function HomePage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAssignments = async () => {
    try {
      const data = await getAssignments();
      setAssignments(data);
    } catch (err) {
      console.error('Failed to fetch assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteAssignment(id);
      setAssignments((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      console.error('Failed to delete assignment:', err);
    }
  };

  const hasAssignments = assignments.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-bg-gradient-top to-bg-gradient-bottom relative">
      {/* Desktop Sidebar */}
      <Sidebar assignmentCount={assignments.length} />

      {/* Mobile Top Bar */}
      <MobileTopBar />

      {/* Main Content Area */}
      <div className="lg:ml-[327px]">
        {/* Desktop Top Bar */}
        <div className="px-0 pt-3 lg:px-0">
          <TopBar />
        </div>

        {/* Content */}
        {loading ? (
          <main className="flex items-center justify-center min-h-[calc(100vh-120px)] lg:min-h-[calc(100vh-80px)] px-4 pb-40 lg:pb-8">
            <div className="flex flex-col items-center gap-4 animate-pulse">
              <div className="w-16 h-16 border-4 border-bg-offwhite-50 border-t-btn-primary rounded-full animate-spin" />
              <p className="text-text-secondary text-base tracking-[-0.04em]">Loading assignments...</p>
            </div>
          </main>
        ) : hasAssignments ? (
          <main className="px-4 lg:px-6 py-6 pb-40 lg:pb-8">
            <AssignmentsList assignments={assignments} onDelete={handleDelete} />
          </main>
        ) : (
          <main className="flex items-center justify-center min-h-[calc(100vh-120px)] lg:min-h-[calc(100vh-80px)] px-4 pb-40 lg:pb-8">
            <EmptyState />
          </main>
        )}
      </div>

      {/* Mobile Bottom Nav */}
      <MobileBottomNav />
    </div>
  );
}
