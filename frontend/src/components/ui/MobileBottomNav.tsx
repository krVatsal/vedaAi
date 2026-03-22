'use client';

import { useRouter } from 'next/navigation';
import { LayoutGrid, FileText, FolderOpen, Sparkles, Plus } from 'lucide-react';

const tabs = [
  { label: 'Home', icon: LayoutGrid, active: false },
  { label: 'Assignments', icon: FileText, active: true },
  { label: 'Library', icon: FolderOpen, active: false },
  { label: 'AI Toolkit', icon: Sparkles, active: false },
];

export function MobileBottomNav() {
  const router = useRouter();

  return (
    <div className="fixed bottom-0 left-0 right-0 lg:hidden z-40">
      {/* Blur overlay area */}
      <div className="backdrop-blur-sm">
        {/* FAB */}
        <div className="flex justify-end px-2.5 pb-3">
          <button
            onClick={() => router.push('/create')}
            className="w-12 h-12 bg-white rounded-full shadow-realistic flex items-center justify-center hover:bg-bg-offwhite transition-colors"
          >
            <Plus size={20} className="text-btn-orange" strokeWidth={2.5} />
          </button>
        </div>

        {/* Bottom Nav Bar */}
        <div className="mx-2.5 mb-3 bg-btn-primary rounded-3xl shadow-realistic px-6 py-2 flex items-center justify-between">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.label}
                className="flex flex-col items-center justify-center gap-1 py-3 px-2 min-w-[52px]"
              >
                <Icon
                  size={20}
                  className={tab.active ? 'text-white' : 'text-white/25'}
                  strokeWidth={tab.active ? 2 : 1.5}
                  fill={tab.active ? 'currentColor' : 'none'}
                />
                <span
                  className={`text-xs font-semibold tracking-[-0.04em] leading-[140%] ${
                    tab.active ? 'text-white' : 'text-white/25'
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
