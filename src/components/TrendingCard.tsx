import React, { useState } from 'react';
import { BloggerPost } from '../types/blogger';
import { extractPrimaryThumbnail, calculateReadingTime, createTextSnippet } from '../services/bloggerService';
import { FallbackImage } from './FallbackImage';
import { Calendar, Clock, Bookmark, ArrowRight, ExternalLink } from 'lucide-react';
import { formatRelativeTime } from '../utils/newsUtils';

interface TrendingCardProps {
  post: BloggerPost;
  onSelectPost: (post: BloggerPost) => void;
  isSaved?: boolean;
  onToggleSave?: (post: BloggerPost) => void;
}

export const TrendingCard: React.FC<TrendingCardProps> = ({
  post,
  onSelectPost,
  isSaved = false,
  onToggleSave
}) => {
  const [imageFailed, setImageFailed] = useState(false);
  const thumbnailUrl = extractPrimaryThumbnail(post);
  const primaryCategory = post.labels && post.labels.length > 0 ? post.labels[0] : 'Berita';
  const authorName = post.author?.displayName || 'Redaksi SEISMO';
  const relativeTime = formatRelativeTime(post.published);
  const readingTime = calculateReadingTime(post.content);
  const snippet = createTextSnippet(post.content, 110);

  const formattedDate = new Date(post.published).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <article className="group relative rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md dark:hover:border-slate-700 transition-all duration-300 p-4 flex flex-col justify-between">
      {/* Top Section: Single 16:9 Thumbnail + Details */}
      <div className="flex flex-col sm:flex-row items-start gap-4">
        {/* Left Thumbnail (Single Image) */}
        <div 
          onClick={() => onSelectPost(post)}
          className="relative w-full sm:w-36 h-40 sm:h-28 rounded-2xl overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-950 cursor-pointer shadow-sm"
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
              className="w-full h-full text-[8px]"
            />
          )}

          {/* Genuine Category Tag on Thumbnail */}
          <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-md text-white font-bold text-[10px] shadow border border-white/10 uppercase tracking-wider">
            {primaryCategory}
          </div>
        </div>

        {/* Right Details */}
        <div className="flex-1 min-w-0 flex flex-col justify-between h-full space-y-2">
          <div>
            {/* Publication Date & Relative Time */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1 font-mono text-[11px]">
                <Calendar className="w-3 h-3 text-amber-500" />
                {formattedDate}
              </span>
              <span>·</span>
              <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                {relativeTime}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1 text-[11px] font-mono">
                <Clock className="w-3 h-3 text-blue-500" />
                {readingTime} mnt
              </span>
            </div>

            {/* Title */}
            <h3 
              onClick={() => onSelectPost(post)}
              className="font-bold text-slate-900 dark:text-white text-base leading-snug line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-amber-400 transition-colors cursor-pointer mt-1"
            >
              {post.title}
            </h3>

            {/* Clean summary */}
            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed mt-1">
              {snippet}
            </p>
          </div>

          {/* Author */}
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Penulis: <span className="text-slate-800 dark:text-slate-300 font-medium">{authorName}</span>
          </p>
        </div>
      </div>

      {/* Bottom Editorial Bar */}
      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
        <button
          onClick={() => onSelectPost(post)}
          className="flex items-center gap-1 font-bold text-blue-600 dark:text-amber-400 hover:text-blue-700 dark:hover:text-amber-300 transition-colors text-xs"
        >
          <span>Baca Selengkapnya</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>

        <div className="flex items-center gap-2">
          {post.url && (
            <a
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              title="Buka artikel asli di Blogger"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}

          {onToggleSave && (
            <button
              onClick={() => onToggleSave(post)}
              className={`p-1.5 rounded-lg transition-colors ${
                isSaved ? 'text-amber-500' : 'text-slate-400 hover:text-slate-700 dark:hover:text-white'
              }`}
              title={isSaved ? 'Hapus bookmark' : 'Simpan berita'}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
            </button>
          )}
        </div>
      </div>
    </article>
  );
};
