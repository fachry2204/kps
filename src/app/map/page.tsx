"use client";

import dynamic from "next/dynamic";
import { X, ChevronUp, ChevronDown, Search, Database, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getUnits } from "@/app/actions";

// Dynamically import MapComponent with no SSR
const MapComponent = dynamic(
  () => import("@/components/map/MapComponent"),
  { ssr: false, loading: () => (
    <div className="w-full h-screen bg-tactical-bg border border-tactical-border flex items-center justify-center flex-col gap-4">
      <div className="w-12 h-12 border-4 border-tactical-green border-t-transparent rounded-full animate-spin"></div>
      <div className="text-tactical-green font-mono text-sm tracking-widest animate-pulse">ESTABLISHING SATELLITE LINK...</div>
    </div>
  )}
);

export default function MapPage() {
  const router = useRouter();
  const [isFullScreen, setIsFullScreen] = useState(true);
  const [center, setCenter] = useState<[number, number]>([-0.7893, 113.9213]);
  const [zoom, setZoom] = useState<number>(5);
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [units, setUnits] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDataModal, setShowDataModal] = useState(false);

  const handleSearch = (val: string) => {
    setSearchQuery(val);
    if (val.length > 0) {
      setCenter([-0.7893, 113.9213]);
      setZoom(5);
    }
  };

  useEffect(() => {
    getUnits().then(data => setUnits(data));
  }, []);

  useEffect(() => {
    if (!isFullScreen) {
      router.push("/");
    }
  }, [isFullScreen, router]);

  if (!isFullScreen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-tactical-bg overflow-hidden">
      {/* Full Screen Close Button */}
      <button 
        onClick={() => setIsFullScreen(false)}
        className="absolute top-6 right-6 z-[1000] p-2 bg-tactical-red/20 border border-tactical-red text-tactical-red rounded-full hover:bg-tactical-red hover:text-white transition-all shadow-[0_0_15px_rgba(255,51,51,0.3)] group"
        title="Exit Full Screen"
      >
        <X className="w-4 h-4 group-hover:scale-110 transition-transform" />
      </button>

      {/* Map Content */}
      <div className="w-full h-full">
        <MapComponent isFullScreen={true} targetCenter={center} targetZoom={zoom} activeCategory={activeCategory} units={units} searchQuery={searchQuery} />
      </div>
      
      {/* Overlay Header & Menu */}
      <div className="absolute top-6 left-6 z-[1000] pointer-events-none w-[280px]">
        <div className="tactical-glass tactical-border rounded-xl p-4 flex flex-col pointer-events-auto">
          {/* Header */}
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-4">
              <img src="/logo.png" alt="Kopassus" className="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(204,0,0,0.5)]" />
              <div>
                <h2 className="text-xl font-bold text-tactical-text tracking-wider">TACTICAL MAP</h2>
              </div>
            </div>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1 hover:bg-tactical-green/20 rounded text-tactical-muted hover:text-tactical-text transition-colors"
            >
              {isMenuOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
          </div>

          {/* Menus */}
          {isMenuOpen && (
            <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-tactical-border/50">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tactical-muted" />
                <input 
                  type="text" 
                  placeholder={`Cari di ${activeCategory || 'semua kategori'}...`}
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full bg-tactical-bg border border-tactical-border rounded-md py-2 pl-9 pr-3 text-sm text-tactical-text focus:outline-none focus:border-tactical-green transition-colors"
                />
              </div>

              <div className="flex flex-col gap-2 mt-1">
                {(!activeCategory || activeCategory === 'KESATUAN') && (
                  <button 
                    onClick={() => { setActiveCategory('KESATUAN'); setSearchQuery(""); setShowDataModal(false); }}
                    className={`w-full text-left bg-tactical-bg border rounded-md p-2 hover:bg-tactical-green hover:text-tactical-bg transition-colors font-bold tracking-wider text-xs ${activeCategory === 'KESATUAN' ? 'border-tactical-green text-tactical-green' : 'border-tactical-border text-tactical-text'}`}
                  >
                    KESATUAN
                  </button>
                )}
                {(!activeCategory || activeCategory === 'INTELIJEN') && (
                  <button 
                    onClick={() => { setActiveCategory('INTELIJEN'); setSearchQuery(""); setShowDataModal(false); }}
                    className={`w-full text-left bg-tactical-bg border rounded-md p-2 hover:bg-tactical-green hover:text-tactical-bg transition-colors font-bold tracking-wider text-xs ${activeCategory === 'INTELIJEN' ? 'border-tactical-green text-tactical-green' : 'border-tactical-border text-tactical-text'}`}
                  >
                    INTELIJEN
                  </button>
                )}
                {(!activeCategory || activeCategory === 'OPERASI') && (
                  <button 
                    onClick={() => { setActiveCategory('OPERASI'); setSearchQuery(""); setShowDataModal(false); }}
                    className={`w-full text-left bg-tactical-bg border rounded-md p-2 hover:bg-tactical-green hover:text-tactical-bg transition-colors font-bold tracking-wider text-xs ${activeCategory === 'OPERASI' ? 'border-tactical-green text-tactical-green' : 'border-tactical-border text-tactical-text'}`}
                  >
                    OPERASI
                  </button>
                )}
              <button 
                onClick={() => { 
                  setActiveCategory(null); 
                  setSearchQuery(""); 
                  setShowDataModal(false); 
                  setCenter([-0.7893, 113.9213]);
                  setZoom(5);
                }}
                className={`w-full text-left bg-tactical-bg border rounded-md p-2 hover:bg-tactical-green hover:text-tactical-bg transition-colors font-bold tracking-wider text-xs ${activeCategory === null ? 'border-tactical-green text-tactical-green' : 'border-tactical-border text-tactical-text'}`}
              >
                TAMPILKAN SEMUA
              </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Button to view data corresponding to the active category */}
      {activeCategory && (
        <button
          onClick={() => setShowDataModal(true)}
          className="absolute bottom-[20px] right-[70px] z-[1000] p-2 bg-tactical-bg border border-tactical-green text-tactical-green rounded hover:bg-tactical-green hover:text-tactical-bg transition-colors shadow-[0_0_15px_rgba(0,255,0,0.2)] group flex items-center justify-center"
          title={`Lihat Data ${activeCategory}`}
        >
          <Eye className="w-6 h-6 group-hover:scale-110 transition-transform" />
        </button>
      )}

      {/* Data Modal */}
      {showDataModal && activeCategory && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] max-w-4xl max-h-[80vh] bg-tactical-bg/95 backdrop-blur-md border border-tactical-green rounded-xl z-[2000] flex flex-col shadow-[0_0_30px_rgba(0,255,0,0.2)] overflow-hidden">
          <div className="flex justify-between items-center p-4 border-b border-tactical-border bg-tactical-green/10">
            <h3 className="font-bold text-tactical-text tracking-widest flex items-center gap-2">
              <Database className="w-5 h-5 text-tactical-green" /> DATA {activeCategory}
            </h3>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tactical-muted" />
                <input 
                  type="text" 
                  placeholder="Cari data..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-64 bg-tactical-bg border border-tactical-border rounded-md py-1.5 pl-9 pr-3 text-sm text-tactical-text focus:outline-none focus:border-tactical-green transition-colors"
                />
              </div>
              <button onClick={() => setShowDataModal(false)} className="text-tactical-muted hover:text-tactical-red transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
          <div className="p-0 overflow-y-auto">
            {activeCategory === 'KESATUAN' && (
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-tactical-muted bg-tactical-dark font-mono uppercase sticky top-0">
                  <tr>
                    <th className="px-6 py-4 border-b border-tactical-border">LOGO</th>
                    <th className="px-6 py-4 border-b border-tactical-border">NAMA KESATUAN</th>
                    <th className="px-6 py-4 border-b border-tactical-border">TIPE</th>
                    <th className="px-6 py-4 border-b border-tactical-border">LOKASI</th>
                  </tr>
                </thead>
                <tbody>
                  {units
                    .filter(u => {
                      if (!searchQuery) return true;
                      const q = searchQuery.toLowerCase();
                      return (u.unit_name?.toLowerCase().includes(q) || 
                              u.unit_type?.toLowerCase().includes(q) || 
                              u.location?.toLowerCase().includes(q));
                    })
                    .map((u, i) => (
                    <tr 
                      key={u.id || i} 
                      className="border-b border-tactical-border/50 hover:bg-tactical-green/5 transition-colors cursor-pointer group"
                      onClick={() => {
                        if (u.coordinates) {
                          const coords = u.coordinates.split(',');
                          if (coords.length === 2) {
                            const lat = parseFloat(coords[0]);
                            const lng = parseFloat(coords[1]);
                            if (!isNaN(lat) && !isNaN(lng)) {
                              setCenter([lat, lng]);
                              setZoom(15);
                              setShowDataModal(false);
                            }
                          }
                        }
                      }}
                    >
                      <td className="px-6 py-3">
                        <img 
                          src={u.logo_url || "https://upload.wikimedia.org/wikipedia/commons/6/61/Lambang_Kopassus.svg"} 
                          className="w-10 h-10 object-contain drop-shadow-[0_0_5px_rgba(0,255,0,0.5)] group-hover:scale-110 transition-transform" 
                          alt="Logo"
                        />
                      </td>
                      <td className="px-6 py-3 text-tactical-text font-bold group-hover:text-tactical-green transition-colors">{u.unit_name}</td>
                      <td className="px-6 py-3 text-tactical-cyan">{u.unit_type}</td>
                      <td className="px-6 py-3 font-mono text-tactical-muted">{u.location}</td>
                    </tr>
                  ))}
                  {units.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-tactical-muted font-mono">
                        Tidak ada data kesatuan yang ditemukan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
            {activeCategory === 'INTELIJEN' && (
              <div className="text-center text-tactical-muted py-12 font-mono flex flex-col items-center justify-center gap-4">
                <div className="w-16 h-16 border-2 border-dashed border-tactical-red rounded-full flex items-center justify-center animate-pulse">
                  <X className="w-8 h-8 text-tactical-red" />
                </div>
                <p className="text-tactical-red">DATA TERENKRIPSI</p>
                <p className="text-xs">Akses tingkat lanjut diperlukan untuk melihat detail data intelijen.</p>
              </div>
            )}
            {activeCategory === 'OPERASI' && (
              <div className="text-center text-tactical-muted py-12 font-mono flex flex-col items-center justify-center gap-4">
                <div className="w-16 h-16 border-2 border-dashed border-tactical-cyan rounded-full flex items-center justify-center animate-spin-slow">
                  <Database className="w-8 h-8 text-tactical-cyan" />
                </div>
                <p className="text-tactical-cyan">SINKRONISASI DATA OPERASI...</p>
                <p className="text-xs">Menunggu koneksi aman ke server pusat.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

