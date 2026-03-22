'use client';

import { Bell, Menu } from 'lucide-react';

export function MobileTopBar() {
  return (
    <header className="flex lg:hidden items-center justify-between px-3 py-3">
      <div className="flex items-center gap-2 bg-white rounded-2xl px-4 py-3 w-full shadow-sm">
        {/* Logo */}
        <div className="flex items-center gap-2 flex-1">
          <div className="w-7 h-7 rounded-lg bg-[#303030] flex items-center justify-center overflow-hidden">
            <svg width="18" height="14" viewBox="0 0 28 20" fill="none">
              <path d="M4.2 5.5L12.6 5.5L12.6 15.3L4.2 15.3L4.2 5.5Z" fill="white" />
              <path d="M15.4 5.5L23.8 5.5L23.8 15.3L15.4 15.3L15.4 5.5Z" fill="white" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-[-0.06em] text-text-primary leading-[140%]">
            VedaAI
          </span>
        </div>

        {/* Right icons */}
        <div className="flex items-center gap-3">
          {/* Bell */}
          <button className="relative w-9 h-9 bg-bg-offwhite rounded-full flex items-center justify-center">
            <Bell size={24} className="text-text-primary" strokeWidth={2} />
            <span className="absolute top-[1px] right-[1px] w-2 h-2 bg-btn-orange rounded-full" />
          </button>

          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#f0e6d3] to-[#d4c4a8] flex items-center justify-center overflow-hidden">
            <span className="text-xs font-bold text-text-dark">JD</span>
          </div>

          {/* Menu */}
          <button className="w-6 h-6 flex items-center justify-center">
            <Menu size={24} className="text-[#1D1B20]" strokeWidth={2} />
          </button>
        </div>
      </div>
    </header>
  );
}
