import React, { useState } from 'react';
import { BloggerPost, APIErrorDetail } from '../types/blogger';
import { NewsCard } from '../components/NewsCard';
import { 
  AlertCircle, 
  Search, 
  Key, 
  RefreshCw, 
  SlidersHorizontal,
  ChevronDown,
  LayoutGrid,
  List,
  Bookmark,
  TrendingUp,
  Newspaper
} from 'lucide-react';

interface NewsHomeProps {
  posts: BloggerPost[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onSelectPost: (post: BloggerPost) => void;
  searchQuery: string;
  onClearSearch: () => void;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  errorDetail: APIErrorDetail | null;
  hasApiKey: boolean;
  onOpenConnectionPanel: () => void;
  onRefresh: () => void;
  isCachedData: boolean;
  savedPostIds: Set<string>;
  onToggleSavePost: (post: BloggerPost) => void;
}

export const NewsHome: React.FC<NewsHomeProps> = ({
  posts,
  isLoading,
  isLoadingMore,
  hasMore,
  onLoadMore,
  onSelectPost,
  searchQuery,
  onClearSearch,
  selectedCategory,
  onSelectCategory,
  errorDetail,
  hasApiKey,
  onOpenConnectionPanel,
  onRefresh,
  isCachedData,
  savedPostIds,
  onToggleSavePost
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // If API Key is not configured yet and no posts exist
  if (!hasApiKey && posts.length === 0 && !isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="rounded-2xl border border-blue-900/60 bg-gradient-to-b from-slate-900 via-slate-900 to-blue-950/40 p-8 sm:p-12 text-center shadow-2xl space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
            <Key className="w-8 h-8" />
          </div>

          <div className="space-y-3 max-w-xl mx-auto">
            <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold">
              Konfigurasi Sumber Berita
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Hubungkan ke Blogger JSON API v3.0
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Aplikasi berita ini tersinkronisasi langsung dengan blog <strong className="text-white">rmndninews.blogspot.com</strong> (Blog ID: <code className="font-mono text-amber-300">3619052327211751609</code>). Masukkan Google Cloud API Key Anda untuk mulai memuat seluruh artikel berita terkini.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onOpenConnectionPanel}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all shadow-lg shadow-blue-900/40"
            >
              <SlidersHorizontal className="w-4 h-4 text-amber-300" />
              <span>Buka Panel Koneksi Blogger</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-800/80 text-left text-xs">
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-amber-400 font-bold block mb-1">1. Buat API Key</span>
              <p className="text-slate-400">Buat API Key gratis di Google Cloud Console pada menu Credentials.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-blue-400 font-bold block mb-1">2. Aktifkan Blogger API</span>
              <p className="text-slate-400">Aktifkan "Blogger API v3" di library API Google Cloud Project Anda.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-emerald-400 font-bold block mb-1">3. Sinkronisasi Nyata</span>
              <p className="text-slate-400">Artikel, kategori label dinamis, dan gambar asli langsung termuat secara instan.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Filter posts based on category and search
  const filteredPosts = posts.filter((post) => {
    // Saved filter
    if (selectedCategory === 'Tersimpan') {
      if (!savedPostIds.has(post.id)) return false;
    }

    // Search query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = post.title.toLowerCase().includes(q);
      const matchContent = post.content ? post.content.toLowerCase().includes(q) : false;
      const matchAuthor = post.author?.displayName?.toLowerCase().includes(q);
      const matchLabel = post.labels?.some(l => l.toLowerCase().includes(q));
      if (!matchTitle && !matchContent && !matchAuthor && !matchLabel) return false;
    }

    // Category match
    if (selectedCategory && selectedCategory !== 'Semua Berita' && selectedCategory !== 'Tersimpan') {
      const catLower = selectedCategory.toLowerCase();
      return post.labels?.some(l => l.trim().toLowerCase() === catLower);
    }

    return true;
  });

  const featuredPost = filteredPosts.length > 0 && selectedCategory !== 'Tersimpan' && !searchQuery
    ? filteredPosts[0] 
    : null;
  const gridPosts = featuredPost 
    ? filteredPosts.slice(1) 
    : filteredPosts;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Cached Data Warning Banner if offline/error */}
      {isCachedData && (
        <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/80 text-amber-200 text-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Menampilkan data terakhir dari <strong>Cache Lokal</strong> karena koneksi ke server Blogger mengalami kendala.
            </span>
          </div>
          <button
            onClick={onRefresh}
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-900/60 hover:bg-amber-800 text-amber-100 font-semibold text-xs border border-amber-700/60"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Coba Lagi</span>
          </button>
        </div>
      )}

