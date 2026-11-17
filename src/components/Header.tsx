import React from 'react';
import { 
  Newspaper, 
  Search, 
  SlidersHorizontal, 
  X, 
  Menu,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Clock,
  Bookmark,
  TrendingUp,
  Globe,
  Sun,
  Moon,
  Bell
} from 'lucide-react';
import { ConnectionStatus } from '../types/blogger';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  connectionStatus: ConnectionStatus;
  onToggleConnectionPanel: () => void;
  onToggleMobileMenu: () => void;
  isConnectionPanelOpen: boolean;
  totalArticlesLoaded: number;
  lastUpdated: Date | null;
  onRefresh: () => void;
  isRefreshing: boolean;
  savedCount: number;
  onOpenSaved: () => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  topCategories: string[];
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onOpenNotifications: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  connectionStatus,
  onToggleConnectionPanel,
  onToggleMobileMenu,
  isConnectionPanelOpen,
  totalArticlesLoaded,
  lastUpdated,
  onRefresh,
  isRefreshing,
  savedCount,
  onOpenSaved,
  selectedCategory,
  onSelectCategory,
  topCategories,
  theme,
  onToggleTheme,
  onOpenNotifications
}) => {
  const currentDate = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md transition-colors">
      {/* Editorial Top Bar */}
      <div className="hidden md:flex items-center justify-between px-6 py-1.5 text-xs border-b border-slate-200 dark:border-slate-800/60 bg-slate-50 dark:bg-slate-900/60 font-mono text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-[#f05537] font-bold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>EDISI DIGITAL</span>
          </span>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <span className="text-slate-700 dark:text-slate-300 font-sans">{currentDate}</span>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <a 
            href="https://rmndninews.blogspot.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1 font-sans"
          >
            <Globe className="w-3 h-3 text-slate-400" />
            rmndninews.blogspot.com
          </a>
        </div>

        <div className="flex items-center gap-4">
          {/* Theme Switcher Button */}
          <button
            onClick={onToggleTheme}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-slate-200/60 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-amber-500 transition-colors font-sans text-xs"
            title={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>Terang</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-slate-600" />
                <span>Gelap</span>
              </>
            )}
          </button>

          <span className="text-slate-300 dark:text-slate-700">|</span>

          {/* Saved Articles Shortcut */}
          <button
            onClick={onOpenSaved}
            className={`flex items-center gap-1.5 text-xs transition-colors ${
              selectedCategory === 'Tersimpan' 
                ? 'text-[#f05537] font-semibold' 
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Tersimpan ({savedCount})</span>
          </button>

          <span className="text-slate-300 dark:text-slate-700">|</span>

          {/* Push Notification Shortcut in Top Bar */}
          <button
            onClick={onOpenNotifications}
            className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 hover:text-[#f05537] dark:hover:text-amber-400 transition-colors"
            title="Push Notifikasi Bencana (OneSignal)"
          >
            <Bell className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
            <span>Notifikasi</span>
          </button>

          <span className="text-slate-300 dark:text-slate-700">|</span>

          {lastUpdated && (
            <span className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
              <Clock className="w-3 h-3 text-slate-400" />
              {lastUpdated.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}

          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-slate-200 transition-colors disabled:opacity-50"
            title="Segarkan berita dari Blogger"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-amber-500' : ''}`} />
            <span>Segarkan</span>
          </button>
        </div>
      </div>

      {/* Main navigation row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 -ml-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Buka navigasi menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <a 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              onSelectCategory('Semua Berita');
            }}
            className="flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 via-blue-600 to-amber-400 p-0.5 shadow-md shadow-rose-500/20">
              <div className="w-full h-full bg-white dark:bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Newspaper className="w-5 h-5 text-rose-600 dark:text-amber-400 group-hover:scale-110 transition-transform duration-200" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-black tracking-tight text-slate-900 dark:text-white text-lg leading-tight flex items-center gap-1.5">
                BREAK <span className="text-[#f05537] dark:text-amber-400">NEWS</span>
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 ml-0.5 font-bold">
                  LIVE
                </span>
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 tracking-wider uppercase font-semibold">
                Portal Berita Terkini &amp; Bencana
              </span>
            </div>
          </a>
        </div>

        {/* Middle: Search Box */}
        <div className="flex-1 max-w-md mx-2 sm:mx-6">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Cari berita berdasarkan judul atau isi..."
              className="w-full bg-slate-100 dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 pl-9 pr-9 py-2.5 rounded-full border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-[#f05537] focus:ring-1 focus:ring-[#f05537] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                aria-label="Bersihkan pencarian"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Right: Status & API Connection Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Connection status badge */}
          <div className="hidden sm:flex items-center text-xs font-mono">
            {connectionStatus === 'connected' ? (
              <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 px-2.5 py-1 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Terhubung ({totalArticlesLoaded})</span>
              </div>
            ) : connectionStatus === 'connecting' ? (
              <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 px-2.5 py-1 rounded-full animate-pulse">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Sinkronisasi...</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2.5 py-1 rounded-full">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                <span>Blogger API</span>
              </div>
            )}
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            className="p-2.5 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-amber-500 transition-colors shadow-sm"
            title={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          {/* Push Notification Bell Button (OneSignal) */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2.5 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-[#f05537] dark:hover:text-amber-400 transition-colors shadow-sm"
            title="Push Notifikasi Kebencanaan (OneSignal)"
            aria-label="Push Notifikasi"
          >
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-2 right-2 ring-2 ring-white dark:ring-slate-900 animate-ping" />
            <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-2 right-2 ring-2 ring-white dark:ring-slate-900" />
          </button>

          {/* Toggle Connection Panel Button */}
          <button
            onClick={onToggleConnectionPanel}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-full border transition-all ${
              isConnectionPanelOpen
                ? 'bg-[#f05537] text-white border-[#f05537] shadow-md shadow-orange-500/30'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
            title="Pengaturan Blogger API v3"
          >
            <SlidersHorizontal className="w-4 h-4 text-amber-500" />
            <span className="hidden md:inline">Blogger API</span>
          </button>
        </div>
      </div>

      {/* Horizontal Category Nav Bar for Desktop */}
      {topCategories.length > 0 && (
        <div className="hidden md:flex items-center gap-1 px-6 py-2 border-t border-slate-100 dark:border-slate-800/60 overflow-x-auto max-w-7xl mx-auto text-xs">
          <button
            onClick={() => onSelectCategory('Semua Berita')}
            className={`px-3 py-1.5 rounded-full font-bold transition-all shrink-0 ${
              selectedCategory === 'Semua Berita'
                ? 'bg-[#f05537] text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
          >
            All
          </button>
          {topCategories.slice(0, 9).map((cat) => (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full font-semibold transition-all shrink-0 ${
                selectedCategory.toLowerCase() === cat.toLowerCase()
                  ? 'bg-[#f05537] text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}
    </header>
  );
};
