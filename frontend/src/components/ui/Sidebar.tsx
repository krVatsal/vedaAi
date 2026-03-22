'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Home,
  Users,
  FileText,
  BookOpen,
  FolderOpen,
  Settings,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  assignmentCount?: number;
  activePage?: string; // 'home' | 'assignments' | etc.
  buttonLabel?: string; // Override button text
}

interface NavItem {
  label: string;
  icon: typeof Home;
  href: string;
  key: string;
  badge: number;
}

const getNavItems = (assignmentCount: number): NavItem[] => [
  { label: 'Home', icon: Home, href: '/', key: 'home', badge: 0 },
  { label: 'My Groups', icon: Users, href: '/groups', key: 'groups', badge: 0 },
  { label: 'Assignments', icon: FileText, href: '/', key: 'assignments', badge: assignmentCount },
  { label: "AI Teacher's Toolkit", icon: BookOpen, href: '/toolkit', key: 'toolkit', badge: 0 },
  { label: 'My Library', icon: FolderOpen, href: '/library', key: 'library', badge: 0 },
];

export function Sidebar({
  assignmentCount = 0,
  activePage = 'assignments',
  buttonLabel = 'Create Assignment',
}: SidebarProps) {
  const router = useRouter();
  const navItems = getNavItems(assignmentCount);

  return (
    <aside className="hidden lg:flex flex-col justify-between w-[304px] h-[calc(100vh-24px)] bg-white rounded-2xl shadow-sidebar p-6 fixed left-3 top-3 z-30">
      {/* Top section */}
      <div className="flex flex-col gap-14">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-[15px] bg-gradient-to-b from-[#E56820] to-[#D45E3E] flex items-center justify-center relative overflow-hidden shadow-md">
            <svg width="28" height="20" viewBox="0 0 28 20" fill="none">
              <path d="M4.2 5.5L12.6 5.5L12.6 15.3L4.2 15.3L4.2 5.5Z" fill="white" />
              <path d="M15.4 5.5L23.8 5.5L23.8 15.3L15.4 15.3L15.4 5.5Z" fill="white" />
            </svg>
          </div>
          <span className="text-[28px] font-bold leading-5 tracking-[-0.06em] text-text-primary">
            VedaAI
          </span>
        </div>

        {/* CTA Button */}
        <button
          onClick={() => router.push('/create')}
          className="w-full h-[42px] bg-btn-dark rounded-full flex items-center justify-center gap-2.5 shadow-btn-glow hover:bg-[#1a1a1a] transition-colors"
        >
          <Sparkles size={18} className="text-white" />
          <span className="text-white font-inter font-medium text-base tracking-[-0.04em]">
            {buttonLabel}
          </span>
        </button>

        {/* Nav Menu */}
        <nav className="flex flex-col gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.key === activePage;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-bg-offwhite text-text-primary font-medium'
                    : 'text-text-secondary hover:bg-bg-offwhite/50'
                }`}
              >
                <Icon
                  size={20}
                  className={isActive ? 'text-text-primary' : 'text-text-secondary'}
                  strokeWidth={isActive ? 2 : 1.5}
                />
                <span className="text-base tracking-[-0.04em] leading-[140%] flex-1">
                  {item.label}
                </span>
                {item.badge > 0 && (
                  <span className="bg-btn-orange text-white text-xs font-semibold px-2.5 py-0.5 rounded-full min-w-[24px] text-center">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom section */}
      <div className="flex flex-col gap-2">
        {/* Settings */}
        <Link
          href="/settings"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-text-secondary hover:bg-bg-offwhite/50 transition-colors"
        >
          <Settings size={20} className="text-text-secondary" strokeWidth={1.5} />
          <span className="text-base tracking-[-0.04em] leading-[140%]">Settings</span>
        </Link>

        {/* School Card */}
        <div className="bg-bg-offwhite rounded-2xl p-3">
          <div className="flex items-center gap-2">
            <div className="w-[59px] h-[56px] rounded-full bg-bg-offwhite-50 flex-shrink-0 overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-[#f0e6d3] to-[#d4c4a8] flex items-center justify-center text-text-dark text-xs font-bold">
                DPS
              </div>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-base font-bold tracking-[-0.04em] text-text-primary truncate leading-[140%]">
                Delhi Public School
              </span>
              <span className="text-sm tracking-[-0.04em] text-text-dark leading-[140%]">
                Bokaro Steel City
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
