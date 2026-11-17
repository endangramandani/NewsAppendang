import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  CloudLightning, 
  ExternalLink, 
  RefreshCw, 
  MapPin, 
  Wind, 
  Droplets, 
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Thermometer,
  Wind as WindIcon,
  Smile,
  AlertTriangle
} from 'lucide-react';
import { 
  EarthquakeData, 
  WeatherData, 
  AirQualityData,
  fetchLatestEarthquake, 
  fetchCurrentWeather,
  fetchAirQuality
} from '../services/disasterService';

export const DisasterDashboard: React.FC = () => {
  const [earthquake, setEarthquake] = useState<EarthquakeData | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [airQuality, setAirQuality] = useState<AirQualityData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [eqData, wData, aqiData] = await Promise.allSettled([
        fetchLatestEarthquake(),
        fetchCurrentWeather(),
        fetchAirQuality()
      ]);

      if (eqData.status === 'fulfilled') {
        setEarthquake(eqData.value);
      }
      if (wData.status === 'fulfilled') {
        setWeather(wData.value);
      }
      if (aqiData.status === 'fulfilled') {
        setAirQuality(aqiData.value);
      }
      setLastRefreshed(new Date());
    } catch (err: any) {
      setError('Gagal memuat sebagian data pemantauan kebencanaan.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <section className="rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 sm:p-5 shadow-sm transition-colors space-y-3 sm:space-y-4">
      {/* Simplified Compact Header & Summary Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
        <div className="flex items-start sm:items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0 mt-0.5 sm:mt-0">
            <Activity className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
          </div>
          <div className="min-w-0 flex-1 space-y-0.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm md:text-base leading-tight tracking-tight truncate max-w-[200px] sm:max-w-none">
                Suhu, Kualitas Udara &amp; Gempa
              </h3>
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[9px] sm:text-[10px] font-bold font-mono tracking-wider shrink-0">
                LIVE
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 leading-snug line-clamp-1 sm:line-clamp-none sm:truncate mt-0.5">
              {weather ? `Suhu ${weather.temperature}°C (${weather.condition})` : ''}
              {airQuality ? ` · AQI: ${airQuality.aqi} (${airQuality.status})` : ''}
              {earthquake ? ` · Gempa ${earthquake.magnitude}` : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
          <button
            onClick={loadData}
            disabled={isLoading}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
            title="Segarkan data"
            aria-label="Segarkan data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-rose-500' : ''}`} />
          </button>
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] sm:text-xs shadow-sm transition-all active:scale-95"
          >
            <span>{isExpanded ? 'Ringkas' : 'Selengkapnya'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expanded Detailed Grid View */}
      {isExpanded && (
        <div className="space-y-4 sm:space-y-6 pt-3 sm:pt-4 border-t border-slate-200 dark:border-slate-800 animate-in fade-in duration-300">
          <div className="flex items-center justify-between text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-mono flex-wrap gap-1">
            <span>Sumber: BMKG / USGS &amp; Open-Meteo Air Quality</span>
            {lastRefreshed && (
              <span>Update: {lastRefreshed.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Suhu Udara Panel */}
            <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-50/70 to-slate-50 dark:from-amber-950/20 dark:to-slate-900/60 border border-amber-200/80 dark:border-amber-900/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-amber-700 dark:text-amber-400">
                  <Thermometer className="w-4 h-4 text-amber-500" />
                  <span>SUHU UDARA</span>
                </span>
                {weather && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 text-[10px] font-bold font-mono">
                    {weather.temperature}°C
                  </span>
                )}
              </div>

              {weather ? (
                <div className="space-y-2.5">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white text-sm">
                      {weather.city}
                    </p>
                    <p className="text-base font-black text-amber-600 dark:text-amber-400 mt-0.5">
                      {weather.condition}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-950/60 border border-amber-200/60 dark:border-amber-900/30 flex items-center gap-2">
                      <Droplets className="w-4 h-4 text-sky-500 shrink-0" />
                      <div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Kelembapan</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{weather.humidity}%</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-950/60 border border-amber-200/60 dark:border-amber-900/30 flex items-center gap-2">
                      <Wind className="w-4 h-4 text-blue-500 shrink-0" />
                      <div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Angin</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{weather.windSpeed} km/j</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-24 flex items-center justify-center text-xs text-slate-400 animate-pulse">
                  Memuat data suhu...
                </div>
              )}
            </div>

            {/* Kualitas Udara (AQI) Panel */}
            <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-50/70 to-slate-50 dark:from-emerald-950/20 dark:to-slate-900/60 border border-emerald-200/80 dark:border-emerald-900/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  <WindIcon className="w-4 h-4 text-emerald-500" />
                  <span>KUALITAS UDARA (AQI)</span>
                </span>
                {airQuality && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono border ${airQuality.color}`}>
                    AQI {airQuality.aqi}
                  </span>
                )}
              </div>

              {airQuality ? (
                <div className="space-y-2.5">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white text-sm">
                      Indeks Udara Jakarta
                    </p>
                    <p className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                      {airQuality.status}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-950/60 border border-emerald-200/60 dark:border-emerald-900/30">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block">PM2.5 / PM10</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">{airQuality.pm25} / {airQuality.pm10} µg/m³</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-950/60 border border-emerald-200/60 dark:border-emerald-900/30">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block">NO2 (Gas)</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">{airQuality.no2} ppb</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-24 flex items-center justify-center text-xs text-slate-400 animate-pulse">
                  Memuat data kualitas udara...
                </div>
              )}
            </div>

            {/* Earthquake Panel */}
            <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-rose-50/70 to-slate-50 dark:from-rose-950/20 dark:to-slate-900/60 border border-rose-200/80 dark:border-rose-900/40 space-y-3 md:col-span-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-rose-600 dark:text-rose-400">
                  <Activity className="w-4 h-4" />
                  <span>GEMPA BUMI TERAKHIR ({earthquake?.source || 'BMKG/USGS'})</span>
                </span>
                {earthquake && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 text-[10px] font-bold font-mono">
                    {earthquake.magnitude}
                  </span>
                )}
              </div>

              {earthquake ? (
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm leading-snug">
                        {earthquake.location}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                        Kedalaman: {earthquake.depth} · {earthquake.potential || 'Tidak berpotensi tsunami'}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-16 flex items-center justify-center text-xs text-slate-400 animate-pulse">
                  Memuat data seismik...
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
