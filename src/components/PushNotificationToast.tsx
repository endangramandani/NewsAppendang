import React, { useState, useEffect, useRef } from 'react';
import { BloggerPost } from '../types/blogger';
import { Bell, X, ArrowRight, Sparkles } from 'lucide-react';
import { playAlertBeep } from '../services/oneSignalService';

interface PushNotificationToastProps {
  latestPost: BloggerPost | null;
  onSelectPost: (post: BloggerPost) => void;
  durationMs?: number;
}

export const PushNotificationToast: React.FC<PushNotificationToastProps> = ({
  latestPost,
  onSelectPost,
  durationMs = 6000
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(100);
  const lastPostIdRef = useRef<string | null>(null);

  // Trigger notification when latestPost appears or changes
  useEffect(() => {
    if (!latestPost || !latestPost.id) return;

    // Show notification if it's the first time or a different post
    if (lastPostIdRef.current !== latestPost.id) {
      lastPostIdRef.current = latestPost.id;
      setIsVisible(true);
      setProgress(100);

      // Play soft chime alert
      try {
        playAlertBeep();
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          navigator.vibrate([80, 40, 80]);
        }
      } catch {
        // Ignore audio restrictions
      }
    }
  }, [latestPost]);

  // Countdown timer to auto-hide after durationMs
  useEffect(() => {
    if (!isVisible || isPaused) return;

    const intervalTime = 50;
    const step = (intervalTime / durationMs) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev - step;
        if (next <= 0) {
          clearInterval(timer);
          setIsVisible(false);
          return 0;
        }
        return next;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isVisible, isPaused, durationMs]);

  if (!isVisible || !latestPost) {
    return null;
  }

  const categoryName = latestPost.labels && latestPost.labels.length > 0 
    ? latestPost.labels[0] 
    : 'Berita Terkini';

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white border border-blue-500/50 shadow-xl animate-in slide-in-from-top-3 fade-in duration-300 transition-all cursor-pointer"
      onClick={() => onSelectPost(latestPost)}
    >
      <div className="p-3 sm:p-3.5 flex items-start sm:items-center justify-between gap-3">
        {/* Bell Icon with Ripple Animation */}
        <div className="relative shrink-0 mt-0.5 sm:mt-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-600/80 border border-blue-400/40 flex items-center justify-center text-amber-300 shadow-md">
            <Bell className="w-4 h-4 animate-bounce" />
          </div>
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
          </span>
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1 space-y-0.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-400 text-slate-950 text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider">
              <Sparkles className="w-2.5 h-2.5" />
              <span>Berita Baru</span>
            </span>
            <span className="text-[10px] font-mono text-blue-300 uppercase tracking-wider truncate">
              {categoryName}
            </span>
            <span className="text-[10px] text-blue-200/60 hidden sm:inline">
              · Baru Saja
            </span>
          </div>

          <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-1 leading-snug group-hover:text-amber-300 transition-colors">
            {latestPost.title}
          </h4>
        </div>

        {/* Action Button & Close */}
        <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onSelectPost(latestPost)}
            className="px-2.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-[11px] font-bold shadow-sm transition-all flex items-center gap-1 active:scale-95"
          >
            <span>Baca</span>
            <ArrowRight className="w-3 h-3" />
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="p-1.5 text-blue-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Tutup notifikasi"
            title="Tutup notifikasi"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Countdown Progress Bar (Disappears in few seconds) */}
      <div className="h-1 w-full bg-slate-800/80 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-400 via-amber-300 to-amber-400 transition-all duration-75 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
