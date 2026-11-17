import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FilterPillsProps {
  categories: { name: string; count: number }[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  feedFilter: 'for-you' | 'latest' | 'trending';
  onChangeFeedFilter: (filter: 'for-you' | 'latest' | 'trending') => void;
}

export const FilterPills: React.FC<FilterPillsProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  feedFilter,
  onChangeFeedFilter
}) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const filterLabels = {
    'for-you': 'For You',
    'latest': 'Latest',
    'trending': 'Trending'
  };

  return (
    <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none py-2 select-none">
      {/* For You Dropdown pill */}
      <div className="relative shrink-0">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors shadow-sm"
        >
          <span>{filterLabels[feedFilter]}</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </button>

        {showDropdown && (
          <>
            <div 
              className="fixed inset-0 z-30" 
              onClick={() => setShowDropdown(false)} 
            />
            <div className="absolute top-full left-0 mt-2 w-36 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1.5 z-40 text-xs">
              <button
                onClick={() => {
                  onChangeFeedFilter('for-you');
                  setShowDropdown(false);
                }}
                className={`w-full text-left px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                  feedFilter === 'for-you' ? 'text-[#f05537] font-bold' : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                For You
              </button>
              <button
                onClick={() => {
                  onChangeFeedFilter('latest');
                  setShowDropdown(false);
                }}
                className={`w-full text-left px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                  feedFilter === 'latest' ? 'text-[#f05537] font-bold' : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                Latest News
              </button>
              <button
                onClick={() => {
                  onChangeFeedFilter('trending');
                  setShowDropdown(false);
                }}
                className={`w-full text-left px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                  feedFilter === 'trending' ? 'text-[#f05537] font-bold' : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                Trending Votes
              </button>
            </div>
          </>
        )}
      </div>

      {/* "All" Orange Pill Button matching screenshot */}
      <button
        onClick={() => onSelectCategory('Semua Berita')}
        className={`shrink-0 px-5 py-2 rounded-full text-xs font-bold transition-all shadow-sm ${
          selectedCategory === 'Semua Berita'
            ? 'bg-[#f05537] text-white shadow-orange-500/30 shadow-md scale-105'
            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 hover:border-slate-300'
        }`}
      >
        All
      </button>

      {/* Dynamic Category Pills */}
      {categories.map((cat) => {
        const isSelected = selectedCategory.toLowerCase() === cat.name.toLowerCase();
        return (
          <button
            key={cat.name}
            onClick={() => onSelectCategory(cat.name)}
            className={`shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
              isSelected
                ? 'bg-[#f05537] text-white shadow-orange-500/30 shadow-md scale-105'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 hover:border-slate-300'
            }`}
          >
            {cat.name}
          </button>
        );
      })}
    </div>
  );
};
