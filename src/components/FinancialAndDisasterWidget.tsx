import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  ShieldAlert, 
  Coins, 
  ChevronDown,
  ArrowRightLeft,
  DollarSign
} from 'lucide-react';
import { fetchLatestEarthquake, EarthquakeData } from '../services/disasterService';

interface ExchangeRate {
  code: string;
  name: string;
  rate: number;
  change: string;
  isUp: boolean;
  flag: string;
}

const CURRENCIES: ExchangeRate[] = [
  { code: 'USD', name: 'Dolar AS', rate: 15850, change: '+0.15%', isUp: true, flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', rate: 17120, change: '-0.08%', isUp: false, flag: '🇪🇺' },
  { code: 'SGD', name: 'Dolar Singapura', rate: 11780, change: '+0.12%', isUp: true, flag: '🇸🇬' },
  { code: 'JPY', name: 'Yen Jepang', rate: 102.50, change: '-0.35%', isUp: false, flag: '🇯🇵' },
  { code: 'AUD', name: 'Dolar Australia', rate: 10450, change: '+0.22%', isUp: true, flag: '🇦🇺' },
  { code: 'MYR', name: 'Ringgit Malaysia', rate: 3355, change: '+0.05%', isUp: true, flag: '🇲🇾' },
  { code: 'SAR', name: 'Riyal Arab', rate: 4220, change: '+0.10%', isUp: true, flag: '🇸🇦' },
  { code: 'GBP', name: 'Pound Sterling', rate: 20150, change: '+0.18%', isUp: true, flag: '🇬🇧' },
];

export const FinancialAndDisasterWidget: React.FC = () => {
  const [earthquake, setEarthquake] = useState<EarthquakeData | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<ExchangeRate>(CURRENCIES[0]);
  const [calcAmountIdr, setCalcAmountIdr] = useState<number>(100000);
  const [showCalc, setShowCalc] = useState<boolean>(false);

  const [ihsg] = useState({
    value: 7324.50,
    change: '+32.40',
    percent: '+0.44%',
    isUp: true
  });

  const [goldPrice] = useState({
    pricePerGram: 1420000,
    change: '+Rp 4.000',
    percent: '+0.28%',
    isUp: true
  });

  useEffect(() => {
    fetchLatestEarthquake().then(setEarthquake).catch(() => {});
  }, []);

  const convertedVal = (calcAmountIdr / selectedCurrency.rate).toFixed(2);

  return (
    <div className="space-y-2">
      {/* 1 Row Horizontal Scrolling Cards Bar - Clean & Concise */}
      <div className="flex gap-2.5 overflow-x-auto pb-1.5 scrollbar-none select-none snap-x text-xs">
        
        {/* Card 1: Status Bencana */}
        <div className="snap-start shrink-0 min-w-[170px] sm:min-w-[180px] p-2.5 sm:p-3 rounded-2xl bg-gradient-to-br from-rose-50 to-white dark:from-rose-950/40 dark:to-slate-900 border border-rose-200/80 dark:border-rose-900/50 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 font-bold text-rose-600 dark:text-rose-400 text-[10px] uppercase font-mono">
              <ShieldAlert className="w-3 h-3 text-rose-500 animate-pulse" />
              <span>Bencana BMKG</span>
            </span>
            <span className="px-1.5 py-0.2 bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 rounded text-[9px] font-extrabold font-mono">
              SIAGA
            </span>
          </div>
          <div className="font-extrabold text-slate-900 dark:text-white text-xs truncate">
            {earthquake ? `${earthquake.magnitude} · ${earthquake.location.split(',')[0]}` : 'Gempa M 5.2 Terkini'}
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
            Darurat: <strong className="text-rose-600">117 / 115</strong>
          </div>
        </div>

        {/* Card 2: IHSG Saham */}
        <div className="snap-start shrink-0 min-w-[160px] sm:min-w-[170px] p-2.5 sm:p-3 rounded-2xl bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/40 dark:to-slate-900 border border-blue-200/80 dark:border-blue-900/50 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 font-bold text-blue-600 dark:text-blue-400 text-[10px] uppercase font-mono">
              <TrendingUp className="w-3 h-3 text-blue-500" />
              <span>IHSG Saham</span>
            </span>
            <span className="text-[10px] font-extrabold font-mono text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-1 rounded">
              {ihsg.percent}
            </span>
          </div>
          <div className="font-black text-slate-900 dark:text-white text-sm font-mono tracking-tight">
            {ihsg.value.toLocaleString('id-ID')}
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
            Bursa Efek Indonesia
          </div>
        </div>

        {/* Card 3: Harga Emas Antam Terbaru */}
        <div className="snap-start shrink-0 min-w-[185px] sm:min-w-[195px] p-2.5 sm:p-3 rounded-2xl bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/40 dark:to-slate-900 border border-amber-200/80 dark:border-amber-900/50 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 font-bold text-amber-700 dark:text-amber-400 text-[10px] uppercase font-mono">
              <Coins className="w-3 h-3 text-amber-500" />
              <span>Emas Antam Terbaru</span>
            </span>
            <span className="text-[10px] font-extrabold font-mono text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-1 rounded">
              {goldPrice.percent}
            </span>
          </div>
          <div className="font-black text-amber-700 dark:text-amber-300 text-xs font-mono">
            Rp {goldPrice.pricePerGram.toLocaleString('id-ID')} <span className="text-[10px] font-normal text-slate-500 dark:text-slate-400">/ gram</span>
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
            Naik {goldPrice.change}
          </div>
        </div>

        {/* Card 4: Kurs Rupiah Interaktif (Pilih Mata Uang Sendiri) */}
        <div className="snap-start shrink-0 min-w-[210px] sm:min-w-[230px] p-2.5 sm:p-3 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white border border-indigo-700/60 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 font-bold text-amber-300 text-[10px] uppercase font-mono">
              <DollarSign className="w-3 h-3 text-amber-400" />
              <span>Kurs IDR Ke</span>
            </span>

            {/* Currency Picker Dropdown */}
            <div className="relative">
              <select
                value={selectedCurrency.code}
                onChange={(e) => {
                  const curr = CURRENCIES.find(c => c.code === e.target.value);
                  if (curr) setSelectedCurrency(curr);
                }}
                className="bg-indigo-900/80 text-white text-[11px] font-bold font-mono px-2 py-0.5 rounded-lg border border-indigo-600 focus:outline-none appearance-none cursor-pointer pr-5"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code} className="bg-slate-900 text-white">
                    {c.flag} {c.code} - {c.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 text-indigo-300 absolute right-1.5 top-1.5 pointer-events-none" />
            </div>
          </div>

          <div className="flex items-baseline justify-between pt-0.5">
            <div className="font-extrabold text-amber-400 text-xs font-mono">
              Rp {selectedCurrency.rate.toLocaleString('id-ID')}
            </div>
            <span className={`text-[10px] font-mono font-bold ${selectedCurrency.isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
              {selectedCurrency.change}
            </span>
          </div>

          <div className="flex items-center justify-between text-[10px] text-indigo-200 font-mono pt-0.5">
            <span className="truncate">{selectedCurrency.flag} {selectedCurrency.name}</span>
            <button
              onClick={() => setShowCalc(!showCalc)}
              className="text-amber-300 hover:underline font-bold flex items-center gap-0.5 shrink-0"
            >
              <ArrowRightLeft className="w-2.5 h-2.5" />
              <span>Kalkulator</span>
            </button>
          </div>
        </div>

      </div>

      {/* Interactive Currency Converter Panel */}
      {showCalc && (
        <div className="p-3 rounded-2xl bg-indigo-950/80 border border-indigo-700/60 text-white text-xs flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <span className="text-xl">{selectedCurrency.flag}</span>
            <div>
              <span className="font-bold text-amber-300 block">
                Hitung Konversi {selectedCurrency.code} ({selectedCurrency.name})
              </span>
              <span className="text-[11px] text-indigo-200 font-mono">
                Rp {calcAmountIdr.toLocaleString('id-ID')} = <strong className="text-amber-400 text-xs">{convertedVal} {selectedCurrency.code}</strong>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-indigo-300 font-mono">Rp</span>
            <input
              type="number"
              value={calcAmountIdr}
              onChange={(e) => setCalcAmountIdr(Math.max(0, Number(e.target.value)))}
              className="w-28 px-2.5 py-1 bg-slate-900 border border-indigo-600 rounded-xl text-right font-mono font-bold text-white focus:outline-none"
            />
            <button
              onClick={() => setShowCalc(false)}
              className="px-2 py-1 bg-indigo-900 hover:bg-indigo-800 rounded-lg text-[10px] text-indigo-200 font-mono font-bold"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
