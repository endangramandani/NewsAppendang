import React, { useState, useEffect } from 'react';
import { Thermometer, Wind, Droplets, CloudSun, MapPin, Navigation, RefreshCw, ChevronDown, Check } from 'lucide-react';
import { fetchCurrentWeather, fetchAirQuality, WeatherData, AirQualityData } from '../services/disasterService';

interface CityOption {
  name: string;
  lat: number;
  lng: number;
}

const INDONESIA_CITIES: CityOption[] = [
  { name: 'Jakarta (DKI)', lat: -6.2088, lng: 106.8456 },
  { name: 'Surabaya (Jatim)', lat: -7.2575, lng: 112.7521 },
  { name: 'Bandung (Jabar)', lat: -6.9175, lng: 107.6191 },
  { name: 'Medan (Sumut)', lat: 3.5952, lng: 98.6722 },
  { name: 'Denpasar (Bali)', lat: -8.6705, lng: 115.2126 },
  { name: 'Yogyakarta (DIY)', lat: -7.7956, lng: 110.3695 },
  { name: 'Makassar (Sulsel)', lat: -5.1477, lng: 119.4327 },
  { name: 'Semarang (Jateng)', lat: -6.9666, lng: 110.4167 },
  { name: 'Palembang (Sumsel)', lat: -2.9909, lng: 104.7566 },
  { name: 'Balikpapan (Kaltim)', lat: -1.2379, lng: 116.8529 },
];

export const TopWeatherBanner: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [airQuality, setAirQuality] = useState<AirQualityData | null>(null);
  const [selectedCity, setSelectedCity] = useState<CityOption>(INDONESIA_CITIES[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState<boolean>(true);

  const loadWeatherForCoords = (lat: number, lng: number, name: string) => {
    setIsLoadingLocation(true);
    Promise.all([
      fetchCurrentWeather(lat, lng, name),
      fetchAirQuality(lat, lng)
    ]).then(([wData, aqiData]) => {
      setWeather(wData);
      setAirQuality(aqiData);
    }).catch(() => {
      // Fallback Jakarta
      fetchCurrentWeather(-6.2088, 106.8456, 'Jakarta & Sekitarnya').then(setWeather);
      fetchAirQuality(-6.2088, 106.8456).then(setAirQuality);
    }).finally(() => {
      setIsLoadingLocation(false);
    });
  };

  const handleSelectCity = (city: CityOption) => {
    setSelectedCity(city);
    setIsDropdownOpen(false);
    loadWeatherForCoords(city.lat, city.lng, city.name);
  };

  const detectGpsLocation = () => {
    setIsLoadingLocation(true);
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const gpsCity: CityOption = { name: `GPS (${lat.toFixed(2)}, ${lng.toFixed(2)})`, lat, lng };
          setSelectedCity(gpsCity);
          setIsDropdownOpen(false);
          loadWeatherForCoords(lat, lng, gpsCity.name);
        },
        () => {
          setIsLoadingLocation(false);
          alert('Gagal mendeteksi lokasi GPS otomatis. Menggunakan kota pilihan.');
        },
        { timeout: 10000, maximumAge: 60000 }
      );
    } else {
      setIsLoadingLocation(false);
      alert('Geolokasi tidak didukung oleh browser Anda.');
    }
  };

  useEffect(() => {
    loadWeatherForCoords(selectedCity.lat, selectedCity.lng, selectedCity.name);
  }, []);

  if (!weather) return null;

  return (
    <div className="relative rounded-2xl sm:rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white p-3.5 sm:p-4 shadow-md border border-blue-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 select-none">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-amber-300 shrink-0 shadow-inner">
          <CloudSun className="w-6 h-6 animate-pulse" />
        </div>
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-mono uppercase tracking-wider bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full font-extrabold flex items-center gap-1">
              <Navigation className="w-2.5 h-2.5" />
              <span>Suhu &amp; Angin</span>
            </span>

            {/* City Selection Dropdown Trigger */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="text-[11px] text-blue-200 hover:text-white flex items-center gap-1 bg-blue-900/80 px-2.5 py-0.5 rounded-full border border-blue-700/60 font-mono transition-colors"
              >
                <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                <span className="truncate max-w-[140px] sm:max-w-[180px]">{selectedCity.name}</span>
                <ChevronDown className="w-3 h-3 opacity-70" />
              </button>

              {/* City Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden py-1.5 animate-in fade-in duration-150">
                  <div className="px-3 py-1.5 border-b border-slate-800 text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center justify-between">
                    <span>Pilih Kota / Wilayah</span>
                    <button
                      onClick={detectGpsLocation}
                      className="text-amber-400 hover:underline font-bold"
                    >
                      Gunakan GPS
                    </button>
                  </div>

                  <div className="max-h-56 overflow-y-auto no-scrollbar">
                    {INDONESIA_CITIES.map((city) => (
                      <button
                        key={city.name}
                        onClick={() => handleSelectCity(city)}
                        className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-blue-900/50 transition-colors ${
                          selectedCity.name === city.name ? 'bg-blue-900/80 font-bold text-amber-300' : 'text-slate-200'
                        }`}
                      >
                        <span className="truncate">{city.name}</span>
                        {selectedCity.name === city.name && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap pt-0.5 text-xs">
            <div className="flex items-center gap-1.5">
              <Thermometer className="w-4 h-4 text-amber-400" />
              <span className="text-lg sm:text-xl font-black tracking-tight text-white">{weather.temperature}°C</span>
              <span className="text-amber-300 font-semibold">({weather.condition})</span>
            </div>

            <div className="flex items-center gap-2 text-blue-200 font-mono text-[11px]">
              <span className="flex items-center gap-1 bg-blue-900/50 px-2 py-0.5 rounded-lg border border-blue-700/40">
                <Droplets className="w-3.5 h-3.5 text-sky-400" /> 
                <span>Hum: <strong className="text-white">{weather.humidity}%</strong></span>
              </span>
              <span className="flex items-center gap-1 bg-blue-900/50 px-2 py-0.5 rounded-lg border border-blue-700/40">
                <Wind className="w-3.5 h-3.5 text-blue-400" /> 
                <span>Wind: <strong className="text-white">{weather.windSpeed} km/j</strong></span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-blue-800/60">
        {airQuality && (
          <div className="px-3 py-1.5 rounded-xl bg-blue-900/60 border border-blue-700/50 text-xs space-y-0.5 flex-1 sm:flex-none">
            <div className="text-[9px] text-blue-300 font-mono uppercase font-bold flex items-center justify-between gap-2">
              <span>Kualitas Udara</span>
              <span className="text-emerald-400 font-extrabold">{airQuality.aqi}</span>
            </div>
            <div className="font-extrabold text-white text-xs truncate">
              {airQuality.status}
            </div>
          </div>
        )}

        <button
          onClick={() => loadWeatherForCoords(selectedCity.lat, selectedCity.lng, selectedCity.name)}
          disabled={isLoadingLocation}
          className="p-2 rounded-xl bg-blue-800/80 hover:bg-blue-700 text-blue-200 hover:text-white transition-colors"
          title="Segarkan Cuaca"
          aria-label="Segarkan Cuaca"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoadingLocation ? 'animate-spin text-amber-400' : ''}`} />
        </button>
      </div>
    </div>
  );
};
