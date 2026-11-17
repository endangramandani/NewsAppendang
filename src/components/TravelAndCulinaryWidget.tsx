import React, { useState } from 'react';
import { 
  Compass, 
  Utensils, 
  MapPin, 
  Star, 
  Clock, 
  Ticket, 
  ChevronRight,
  Heart,
  X,
  Navigation
} from 'lucide-react';

interface RecommendationItem {
  id: string;
  type: 'wisata' | 'kuliner';
  title: string;
  category: string;
  city: string;
  rating: number;
  reviewsCount: number;
  priceTag: string;
  image: string;
  description: string;
  address: string;
  openingHours: string;
  highlights: string[];
}

const RECOMMENDATIONS: RecommendationItem[] = [
  // WISATA
  {
    id: 'w1',
    type: 'wisata',
    title: 'Taman Mini Indonesia Indah (TMII)',
    category: 'Edukasi & Budaya',
    city: 'Jakarta',
    rating: 4.8,
    reviewsCount: 1240,
    priceTag: 'Rp 25.000 / orang',
    image: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=800&q=80',
    description: 'Rangkuman kebudayaan nusantara dalam Anjungan Daerah, Danau Archipelago, dan Kereta Gantung modern pasca revitalisasi.',
    address: 'Jl. Raya Taman Mini, Cipayung, Jakarta Timur',
    openingHours: '06:00 - 20:00 WIB',
    highlights: ['Kereta Gantung', 'Taman Burung', 'Museum Komodo', 'Anjungan Daerah']
  },
  {
    id: 'w2',
    type: 'wisata',
    title: 'Kawasan Kintamani & Danau Batur',
    category: 'Pemandangan Alam',
    city: 'Bali',
    rating: 4.9,
    reviewsCount: 3100,
    priceTag: 'Gratis (Spot Cafe Panoramic)',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
    description: 'Nikmati pemandangan Gunung Batur dan Danau Batur yang memukau sambil menikmati kopi kintamani segar di cafe tebing.',
    address: 'Kintamani, Kabupaten Bangli, Bali',
    openingHours: '24 Jam (Cafe 06:00 - 19:00)',
    highlights: ['Sunrise Volcano', 'Danau Batur', 'Kopi Arabika Kintamani']
  },
  {
    id: 'w3',
    type: 'wisata',
    title: 'Taman Asri Kawah Putih Ciwidey',
    category: 'Wisata Alam',
    city: 'Bandung',
    rating: 4.7,
    reviewsCount: 1850,
    priceTag: 'Rp 30.000 / orang',
    image: 'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=800&q=80',
    description: 'Danau kawah vulkanik unik berpendar kehijauan diselimuti kabut lembut pegunungan kawah Gunung Patuha.',
    address: 'Sugihmukti, Pasirwangi, Ciwidey, Bandung',
    openingHours: '07:30 - 17:00 WIB',
    highlights: ['Jembatan Dermaga Ponton', 'Dermaga Kayu', 'Hutan Cantigi']
  },
  {
    id: 'w4',
    type: 'wisata',
    title: 'Candi Prambanan & Ratu Boko',
    category: 'Warisan Sejarah',
    city: 'Yogyakarta',
    rating: 4.9,
    reviewsCount: 4200,
    priceTag: 'Rp 50.000 / orang',
    image: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=800&q=80',
    description: 'Kompleks candi Hindu terbesar di Indonesia berlatar arsitektur megah abad ke-9 dengan Sendratari Ramayana.',
    address: 'Jl. Raya Solo - Yogyakarta No.16, Prambanan',
    openingHours: '06:30 - 17:00 WIB',
    highlights: ['Candi Siwa', 'Sendratari Terbuka', 'Taman Bunga']
  },

  // KULINER
  {
    id: 'k1',
    type: 'kuliner',
    title: 'Soto Betawi H. Husein',
    category: 'Kuliner Legendaris',
    city: 'Jakarta',
    rating: 4.9,
    reviewsCount: 2100,
    priceTag: 'Rp 35.000 - Rp 50.000',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    description: 'Soto Betawi kuah santan rempah gurih nan kental dengan daging sapi empuk resep asli sejak 1988.',
    address: 'Jl. Padang Panjang No.6C, Manggarai Selatan, Jakarta Selatan',
    openingHours: '07:00 - 14:00 WIB (Cepat Habis)',
    highlights: ['Daging Empuk', 'Kuah Rempah Asli', 'Emping Segar']
  },
  {
    id: 'k2',
    type: 'kuliner',
    title: 'Gudeg Yu Djum Wijilan',
    category: 'Khas Tradisional',
    city: 'Yogyakarta',
    rating: 4.8,
    reviewsCount: 3800,
    priceTag: 'Rp 20.000 - Rp 45.000',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80',
    description: 'Gudeg kering autentik dengan krecek pedas gurih, telur bacem, dan ayam kampung suwir legit.',
    address: 'Jl. Wijilan No.167, Panembahan, Kraton, Yogyakarta',
    openingHours: '06:00 - 22:00 WIB',
    highlights: ['Gudeg Kering', 'Sambal Goreng Krecek', 'Kemasan Kendil besek']
  },
  {
    id: 'k3',
    type: 'kuliner',
    title: 'Batagor Riri & Cuanki Serayu',
    category: 'Jajanan Khas',
    city: 'Bandung',
    rating: 4.8,
    reviewsCount: 2900,
    priceTag: 'Rp 18.000 - Rp 30.000',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
    description: 'Ikan tenggiri pilihan digoreng renyah dengan bumbu kacang kental khas Bandung dipadu kuah hangat.',
    address: 'Jl. Serayu No.2, Cihapit, Bandung',
    openingHours: '11:00 - 19:00 WIB',
    highlights: ['Batagor Kuah', 'Kacang Sangrai Pedas', 'Cuanki Bakso']
  },
  {
    id: 'k4',
    type: 'kuliner',
    title: 'Nasi Ayam Bu Wido & Tahu Gimbal',
    category: 'Kuliner Malam',
    city: 'Semarang',
    rating: 4.7,
    reviewsCount: 1400,
    priceTag: 'Rp 15.000 - Rp 25.000',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
    description: 'Nasi gurih disiram kuah opor, dengan suwiran ayam, telur opor, krecek, dan tahu udang renyah.',
    address: 'Jl. Gajah Mada No.142, Semarang',
    openingHours: '17:00 - 23:00 WIB',
    highlights: ['Bumbu Kacang Petis', 'Tahu Udang', 'Nasi Gurih Warm']
  }
];

