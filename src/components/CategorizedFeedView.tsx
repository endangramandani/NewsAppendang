import React from 'react';
import { BloggerPost } from '../types/blogger';
import { TrendingCard } from './TrendingCard';

interface CategorizedFeedViewProps {
  posts: BloggerPost[];
  categories: { name: string; count: number }[];
  onSelectPost: (post: BloggerPost) => void;
  savedPostIds: Set<string>;
  onToggleSavePost: (post: BloggerPost) => void;
  onSelectCategory: (cat: string) => void;
}

export const CategorizedFeedView: React.FC<CategorizedFeedViewProps> = ({
  posts,
  categories,
  onSelectPost,
  savedPostIds,
  onToggleSavePost,
  onSelectCategory
}) => {
  const activeCategories = categories.filter(c => c.name !== 'Semua Berita' && c.name !== 'Tersimpan' && c.count > 0);

  return (
    <div className="space-y-10">
      {activeCategories.map((cat) => {
        const catPosts = posts.filter(p => p.labels?.some(l => l.trim().toLowerCase() === cat.name.toLowerCase()));
        if (catPosts.length === 0) return null;

        return (
          <div key={cat.name} className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-600" />
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base sm:text-lg">
                  {cat.name}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-mono">
                  {catPosts.length}
                </span>
              </div>
              <button
                onClick={() => onSelectCategory(cat.name)}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Lihat Semua →
              </button>
            </div>

            <div className="space-y-3.5">
              {catPosts.slice(0, 3).map((post) => (
                <TrendingCard
                  key={post.id}
                  post={post}
                  onSelectPost={onSelectPost}
                  isSaved={savedPostIds.has(post.id)}
                  onToggleSave={onToggleSavePost}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
