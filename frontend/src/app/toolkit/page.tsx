import { Sidebar } from '@/components/ui/Sidebar';
import { TopBar } from '@/components/ui/TopBar';
import { MobileTopBar } from '@/components/ui/MobileTopBar';
import { MobileBottomNav } from '@/components/ui/MobileBottomNav';
import { BookOpen, Sparkles } from 'lucide-react';

export default function ToolkitPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-bg-gradient-top to-bg-gradient-bottom relative">
      <Sidebar activePage="toolkit" />
      <MobileTopBar />

      <div className="lg:ml-[327px]">
        <div className="px-0 pt-3 lg:px-0">
          <TopBar />
        </div>

        <main className="px-4 lg:px-6 py-6 pb-44 lg:pb-8 flex items-center justify-center min-h-[calc(100vh-140px)]">
          <div className="flex flex-col items-center gap-6 max-w-md text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-[#4BC26D] to-[#3BA65A] rounded-3xl flex items-center justify-center shadow-lg transform rotate-3">
              <BookOpen size={48} className="text-white transform -rotate-3" strokeWidth={1.5} />
            </div>
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-bold tracking-[-0.04em] text-text-primary">
                AI Teacher's Toolkit
              </h1>
              <p className="text-lg text-text-secondary tracking-[-0.04em] leading-relaxed">
                Imagine having a superpowered teaching assistant available 24/7. 
                We are brewing next-generation AI tools to handle grading, lesson planning, and student analytics.
              </p>
            </div>
            <div className="flex items-center gap-2 mt-4 px-6 py-2 bg-[#e6f4ea] text-[#2c7a40] rounded-full font-medium tracking-[-0.04em]">
              <Sparkles size={16} />
              <span>Coming Very Soon</span>
            </div>
          </div>
        </main>
      </div>

      <div className="fixed bottom-0 left-0 right-0 lg:hidden z-40">
        <MobileBottomNav />
      </div>
    </div>
  );
}