      {/* Main Filter / Category Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-400">
            <span>Kanal Berita</span>
            <span className="text-slate-600">/</span>
            <span className="text-blue-400 font-bold">{selectedCategory}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-1">
            {selectedCategory === 'Semua Berita' 
              ? 'Warta Terkini & Informasi Utama' 
              : selectedCategory === 'Tersimpan' 
              ? 'Daftar Berita Tersimpan' 
              : `Kategori: ${selectedCategory}`}
          </h1>
        </div>

        {/* View mode toggle & Active search indicator */}
        <div className="flex items-center gap-3">
          {searchQuery && (
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
              <span className="text-slate-400">Pencarian:</span>
              <strong className="text-white">"{searchQuery}"</strong>
              <button
                onClick={onClearSearch}
                className="text-slate-400 hover:text-white ml-1 p-0.5"
              >
                ✕
              </button>
            </div>
          )}

          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 text-slate-400">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-blue-600 text-white' : 'hover:text-white'
              }`}
              title="Tampilan Grid"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-blue-600 text-white' : 'hover:text-white'
              }`}
              title="Tampilan List"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Loading Skeletons */}
      {isLoading && posts.length === 0 && (
        <div className="space-y-8 animate-pulse">
          <div className="h-80 sm:h-96 rounded-2xl bg-slate-900/80 border border-slate-800" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-72 rounded-xl bg-slate-900/70 border border-slate-800" />
            ))}
          </div>
        </div>
      )}

      {/* API Error state when no posts are available */}
      {errorDetail && posts.length === 0 && !isLoading && (
        <div className="p-8 rounded-2xl bg-rose-950/40 border border-rose-900/80 text-center max-w-2xl mx-auto space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
          <h3 className="text-lg font-bold text-white">Gagal Memuat Berita Blogger</h3>
          <p className="text-xs text-rose-200 leading-relaxed">
            {errorDetail.message}
          </p>
          {errorDetail.help && (
            <p className="text-xs text-slate-300 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              <strong>Solusi:</strong> {errorDetail.help}
            </p>
          )}
          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={onOpenConnectionPanel}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
            >
              Buka Pengaturan API
            </button>
            <button
              onClick={onRefresh}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs"
            >
              Muat Ulang
            </button>
          </div>
        </div>
      )}

      {/* Empty State when no articles match filter */}
      {!isLoading && filteredPosts.length === 0 && posts.length > 0 && (
        <div className="text-center py-16 px-4 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
          <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            {selectedCategory === 'Tersimpan' ? (
              <Bookmark className="w-6 h-6" />
            ) : (
              <Search className="w-6 h-6" />
            )}
          </div>
          <h3 className="text-base font-bold text-white">
            {selectedCategory === 'Tersimpan' 
              ? 'Belum Ada Berita Tersimpan' 
              : 'Tidak Ada Berita Ditemukan'}
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {selectedCategory === 'Tersimpan' 
              ? 'Klik ikon bookmark pada kartu berita untuk menyimpannya ke daftar bacaan Anda.' 
              : `Tidak ditemukan artikel untuk kategori "${selectedCategory}"${searchQuery ? ` dengan kata kunci "${searchQuery}"` : ''}.`}
          </p>
          <button
            onClick={() => {
              onClearSearch();
              onSelectCategory('Semua Berita');
            }}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
          >
            Lihat Semua Berita
          </button>
        </div>
      )}

      {/* Content Rendering: Featured Post + Grid/List of Cards */}
      {filteredPosts.length > 0 && (
        <div>
          {/* Featured Headline Post */}
          {featuredPost && (
            <NewsCard 
              post={featuredPost} 
              onSelectPost={onSelectPost} 
              isFeatured={true}
              isSaved={savedPostIds.has(featuredPost.id)}
              onToggleSave={onToggleSavePost}
            />
          )}

          {/* Grid / List of Remaining Cards */}
          {gridPosts.length > 0 && (
            <div className={
              viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            }>
              {gridPosts.map((post) => (
                <NewsCard
                  key={post.id}
                  post={post}
                  onSelectPost={onSelectPost}
                  isSaved={savedPostIds.has(post.id)}
                  onToggleSave={onToggleSavePost}
                />
              ))}
            </div>
          )}

          {/* Pagination: Muat Berita Berikutnya */}
          {hasMore && selectedCategory !== 'Tersimpan' && (
            <div className="pt-10 text-center">
              <button
                onClick={onLoadMore}
                disabled={isLoadingMore}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-slate-950 border border-slate-700 text-slate-200 hover:text-white font-bold text-sm transition-all shadow-md shadow-slate-950/60 disabled:opacity-50"
              >
                {isLoadingMore ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                    <span>Memuat Halaman Berikutnya...</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 text-blue-400" />
                    <span>Muat Berita Berikutnya (Blogger API)</span>
                  </>
                )}
              </button>
              <p className="mt-2 text-[11px] text-slate-400 font-mono">
                Menggunakan parameter pagination <code className="text-slate-300">nextPageToken</code>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
