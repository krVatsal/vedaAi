'use client';

import { ArrowLeft, Bell, ChevronDown, LayoutGrid } from 'lucide-react';

export function TopBar() {
  return (
    <header className="hidden lg:flex items-center px-3 gap-2.5 h-14 bg-white/75 backdrop-blur-sm rounded-2xl">
      {/* Back Arrow */}
      <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-bg-offwhite transition-colors">
        <ArrowLeft size={24} className="text-text-primary" strokeWidth={2} />
      </button>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 flex-1">
        <LayoutGrid size={20} className="text-bg-disabled" strokeWidth={2} />
        <span className="text-base font-semibold tracking-[-0.04em] text-bg-disabled">
          Assignment
        </span>
      </div>

      {/* Notification Bell */}
      <button className="relative w-9 h-9 bg-bg-offwhite rounded-full flex items-center justify-center hover:bg-[#e8e8e8] transition-colors">
        <Bell size={24} className="text-text-primary" strokeWidth={2} />
        <span className="absolute top-[1px] right-[1px] w-2 h-2 bg-btn-orange rounded-full" />
      </button>

      {/* User Profile */}
      <button className="flex items-center gap-2 py-1.5 px-3 rounded-xl shadow-realistic hover:bg-bg-offwhite/50 transition-colors">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#f0e6d3] to-[#d4c4a8] flex items-center justify-center overflow-hidden">
          <span className="text-xs font-bold text-text-dark">JD</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-base font-semibold tracking-[-0.04em] text-text-primary">
            John Doe
          </span>
          <ChevronDown size={24} className="text-text-primary" strokeWidth={1.5} />
        </div>
      </button>
    </header>
  );
}
