import React from 'react';
import { BloggerPost } from '../types/blogger';
import { extractPrimaryThumbnail, calculateReadingTime } from '../services/bloggerService';
import { FallbackImage } from './FallbackImage';
import { Calendar, Clock, Bookmark, ArrowRight } from 'lucide-react';

interface LatestFourNewsProps {
  posts: BloggerPost[];
  onSelectPost: (post: BloggerPost) => void;
  savedPostIds?: Set<string>;
  onToggleSave?: (post: BloggerPost) => void;
}

export const LatestFourNews: React.FC<LatestFourNewsProps> = ({
  posts,
  onSelectPost,
  savedPostIds = new Set(),
  onToggleSave
}) => {
  if (!posts || posts.length === 0) return null;

  const fourPosts = posts.slice(0, 4);
  const mainPost = fourPosts[0];
  const sidePosts = fourPosts.slice(1, 4);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-extrabold text-slate-900 dark:text-white text-base sm:text-lg flex items-center gap-2">
          <span>🔥 4 Berita Terbaru</span>
        </h3>
        <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
          Update Terkini
        </span>
      </div>

      {/* Main Feature + 3 Side/Bottom Stack */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Main Latest Post (Col 7) */}
        {mainPost && (
          <div 
            onClick={() => onSelectPost(mainPost)}
            className="md:col-span-7 group relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-lg cursor-pointer flex flex-col justify-between aspect-[16/10] md:aspect-[16/9]"
          >
            <div className="absolute inset-0">
              {(() => {
                const thumb = extractPrimaryThumbnail(mainPost);
                return thumb ? (
                  <img
                    src={thumb}
                    alt={mainPost.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <FallbackImage title={mainPost.title} category={mainPost.labels?.[0] || 'Berita'} className="w-full h-full" />
                );
              })()}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
            </div>

            {/* Top badge */}
            <div className="relative z-10 p-4 sm:p-5 flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-bold uppercase tracking-wider">
                {mainPost.labels?.[0] || 'Utama'}
              </span>
              {onToggleSave && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleSave(mainPost);
                  }}
                  className={`p-2 rounded-xl backdrop-blur-md transition-all ${
                    savedPostIds.has(mainPost.id) 
                      ? 'bg-amber-400 text-slate-950' 
                      : 'bg-black/60 text-white hover:bg-black/90'
                  }`}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${savedPostIds.has(mainPost.id) ? 'fill-current' : ''}`} />
                </button>
              )}
            </div>

            {/* Bottom info */}
            <div className="relative z-10 p-4 sm:p-6 space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                <span>{new Date(mainPost.published).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                <span>·</span>
                <span>{calculateReadingTime(mainPost.content)} mnt baca</span>
              </div>
              <h4 className="text-base sm:text-xl font-extrabold text-white group-hover:text-amber-300 transition-colors line-clamp-2 leading-snug">
                {mainPost.title}
              </h4>
            </div>
          </div>
        )}

        {/* 3 Secondary Latest Posts (Col 5) */}
        <div className="md:col-span-5 flex flex-col gap-3 justify-between">
          {sidePosts.map((post) => {
            const thumb = extractPrimaryThumbnail(post);
            const isSaved = savedPostIds.has(post.id);
            return (
              <div
                key={post.id}
                onClick={() => onSelectPost(post)}
                className="group flex items-center gap-3.5 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-700 transition-all cursor-pointer shadow-sm"
              >
                <div className="relative w-24 h-20 sm:w-28 sm:h-20 rounded-xl overflow-hidden bg-slate-950 shrink-0">
                  {thumb ? (
                    <img src={thumb} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  ) : (
                    <FallbackImage title={post.title} category={post.labels?.[0] || 'Berita'} className="w-full h-full" />
                  )}
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 text-[10px] font-mono text-blue-600 dark:text-blue-400 font-bold uppercase">
                    <span>{post.labels?.[0] || 'Warta'}</span>
                    <span>·</span>
                    <span className="text-slate-400">{new Date(post.published).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                  </div>
                  <h5 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-amber-500 dark:group-hover:text-amber-300 transition-colors line-clamp-2 leading-snug">
                    {post.title}
                  </h5>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
