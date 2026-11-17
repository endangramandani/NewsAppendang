import React, { useState, useMemo } from 'react';
import { BloggerPost, APIErrorDetail } from '../types/blogger';
import { LatestFourNews } from './LatestFourNews';
import { FilterPills } from './FilterPills';
import { TrendingCard } from './TrendingCard';
import { TravelAndCulinaryWidget } from './TravelAndCulinaryWidget';
import { PushNotificationToast } from './PushNotificationToast';
import { TopWeatherBanner } from './TopWeatherBanner';
import { FinancialAndDisasterWidget } from './FinancialAndDisasterWidget';
import { 
  AlertCircle, 
  RefreshCw, 
  ChevronDown, 
  ChevronUp,
  Bookmark, 
  PhoneCall,
  Compass,
  ShieldCheck,
  Radio
} from 'lucide-react';

interface WebViewProps {
  posts: BloggerPost[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onSelectPost: (post: BloggerPost) => void;
  searchQuery: string;
  onClearSearch: () => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  categories: { name: string; count: number }[];
  savedPostIds: Set<string>;
  onToggleSavePost: (post: BloggerPost) => void;
  onOpenConnectionPanel: () => void;
  onRefresh: () => void;
  errorDetail: APIErrorDetail | null;
  hasApiKey: boolean;
  isCachedData: boolean;
  theme: 'light' | 'dark';
  onOpenNotifications: () => void;
}

export const WebView: React.FC<WebViewProps> = ({
  posts,
  isLoading,
  isLoadingMore,
  hasMore,
  onLoadMore,
  onSelectPost,
  searchQuery,
  selectedCategory,
  onSelectCategory,
  categories,
  savedPostIds,
  onToggleSavePost,
  onRefresh,
  isCachedData,
}) => {
  const [feedFilter, setFeedFilter] = useState<'for-you' | 'latest' | 'trending'>('for-you');
  const [showAllGrid, setShowAllGrid] = useState(false);

  // Filter posts
  const filteredPosts = posts.filter((post) => {
    if (selectedCategory === 'Tersimpan') {
      if (!savedPostIds.has(post.id)) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = post.title.toLowerCase().includes(q);
      const matchContent = post.content ? post.content.toLowerCase().includes(q) : false;
      const matchLabel = post.labels?.some(l => l.toLowerCase().includes(q));
      if (!matchTitle && !matchContent && !matchLabel) return false;
    }

    if (selectedCategory && selectedCategory !== 'Semua Berita' && selectedCategory !== 'Tersimpan') {
      const catLower = selectedCategory.toLowerCase();
      return post.labels?.some(l => l.trim().toLowerCase() === catLower);
    }

    return true;
  });

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    return new Date(b.published).getTime() - new Date(a.published).getTime();
  });

  // Always keep latest 4 news items globally, regardless of category chosen below
  const latestGlobalPosts = useMemo(() => {
    return [...posts].sort((a, b) => {
      return new Date(b.published).getTime() - new Date(a.published).getTime();
    });
  }, [posts]);

  const gridPosts = (selectedCategory !== 'Semua Berita' || searchQuery) ? sortedPosts : sortedPosts.slice(4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Real-time Push Notification Toast for New News (Auto disappears after few seconds) */}
      {latestGlobalPosts.length > 0 && (
        <PushNotificationToast
          latestPost={latestGlobalPosts[0]}
          onSelectPost={onSelectPost}
          durationMs={6000}
        />
      )}

      {/* Top Weather & Air Quality Banner for User's Device Location */}
      <TopWeatherBanner />

      {/* Financial, IHSG & Disaster Summary Cards */}
      <FinancialAndDisasterWidget />

      {/* Cached warning banner */}
      {isCachedData && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Menampilkan data dari cache lokal (offline).</span>
          </div>
          <button
            onClick={onRefresh}
            className="px-3 py-1 bg-amber-200/70 dark:bg-amber-900/60 rounded-lg text-amber-900 dark:text-amber-100 text-xs font-semibold"
          >
            Segarkan
          </button>
        </div>
      )}

      {/* 4 Latest News Showcase (Always stays visible regardless of category chosen below) */}
      {latestGlobalPosts.length > 0 && !searchQuery && (
        <div className="mb-8">
          <LatestFourNews
            posts={latestGlobalPosts}
            onSelectPost={onSelectPost}
            savedPostIds={savedPostIds}
            onToggleSave={onToggleSavePost}
          />
        </div>
      )}

      {/* Filter Pills Bar: For You ⌵, All, and Dynamic Categories */}
      <div className="border-b border-slate-200 dark:border-slate-800/80 pb-3">
        <FilterPills
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={onSelectCategory}
          feedFilter={feedFilter}
          onChangeFeedFilter={setFeedFilter}
        />
      </div>

      {/* Two-Column Responsive Desktop Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left/Main Column: News Articles Grid (Col 7-8) */}
        <div className="md:col-span-7 lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800/80">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {selectedCategory === 'Tersimpan' 
                ? 'Daftar Berita Tersimpan' 
                : selectedCategory === 'Semua Berita' 
                ? 'Warta Lainnya & Analisis Bencana' 
                : `Kategori: ${selectedCategory}`}
            </h2>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-800">
              {filteredPosts.length} artikel ditemukan
            </span>
          </div>

          {/* Loading state */}
          {isLoading && posts.length === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
              <div className="h-44 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800" />
              <div className="h-44 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800" />
              <div className="h-44 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800" />
              <div className="h-44 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800" />
            </div>
          )}

          {/* Empty state */}
          {!isLoading && filteredPosts.length === 0 && (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
              <Bookmark className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Tidak ada artikel</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {selectedCategory === 'Tersimpan' 
                  ? 'Simpan artikel favorit Anda menggunakan tombol bookmark.' 
                  : 'Coba ubah kata kunci atau pilih kategori lain.'}
              </p>
            </div>
          )}

          {/* News Cards Grid: 2 columns on desktop with collapsible See All feature */}
          {gridPosts.length > 0 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(showAllGrid ? gridPosts : gridPosts.slice(0, 6)).map((post) => (
                  <TrendingCard
                    key={post.id}
                    post={post}
                    onSelectPost={onSelectPost}
                    isSaved={savedPostIds.has(post.id)}
                    onToggleSave={onToggleSavePost}
                  />
                ))}
              </div>

              {!showAllGrid && gridPosts.length > 6 && (
                <button
                  onClick={() => setShowAllGrid(true)}
                  className="w-full py-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  <span>Lihat Semua Warta Lainnya ({gridPosts.length - 6} artikel lainnya)</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              )}

              {showAllGrid && gridPosts.length > 6 && (
                <button
                  onClick={() => setShowAllGrid(false)}
                  className="w-full py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-2 transition-all"
                >
                  <span>Tampilkan Sebagian Saja</span>
                  <ChevronUp className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {/* Load More Pagination Button */}
          {hasMore && selectedCategory !== 'Tersimpan' && (
            <div className="pt-6 text-center">
              <button
                onClick={onLoadMore}
                disabled={isLoadingMore}
                className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-sm transition-all shadow-sm hover:shadow active:scale-98 disabled:opacity-50"
              >
                {isLoadingMore ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                    <span>Memuat Halaman Berikutnya...</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 text-blue-600" />
                    <span>Muat Berita Berikutnya (Blogger API)</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Right/Sidebar Column: Widgets & Telemetry (Col 4-5) */}
        <div className="md:col-span-5 lg:col-span-4 space-y-6">
          {/* Rekomendasi Tempat Wisata & Kuliner Nusantara */}
          <TravelAndCulinaryWidget />

          {/* Emergency Helplines & Contacts Card */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <PhoneCall className="w-4 h-4 text-rose-500" />
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                Kontak Darurat Kebencanaan
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-900/40 space-y-0.5">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-semibold">BNPB Siaga</span>
                <span className="text-sm font-extrabold text-rose-700 dark:text-rose-400 font-mono">117</span>
              </div>
              <div className="p-3 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 space-y-0.5">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-semibold">Call Center BMKG</span>
                <span className="text-sm font-extrabold text-blue-700 dark:text-blue-400 font-mono">196</span>
              </div>
              <div className="p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 space-y-0.5">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-semibold">BASARNAS (SAR)</span>
                <span className="text-sm font-extrabold text-amber-700 dark:text-amber-400 font-mono">115</span>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40 space-y-0.5">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-semibold">Ambulans / PMI</span>
                <span className="text-sm font-extrabold text-emerald-700 dark:text-emerald-400 font-mono">118 / 119</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Hubungi nomor darurat di atas untuk bantuan evakuasi medis atau pelaporan kondisi bahaya di wilayah Anda.
            </p>
          </div>

          {/* Topic Quick Navigation Card */}
          {categories.length > 0 && (
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                <Compass className="w-4 h-4 text-blue-600 dark:text-amber-400" />
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Jelajahi Topik Berita
                </h3>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {categories.slice(0, 10).map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => onSelectCategory(cat.name)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      selectedCategory === cat.name
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className="text-[10px] opacity-70 font-mono">({cat.count})</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Verification & Source Badge */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-slate-900 to-blue-950 text-white border border-blue-900 shadow-sm space-y-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-extrabold text-white">Sumber Terverifikasi</span>
            </div>
            <p className="text-xs text-blue-200/80 leading-relaxed">
              Disinkronkan secara langsung dari Google Blogger JSON API v3.0 (<span className="text-amber-300 font-mono">rmndninews.blogspot.com</span>) dengan data seismik resmi BMKG &amp; USGS.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
