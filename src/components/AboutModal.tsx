import React from 'react';
import { 
  Activity, 
  X, 
  Globe, 
  ShieldCheck, 
  ExternalLink, 
  Layers, 
  Sparkles, 
  Bookmark,
  CloudLightning
} from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col text-slate-900 dark:text-slate-100 transition-colors">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-amber-400">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-blue-950 dark:text-white">Tentang BREAK NEWS</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Portal Berita Gempa Bumi, Cuaca &amp; Edukasi Mitigasi Bencana</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <section className="space-y-2">
            <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Misi &amp; Komitmen Informasi Publik
            </h4>
            <p>
              <strong>BREAK NEWS</strong> adalah portal informasi kebencanaan terpadu yang menyajikan berita aktual seputar aktivitas seismik, peringatan cuaca, mitigasi bencana alam, dan edukasi lingkungan Indonesia serta dunia. Seluruh data artikel disinkronisasi langsung dari Google Blogger JSON API v3.0 tanpa data fiktif.
            </p>
          </section>

          <section className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold mb-1">
                <Activity className="w-4 h-4" />
                <span>Monitoring Seismik Terkini</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pusat data gempa bumi real-time bersumber dari sensor BMKG (Badan Meteorologi, Klimatologi, dan Geofisika) dan jaringan global USGS.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400 font-bold mb-1">
                <CloudLightning className="w-4 h-4" />
                <span>Prakiraan Cuaca Dinamis</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pemantauan suhu, kelembapan, kondisi atmosfer, dan kecepatan angin berbasis model numerik meteorologi terbuka.
              </p>
            </div>
          </section>

          <section className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 space-y-2">
            <div className="flex items-center gap-2 text-blue-900 dark:text-blue-300 font-bold">
              <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Google Blogger JSON API v3.0</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Terhubung langsung ke blog resmi <strong className="text-slate-900 dark:text-white">rmndninews.blogspot.com</strong> (Blog ID: <span className="font-mono text-blue-600 dark:text-amber-300 font-bold">3619052327211751609</span>). Setiap artikel, label kategori, gambar thumbnail, dan isi berita langsung diperbarui saat diterbitkan oleh redaksi.
            </p>
          </section>

          <section className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Keamanan &amp; Integritas</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Konten HTML disanitasi menggunakan DOMPurify sebelum dirender untuk mencegah injeksi skrip berbahaya. Seluruh data bookmark pengguna disimpan secara aman di browser lokal.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between">
          <a
            href="https://rmndninews.blogspot.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline font-bold"
          >
            <span>Kunjungi Blog Sumber Asli</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-bold transition-colors shadow-sm"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
