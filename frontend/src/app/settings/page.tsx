import { Sidebar } from '@/components/ui/Sidebar';
import { TopBar } from '@/components/ui/TopBar';
import { MobileTopBar } from '@/components/ui/MobileTopBar';
import { MobileBottomNav } from '@/components/ui/MobileBottomNav';
import { Settings as SettingsIcon, Wrench } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-bg-gradient-top to-bg-gradient-bottom relative">
      <Sidebar activePage="settings" />
      <MobileTopBar />

      <div className="lg:ml-[327px]">
        <div className="px-0 pt-3 lg:px-0">
          <TopBar />
        </div>

        <main className="px-4 lg:px-6 py-6 pb-44 lg:pb-8 flex items-center justify-center min-h-[calc(100vh-140px)]">
          <div className="flex flex-col items-center gap-6 max-w-md text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-700 to-gray-900 rounded-3xl flex items-center justify-center shadow-lg relative">
              <SettingsIcon size={48} className="text-white animate-spin-slow" strokeWidth={1.5} />
              <div className="absolute -bottom-2 -right-2 bg-btn-orange p-2 rounded-full border-4 border-[#FDFDFD]">
                <Wrench size={20} className="text-white" />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-bold tracking-[-0.04em] text-text-primary">
                Settings
              </h1>
              <p className="text-lg text-text-secondary tracking-[-0.04em] leading-relaxed">
                We're fine-tuning the controls. Account preferences, school profiles, and custom AI templates are currently being wired up in our workshop!
              </p>
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
