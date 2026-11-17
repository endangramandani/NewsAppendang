import React, { useState, useEffect } from 'react';
import { BloggerPost } from '../types/blogger';
import { extractPrimaryThumbnail, calculateReadingTime } from '../services/bloggerService';
import { FallbackImage } from './FallbackImage';
import { Calendar, Clock, Bookmark, ArrowRight, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';

interface HeroFeaturedCardProps {
  post: BloggerPost;
  onSelectPost: (post: BloggerPost) => void;
  isSaved?: boolean;
  onToggleSave?: (post: BloggerPost) => void;
  allHeroPosts?: BloggerPost[];
  currentHeroIndex?: number;
  onSelectHeroIndex?: (index: number) => void;
}

export const HeroFeaturedCard: React.FC<HeroFeaturedCardProps> = ({
  post,
  onSelectPost,
  isSaved = false,
  onToggleSave,
  allHeroPosts = [],
  currentHeroIndex = 0,
  onSelectHeroIndex
}) => {
  const [imageFailed, setImageFailed] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  const thumbnailUrl = extractPrimaryThumbnail(post);
  const primaryCategory = post.labels && post.labels.length > 0 ? post.labels[0] : 'Berita Utama';
  const authorName = post.author?.displayName || 'Redaksi SEISMO WEATHER';
  const readingTime = calculateReadingTime(post.content);

  const formattedDate = new Date(post.published).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  // Auto slide timer (every 5 seconds)
  useEffect(() => {
    if (!allHeroPosts || allHeroPosts.length <= 1 || isPaused || !onSelectHeroIndex) return;

    const timer = setInterval(() => {
      const nextIdx = (currentHeroIndex + 1) % allHeroPosts.length;
      onSelectHeroIndex(nextIdx);
      setImageFailed(false);
    }, 5000);

    return () => clearInterval(timer);
  }, [allHeroPosts, currentHeroIndex, isPaused, onSelectHeroIndex]);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSelectHeroIndex && allHeroPosts.length > 1) {
      const newIndex = (currentHeroIndex - 1 + allHeroPosts.length) % allHeroPosts.length;
      onSelectHeroIndex(newIndex);
      setImageFailed(false);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSelectHeroIndex && allHeroPosts.length > 1) {
      const newIndex = (currentHeroIndex + 1) % allHeroPosts.length;
      onSelectHeroIndex(newIndex);
      setImageFailed(false);
    }
  };

  return (
    <div 
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative w-full rounded-[2rem] overflow-hidden shadow-xl bg-slate-900 aspect-[4/5] sm:aspect-[16/10] md:aspect-[16/9] max-h-[480px] group select-none transition-all duration-500"
    >
      {/* Background Image / Hero Media with Slide Fade Transition */}
      <div className="absolute inset-0 w-full h-full animate-in fade-in duration-300">
        {thumbnailUrl && !imageFailed ? (
          <img
            key={post.id}
            src={thumbnailUrl}
            alt={post.title}
            onError={() => setImageFailed(true)}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
          />
        ) : (
          <FallbackImage 
            title={post.title} 
            category={primaryCategory} 
            className="w-full h-full"
          />
        )}
        {/* Cinematic Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-black/30" />
      </div>

      {/* Slide Navigation Arrow Buttons */}
      {allHeroPosts.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 backdrop-blur-md opacity-80 group-hover:opacity-100 transition-all shadow-lg hover:scale-105"
            aria-label="Berita Sebelumnya"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 backdrop-blur-md opacity-80 group-hover:opacity-100 transition-all shadow-lg hover:scale-105"
            aria-label="Berita Berikutnya"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Top Bar on Hero Image */}
      <div className="absolute top-4 sm:top-6 left-4 sm:left-6 right-4 sm:right-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          {/* Category Badge Pill */}
          <span className="px-3.5 py-1 rounded-full bg-blue-600/90 backdrop-blur-md text-xs font-bold text-white shadow-sm border border-blue-400/40 uppercase tracking-wider">
            {primaryCategory}
          </span>

          {/* Author Badge Pill */}
          <span className="hidden sm:inline-block px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-[11px] font-semibold text-white/90 border border-white/10">
            {authorName}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Bookmark Save Button */}
          {onToggleSave && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleSave(post);
              }}
              className={`p-2 rounded-full backdrop-blur-md transition-all ${
                isSaved 
                  ? 'bg-amber-400 text-slate-950 shadow-lg' 
                  : 'bg-black/60 text-white hover:bg-black/90 border border-white/10'
              }`}
              title={isSaved ? 'Hapus dari tersimpan' : 'Simpan berita'}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
            </button>
          )}

          {post.url && (
            <a
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-2 rounded-full bg-black/60 hover:bg-black/90 text-white/90 border border-white/10 backdrop-blur-md transition-colors"
              title="Buka di Blogger asli"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>

      {/* Center/Bottom Content */}
      <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6 z-10 space-y-3.5">
        {/* Metadata info */}
        <div className="flex items-center gap-3 text-xs font-mono text-slate-300">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            {formattedDate}
          </span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-sky-400" />
            {readingTime} mnt baca
          </span>
          {allHeroPosts.length > 1 && (
            <>
              <span>·</span>
              <span className="text-amber-300 font-bold">
                Slide {currentHeroIndex + 1} dari {allHeroPosts.length} {isPaused && '(Dijeda)'}
              </span>
            </>
          )}
        </div>

        {/* Headline Title */}
        <h2 
          onClick={() => onSelectPost(post)}
          className="text-lg sm:text-2xl md:text-3xl font-extrabold text-white leading-tight cursor-pointer line-clamp-3 hover:text-amber-300 transition-colors drop-shadow-md"
        >
          {post.title}
        </h2>

        {/* Bottom Actions Row */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onSelectPost(post)}
              className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-white text-slate-950 font-bold text-xs sm:text-sm hover:bg-amber-300 active:scale-95 transition-all shadow-lg"
            >
              <span>Baca Selengkapnya</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {/* Carousel Dots */}
            {allHeroPosts.length > 1 && (
              <div className="flex items-center gap-1.5 px-2 bg-black/40 backdrop-blur-md py-1.5 rounded-full border border-white/10">
                {allHeroPosts.slice(0, 4).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      if (onSelectHeroIndex) onSelectHeroIndex(idx);
                      setImageFailed(false);
                    }}
                    className={`rounded-full transition-all ${
                      idx === currentHeroIndex 
                        ? 'w-5 h-1.5 bg-amber-400' 
                        : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/70'
                    }`}
                    aria-label={`Slide ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
            Sumber: rmndninews
          </span>
        </div>
      </div>
    </div>
  );
};
