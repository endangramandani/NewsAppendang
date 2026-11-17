import React, { useState, useMemo, useRef } from 'react';
import { BloggerPost, APIErrorDetail } from '../types/blogger';
import { AndroidPhoneHeader } from './AndroidPhoneHeader';
import { LatestFourNews } from './LatestFourNews';
import { FilterPills } from './FilterPills';
import { TrendingCard } from './TrendingCard';
import { TravelAndCulinaryWidget } from './TravelAndCulinaryWidget';
import { PushNotificationToast } from './PushNotificationToast';
import { TopWeatherBanner } from './TopWeatherBanner';
import { FinancialAndDisasterWidget } from './FinancialAndDisasterWidget';
import { BottomFloatingBar } from './BottomFloatingBar';
import { Search, X, SlidersHorizontal, RefreshCw, ChevronDown, ChevronUp, Bell } from 'lucide-react';

interface AndroidViewProps {
  posts: BloggerPost[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onSelectPost: (post: BloggerPost) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  categories: { name: string; count: number }[];
  savedPostIds: Set<string>;
  onToggleSavePost: (post: BloggerPost) => void;
  onOpenConnectionPanel: () => void;
  onRefresh: () => void;
  errorDetail: APIErrorDetail | null;
  hasApiKey: boolean;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onOpenNotifications: () => void;
  unreadCount?: number;
}

export const AndroidView: React.FC<AndroidViewProps> = ({
  posts,
  isLoading,
  isLoadingMore,
  hasMore,
  onLoadMore,
  onSelectPost,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  categories,
  savedPostIds,
  onToggleSavePost,
  onOpenConnectionPanel,
  onRefresh,
  errorDetail,
  hasApiKey,
  theme,
  onToggleTheme,
  onOpenNotifications,
  unreadCount = 0
}) => {
  const [currentTab, setCurrentTab] = useState<'home' | 'explore' | 'saved' | 'api'>('home');
  const [feedFilter, setFeedFilter] = useState<'for-you' | 'latest' | 'trending'>('for-you');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showAllTrending, setShowAllTrending] = useState(false);

  const feedRef = useRef<HTMLDivElement>(null);
  const travelRef = useRef<HTMLDivElement>(null);

