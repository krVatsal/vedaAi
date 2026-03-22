'use client';

import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';

function Illustration({ className = '' }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Background circle */}
        <circle cx="150" cy="149" r="120" fill="url(#bgGrad)" />
        
        {/* Doodle - left question mark shape */}
        <path d="M40 90 C40 70, 60 55, 75 55 C90 55, 100 65, 100 80 C100 95, 85 100, 75 110 L75 125" 
              stroke="#011625" strokeWidth="4" strokeLinecap="round" fill="none" />
        <circle cx="75" cy="135" r="3" fill="#011625" />
        
        {/* Doodle - right dot */}
        <circle cx="275" cy="184" r="6" fill="#417BA4" />
        
        {/* Doodle - bottom left triangle */}
        <path d="M55 240 L65 225 L75 240 Z" fill="none" stroke="#417BA4" strokeWidth="3" strokeLinejoin="round" />

        {/* Cloud */}
        <g transform="translate(220, 45)">
          <ellipse cx="35" cy="28" rx="35" ry="14" fill="white" filter="url(#cloudShadow)" />
          <ellipse cx="25" cy="20" rx="18" ry="18" fill="white" />
          <ellipse cx="45" cy="22" rx="14" ry="14" fill="white" />
          {/* Cloud details */}
          <circle cx="55" cy="36" r="6" fill="#CCC6D9" />
          <rect x="64" y="31" width="16" height="6" rx="3" fill="#D5D5D5" />
        </g>

        {/* Page/Document */}
        <rect x="88" y="62" width="125" height="155" rx="16" fill="white" filter="url(#pageShadow)" />
        
        {/* Document lines */}
        <g transform="translate(112, 86)">
          <rect width="50" height="10" rx="5" fill="#011625" />
          <rect y="22" width="76" height="10" rx="5" fill="#D5D5D5" />
          <rect y="44" width="76" height="10" rx="5" fill="#D5D5D5" />
          <rect y="66" width="76" height="10" rx="5" fill="#D5D5D5" />
          <rect y="88" width="76" height="10" rx="5" fill="#D5D5D5" />
        </g>

        {/* Magnifying glass outer ring */}
        <circle cx="185" cy="163" r="62.5" fill="#E1DCEB" />
        <circle cx="185" cy="163" r="53" fill="url(#lensGrad)" />
        
        {/* Glass fill with frosted effect */}
        <circle cx="185" cy="163" r="54" fill="rgba(255,255,255,0.3)" />
        
        {/* Red X circle */}
        <circle cx="185" cy="163" r="25" fill="#FF4040" />
        
        {/* X mark */}
        <path d="M176 154 L194 172 M194 154 L176 172" stroke="white" strokeWidth="4" strokeLinecap="round" />

        {/* Magnifying glass handle */}
        <rect x="228" y="202" width="16" height="48" rx="8" fill="#E1DCEB" transform="rotate(-50 236 226)" />

        {/* Green semi-circle accent on lens */}
        <path d="M132 195 A62.5 62.5 0 0 1 185 100.5" stroke="#17CB9E" strokeWidth="10" fill="none" strokeLinecap="round" opacity="0.6" />

        <defs>
          <linearGradient id="bgGrad" x1="150" y1="0" x2="150" y2="300" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F2F2F2" />
            <stop offset="1" stopColor="#EFEFEF" />
          </linearGradient>
          <linearGradient id="lensGrad" x1="160" y1="120" x2="210" y2="220" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFFFFF" />
            <stop offset="1" stopColor="#FFADAD" />
          </linearGradient>
          <filter id="pageShadow" x="70" y="50" width="165" height="195" filterUnits="userSpaceOnUse">
            <feDropShadow dx="0" dy="20" stdDeviation="15" floodColor="#929292" floodOpacity="0.19" />
          </filter>
          <filter id="cloudShadow" x="-10" y="-10" width="120" height="70" filterUnits="userSpaceOnUse">
            <feDropShadow dx="6" dy="4" stdDeviation="6.5" floodColor="#1B778B" floodOpacity="0.09" />
          </filter>
        </defs>
      </svg>
    </div>
  );
}

export function EmptyState() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center gap-8 w-full max-w-[486px] mx-auto animate-fade-up">
      {/* Illustration */}
      <Illustration className="w-[300px] h-[300px] lg:w-[300px] lg:h-[300px] md:w-[220px] md:h-[220px]" />

      {/* Text content */}
      <div className="flex flex-col items-center gap-0.5 w-full">
        <h2 className="text-xl font-bold tracking-[-0.04em] leading-[140%] text-text-primary text-center">
          No assignments yet
        </h2>
        <p className="text-base font-normal tracking-[-0.04em] leading-[140%] text-text-secondary text-center max-w-[486px]">
          Create your first assignment to start collecting and grading student
          submissions. You can set up rubrics, define marking criteria, and let AI
          assist with grading.
        </p>
      </div>

      {/* CTA Button */}
      <button
        onClick={() => router.push('/create')}
        className="flex items-center gap-1 bg-btn-primary text-white rounded-full px-6 py-3 hover:bg-[#2a2a2a] transition-colors group"
      >
        <Plus size={20} className="text-white" strokeWidth={2} />
        <span className="text-base font-medium tracking-[-0.04em] leading-[140%] text-center">
          Create Your First Assignment
        </span>
      </button>
    </div>
  );
}
