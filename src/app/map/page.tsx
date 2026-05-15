"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { X, ChevronUp, ChevronDown, Search, Database, Eye, LayoutDashboard, Shield, Activity, MessageSquare, Users, Package, BarChart3, Settings, ChevronLeft, ChevronRight, Map as MapIcon, RefreshCcw, ShieldAlert, Target } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { getUnits, getIntelReports, getOpsDalamNegeri, getOpsLuarNegeri, getLogistics } from "@/app/actions";

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

function MapContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const initialLat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : -0.7893;
  const initialLng = searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : 113.9213;
  const initialZoom = searchParams.get('zoom') ? parseInt(searchParams.get('zoom')!) : 5;

  const [isFullScreen, setIsFullScreen] = useState(true);
  const [center, setCenter] = useState<[number, number]>([initialLat, initialLng]);
  const [zoom, setZoom] = useState<number>(initialZoom);
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>('KESATUAN');
  const [units, setUnits] = useState<any[]>([]);
  const [intelReports, setIntelReports] = useState<any[]>([]);
  const [opsDalamNegeri, setOpsDalamNegeri] = useState<any[]>([]);
  const [opsLuarNegeri, setOpsLuarNegeri] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDataModal, setShowDataModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [logistics, setLogistics] = useState<any[]>([]);

  const menuItems = [
    { name: "Dashboard", icon: <LayoutDashboard size={20} />, path: "/dashboard" },
    { name: "Map", icon: <MapIcon size={20} />, path: "/map" },
    { name: "Kesatuan", icon: <Shield size={20} />, path: "/kesatuan" },
    { name: "Intelijen", icon: <Activity size={20} />, path: "/intel" },
    { name: "Gelar Operasi", icon: <Database size={20} />, path: "/gelar-operasi" },
    { name: "Komunikasi", icon: <MessageSquare size={20} />, path: "/komunikasi" },
    { name: "Personnel", icon: <Users size={20} />, path: "/personnel" },
    { name: "Logistics", icon: <Package size={20} />, path: "/logistics" },
    { name: "Statistik", icon: <BarChart3 size={20} />, path: "/statistik" },
    { name: "Settings", icon: <Settings size={20} />, path: "/settings" },
  ];

  const handleSearch = (val: string) => {
    setSearchQuery(val);
    if (val.length > 0) {
      setCenter([-0.7893, 113.9213]);
      setZoom(5);
    }
  };

  useEffect(() => {
    getUnits().then(data => setUnits(data));
    getIntelReports().then(data => setIntelReports(data));
    getOpsDalamNegeri().then(data => setOpsDalamNegeri(data));
    getOpsLuarNegeri().then(data => setOpsLuarNegeri(data));
    getLogistics().then(data => setLogistics(data));
  }, []);

  useEffect(() => {
    if (!isFullScreen) {
      router.push("/dashboard");
    }
  }, [isFullScreen, router]);

  return (
    <div className="relative w-full h-screen bg-tactical-bg overflow-hidden shadow-2xl">
      {!isFullScreen ? (
        <div className="flex items-center justify-center h-full text-tactical-green font-mono">
          REDIRECTING TO DASHBOARD...
        </div>
      ) : (
        <>
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
        <MapComponent 
          isFullScreen={true} 
          targetCenter={center} 
          targetZoom={zoom} 
          activeCategory={activeCategory} 
          units={units} 
          intelReports={intelReports}
          opsDalamNegeri={opsDalamNegeri}
          opsLuarNegeri={opsLuarNegeri}
          searchQuery={searchQuery} 
          onMarkerClick={(newCenter, newZoom) => {
            setCenter(newCenter);
            setZoom(newZoom);
          }}
        />
      </div>


      
      {/* Draggable Overlay Header & Menu */}
      <motion.div 
        drag
        dragMomentum={false}
        initial={{ top: '24px', left: '50%', x: '-50%' }}
        className="absolute z-[1000] pointer-events-auto cursor-grab active:cursor-grabbing"
      >
        <div className="carbon-fiber gold-tactical-border rounded-sm p-2 flex items-center gap-6 shadow-[0_0_30px_rgba(0,0,0,0.8)] scale-[0.85] origin-center">
          {/* Logo & Info Section */}
          <div className="flex items-center gap-4 relative z-10">
            <div className="relative">
              <img src="/logo_puskodal.png" alt="Kopassus" className="w-14 h-14 object-contain drop-shadow-[0_0_6px_rgba(201,160,65,0.3)]" />
            </div>
            <div className="flex flex-col justify-center">
              <h1 className="text-2xl font-black text-[#facc15] leading-none tracking-tight italic" style={{ textShadow: '0 0 10px rgba(250, 204, 21, 0.6), 2px 2px 2px rgba(0,0,0,1)' }}>IDC-SF</h1>
              <div className="text-[10px] text-[#facc15] font-black tracking-[0.2em] mt-1 drop-shadow-md">INTEGRATED DATA CENTER</div>
              <div className="text-[11px] text-white font-bold tracking-wide mt-1 drop-shadow-md">Komando Pasukan Khusus</div>
              <div className="text-[10px] text-[#facc15] italic font-serif mt-1 drop-shadow-sm">
                "Berani, Benar, Berhasil"
              </div>
            </div>
          </div>

          {/* Vertical Separator */}
          <div className="w-[1px] h-12 bg-gray-700/50 self-center mx-0.5" />

          {/* Navigation Controls */}
          <div className="flex items-center relative z-10">
            <div className="flex bg-black/40 border border-[#8a6d2b]/50 rounded-lg p-0.5 backdrop-blur-sm min-w-[200px] h-[34px]">
              <button 
                onClick={() => {
                  setActiveCategory('KESATUAN');
                  setSearchQuery("");
                  setCenter([-0.7893, 113.9213]);
                  setZoom(5);
                }}
                className={cn(
                  "flex-1 rounded-md text-xs font-bold transition-all duration-200",
                  activeCategory === 'KESATUAN' 
                    ? "bg-[#b91c1c] text-white shadow-inner" 
                    : "text-gray-300 hover:text-white"
                )}
              >
                Satuan
              </button>
              <button 
                onClick={() => {
                  setActiveCategory('OPERASI');
                  setSearchQuery("");
                  setCenter([-0.7893, 113.9213]);
                  setZoom(5);
                }}
                className={cn(
                  "flex-1 rounded-md text-xs font-bold transition-all duration-200",
                  activeCategory === 'OPERASI' 
                    ? "bg-[#b91c1c] text-white shadow-inner" 
                    : "text-gray-300 hover:text-white"
                )}
              >
                Operasi
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="absolute top-6 right-[80px] z-[1000] flex flex-col gap-3 pointer-events-auto">
        <button 
          onClick={() => {
            setActiveCategory(null);
            setSearchQuery("");
            setCenter([-0.7893, 113.9213]);
            setZoom(5);
          }}
          className={cn(
            "text-[12px] font-black tracking-[0.1em] px-5 py-2.5 border-2 rounded-md shadow-[0_0_20px_rgba(0,0,0,0.6)] backdrop-blur-md transition-all uppercase flex items-center gap-2",
            activeCategory === null 
              ? "border-tactical-green text-white bg-tactical-green shadow-[0_0_15px_rgba(0,255,0,0.4)]" 
              : "border-gray-400 text-white bg-black/80 hover:border-tactical-green hover:bg-tactical-green/20 hover:shadow-[0_0_15px_rgba(0,255,0,0.2)]"
          )}
        >
          <RefreshCcw size={14} className={cn(activeCategory === null ? "animate-spin-slow" : "")} />
          Reset View
        </button>
        <button 
          onClick={() => setActiveCategory('INTELIJEN')}
          className={cn(
            "text-[12px] font-black tracking-[0.1em] px-5 py-2.5 border-2 rounded-md shadow-[0_0_20px_rgba(0,0,0,0.6)] backdrop-blur-md transition-all uppercase flex items-center gap-2",
            activeCategory === 'INTELIJEN' 
              ? "border-tactical-cyan text-black bg-tactical-cyan shadow-[0_0_15px_rgba(0,240,255,0.5)]" 
              : "border-gray-400 text-white bg-black/80 hover:border-tactical-cyan hover:bg-tactical-cyan/20 hover:shadow-[0_0_15px_rgba(0,240,255,0.2)]"
          )}
        >
          <ShieldAlert size={14} />
          Intelijen
        </button>
        <button 
          onClick={() => {
            setActiveCategory('SENJATA');
            setShowDataModal(true);
          }}
          className={cn(
            "text-[12px] font-black tracking-[0.1em] px-5 py-2.5 border-2 rounded-md shadow-[0_0_20px_rgba(0,0,0,0.6)] backdrop-blur-md transition-all uppercase flex items-center gap-2",
            activeCategory === 'SENJATA' 
              ? "border-yellow-500 text-black bg-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.5)]" 
              : "border-gray-400 text-white bg-black/80 hover:border-yellow-500 hover:bg-yellow-500/20 hover:shadow-[0_0_15px_rgba(234,179,8,0.2)]"
          )}
        >
          <Target size={14} />
          Senjata
        </button>
        <button 
          onClick={() => {
            setActiveCategory('ALUTSISTA');
            setShowDataModal(true);
          }}
          className={cn(
            "text-[12px] font-black tracking-[0.1em] px-5 py-2.5 border-2 rounded-md shadow-[0_0_20px_rgba(0,0,0,0.6)] backdrop-blur-md transition-all uppercase flex items-center gap-2",
            activeCategory === 'ALUTSISTA' 
              ? "border-orange-500 text-black bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.5)]" 
              : "border-gray-400 text-white bg-black/80 hover:border-orange-500 hover:bg-orange-500/20 hover:shadow-[0_0_15px_rgba(249,115,22,0.2)]"
          )}
        >
          <Package size={14} />
          Alutsista
        </button>
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
                          src={u.logo_url || "/logo_puskodal.png"} 
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
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-tactical-muted bg-tactical-dark font-mono uppercase sticky top-0">
                  <tr>
                    <th className="px-6 py-4 border-b border-tactical-border">STATUS</th>
                    <th className="px-6 py-4 border-b border-tactical-border">JUDUL LAPORAN</th>
                    <th className="px-6 py-4 border-b border-tactical-border">ANCAMAN</th>
                    <th className="px-6 py-4 border-b border-tactical-border">LOKASI</th>
                  </tr>
                </thead>
                <tbody>
                  {intelReports
                    .filter(intel => {
                      if (!searchQuery) return true;
                      const q = searchQuery.toLowerCase();
                      return (intel.title?.toLowerCase().includes(q) || 
                              intel.location_tag?.toLowerCase().includes(q));
                    })
                    .map((intel, i) => (
                    <tr 
                      key={intel.id || i} 
                      className="border-b border-tactical-border/50 hover:bg-tactical-green/5 transition-colors cursor-pointer group"
                      onClick={() => {
                        if (intel.coordinates) {
                          const coords = intel.coordinates.split(',');
                          if (coords.length === 2) {
                            const lat = parseFloat(coords[0]);
                            const lng = parseFloat(coords[1]);
                            if (!isNaN(lat) && !isNaN(lng)) {
                              setCenter([lat, lng]);
                              setZoom(13);
                              setShowDataModal(false);
                            }
                          }
                        }
                      }}
                    >
                      <td className="px-6 py-3">
                        <div className={cn(
                          "w-3 h-3 rounded-full animate-pulse",
                          intel.threat_level === 'HIGH' ? "bg-tactical-red" : "bg-tactical-yellow"
                        )} />
                      </td>
                      <td className="px-6 py-3 text-tactical-text font-bold group-hover:text-tactical-green transition-colors">{intel.title}</td>
                      <td className={cn(
                        "px-6 py-3 font-bold",
                        intel.threat_level === 'HIGH' ? "text-tactical-red" : "text-tactical-yellow"
                      )}>{intel.threat_level}</td>
                      <td className="px-6 py-3 font-mono text-tactical-muted">{intel.location_tag}</td>
                    </tr>
                  ))}
                  {intelReports.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-tactical-muted font-mono">
                        Tidak ada data intelijen yang ditemukan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
            {activeCategory === 'OPERASI' && (
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-tactical-muted bg-tactical-dark font-mono uppercase sticky top-0">
                  <tr>
                    <th className="px-6 py-4 border-b border-tactical-border">TYPE</th>
                    <th className="px-6 py-4 border-b border-tactical-border">NAMA OPERASI</th>
                    <th className="px-6 py-4 border-b border-tactical-border">STATUS</th>
                    <th className="px-6 py-4 border-b border-tactical-border">LOKASI</th>
                  </tr>
                </thead>
                <tbody>
                  {[...opsDalamNegeri.map(o => ({...o, opCategory: 'DOMESTIC'})), ...opsLuarNegeri.map(o => ({...o, opCategory: 'INTERNATIONAL'}))]
                    .filter(op => {
                      if (!searchQuery) return true;
                      const q = searchQuery.toLowerCase();
                      return (op.name?.toLowerCase().includes(q) || 
                              op.location?.toLowerCase().includes(q));
                    })
                    .map((op, i) => (
                    <tr 
                      key={`${op.opCategory}-${op.id || i}`} 
                      className="border-b border-tactical-border/50 hover:bg-tactical-green/5 transition-colors cursor-pointer group"
                      onClick={() => {
                        if (op.coordinates) {
                          const coords = op.coordinates.split(',');
                          if (coords.length === 2) {
                            const lat = parseFloat(coords[0]);
                            const lng = parseFloat(coords[1]);
                            if (!isNaN(lat) && !isNaN(lng)) {
                              setCenter([lat, lng]);
                              setZoom(13);
                              setShowDataModal(false);
                            }
                          }
                        }
                      }}
                    >
                      <td className="px-6 py-3">
                        <span className={cn(
                          "text-[10px] px-2 py-0.5 rounded-full border",
                          op.opCategory === 'DOMESTIC' ? "border-tactical-green text-tactical-green" : "border-tactical-cyan text-tactical-cyan"
                        )}>{op.opCategory}</span>
                      </td>
                      <td className="px-6 py-3 text-tactical-text font-bold group-hover:text-tactical-green transition-colors">{op.name}</td>
                      <td className="px-6 py-3">
                        <span className="text-tactical-yellow font-bold text-xs">{op.status}</span>
                      </td>
                      <td className="px-6 py-3 font-mono text-tactical-muted">{op.location}</td>
                    </tr>
                  ))}
                  {opsDalamNegeri.length === 0 && opsLuarNegeri.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-tactical-muted font-mono">
                        Tidak ada data operasi yang ditemukan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
            {(activeCategory === 'SENJATA' || activeCategory === 'ALUTSISTA') && (
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-tactical-muted bg-tactical-dark font-mono uppercase sticky top-0">
                  <tr>
                    <th className="px-6 py-4 border-b border-tactical-border">ITEM NAME</th>
                    <th className="px-6 py-4 border-b border-tactical-border">CATEGORY</th>
                    <th className="px-6 py-4 border-b border-tactical-border">QTY</th>
                    <th className="px-6 py-4 border-b border-tactical-border">STATUS</th>
                    <th className="px-6 py-4 border-b border-tactical-border">LOCATION</th>
                  </tr>
                </thead>
                <tbody>
                  {logistics
                    .filter(item => {
                      // Filter by category if SENJATA or ALUTSISTA
                      if (activeCategory === 'SENJATA') {
                        if (item.category !== 'Weaponry' && item.category !== 'Ammunition') return false;
                      } else if (activeCategory === 'ALUTSISTA') {
                        // For now everything else is considered alutsista or we show all if not weaponry
                        if (item.category === 'Weaponry' || item.category === 'Ammunition') return false;
                      }
                      
                      if (!searchQuery) return true;
                      const q = searchQuery.toLowerCase();
                      return (item.item_name?.toLowerCase().includes(q) || 
                              item.category?.toLowerCase().includes(q) ||
                              item.unit_name?.toLowerCase().includes(q) ||
                              item.unit_location?.toLowerCase().includes(q));
                    })
                    .map((item, i) => (
                    <tr 
                      key={item.id || i} 
                      className="border-b border-tactical-border/50 hover:bg-tactical-green/5 transition-colors group"
                    >
                      <td className="px-6 py-3 text-tactical-text font-bold group-hover:text-tactical-green transition-colors">{item.item_name}</td>
                      <td className="px-6 py-3">
                        <span className="text-[10px] px-2 py-0.5 rounded-full border border-tactical-muted/30 text-tactical-muted uppercase">{item.category}</span>
                      </td>
                      <td className="px-6 py-3 font-mono text-tactical-text">{item.quantity} {item.unit}</td>
                      <td className="px-6 py-3">
                        <div className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-bold uppercase inline-block",
                          item.condition_status === 'GOOD' ? "bg-emerald-500/20 text-emerald-500" :
                          item.condition_status === 'MAINTENANCE' ? "bg-yellow-500/20 text-yellow-500" :
                          "bg-red-500/20 text-red-500"
                        )}>
                          {item.condition_status}
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <div className="text-xs font-bold text-tactical-text">{item.unit_name || 'PUSKODAL'}</div>
                        <div className="text-[10px] text-tactical-muted italic">{item.unit_location || 'Jakarta'}</div>
                      </td>
                    </tr>
                  ))}
                  {logistics.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-tactical-muted font-mono">
                        Tidak ada data logistik yang ditemukan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

        </>
      )}
    </div>
  );
}

export default function MapPage() {
  return (
    <Suspense fallback={
      <div className="w-full h-screen bg-tactical-bg border border-tactical-border flex items-center justify-center flex-col gap-4">
        <div className="w-12 h-12 border-4 border-tactical-green border-t-transparent rounded-full animate-spin"></div>
        <div className="text-tactical-green font-mono text-sm tracking-widest animate-pulse">PREPARING TACTICAL INTERFACE...</div>
      </div>
    }>
      <MapContent />
    </Suspense>
  );
}

