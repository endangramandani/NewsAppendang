import React, { useState } from 'react';
import { BloggerPost } from '../types/blogger';
import { extractPrimaryThumbnail, createTextSnippet, calculateReadingTime } from '../services/bloggerService';
import { FallbackImage } from './FallbackImage';
import { Calendar, User, ArrowRight, Clock, Bookmark } from 'lucide-react';

interface NewsCardProps {
  post: BloggerPost;
  onSelectPost: (post: BloggerPost) => void;
  isFeatured?: boolean;
  isSaved?: boolean;
  onToggleSave?: (post: BloggerPost) => void;
}

export const NewsCard: React.FC<NewsCardProps> = ({ 
  post, 
  onSelectPost, 
  isFeatured = false,
  isSaved = false,
  onToggleSave
}) => {
  const [imageFailed, setImageFailed] = useState(false);
  
  const thumbnailUrl = extractPrimaryThumbnail(post);
  const primaryCategory = post.labels && post.labels.length > 0 ? post.labels[0] : 'Berita';
  const snippet = createTextSnippet(post.content, isFeatured ? 260 : 130);
  const readingTime = calculateReadingTime(post.content);

  const formattedDate = new Date(post.published).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleSave) {
      onToggleSave(post);
    }
  };

  if (isFeatured) {
    return (
      <article className="group relative overflow-hidden rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all duration-300 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-0 mb-8">
        {/* Featured 16:9 or full-height responsive thumbnail */}
        <div className="lg:col-span-7 relative aspect-video lg:aspect-auto overflow-hidden bg-slate-950">
          {thumbnailUrl && !imageFailed ? (
            <img
              src={thumbnailUrl}
              alt={post.title}
              loading="lazy"
              onError={() => setImageFailed(true)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <FallbackImage 
              title={post.title} 
              category={primaryCategory} 
              className="w-full h-full min-h-[260px]"
            />
          )}

          {/* Bookmark overlay button */}
          {onToggleSave && (
            <button
              onClick={handleBookmarkClick}
              className={`absolute top-4 right-4 p-2.5 rounded-xl backdrop-blur-md transition-all z-10 ${
                isSaved 
                  ? 'bg-amber-500 text-slate-950 shadow-lg' 
                  : 'bg-slate-950/70 text-slate-300 hover:text-white hover:bg-slate-900/90'
              }`}
              title={isSaved ? 'Hapus dari tersimpan' : 'Simpan berita'}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            </button>
          )}

          {/* Gradient overlay on mobile */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60 lg:hidden" />
        </div>

        {/* Featured Content Area */}
        <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Unboxed Metadata */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
              <span className="font-bold uppercase tracking-wider text-amber-400">
                {primaryCategory}
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {formattedDate}
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {readingTime} mnt baca
              </span>
            </div>

            {/* Headline Title */}
            <h2 
              onClick={() => onSelectPost(post)}
              className="text-xl sm:text-2xl font-extrabold text-white group-hover:text-amber-300 transition-colors cursor-pointer leading-snug line-clamp-3"
            >
              {post.title}
            </h2>

            {/* Clean Excerpt */}
            <p className="text-slate-300 text-sm leading-relaxed line-clamp-3 sm:line-clamp-4">
              {snippet}
            </p>
          </div>

          {/* Bottom Bar */}
          <div className="pt-6 mt-6 border-t border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-300">
                <User className="w-3.5 h-3.5" />
              </div>
              <span className="font-medium truncate max-w-[130px]">
                {post.author?.displayName || 'Redaksi'}
              </span>
            </div>

            <button
              onClick={() => onSelectPost(post)}
              className="flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 group/btn transition-colors"
            >
              <span>Baca Selengkapnya</span>
              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </article>
    );
  }

  // Standard Grid Card
  return (
    <article className="group flex flex-col justify-between overflow-hidden rounded-xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-900 transition-all duration-200 shadow-md">
      <div>
        {/* Single 16:9 Thumbnail */}
        <div 
          onClick={() => onSelectPost(post)}
          className="relative aspect-video w-full overflow-hidden bg-slate-950 cursor-pointer"
        >
          {thumbnailUrl && !imageFailed ? (
            <img
              src={thumbnailUrl}
              alt={post.title}
              loading="lazy"
              onError={() => setImageFailed(true)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <FallbackImage 
              title={post.title} 
              category={primaryCategory} 
              className="w-full h-full"
            />
          )}

          {/* Bookmark button */}
          {onToggleSave && (
            <button
              onClick={handleBookmarkClick}
              className={`absolute top-2.5 right-2.5 p-2 rounded-lg backdrop-blur-md transition-all z-10 ${
                isSaved 
                  ? 'bg-amber-500 text-slate-950 shadow-md' 
                  : 'bg-slate-950/70 text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
              title={isSaved ? 'Hapus dari tersimpan' : 'Simpan berita'}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
            </button>
          )}
        </div>

        {/* Card Content */}
        <div className="p-4 sm:p-5 space-y-2.5">
          {/* Metadata */}
          <div className="flex items-center gap-2 text-[11px] font-mono">
            <span className="font-bold uppercase tracking-wider text-blue-400">
              {primaryCategory}
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400">
              {formattedDate}
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400">
              {readingTime} mnt
            </span>
          </div>

          {/* Title */}
          <h3 
            onClick={() => onSelectPost(post)}
            className="font-bold text-white group-hover:text-amber-300 transition-colors text-base line-clamp-2 leading-snug cursor-pointer"
          >
            {post.title}
          </h3>

          {/* Excerpt */}
          <p className="text-slate-400 text-xs leading-relaxed line-clamp-3">
            {snippet}
          </p>
        </div>
      </div>

      {/* Footer / Read More Button */}
      <div className="px-4 pb-4 pt-2 flex items-center justify-between border-t border-slate-800/60 mt-auto text-xs">
        <span className="text-[11px] text-slate-400 truncate max-w-[130px]">
          {post.author?.displayName || 'Redaksi'}
        </span>

        <button
          onClick={() => onSelectPost(post)}
          className="flex items-center gap-1 font-semibold text-blue-400 hover:text-amber-300 group/btn transition-colors text-xs"
        >
          <span>Baca Berita</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </article>
  );
};
