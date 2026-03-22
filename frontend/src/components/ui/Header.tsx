'use client';

import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export function Header() {
  return (
    <header className="relative z-20 border-b border-white/[0.06] bg-ink-900/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-jade to-jade-700 flex items-center justify-center shadow-lg shadow-jade/25 group-hover:shadow-jade/40 transition-shadow">
              <Sparkles size={14} className="text-ink-900" />
            </div>
            <div>
              <span className="font-display font-bold text-ink-50 text-lg leading-none">
                Veda<span className="text-jade">AI</span>
              </span>
              <div className="text-[10px] text-ink-400 font-body leading-none mt-0.5 tracking-wide uppercase">
                Assessment Creator
              </div>
            </div>
          </Link>

          {/* Nav */}
          <nav className="flex items-center gap-1">
            <Link
              href="/"
              className="btn-ghost text-sm py-1.5 px-3"
            >
              Create
            </Link>
            <div className="w-px h-4 bg-white/10 mx-1" />
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost text-sm py-1.5 px-3 text-ink-400"
            >
              GitHub
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}
