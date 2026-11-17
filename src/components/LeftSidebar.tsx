import React from 'react';
import { 
  Newspaper, 
  Bookmark, 
  TrendingUp, 
  Tag, 
  Info, 
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Compass
} from 'lucide-react';

interface LeftSidebarProps {
  categories: { name: string; count: number }[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  onOpenAboutModal: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  savedCount: number;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  onOpenAboutModal,
  isOpenMobile,
  onCloseMobile,
  savedCount
}) => {
  const content = (
    <div className="flex flex-col h-full justify-between py-5 px-4 space-y-6 overflow-y-auto">
      {/* Top Section: Feeds & Navigation */}
      <div className="space-y-6">
        <div>
          <div className="px-3 pb-2 text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
            Kanal Berita
          </div>
          <nav className="space-y-1">
            <button
              onClick={() => {
                onSelectCategory('Semua Berita');
                onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                selectedCategory === 'Semua Berita'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Newspaper className="w-4 h-4 text-amber-400" />
                <span>Semua Berita</span>
              </div>
              <ChevronRight className={`w-3.5 h-3.5 opacity-60 ${selectedCategory === 'Semua Berita' ? 'text-white' : 'text-slate-400'}`} />
            </button>

            <button
              onClick={() => {
                onSelectCategory('Tersimpan');
                onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                selectedCategory === 'Tersimpan'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Bookmark className="w-4 h-4 text-amber-400" />
                <span>Berita Tersimpan</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                {savedCount}
              </span>
            </button>
          </nav>
        </div>

        {/* Dynamic Categories from Blogger Labels */}
        <div>
          <div className="flex items-center justify-between px-3 pb-2 text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
            <span className="flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-blue-400" />
              <span>Kategori Label ({categories.length})</span>
            </span>
          </div>

          {categories.length === 0 ? (
            <div className="px-3 py-3 rounded-xl bg-slate-900/50 border border-slate-800/80 text-xs text-slate-400 space-y-1">
              <p className="text-slate-300 font-medium">Belum ada kategori</p>
              <p className="text-[11px] leading-relaxed">
                Kategori akan muncul otomatis dari label artikel Blogger saat terhubung.
              </p>
            </div>
          ) : (
            <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
              {categories.map((cat) => {
                const isSelected = selectedCategory.toLowerCase() === cat.name.toLowerCase();
                return (
                  <button
                    key={cat.name}
                    onClick={() => {
                      onSelectCategory(cat.name);
                      onCloseMobile();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-blue-950/90 text-blue-300 border border-blue-800/80 font-semibold'
                        : 'text-slate-300 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    <span className="truncate pr-2">{cat.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
                      {cat.count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Editorial Standards badge */}
        <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/70 text-xs space-y-1.5">
          <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Redaksi Digital</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Menyajikan berita aktual, terverifikasi, dan langsung tersinkronisasi dari Blogger JSON API v3.0.
          </p>
        </div>
      </div>

      {/* Bottom Section: Ecosystem links & About button */}
      <div className="pt-4 border-t border-slate-800/80 space-y-2">
        <button
          onClick={() => {
            onOpenAboutModal();
            onCloseMobile();
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
        >
          <Info className="w-4 h-4 text-blue-400" />
          <span>Tentang Redaksi & Aplikasi</span>
        </button>

        <a
          href="https://rmndninews.blogspot.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 transition-colors"
        >
          <div className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
            <span>Kunjungi Blog Sumber</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">rmndninews</span>
        </a>

        <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/60 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5 text-slate-300 font-medium mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Sumber Resmi Terbuka</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-normal">
            Data artikel dipublikasikan secara terbuka melalui Google Blogger API.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop fixed sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 border-r border-slate-800/80 bg-slate-950/60 backdrop-blur-sm min-h-[calc(100vh-4rem)]">
        <div className="sticky top-20 max-h-[calc(100vh-5rem)]">
          {content}
        </div>
      </aside>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-slate-950 border-r border-slate-800 shadow-2xl z-10 flex flex-col">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-white text-sm">Navigasi Berita</span>
              </div>
              <button
                onClick={onCloseMobile}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                ✕
              </button>
            </div>
            {content}
          </div>
        </div>
      )}
    </>
  );
};