export const TravelAndCulinaryWidget: React.FC = () => {
  const [activeType, setActiveType] = useState<'semua' | 'wisata' | 'kuliner'>('semua');
  const [selectedCity, setSelectedCity] = useState<string>('Semua');
  const [activeItemModal, setActiveItemModal] = useState<RecommendationItem | null>(null);

  const cities = ['Semua', 'Jakarta', 'Bandung', 'Yogyakarta', 'Bali'];

  const filteredItems = RECOMMENDATIONS.filter(item => {
    if (activeType !== 'semua' && item.type !== activeType) return false;
    if (selectedCity !== 'Semua' && item.city.toLowerCase() !== selectedCity.toLowerCase()) return false;
    return true;
  });

  return (
    <section className="rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 sm:p-4 shadow-sm space-y-3 text-slate-900 dark:text-slate-100 select-none">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white">
              Rekomendasi Wisata &amp; Kuliner (Pilih untuk Detail Inti)
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Ketuk kartu kecil untuk melihat informasi rincian lengkap
            </p>
          </div>
        </div>

        {/* Filter Type Pills */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-[11px] font-semibold self-start sm:self-auto">
          <button
            onClick={() => setActiveType('semua')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              activeType === 'semua' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-bold' : 'text-slate-500'
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setActiveType('wisata')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
              activeType === 'wisata' ? 'bg-amber-500 text-white shadow-sm font-bold' : 'text-slate-500'
            }`}
          >
            <Compass className="w-3 h-3" />
            <span>Wisata</span>
          </button>
          <button
            onClick={() => setActiveType('kuliner')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
              activeType === 'kuliner' ? 'bg-rose-500 text-white shadow-sm font-bold' : 'text-slate-500'
            }`}
          >
            <Utensils className="w-3 h-3" />
            <span>Kuliner</span>
          </button>
        </div>
      </div>

      {/* City Selector Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
        <span className="text-[10px] font-mono text-slate-400 shrink-0">Kota:</span>
        {cities.map(city => (
          <button
            key={city}
            onClick={() => setSelectedCity(city)}
            className={`px-2.5 py-0.5 rounded-full font-semibold transition-all shrink-0 ${
              selectedCity === city
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm font-bold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            {city}
          </button>
        ))}
      </div>

      {/* Compact Small Cards Row (Horizontal Scroll) */}
      <div className="flex gap-2.5 overflow-x-auto pb-1.5 scrollbar-none snap-x">
        {filteredItems.map(item => (
          <div
            key={item.id}
            onClick={() => setActiveItemModal(item)}
            className="snap-start shrink-0 min-w-[200px] max-w-[220px] p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500 transition-all cursor-pointer shadow-sm hover:shadow flex items-center gap-2.5 group"
          >
            {/* Small Avatar Image */}
            <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-200 shrink-0">
              <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
              <span className="absolute bottom-0 inset-x-0 bg-black/70 text-white text-[8px] text-center font-bold font-mono">
                ★ {item.rating}
              </span>
            </div>

            {/* Small Title & Subtitle */}
            <div className="min-w-0 flex-1 space-y-0.5 text-xs">
              <div className="flex items-center gap-1 text-[9px] text-amber-600 dark:text-amber-400 font-bold uppercase font-mono truncate">
                <span>{item.type === 'wisata' ? '🏖️ Wisata' : '🍲 Kuliner'}</span>
                <span>·</span>
                <span className="text-slate-400">{item.city}</span>
              </div>

              <h4 className="font-extrabold text-slate-900 dark:text-white text-xs truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                {item.title}
              </h4>

              <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400 truncate">
                {item.priceTag}
              </p>
            </div>

            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all shrink-0" />
          </div>
        ))}
      </div>

      {/* Detail Inti Modal / Popup Drawer */}
      {activeItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden space-y-3.5 p-5 text-xs text-slate-900 dark:text-slate-100">
            
            {/* Modal Image Header */}
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-200 shadow-sm">
              <img src={activeItemModal.image} alt={activeItemModal.title} className="w-full h-full object-cover" />
              <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider">
                {activeItemModal.category}
              </div>
              <button
                onClick={() => setActiveItemModal(null)}
                className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-black/70 text-white flex items-center justify-center font-bold hover:bg-black"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Inti Content */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-amber-500 font-bold flex items-center gap-1 text-xs">
                  <Star className="w-4 h-4 fill-current" />
                  <span>{activeItemModal.rating} / 5.0</span>
                  <span className="text-slate-400 font-normal">({activeItemModal.reviewsCount} ulasan)</span>
                </span>
                <span className="font-mono text-slate-500 font-bold text-[11px] flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  <span>{activeItemModal.city}</span>
                </span>
              </div>

              <h3 className="font-black text-slate-900 dark:text-white text-base leading-snug">
                {activeItemModal.title}
              </h3>

              <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
                {activeItemModal.description}
              </p>

              {/* Rincian Inti Box */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 space-y-1.5 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span className="truncate">{activeItemModal.address}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span>Jam Operasional: <strong>{activeItemModal.openingHours}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold">
                  <Ticket className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>Perkiraan Biaya: <strong className="text-amber-600 dark:text-amber-400">{activeItemModal.priceTag}</strong></span>
                </div>
              </div>

              {/* Daya Tarik Utama / Special Highlights */}
              <div className="space-y-1 pt-0.5">
                <span className="font-bold text-slate-900 dark:text-white block text-[11px]">Keunggulan Utama:</span>
                <div className="flex flex-wrap gap-1">
                  {activeItemModal.highlights.map(h => (
                    <span key={h} className="px-2.5 py-0.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 text-amber-800 dark:text-amber-300 text-[10px] font-semibold">
                      ✓ {h}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 font-mono">ID: {activeItemModal.id}</span>
              <button
                onClick={() => setActiveItemModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs shadow-sm"
              >
                Tutup Inti Rincian
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
