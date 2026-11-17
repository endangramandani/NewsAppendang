import React from 'react';
import { Newspaper } from 'lucide-react';

interface FallbackImageProps {
  title?: string;
  category?: string;
  className?: string;
}

export const FallbackImage: React.FC<FallbackImageProps> = ({ 
  title, 
  category, 
  className = "w-full h-full" 
}) => {
  return (
    <div className={`relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 flex flex-col justify-between p-6 select-none border border-slate-800/80 ${className}`}>
      {/* Background Editorial Graphic Pattern */}
      <svg className="absolute inset-0 w-full h-full opacity-15 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="editorial-grid" width="28" height="28" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="currentColor" className="text-blue-400" />
            <path d="M 28 0 L 0 0 0 28" fill="none" stroke="currentColor" strokeWidth="0.4" className="text-slate-700" />
          </pattern>
          <linearGradient id="news-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#6366f1" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0.8" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#editorial-grid)" />
        <path
          d="M 0 100 Q 150 40, 300 110 T 600 70"
          fill="none"
          stroke="url(#news-grad)"
          strokeWidth="3"
        />
      </svg>

      {/* Top Header Badge */}
      <div className="relative z-10 flex items-center justify-between text-xs font-semibold tracking-wider text-slate-300">
        <span className="flex items-center gap-1.5 text-blue-400 font-mono">
          <Newspaper className="w-3.5 h-3.5 text-amber-400" />
          <span>DIGITAL NEWS BULLETIN</span>
        </span>
        <span className="text-[10px] text-slate-400 font-mono tracking-widest">RMNDNI MEDIA</span>
      </div>

      {/* Center Topic Preview */}
      <div className="relative z-10 my-auto text-center py-4">
        <div className="inline-block p-3 rounded-2xl bg-slate-800/90 border border-slate-700/70 shadow-lg mb-3">
          <Newspaper className="w-8 h-8 text-amber-400 mx-auto" />
        </div>
        <p className="text-xs uppercase tracking-widest text-blue-400 font-bold mb-1">
          {category || 'BERITA TERKINI'}
        </p>
        <h4 className="text-sm font-semibold text-slate-100 line-clamp-2 max-w-sm mx-auto px-2 leading-relaxed">
          {title || 'RMNDNI NEWS — Warta & Informasi Terpercaya'}
        </h4>
      </div>

      {/* Bottom Identity */}
      <div className="relative z-10 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2 font-mono">
        <span className="text-slate-300 font-semibold tracking-tight">NEWS APP</span>
        <span className="text-slate-400">rmndninews.blogspot.com</span>
      </div>
    </div>
  );
};
