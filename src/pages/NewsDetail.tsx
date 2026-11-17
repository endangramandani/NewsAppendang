import React, { useState, useEffect } from 'react';
import { BloggerPost } from '../types/blogger';
import { 
  extractPrimaryThumbnail, 
  sanitizeArticleHtml, 
  calculateReadingTime 
} from '../services/bloggerService';
import { FallbackImage } from '../components/FallbackImage';
import { 
  ArrowLeft, 
  ExternalLink, 
  Calendar, 
  User, 
  Clock, 
  Share2, 
  Check, 
  Tag,
  Bookmark,
  BookOpen
} from 'lucide-react';

interface NewsDetailProps {
  post: BloggerPost;
  onBack: () => void;
  onSelectCategory?: (category: string) => void;
  isSaved?: boolean;
  onToggleSave?: (post: BloggerPost) => void;
  allPosts?: BloggerPost[];
  onSelectPost?: (post: BloggerPost) => void;
}

export const NewsDetail: React.FC<NewsDetailProps> = ({ 
  post, 
  onBack,
  onSelectCategory,
  isSaved = false,
  onToggleSave,
  allPosts = [],
  onSelectPost
}) => {
  const [imageFailed, setImageFailed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [readingProgress, setReadingProgress] = useState(0);

  const heroImage = extractPrimaryThumbnail(post);
  const primaryCategory = post.labels && post.labels.length > 0 ? post.labels[0] : 'Berita';
  const readingTime = calculateReadingTime(post.content);
  const sanitizedHtml = sanitizeArticleHtml(post.content);

  const publishDate = new Date(post.published).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const publishTime = new Date(post.published).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit'
  });

  // Reading progress tracker
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const currentProgress = (window.scrollY / totalHeight) * 100;
        setReadingProgress(Math.min(100, Math.max(0, currentProgress)));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Related articles calculation based on matching labels
  const relatedPosts = (allPosts || [])
    .filter((p) => p.id !== post.id)
    .filter((p) => {
      if (!p.labels || !post.labels) return false;
      return p.labels.some((l) => post.labels?.includes(l));
    })
    .slice(0, 3);

  const handleShare = async () => {
    const shareData = {
      title: post.title,
      text: `${post.title} — SEISMO WEATHER NEWS`,
      url: post.url || window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // Fallback
      }
    }

    try {
      await navigator.clipboard.writeText(post.url || window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore
    }
  };

  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'large':
        return 'text-lg leading-relaxed';
      case 'xlarge':
        return 'text-xl leading-loose';
      default:
        return 'text-base leading-relaxed';
    }
  };

  return (
    <div className="relative">
      {/* Reading Progress Bar (Fixed Top) */}
      <div 
        className="fixed top-0 left-0 h-1 bg-gradient-to-r from-blue-600 via-sky-400 to-amber-400 z-50 transition-all duration-150"
        style={{ width: `${readingProgress}%` }}
      />

      <article className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Top Bar with Back Button, Reading Tools, and External Link */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-amber-400 transition-colors bg-white dark:bg-slate-900 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Berita</span>
          </button>

          <div className="flex items-center gap-2">
            {/* Font Size Adjuster */}
            <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full p-1 text-xs shadow-sm">
              <button
                onClick={() => setFontSize('normal')}
                className={`px-2.5 py-1 rounded-full font-bold transition-colors ${
                  fontSize === 'normal' 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Ukuran teks normal"
              >
                A
              </button>
              <button
                onClick={() => setFontSize('large')}
                className={`px-2.5 py-1 rounded-full font-bold transition-colors ${
                  fontSize === 'large' 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Ukuran teks besar"
              >
                A+
              </button>
            </div>

            {/* Bookmark Button */}
            {onToggleSave && (
              <button
                onClick={() => onToggleSave(post)}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-full border transition-colors shadow-sm ${
                  isSaved 
                    ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-500/50' 
                    : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                }`}
                title={isSaved ? 'Hapus dari tersimpan' : 'Simpan berita'}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current text-amber-500' : ''}`} />
                <span className="hidden sm:inline">{isSaved ? 'Tersimpan' : 'Simpan'}</span>
              </button>
            )}

            {/* Share Button */}
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 px-3 py-2 rounded-full border border-slate-200 dark:border-slate-800 transition-colors shadow-sm"
              title="Bagikan artikel"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-700 dark:text-emerald-400">Disalin!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Bagikan</span>
                </>
              )}
            </button>

            {post.url && (
              <a
                href={post.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-3.5 py-2 rounded-full transition-colors shadow-sm"
              >
                <span>Artikel Asli</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>

        {/* Article Header */}
        <header className="space-y-4 mb-8">
          {/* Unboxed Metadata */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono">
            <span className="font-extrabold uppercase tracking-wider text-blue-600 dark:text-amber-400">
              {primaryCategory}
            </span>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-amber-500" />
              {publishDate}, {publishTime} WIB
            </span>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-sky-500" />
              {readingTime} menit baca
            </span>
          </div>

          {/* Full Headline Title */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight">
            {post.title}
          </h1>

          {/* Author information */}
          <div className="flex items-center gap-3 pt-2">
            <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-slate-800 flex items-center justify-center text-blue-600 dark:text-amber-400 border border-blue-200 dark:border-slate-700">
              <User className="w-4 h-4" />
            </div>
            <div className="text-xs">
              <p className="font-bold text-slate-900 dark:text-slate-200">
                {post.author?.displayName || 'Redaksi BREAK NEWS'}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Google Blogger JSON API v3.0 Feed · Terverifikasi
              </p>
            </div>
          </div>
        </header>

        {/* Single Main Hero Image */}
        <div className="mb-10 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 shadow-md">
          {heroImage && !imageFailed ? (
            <img
              src={heroImage}
              alt={post.title}
              onError={() => setImageFailed(true)}
              className="w-full max-h-[520px] object-cover"
            />
          ) : (
            <FallbackImage 
              title={post.title} 
              category={primaryCategory} 
              className="w-full min-h-[300px]"
            />
          )}
        </div>

        {/* Main Sanitized Article Content */}
        <div 
          className={`blogger-content bg-white dark:bg-slate-900/60 p-6 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm ${getFontSizeClass()}`}
          dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
        />

        {/* Labels / Tags Section */}
        {post.labels && post.labels.length > 0 && (
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-3 text-xs font-mono text-slate-500 dark:text-slate-400">
              <Tag className="w-3.5 h-3.5 text-blue-600 dark:text-amber-400" />
              <span className="uppercase tracking-wider font-bold">Kategori Artikel:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {post.labels.map((label) => (
                <button
                  key={label}
                  onClick={() => onSelectCategory && onSelectCategory(label)}
                  className="px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
                >
                  #{label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Related Articles Section (Berita Terkait) */}
        {relatedPosts.length > 0 && (
          <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-extrabold text-lg">
              <BookOpen className="w-5 h-5 text-blue-600 dark:text-amber-400" />
              <span>Berita Terkait</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedPosts.map((related) => {
                const thumb = extractPrimaryThumbnail(related);
                return (
                  <div
                    key={related.id}
                    onClick={() => onSelectPost && onSelectPost(related)}
                    className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 transition-colors cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-950 mb-2.5">
                        {thumb ? (
                          <img
                            src={thumb}
                            alt={related.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <FallbackImage title={related.title} className="w-full h-full text-[8px]" />
                        )}
                      </div>
                      <h4 className="font-bold text-xs line-clamp-2 text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-amber-400 transition-colors">
                        {related.title}
                      </h4>
                    </div>

                    <span className="text-[10px] text-slate-400 font-mono mt-3">
                      {new Date(related.published).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Bottom Original Source Card */}
        <div className="mt-10 p-6 rounded-3xl bg-slate-100 dark:bg-blue-950/30 border border-slate-200 dark:border-blue-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Sumber Asli Postingan</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
              Artikel ini diterbitkan secara resmi di blog <span className="text-blue-600 dark:text-blue-300 font-mono font-bold">rmndninews.blogspot.com</span>.
            </p>
          </div>
          {post.url && (
            <a
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm"
            >
              <span>Buka di Blogger</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </article>
    </div>
  );
};