  const handleSelectTab = (tab: 'home' | 'explore' | 'saved' | 'api') => {
    setCurrentTab(tab);
    if (tab === 'saved') {
      onSelectCategory('Tersimpan');
      feedRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (tab === 'home') {
      onSelectCategory('Semua Berita');
      feedRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (tab === 'explore') {
      onSelectCategory('Semua Berita');
      setTimeout(() => {
        travelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    } else if (tab === 'api') {
      onOpenConnectionPanel();
    }
  };

  const filteredPosts = posts.filter((post) => {
    if (currentTab === 'saved' || selectedCategory === 'Tersimpan') {
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

  const trendingPosts = (selectedCategory === 'Semua Berita' && !searchQuery)
    ? sortedPosts.slice(4)
    : sortedPosts;

  return (
    <div className="w-full max-w-2xl mx-auto bg-[#f5f6f8] dark:bg-slate-950 min-h-screen text-slate-900 dark:text-slate-100 flex flex-col relative pb-28 transition-colors">
      {/* Android Top Phone Header */}
      <AndroidPhoneHeader
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenNotifications={onOpenNotifications}
        onToggleApiPanel={onOpenConnectionPanel}
        theme={theme}
        onToggleTheme={onToggleTheme}
        unreadCount={unreadCount}
      />

      {/* Search Overlay if opened */}
      {isSearchOpen && (
        <div className="px-4 py-2 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 animate-in fade-in duration-200">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Cari berita bencana, gempa, cuaca..."
              className="w-full bg-slate-100 dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100 pl-9 pr-9 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-600"
            />
            <button
              onClick={() => {
                onSearchChange('');
                setIsSearchOpen(false);
              }}
              className="absolute right-3 text-slate-400 hover:text-slate-700 dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Scrollable Feed */}
      <div ref={feedRef} className="flex-1 px-4 py-4 space-y-4 overflow-y-auto">
        {/* API Warning if no posts */}
        {!isLoading && posts.length === 0 && !hasApiKey && (
          <div className="p-6 rounded-3xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-center space-y-3">
            <h4 className="font-bold text-blue-900 dark:text-white text-sm">
              Hubungkan Blogger API
            </h4>
            <p className="text-xs text-blue-700 dark:text-blue-300">
              Masukkan Blogger API Key Anda untuk mulai memuat artikel asli dari blog <strong>rmndninews.blogspot.com</strong>.
            </p>
            <button
              onClick={onOpenConnectionPanel}
              className="w-full py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md"
            >
              Buka Pengaturan API
            </button>
          </div>
        )}

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

        {/* 4 Latest News Showcase (Always stays visible regardless of category chosen below) */}
        {latestGlobalPosts.length > 0 && !searchQuery && (
          <LatestFourNews
            posts={latestGlobalPosts}
            onSelectPost={onSelectPost}
            savedPostIds={savedPostIds}
            onToggleSave={onToggleSavePost}
          />
        )}

        {/* Filter Pills */}
        <FilterPills
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => {
            onSelectCategory(cat);
            if (currentTab !== 'explore') setCurrentTab('home');
          }}
          feedFilter={feedFilter}
          onChangeFeedFilter={setFeedFilter}
        />

        {/* Section Title */}
        <div className="flex items-center justify-between pt-1">
          <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">
            {selectedCategory === 'Tersimpan' 
              ? 'Berita Tersimpan' 
              : selectedCategory === 'Semua Berita' 
              ? 'Warta Lainnya' 
              : selectedCategory}
          </h3>
          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
            {filteredPosts.length} artikel
          </span>
        </div>

        {/* Loading Skeletons */}
        {isLoading && posts.length === 0 && (
          <div className="space-y-4 animate-pulse">
            <div className="h-28 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800" />
            <div className="h-28 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800" />
            <div className="h-28 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800" />
          </div>
        )}

        {/* Empty state for filtered category */}
        {!isLoading && filteredPosts.length === 0 && posts.length > 0 && (
          <div className="p-8 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 shadow-sm">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Tidak ada artikel dalam kategori ini</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {selectedCategory === 'Tersimpan' 
                ? 'Belum ada berita yang disimpan. Gunakan tombol bookmark untuk menyimpan berita.'
                : 'Belum ada artikel dengan kategori ini dari Blogger.'}
            </p>
          </div>
        )}

        {/* Trending / Grid Cards List (Collapsed by default, with See All feature) */}
        {trendingPosts.length > 0 && (
          <div className="space-y-3.5">
            {(showAllTrending ? trendingPosts : trendingPosts.slice(0, 5)).map((post) => (
              <TrendingCard
                key={post.id}
                post={post}
                onSelectPost={onSelectPost}
                isSaved={savedPostIds.has(post.id)}
                onToggleSave={onToggleSavePost}
              />
            ))}

            {!showAllTrending && trendingPosts.length > 5 && (
              <button
                onClick={() => setShowAllTrending(true)}
                className="w-full py-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <span>Lihat Semua Warta Lainnya ({trendingPosts.length - 5} artikel lainnya)</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            )}

            {showAllTrending && trendingPosts.length > 5 && (
              <button
                onClick={() => setShowAllTrending(false)}
                className="w-full py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-2 transition-all"
              >
                <span>Tampilkan Sebagian Saja</span>
                <ChevronUp className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Rekomendasi Tempat Wisata & Kuliner Nusantara */}
        {selectedCategory === 'Semua Berita' && !searchQuery && (
          <div ref={travelRef}>
            <TravelAndCulinaryWidget />
          </div>
        )}

        {/* Load More Pagination */}
        {hasMore && selectedCategory !== 'Tersimpan' && (
          <div className="py-4 text-center">
            <button
              onClick={onLoadMore}
              disabled={isLoadingMore}
              className="w-full py-3 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
            >
              {isLoadingMore ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
                  <span>Memuat Halaman Berikutnya...</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5 text-blue-600" />
                  <span>Muat Berita Lainnya</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Bottom Floating Pill Dock */}
      <BottomFloatingBar
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        savedCount={savedPostIds.size}
      />
    </div>
  );
};
