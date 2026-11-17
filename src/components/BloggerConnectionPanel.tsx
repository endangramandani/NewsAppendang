import React, { useState } from 'react';
import { 
  Key, 
  Globe, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Save, 
  HelpCircle, 
  ShieldAlert, 
  X, 
  Database,
  ExternalLink,
  Layers,
  Clock
} from 'lucide-react';
import { ConnectionStatus, APIErrorDetail, BloggerBlogInfo } from '../types/blogger';

interface BloggerConnectionPanelProps {
  isOpen: boolean;
  onClose: () => void;
  blogId: string;
  onBlogIdChange: (val: string) => void;
  apiKey: string;
  onApiKeyChange: (val: string) => void;
  connectionStatus: ConnectionStatus;
  onTestConnection: () => Promise<void>;
  onSaveConfiguration: () => void;
  onRefreshNews: () => void;
  isTesting: boolean;
  isRefreshing: boolean;
  totalArticlesLoaded: number;
  lastUpdated: Date | null;
  errorDetail: APIErrorDetail | null;
  blogInfo: BloggerBlogInfo | null;
  saveSuccessMessage?: string | null;
}

export const BloggerConnectionPanel: React.FC<BloggerConnectionPanelProps> = ({
  isOpen,
  onClose,
  blogId,
  onBlogIdChange,
  apiKey,
  onApiKeyChange,
  connectionStatus,
  onTestConnection,
  onSaveConfiguration,
  onRefreshNews,
  isTesting,
  isRefreshing,
  totalArticlesLoaded,
  lastUpdated,
  errorDetail,
  blogInfo,
  saveSuccessMessage
}) => {
  const [showApiKey, setShowApiKey] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  if (!isOpen) return null;

  return (
    <>
      {/* Mobile Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
        onClick={onClose}
      />

      {/* Main Panel */}
      <aside className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-md bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between overflow-y-auto text-slate-900 dark:text-slate-100 transition-colors">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 sticky top-0 z-10 backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-100 dark:bg-blue-900/40 text-[#f05537] dark:text-blue-400 border border-orange-200 dark:border-blue-700/50">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base tracking-tight">
                BLOGGER API CONNECTION
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Google Blogger JSON API v3.0 Integrator
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Tutup Panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 space-y-6 flex-1">
          {/* Status Badge & Health Indicator */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/70 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-slate-500 dark:text-slate-400 font-semibold tracking-wider">
                Status Koneksi
              </span>
              {connectionStatus === 'connected' ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700/60 px-2.5 py-1 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Connected
                </span>
              ) : connectionStatus === 'connecting' ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-700/60 px-2.5 py-1 rounded-full animate-pulse">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Connecting...
                </span>
              ) : connectionStatus === 'error' ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-800 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-700/60 px-2.5 py-1 rounded-full">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Error
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-2.5 py-1 rounded-full">
                  Idle / Belum Diuji
                </span>
              )}
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200 dark:border-slate-800/80 text-xs">
              <div className="bg-white dark:bg-slate-950/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800/60">
                <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-mono">Artikel Dimuat</span>
                <span className="text-lg font-bold text-slate-900 dark:text-white font-mono">{totalArticlesLoaded}</span>
              </div>
              <div className="bg-white dark:bg-slate-950/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800/60">
                <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-mono">Terakhir Diperbarui</span>
                <span className="text-xs font-medium text-slate-700 dark:text-slate-200 mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {lastUpdated ? lastUpdated.toLocaleTimeString('id-ID') : 'Belum pernah'}
                </span>
              </div>
            </div>

            {/* Blog Info if connected */}
            {blogInfo && (
              <div className="mt-2 p-3 rounded-xl bg-orange-50 dark:bg-blue-950/40 border border-orange-200 dark:border-blue-800/40 text-xs text-orange-950 dark:text-blue-200">
                <p className="font-bold text-slate-900 dark:text-blue-100">{blogInfo.name}</p>
                <p className="text-[11px] text-slate-600 dark:text-blue-300 truncate mt-0.5">{blogInfo.url}</p>
                {blogInfo.posts?.totalItems !== undefined && (
                  <p className="text-[10px] text-[#f05537] dark:text-blue-400 mt-1 font-mono font-bold">
                    Total postingan di Blogger: {blogInfo.posts.totalItems} artikel
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Form Inputs */}
          <div className="space-y-4">
            {/* Blog ID Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Blogger Blog ID <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Globe className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={blogId}
                  onChange={(e) => onBlogIdChange(e.target.value)}
                  placeholder="3619052327211751609"
                  className="w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm font-mono pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-800 focus:outline-none focus:border-[#f05537] transition-all"
                />
              </div>
              <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                Default: <span className="font-mono text-slate-700 dark:text-slate-300">rmndninews.blogspot.com</span>
              </p>
            </div>

            {/* API Key Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Blogger API Key <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowGuide(!showGuide)}
                  className="text-[11px] text-[#f05537] dark:text-amber-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  <HelpCircle className="w-3 h-3" />
                  <span>Dapatkan API Key?</span>
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Key className="w-4 h-4" />
                </div>
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => onApiKeyChange(e.target.value)}
                  placeholder="Masukkan Google Cloud API Key Anda"
                  className="w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm font-mono pl-9 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-800 focus:outline-none focus:border-[#f05537] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  aria-label={showApiKey ? 'Sembunyikan API key' : 'Tampilkan API key'}
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                Kunci API gratis dari Google Cloud Console dengan Blogger API v3 diaktifkan.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <button
              onClick={onTestConnection}
              disabled={isTesting}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-[#f05537] hover:bg-[#e04527] text-white font-bold text-sm transition-all shadow-md shadow-orange-500/20 disabled:opacity-50"
            >
              {isTesting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Menguji Koneksi ke Blogger...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>TEST CONNECTION</span>
                </>
              )}
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onSaveConfiguration}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-full bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all"
              >
                <Save className="w-3.5 h-3.5 text-blue-500" />
                <span>SAVE CONFIG</span>
              </button>

              <button
                onClick={onRefreshNews}
                disabled={isRefreshing}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-full bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-[#f05537] ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>REFRESH NEWS</span>
              </button>
            </div>
          </div>

          {/* Save Success Message */}
          {saveSuccessMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{saveSuccessMessage}</span>
            </div>
          )}

          {/* Error Message Box if API fails */}
          {errorDetail && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/80 text-xs space-y-2">
              <div className="flex items-start gap-2 text-rose-800 dark:text-rose-300 font-semibold">
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <span>Kesalahan API {errorDetail.code ? `(${errorDetail.code})` : ''}: {errorDetail.message}</span>
              </div>
              {errorDetail.help && (
                <p className="text-rose-700 dark:text-rose-200/80 text-[11px] leading-relaxed pl-6 border-t border-rose-200 dark:border-rose-900/60 pt-2">
                  <strong>Solusi:</strong> {errorDetail.help}
                </p>
              )}
            </div>
          )}

          {/* Guide Dropdown on How to Get Free Google API Key */}
          {showGuide && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-3">
              <div className="flex items-center justify-between text-[#f05537] dark:text-amber-400 font-bold">
                <span className="flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4" />
                  Panduan Google Cloud Console
                </span>
                <button 
                  onClick={() => setShowGuide(false)}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
                >
                  ✕
                </button>
              </div>
              <ol className="list-decimal pl-4 space-y-1.5 text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                <li>Buka <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline inline-flex items-center gap-0.5">Google Cloud Console <ExternalLink className="w-2.5 h-2.5" /></a> dan buat/pilih Project.</li>
                <li>Masuk ke menu <strong>APIs & Services</strong> &gt; <strong>Library</strong>.</li>
                <li>Cari <strong>Blogger API v3</strong> dan klik tombol <strong>Enable</strong>.</li>
                <li>Pindah ke tab <strong>Credentials</strong> &gt; klik <strong>+ CREATE CREDENTIALS</strong> &gt; pilih <strong>API key</strong>.</li>
                <li>Salin API Key tersebut dan tempel ke kolom di atas.</li>
              </ol>
            </div>
          )}

          {/* Security Guidance Box */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 space-y-2">
            <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Keamanan Kredensial Frontend</span>
            </div>
            <p className="leading-relaxed">
              Konfigurasi ini dikelola di sisi browser. Batasi API Key Anda dengan 
              <strong className="text-slate-800 dark:text-slate-300"> API Restrictions</strong> (Blogger API v3) dan 
              <strong className="text-slate-800 dark:text-slate-300"> HTTP Referrer Restrictions</strong> di Google Cloud Console.
            </p>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 text-center text-[10px] text-slate-500 dark:text-slate-400 font-mono">
          RMNDNI NEWS APP • Blogger API v3.0 Connector
        </div>
      </aside>
    </>
  );
};
