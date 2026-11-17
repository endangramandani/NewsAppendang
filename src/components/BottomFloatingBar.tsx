import React from 'react';
import { Home, Compass, Bookmark, SlidersHorizontal } from 'lucide-react';

interface BottomFloatingBarProps {
  currentTab: 'home' | 'explore' | 'saved' | 'api';
  onSelectTab: (tab: 'home' | 'explore' | 'saved' | 'api') => void;
  savedCount: number;
}

export const BottomFloatingBar: React.FC<BottomFloatingBarProps> = ({
  currentTab,
  onSelectTab,
  savedCount
}) => {
  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 pointer-events-auto select-none">
      <nav className="flex items-center gap-2 p-1.5 rounded-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800/90 shadow-2xl shadow-slate-400/30 dark:shadow-black/80 transition-colors">
        {/* Beranda Icon Only */}
        <button
          onClick={() => onSelectTab('home')}
          className={`p-2.5 rounded-full transition-all duration-200 relative ${
            currentTab === 'home'
              ? 'bg-slate-900 text-amber-400 dark:bg-amber-400 dark:text-slate-950 shadow-md scale-105'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title="Beranda Utama"
          aria-label="Beranda Utama"
        >
          <Home className="w-5 h-5" />
        </button>

        {/* Wisata & Kuliner Icon Only */}
        <button
          onClick={() => onSelectTab('explore')}
          className={`p-2.5 rounded-full transition-all duration-200 relative ${
            currentTab === 'explore'
              ? 'bg-slate-900 text-sky-400 dark:bg-sky-400 dark:text-slate-950 shadow-md scale-105'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title="Rekomendasi Wisata & Kuliner"
          aria-label="Rekomendasi Wisata & Kuliner"
        >
          <Compass className="w-5 h-5" />
        </button>

        {/* Tersimpan Icon Only */}
        <button
          onClick={() => onSelectTab('saved')}
          className={`p-2.5 rounded-full transition-all duration-200 relative ${
            currentTab === 'saved'
              ? 'bg-slate-900 text-rose-400 dark:bg-rose-500 dark:text-white shadow-md scale-105'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title="Berita Tersimpan"
          aria-label="Berita Tersimpan"
        >
          <Bookmark className="w-5 h-5" />
          {savedCount > 0 && (
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 dark:bg-amber-400 absolute top-1 right-1 border-2 border-white dark:border-slate-900 animate-pulse" />
          )}
        </button>

        {/* Blogger API Icon Only */}
        <button
          onClick={() => onSelectTab('api')}
          className={`p-2.5 rounded-full transition-all duration-200 relative ${
            currentTab === 'api'
              ? 'bg-blue-600 text-white shadow-md scale-105'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title="Pengaturan Blogger API"
          aria-label="Pengaturan Blogger API"
        >
          <SlidersHorizontal className="w-5 h-5" />
        </button>
      </nav>
    </div>
  );
};
