import { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { BloggerConnectionPanel } from './components/BloggerConnectionPanel';
import { WebView } from './components/WebView';
import { AndroidView } from './components/AndroidView';
import { NewsDetail } from './pages/NewsDetail';
import { AboutModal } from './components/AboutModal';
import { NotificationModal } from './components/NotificationModal';
import { Bell } from 'lucide-react';
import { 
  BloggerPost, 
  ConnectionStatus, 
  APIErrorDetail, 
  BloggerBlogInfo 
} from './types/blogger';
import { 
  fetchBloggerPosts, 
  testBloggerConnection 
} from './services/bloggerService';
import { 
  getSavedOneSignalAppId, 
  initOneSignal 
} from './services/oneSignalService';

const DEFAULT_BLOG_ID = '3619052327211751609';
const DEFAULT_BLOG_URL = 'https://rmndninews.blogspot.com/';
const SAVED_POSTS_STORAGE_KEY = 'rmndni_saved_posts';
const THEME_STORAGE_KEY = 'rmndni_theme';
const READ_NOTIFICATIONS_STORAGE_KEY = 'rmndni_read_notifications';

export default function App() {
  // Theme state: defaults to 'light' (clean bright mode), toggleable to 'dark'
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === 'dark' || stored === 'light') return stored;
    } catch {
      // Ignore
    }
    return 'light';
  });

  // Apply 'dark' class to <html> element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Ignore
    }
  }, [theme]);

  // Register PWA Service Worker safely
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // SW registration failed silently
      });
    }
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Configuration state
  const [blogId, setBlogId] = useState<string>(() => {
    return (import.meta.env.VITE_BLOGGER_BLOG_ID as string) || DEFAULT_BLOG_ID;
  });

  const [apiKey, setApiKey] = useState<string>(() => {
    return (import.meta.env.VITE_BLOGGER_API_KEY as string) || '';
  });

  // UI state
  const [isConnectionPanelOpen, setIsConnectionPanelOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState<boolean>(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState<boolean>(false);

  // Initialize OneSignal on startup if App ID is configured
  useEffect(() => {
    const savedId = getSavedOneSignalAppId();
    if (savedId.trim()) {
      initOneSignal(savedId.trim()).catch(() => {
        // Silent
      });
    }
  }, []);

  // Connection & Data state
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('idle');
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [errorDetail, setErrorDetail] = useState<APIErrorDetail | null>(null);
  const [blogInfo, setBlogInfo] = useState<BloggerBlogInfo | null>(null);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // Posts & Pagination state
  const [posts, setPosts] = useState<BloggerPost[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>(undefined);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isCachedData, setIsCachedData] = useState<boolean>(false);

  // Filter & Navigation state
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua Berita');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activePost, setActivePost] = useState<BloggerPost | null>(null);

  // Bookmarks / Saved posts
  const [savedPostIds, setSavedPostIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(SAVED_POSTS_STORAGE_KEY);
      if (saved) {
        return new Set(JSON.parse(saved));
      }
    } catch {
      // Ignore
    }
    return new Set<string>();
  });

  const handleToggleSavePost = (post: BloggerPost) => {
    setSavedPostIds((prev) => {
      const updated = new Set(prev);
      if (updated.has(post.id)) {
        updated.delete(post.id);
      } else {
        updated.add(post.id);
      }
      try {
        localStorage.setItem(SAVED_POSTS_STORAGE_KEY, JSON.stringify(Array.from(updated)));
      } catch {
        // Ignore
      }
      return updated;
    });
  };

  // Read notifications tracking (for Notification Center)
  const [readNotificationIds, setReadNotificationIds] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(READ_NOTIFICATIONS_STORAGE_KEY);
      if (stored) {
        return new Set(JSON.parse(stored));
      }
    } catch {
      // Ignore
    }
    return new Set<string>();
  });

  const handleMarkAsRead = useCallback((id: string) => {
    setReadNotificationIds((prev) => {
      const updated = new Set(prev);
      updated.add(id);
      try {
        localStorage.setItem(READ_NOTIFICATIONS_STORAGE_KEY, JSON.stringify(Array.from(updated)));
      } catch {
        // Ignore
      }
      return updated;
    });
  }, []);

  const handleMarkAllAsRead = useCallback(() => {
    const allIds = new Set(posts.map(p => p.id));
    setReadNotificationIds(allIds);
    try {
      localStorage.setItem(READ_NOTIFICATIONS_STORAGE_KEY, JSON.stringify(Array.from(allIds)));
    } catch {
      // Ignore
    }
  }, [posts]);

  const handleClearNotifications = useCallback(() => {
    const allIds = new Set(posts.map(p => p.id));
    setReadNotificationIds(allIds);
    try {
      localStorage.setItem(READ_NOTIFICATIONS_STORAGE_KEY, JSON.stringify(Array.from(allIds)));
    } catch {
      // Ignore
    }
  }, [posts]);

  const unreadNotificationCount = useMemo(() => {
    return posts.slice(0, 15).filter(p => !readNotificationIds.has(p.id)).length;
  }, [posts, readNotificationIds]);

  /**
   * Loads posts from Blogger API v3
   */
  const loadPosts = useCallback(async (isRefresh = false, tokenToUse?: string) => {
    if (!apiKey.trim()) {
      setConnectionStatus('idle');
      return;
    }

    if (tokenToUse) {
      setIsLoadingMore(true);
    } else if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setConnectionStatus('connecting');
    }

    try {
      const response = await fetchBloggerPosts({
        blogId: blogId.trim(),
        apiKey: apiKey.trim(),
        maxResults: 20,
        pageToken: tokenToUse
      });

      const fetchedItems = response.items || [];

      if (tokenToUse) {
        setPosts((prev) => {
          const existingIds = new Set(prev.map(p => p.id));
          const newItems = fetchedItems.filter(p => !existingIds.has(p.id));
          return [...prev, ...newItems];
        });
      } else {
        setPosts(fetchedItems);
      }

      setNextPageToken(response.nextPageToken);
      setConnectionStatus('connected');
      setErrorDetail(null);
      setIsCachedData(false);
      setLastUpdated(new Date());

      if (fetchedItems.length === 0 && !tokenToUse) {
        setErrorDetail({
          type: 'EMPTY_POSTS',
          message: 'Belum ada postingan yang dipublikasikan pada blog ini.',
          help: 'Pastikan ada artikel berstatus Published di blogger.com.'
        });
      }
    } catch (err: any) {
      const apiErr: APIErrorDetail = err?.type ? err : {
        type: 'UNKNOWN',
        message: err?.message || 'Gagal memuat berita dari Blogger API v3.',
        help: 'Periksa API Key dan Blog ID di panel koneksi sisi kanan.'
      };

      setErrorDetail(apiErr);
      setConnectionStatus('error');

      setPosts((prev) => {
        if (prev.length > 0) {
          setIsCachedData(true);
        }
        return prev;
      });
    } finally {
      setIsRefreshing(false);
      setIsLoadingMore(false);
    }
  }, [apiKey, blogId]);

  useEffect(() => {
    if (apiKey.trim()) {
      loadPosts();
    }
  }, [loadPosts, apiKey]);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setErrorDetail(null);
    setSaveSuccessMessage(null);
    setConnectionStatus('connecting');

    try {
      const info = await testBloggerConnection(blogId, apiKey);
      setBlogInfo(info);
      setConnectionStatus('connected');
      setSaveSuccessMessage(`Berhasil terhubung ke blog "${info.name}"!`);
      await loadPosts(true);
    } catch (err: any) {
      const apiErr: APIErrorDetail = err?.type ? err : {
        type: 'UNKNOWN',
        message: err?.message || 'Uji koneksi gagal.',
        help: 'Pastikan Blog ID dan API Key valid.'
      };
      setErrorDetail(apiErr);
      setConnectionStatus('error');
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveConfiguration = () => {
    setSaveSuccessMessage('Konfigurasi berhasil disimpan untuk sesi ini.');
    setTimeout(() => {
      setSaveSuccessMessage(null);
    }, 4000);
    if (apiKey.trim()) {
      loadPosts(true);
    }
  };

  const handleRefreshNews = () => {
    loadPosts(true);
  };

  const handleLoadMore = () => {
    if (nextPageToken) {
      loadPosts(false, nextPageToken);
    }
  };

  const categoriesList = useMemo(() => {
    const labelCounts = new Map<string, number>();

    posts.forEach((post) => {
      if (post.labels && Array.isArray(post.labels)) {
        post.labels.forEach((rawLabel) => {
          const trimmed = rawLabel.trim();
          if (trimmed) {
            let matchedKey = trimmed;
            for (const key of labelCounts.keys()) {
              if (key.toLowerCase() === trimmed.toLowerCase()) {
                matchedKey = key;
                break;
              }
            }
            labelCounts.set(matchedKey, (labelCounts.get(matchedKey) || 0) + 1);
          }
        });
      }
    });

    const result = Array.from(labelCounts.entries()).map(([name, count]) => ({
      name,
      count
    }));

    // Prioritize natural disaster and environmental topics
    const priority = [
      'gempa indonesia',
      'gempa dunia',
      'cuaca indonesia',
      'cuaca dunia',
      'peringatan dini',
      'edukasi',
      'mitigasi bencana',
      'berita terkini'
    ];

    result.sort((a, b) => {
      const aIndex = priority.indexOf(a.name.toLowerCase());
      const bIndex = priority.indexOf(b.name.toLowerCase());
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      return b.count - a.count;
    });

    return result;
  }, [posts]);

  const topCategoryNames = useMemo(() => {
    return categoriesList.map(c => c.name);
  }, [categoriesList]);

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950 transition-colors duration-200">
      {/* When viewing an article detail */}
      {activePost ? (
        <div className="flex-1">
          <NewsDetail
            post={activePost}
            onBack={() => setActivePost(null)}
            onSelectCategory={(cat) => {
              setSelectedCategory(cat);
              setActivePost(null);
            }}
            isSaved={savedPostIds.has(activePost.id)}
            onToggleSave={handleToggleSavePost}
            allPosts={posts}
            onSelectPost={(p) => setActivePost(p)}
          />
        </div>
      ) : (
        <>
          {/* Mobile Screens (< md): Render Native Android View with bottom floating dock */}
          <div className="block md:hidden w-full">
            <AndroidView
              posts={posts}
              isLoading={connectionStatus === 'connecting'}
              isLoadingMore={isLoadingMore}
              hasMore={Boolean(nextPageToken)}
              onLoadMore={handleLoadMore}
              onSelectPost={(post) => setActivePost(post)}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              categories={categoriesList}
              savedPostIds={savedPostIds}
              onToggleSavePost={handleToggleSavePost}
              onOpenConnectionPanel={() => setIsConnectionPanelOpen(true)}
              onRefresh={handleRefreshNews}
              errorDetail={errorDetail}
              hasApiKey={Boolean(apiKey.trim())}
              theme={theme}
              onToggleTheme={toggleTheme}
              onOpenNotifications={() => setIsNotificationModalOpen(true)}
              unreadCount={unreadNotificationCount}
            />
          </div>

          {/* Desktop & Laptop Screens (md+): Render Full Responsive Web Layout */}
          <div className="hidden md:block w-full flex-1">
            <Header
              searchQuery={searchQuery}
              onSearchChange={(q) => {
                setSearchQuery(q);
                if (activePost) setActivePost(null);
              }}
              connectionStatus={connectionStatus}
              onToggleConnectionPanel={() => setIsConnectionPanelOpen(!isConnectionPanelOpen)}
              onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              isConnectionPanelOpen={isConnectionPanelOpen}
              totalArticlesLoaded={posts.length}
              lastUpdated={lastUpdated}
              onRefresh={handleRefreshNews}
              isRefreshing={isRefreshing}
              savedCount={savedPostIds.size}
              onOpenSaved={() => {
                setSelectedCategory('Tersimpan');
                if (activePost) setActivePost(null);
              }}
              selectedCategory={selectedCategory}
              onSelectCategory={(cat) => {
                setSelectedCategory(cat);
                setActivePost(null);
              }}
              topCategories={topCategoryNames}
              theme={theme}
              onToggleTheme={toggleTheme}
              onOpenNotifications={() => setIsNotificationModalOpen(true)}
            />

            <main className="flex-1">
              <WebView
                posts={posts}
                isLoading={connectionStatus === 'connecting'}
                isLoadingMore={isLoadingMore}
                hasMore={Boolean(nextPageToken)}
                onLoadMore={handleLoadMore}
                onSelectPost={(post) => setActivePost(post)}
                searchQuery={searchQuery}
                onClearSearch={() => setSearchQuery('')}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                categories={categoriesList}
                savedPostIds={savedPostIds}
                onToggleSavePost={handleToggleSavePost}
                onOpenConnectionPanel={() => setIsConnectionPanelOpen(true)}
                onRefresh={handleRefreshNews}
                errorDetail={errorDetail}
                hasApiKey={Boolean(apiKey.trim())}
                isCachedData={isCachedData}
                theme={theme}
                onOpenNotifications={() => setIsNotificationModalOpen(true)}
              />
            </main>
          </div>
        </>
      )}

      {/* Right Blogger API Connection Panel (Slide-out drawer) */}
      <BloggerConnectionPanel
        isOpen={isConnectionPanelOpen}
        onClose={() => setIsConnectionPanelOpen(false)}
        blogId={blogId}
        onBlogIdChange={setBlogId}
        apiKey={apiKey}
        onApiKeyChange={setApiKey}
        connectionStatus={connectionStatus}
        onTestConnection={handleTestConnection}
        onSaveConfiguration={handleSaveConfiguration}
        onRefreshNews={handleRefreshNews}
        isTesting={isTesting}
        isRefreshing={isRefreshing}
        totalArticlesLoaded={posts.length}
        lastUpdated={lastUpdated}
        errorDetail={errorDetail}
        blogInfo={blogInfo}
        saveSuccessMessage={saveSuccessMessage}
      />

      {/* About Ecosystem Modal */}
      <AboutModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
      />

      {/* Push Notification & Inbox Modal */}
      <NotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        posts={posts}
        onSelectPost={(post) => {
          setActivePost(post);
          setIsNotificationModalOpen(false);
        }}
        readNotificationIds={readNotificationIds}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
        onClearNotifications={handleClearNotifications}
      />

      {/* Footer on Web View */}
      {!activePost && (
        <footer className="hidden md:block border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 mt-auto text-xs text-slate-500 dark:text-slate-400 transition-colors">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 dark:text-white tracking-tight">BREAK NEWS</span>
              <span className="text-slate-300 dark:text-slate-600">·</span>
              <span>Google Blogger JSON API v3.0 &amp; BMKG / USGS Telemetry</span>
            </div>

            <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400">
              <a 
                href={DEFAULT_BLOG_URL} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                rmndninews.blogspot.com
              </a>
              <span className="text-slate-300 dark:text-slate-700">·</span>
              <button
                onClick={() => setIsAboutModalOpen(true)}
                className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
              >
                Tentang Portal
              </button>
              <span className="text-slate-300 dark:text-slate-700">·</span>
              <button
                onClick={() => setIsNotificationModalOpen(true)}
                className="hover:text-[#f05537] dark:hover:text-amber-400 transition-colors flex items-center gap-1 font-semibold"
              >
                <Bell className="w-3.5 h-3.5 text-rose-500" />
                <span>Push Notifikasi</span>
              </button>
              <span className="text-slate-300 dark:text-slate-700">·</span>
              <button
                onClick={() => setIsConnectionPanelOpen(true)}
                className="hover:text-amber-500 transition-colors"
              >
                Pengaturan API
              </button>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
