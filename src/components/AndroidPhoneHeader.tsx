import React from 'react';
import { Bell, Search, Sun, Moon, User } from 'lucide-react';

interface AndroidPhoneHeaderProps {
  onOpenSearch: () => void;
  onOpenNotifications: () => void;
  onToggleApiPanel: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  unreadNotifications?: boolean;
  unreadCount?: number;
}

export const AndroidPhoneHeader: React.FC<AndroidPhoneHeaderProps> = ({
  onOpenSearch,
  onOpenNotifications,
  onToggleApiPanel,
  theme,
  onToggleTheme,
  unreadNotifications = true,
  unreadCount = 0
}) => {
  return (
    <div className="w-full pt-3 pb-2 px-4 flex items-center justify-between select-none">
      {/* User / Publisher Avatar & Name */}
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-700 via-blue-600 to-amber-400 p-0.5 shadow-md">
          <div className="w-full h-full rounded-full bg-white dark:bg-slate-950 flex items-center justify-center text-slate-900 dark:text-white">
            <User className="w-4 h-4 text-blue-600 dark:text-amber-400" />
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-black text-slate-900 dark:text-white leading-tight tracking-tight">
            BREAK NEWS
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
            Portal Berita &amp; Mitigasi
          </span>
        </div>
      </div>

      {/* Right Action Icons: Theme Toggle + Bell + Search Pill */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle Button (Terang / Gelap) */}
        <button
          onClick={onToggleTheme}
          className="p-2 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-amber-500 transition-colors shadow-sm"
          title={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-700" />
          )}
        </button>

        {/* Notification Bell */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors shadow-sm"
          title="Pusat Notifikasi Berita"
          aria-label="Pusat Notifikasi"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 ? (
            <span className="absolute -top-1 -right-1 px-1.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-rose-500 text-white text-[9px] font-extrabold ring-2 ring-white dark:ring-slate-900 shadow-sm animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          ) : unreadNotifications ? (
            <span className="w-2 h-2 rounded-full bg-[#f05537] absolute top-1.5 right-1.5 ring-2 ring-white dark:ring-slate-900" />
          ) : null}
        </button>

        {/* Search Pill matching screenshot: 🔍 Search */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-semibold transition-colors shadow-sm"
        >
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <span>Search</span>
        </button>
      </div>
    </div>
  );
};
