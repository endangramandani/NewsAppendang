import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Activity, 
  CloudLightning, 
  Newspaper,
  Volume2,
  CheckCheck,
  Trash2,
  ArrowRight,
  Radio,
  SlidersHorizontal
} from 'lucide-react';
import { BloggerPost } from '../types/blogger';
import { 
  getSavedOneSignalAppId, 
  saveOneSignalAppId, 
  initOneSignal, 
  getPushPermissionStatus, 
  subscribeToPushNotifications, 
  unsubscribeFromPushNotifications, 
  sendLocalTestNotification,
  updateNotificationTopics,
  playAlertBeep,
  PushPermissionStatus 
} from '../services/oneSignalService';
import { fetchLatestEarthquake, fetchCurrentWeather, EarthquakeData, WeatherData } from '../services/disasterService';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  posts?: BloggerPost[];
  onSelectPost?: (post: BloggerPost) => void;
  readNotificationIds?: Set<string>;
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  onClearNotifications?: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({ 
  isOpen, 
  onClose,
  posts = [],
  onSelectPost,
  readNotificationIds = new Set(),
  onMarkAsRead,
  onMarkAllAsRead,
  onClearNotifications
}) => {
  const [activeTab, setActiveTab] = useState<'inbox' | 'settings'>('inbox');
  const [filterType, setFilterType] = useState<'all' | 'news' | 'disaster' | 'weather'>('all');
  
  // Disaster telemetry state for live alert items
  const [earthquake, setEarthquake] = useState<EarthquakeData | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);

  // OneSignal Push settings state
  const [appId, setAppId] = useState<string>(() => getSavedOneSignalAppId());
  const [permission, setPermission] = useState<PushPermissionStatus>('default');
  const [isSubscribing, setIsSubscribing] = useState<boolean>(false);
  const [testSent, setTestSent] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [topics, setTopics] = useState({
    earthquakes: true,
    weather: true,
    breakingNews: true
  });

  const checkStatus = () => {
    setPermission(getPushPermissionStatus());
  };

  useEffect(() => {
    if (isOpen) {
      checkStatus();
      if (appId.trim()) {
        initOneSignal(appId.trim());
      }
      // Load live telemetry for notification feed
      fetchLatestEarthquake().then(setEarthquake).catch(() => {});
      fetchCurrentWeather().then(setWeather).catch(() => {});
    }
  }, [isOpen, appId]);

  if (!isOpen) return null;

  // Build notification items list
  const newsNotifications = posts.slice(0, 15).map((post) => {
    const isRead = readNotificationIds.has(post.id);
    const category = post.labels?.[0] || 'Berita';
    const isDisasterRelated = post.title.toLowerCase().includes('gempa') || 
      post.title.toLowerCase().includes('tsunami') || 
      post.title.toLowerCase().includes('bencana') ||
      post.title.toLowerCase().includes('gunung');
    const isWeatherRelated = post.title.toLowerCase().includes('cuaca') || 
      post.title.toLowerCase().includes('hujan') || 
      post.title.toLowerCase().includes('angin') ||
      post.title.toLowerCase().includes('banjir');

    return {
      id: post.id,
      type: isDisasterRelated ? 'disaster' : isWeatherRelated ? 'weather' : 'news',
      title: post.title,
      category,
      date: new Date(post.published).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }),
      isRead,
      post
    };
  });

  // Filter items based on selected tab filter
  const filteredNotifications = newsNotifications.filter((item) => {
    if (filterType === 'all') return true;
    if (filterType === 'news') return item.type === 'news';
    if (filterType === 'disaster') return item.type === 'disaster';
    if (filterType === 'weather') return item.type === 'weather';
    return true;
  });

  const unreadCount = newsNotifications.filter(n => !n.isRead).length;

  const handleSubscribe = async () => {
    setIsSubscribing(true);
    setStatusMessage(null);
    try {
      const granted = await subscribeToPushNotifications();
      checkStatus();
      if (granted) {
        setStatusMessage('✓ Push Notifikasi berhasil diaktifkan! Anda akan menerima peringatan gempa & cuaca.');
        await updateNotificationTopics(topics);
      } else {
        setStatusMessage('Izin notifikasi belum diizinkan atau diblokir pada browser Anda.');
      }
    } catch {
      setStatusMessage('Gagal meminta izin notifikasi browser.');
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleUnsubscribe = async () => {
    await unsubscribeFromPushNotifications();
    setStatusMessage('Notifikasi telah dinonaktifkan.');
    checkStatus();
  };

  const handleSaveAppId = async () => {
    saveOneSignalAppId(appId);
    if (appId.trim()) {
      await initOneSignal(appId.trim());
      setStatusMessage('✓ OneSignal App ID berhasil disimpan.');
    } else {
      setStatusMessage('OneSignal App ID dihapus.');
    }
  };

  const handleSendTest = async () => {
    playAlertBeep();
    const success = await sendLocalTestNotification(
      'PERINGATAN DINI GEMPA M 5.2 - BREAK NEWS',
      'BMKG: Gempa bumi M 5.2 terjadi di kedalaman 10 km. Waspada potensi gempa susulan.'
    );
    if (success) {
      setTestSent(true);
      setStatusMessage('✓ Notifikasi uji coba berhasil dikirim ke layar & suara alert berbunyi!');
      setTimeout(() => setTestSent(false), 4500);
    } else {
      setStatusMessage('Mohon izinkan notifikasi browser terlebih dahulu.');
    }
  };

  const handleNotificationClick = (item: typeof newsNotifications[0]) => {
    if (onMarkAsRead) {
      onMarkAsRead(item.id);
    }
    if (item.post && onSelectPost) {
      onSelectPost(item.post);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col text-slate-900 dark:text-slate-100 transition-colors max-h-[92vh]">
        
        {/* Header with Title and Close Button */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-amber-400 p-0.5 shadow-md">
              <div className="w-full h-full bg-white dark:bg-slate-950 rounded-[14px] flex items-center justify-center text-blue-600 dark:text-amber-400">
                <Bell className="w-5 h-5 animate-bounce" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white leading-tight">
                  Pusat Notifikasi
                </h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                    {unreadCount} baru
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Kotak masuk berita dan peringatan dini kebencanaan
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs: Kotak Masuk vs Pengaturan Push */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 pt-2">
          <button
            onClick={() => setActiveTab('inbox')}
            className={`flex items-center gap-2 py-2.5 px-4 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'inbox'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Kotak Masuk Notifikasi</span>
            {unreadCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 py-2.5 px-4 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'settings'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Pengaturan Push</span>
          </button>
        </div>

        {/* Tab 1: Kotak Masuk (All Notifications Go Here) */}
        {activeTab === 'inbox' && (
          <div className="flex-1 overflow-y-auto flex flex-col p-4 sm:p-5 space-y-4">
            {/* Filter Pills + Action Buttons */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-3 py-1 rounded-full font-bold transition-all ${
                    filterType === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  Semua ({newsNotifications.length})
                </button>
                <button
                  onClick={() => setFilterType('news')}
                  className={`px-3 py-1 rounded-full font-bold transition-all ${
                    filterType === 'news'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  Berita
                </button>
                <button
                  onClick={() => setFilterType('disaster')}
                  className={`px-3 py-1 rounded-full font-bold transition-all ${
                    filterType === 'disaster'
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  Gempa
                </button>
                <button
                  onClick={() => setFilterType('weather')}
                  className={`px-3 py-1 rounded-full font-bold transition-all ${
                    filterType === 'weather'
                      ? 'bg-sky-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  Cuaca
                </button>
              </div>

              {/* Mark All Read & Clear Buttons */}
              <div className="flex items-center gap-2">
                {unreadCount > 0 && onMarkAllAsRead && (
                  <button
                    onClick={onMarkAllAsRead}
                    className="flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
                    title="Tandai semua sudah dibaca"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Tandai Semua Dibaca</span>
                  </button>
                )}
                {onClearNotifications && (
                  <button
                    onClick={onClearNotifications}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Hapus riwayat notifikasi"
                    aria-label="Hapus riwayat notifikasi"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Live Disaster Alert Pin (BMKG) */}
            {earthquake && (filterType === 'all' || filterType === 'disaster') && (
              <div className="p-3.5 rounded-2xl bg-rose-50/90 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 flex items-start gap-3 shadow-sm">
                <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md">
                  <Activity className="w-4 h-4 animate-pulse" />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded-md bg-rose-600 text-white text-[9px] font-extrabold uppercase font-mono">
                      LIVE BMKG
                    </span>
                    <span className="text-[11px] font-bold text-rose-700 dark:text-rose-300 font-mono">
                      {earthquake.magnitude}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 ml-auto">
                      {earthquake.datetime}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                    {earthquake.location}
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                    Kedalaman {earthquake.depth} · {earthquake.potential || 'Tidak berpotensi tsunami'}
                  </p>
                </div>
              </div>
            )}

            {/* Live Weather Alert Pin */}
            {weather && (filterType === 'all' || filterType === 'weather') && (
              <div className="p-3.5 rounded-2xl bg-sky-50/90 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-900/60 flex items-start gap-3 shadow-sm">
                <div className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-md">
                  <CloudLightning className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded-md bg-sky-600 text-white text-[9px] font-extrabold uppercase font-mono">
                      CUACA
                    </span>
                    <span className="text-[11px] font-bold text-sky-700 dark:text-sky-300 font-mono">
                      {weather.temperature}°C
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 ml-auto font-mono">
                      {weather.city}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                    Kondisi: {weather.condition}
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                    Kelembapan {weather.humidity}% · Kecepatan Angin {weather.windSpeed} km/j
                  </p>
                </div>
              </div>
            )}

            {/* Notification Items List from Blogger */}
            {filteredNotifications.length > 0 ? (
              <div className="space-y-2.5">
                {filteredNotifications.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleNotificationClick(item)}
                    className={`group p-3 sm:p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                      !item.isRead 
                        ? 'bg-blue-50/60 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/60 shadow-sm' 
                        : 'bg-white dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    {/* Icon */}
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-sm ${
                      item.type === 'disaster' 
                        ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400' 
                        : item.type === 'weather'
                        ? 'bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400'
                        : 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                    }`}>
                      {item.type === 'disaster' ? (
                        <Activity className="w-4 h-4" />
                      ) : item.type === 'weather' ? (
                        <CloudLightning className="w-4 h-4" />
                      ) : (
                        <Newspaper className="w-4 h-4" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-mono uppercase font-bold text-blue-600 dark:text-blue-400 truncate">
                          {item.category}
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[10px] font-mono text-slate-400">
                            {item.date}
                          </span>
                          {!item.isRead && (
                            <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" title="Belum dibaca" />
                          )}
                        </div>
                      </div>

                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                        {item.title}
                      </h4>
                    </div>

                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 shrink-0 mt-1 transition-colors" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                  <Bell className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Tidak Ada Notifikasi
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                  Semua notifikasi dalam kategori ini telah dibaca atau belum ada berita baru.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Pengaturan Push & OneSignal */}
        {activeTab === 'settings' && (
          <div className="p-4 sm:p-5 space-y-5 overflow-y-auto text-sm">
            {/* Status Badge */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-mono uppercase text-slate-500 dark:text-slate-400 block font-semibold">
                  Status Izin Perangkat
                </span>
                <span className="text-sm font-bold flex items-center gap-1.5 mt-0.5">
                  {permission === 'granted' ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span className="text-emerald-700 dark:text-emerald-400">Aktif (Izin Diberikan)</span>
                    </>
                  ) : permission === 'denied' ? (
                    <>
                      <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                      <span className="text-rose-700 dark:text-rose-400">Diblokir di Pengaturan Browser</span>
                    </>
                  ) : (
                    <>
                      <Radio className="w-4 h-4 text-amber-500 shrink-0" />
                      <span className="text-amber-700 dark:text-amber-400">Belum Diaktifkan</span>
                    </>
                  )}
                </span>
              </div>

              {permission === 'granted' ? (
                <button
                  onClick={handleUnsubscribe}
                  className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 transition-colors shrink-0"
                >
                  Nonaktifkan
                </button>
              ) : (
                <button
                  onClick={handleSubscribe}
                  disabled={isSubscribing}
                  className="px-4 py-2 rounded-full text-xs font-bold bg-[#f05537] hover:bg-[#d8482d] text-white shadow-md shadow-orange-500/20 transition-all disabled:opacity-50 shrink-0"
                >
                  {isSubscribing ? 'Meminta Izin...' : 'Aktifkan Sekarang'}
                </button>
              )}
            </div>

            {/* Feedback message */}
            {statusMessage && (
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-200 animate-in fade-in">
                {statusMessage}
              </div>
            )}

            {/* Test Sound & Notification Button */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Volume2 className="w-4 h-4 text-amber-500 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Uji Nada &amp; Notifikasi</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Kirim notifikasi simulasi ke layar</p>
                </div>
              </div>
              <button
                onClick={handleSendTest}
                className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold shadow-sm transition-all active:scale-95 shrink-0"
              >
                {testSent ? 'Terkirim!' : 'Kirim Uji Coba'}
              </button>
            </div>

            {/* OneSignal App ID Configuration */}
            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                OneSignal App ID
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={appId}
                  onChange={(e) => setAppId(e.target.value)}
                  placeholder="Contoh: 12345678-abcd-1234-ef01-123456789abc"
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-blue-600"
                />
                <button
                  onClick={handleSaveAppId}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm shrink-0"
                >
                  Simpan
                </button>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Hubungkan akun OneSignal gratis Anda untuk mengirim notifikasi ke semua pengguna web/Android saat berita baru terbit.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
