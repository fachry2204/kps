"use client";

import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronUp, ChevronDown, Search, Database, Eye, LayoutDashboard, Shield, Activity, MessageSquare, Users, Package, BarChart3, Settings, ChevronLeft, ChevronRight, Map as MapIcon, RefreshCcw, ShieldAlert, Target, Building2, MapPin, Crosshair } from "lucide-react";
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
      <div className="text-tactical-green font-mono text-sm tracking-widest animate-pulse">MEMBANGUN KONEKSI SATELIT...</div>
    </div>
  )}
);

function MapContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const initialLat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : -0.7893;
  const initialLng = searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : 113.9213;
  const initialZoom = searchParams.get('zoom') ? parseInt(searchParams.get('zoom')!) : 3;

  const [isFullScreen, setIsFullScreen] = useState(true);
  const [center, setCenter] = useState<[number, number]>([initialLat, initialLng]);
  const [zoom, setZoom] = useState<number>(initialZoom);
  const [moveTrigger, setMoveTrigger] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [units, setUnits] = useState<any[]>([]);
  const [intelReports, setIntelReports] = useState<any[]>([]);
  const [opsDalamNegeri, setOpsDalamNegeri] = useState<any[]>([]);
  const [opsLuarNegeri, setOpsLuarNegeri] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDataModal, setShowDataModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [logistics, setLogistics] = useState<any[]>([]);
  const [opFilter, setOpFilter] = useState("ALL");
  const [extSelectedEntity, setExtSelectedEntity] = useState<any>(null);
  const [extActiveModal, setExtActiveModal] = useState<any>(null);
  const [logisticCategoryFilter, setLogisticCategoryFilter] = useState("ALL");
  const [intelStatusFilter, setIntelStatusFilter] = useState("ALL");

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
  };

  useEffect(() => {
    getUnits().then(data => setUnits(data));
    getIntelReports().then(data => setIntelReports(data));
    getOpsDalamNegeri().then(data => setOpsDalamNegeri(data));
    getOpsLuarNegeri().then(data => setOpsLuarNegeri(data));
    getLogistics().then(data => setLogistics(data));
  }, []);

  const aggregatedLogistics = (() => {
    const grouped: Record<string, any> = {};
    logistics.forEach(item => {
      const name = (item.item_name || item.name || "UNNAMED").toUpperCase();
      if (!grouped[name]) {
        grouped[name] = { 
          ...item, 
          item_name: name,
          total_quantity: 0, 
          unit_count: 0,
          unit_names: [] 
        };
      }
      const qty = Number(item.quantity || 0);
      grouped[name].total_quantity += qty;
      grouped[name].unit_count += 1;
      if (item.unit_name) grouped[name].unit_names.push(item.unit_name);
    });
    return Object.values(grouped);
  })();

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) {
      setActiveCategory(cat.toUpperCase());
      if (cat.toUpperCase() === 'LOGISTIK') {
        setShowDataModal(true);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    if (!isFullScreen) {
      router.push("/dashboard");
    }
  }, [isFullScreen, router]);

  return (
    <div className="relative w-full h-screen bg-tactical-bg overflow-hidden shadow-2xl">
      {!isFullScreen ? (
        <div className="flex items-center justify-center h-full text-tactical-green font-mono">
          MENGALIHKAN KE BERANDA...
        </div>
      ) : (
        <>
          {/* Full Screen Close Button */}
      <button 
        onClick={() => setIsFullScreen(false)}
        className="absolute top-6 right-6 z-[1000] p-2 bg-tactical-red/20 border border-tactical-red text-tactical-red rounded-full hover:bg-tactical-red hover:text-white transition-all shadow-[0_0_15px_rgba(255,51,51,0.3)] group"
        title="Keluar dari Layar Penuh"
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
          opFilter={opFilter}
          intelStatusFilter={intelStatusFilter}
          moveTrigger={moveTrigger}
          onMarkerClick={(newCenter, newZoom) => {
            setCenter(newCenter);
            setZoom(newZoom);
            setMoveTrigger(prev => prev + 1);
          }}
          externalSelectedEntity={extSelectedEntity}
          externalActiveModal={extActiveModal}
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
                  setShowDataModal(true);
                  setSearchQuery("");
                  setCenter([-0.7893, 113.9213]);
                  setZoom(3);
                  setMoveTrigger(prev => prev + 1);
                }}
                className={cn(
                  "flex-1 rounded-md text-xs font-bold transition-all duration-200",
                  activeCategory === 'KESATUAN' 
                    ? "bg-[#b91c1c] text-white shadow-inner" 
                    : "text-gray-300 hover:text-white"
                )}
              >
                Kesatuan
              </button>
              <button 
                onClick={() => {
                  setActiveCategory('OPERASI');
                  setShowDataModal(true);
                  setSearchQuery("");
                  setCenter([-0.7893, 113.9213]);
                  setZoom(3);
                  setMoveTrigger(prev => prev + 1);
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
            setZoom(3);
            setMoveTrigger(prev => prev + 1);
          }}
          className={cn(
            "text-[12px] font-black tracking-[0.1em] px-5 py-2.5 border-2 rounded-md shadow-[0_0_20px_rgba(0,0,0,0.6)] backdrop-blur-md transition-all uppercase flex items-center gap-2",
            activeCategory === null 
              ? "border-tactical-green text-white bg-tactical-green shadow-[0_0_15px_rgba(0,255,0,0.4)]" 
              : "border-gray-400 text-white bg-black/80 hover:border-tactical-green hover:bg-tactical-green/20 hover:shadow-[0_0_15px_rgba(0,255,0,0.2)]"
          )}
        >
          <RefreshCcw size={14} className={cn(activeCategory === null ? "animate-spin-slow" : "")} />
          SEMUA MAP
        </button>
        <button 
          onClick={() => {
            setActiveCategory('INTELIJEN');
            setShowDataModal(true);
          }}
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
            setActiveCategory('LOGISTIK');
            setShowDataModal(true);
            setSearchQuery("");
            setCenter([-0.7893, 113.9213]);
            setZoom(3);
            setMoveTrigger(prev => prev + 1);
          }}
          className={cn(
            "text-[12px] font-black tracking-[0.1em] px-5 py-2.5 border-2 rounded-md shadow-[0_0_20px_rgba(0,0,0,0.6)] backdrop-blur-md transition-all uppercase flex items-center gap-2",
            activeCategory === 'LOGISTIK' 
              ? "border-orange-500 text-black bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.5)]" 
              : "border-gray-400 text-white bg-black/80 hover:border-orange-500 hover:bg-orange-500/20 hover:shadow-[0_0_15px_rgba(249,115,22,0.2)]"
          )}
        >
          <Package size={14} />
          Logistik
        </button>
      </div>

      {/* Button to view data corresponding to the active category */}


      {/* Side Panel for KESATUAN (Special Request) */}
      <AnimatePresence>
        {showDataModal && activeCategory && (
          <motion.div 
            initial={{ x: -400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -400, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-20 bottom-20 w-80 bg-tactical-bg/95 backdrop-blur-md border border-tactical-green rounded-xl z-[1000] flex flex-col shadow-[0_0_30px_rgba(0,255,0,0.2)] overflow-hidden"
            style={{ left: 'calc(var(--sidebar-width, 80px) + 16px)' }}
          >
            <div className="flex justify-between items-center p-4 border-b border-tactical-border bg-tactical-green/10">
              <h3 className="font-bold text-tactical-text text-xs tracking-widest flex items-center gap-2">
                {activeCategory === 'KESATUAN' ? <Building2 className="w-4 h-4 text-tactical-green" /> : 
                 activeCategory === 'OPERASI' ? <Crosshair className="w-4 h-4 text-tactical-green" /> :
                 activeCategory === 'INTELIJEN' ? <ShieldAlert className="w-4 h-4 text-tactical-cyan" /> :
                 <Package className="w-4 h-4 text-orange-500" />}
                {activeCategory}
              </h3>
              <button 
                onClick={() => {
                  setShowDataModal(false);
                  setActiveCategory(null);
                  setSearchQuery("");
                  setCenter([-0.7893, 113.9213]);
                  setZoom(3);
                  setMoveTrigger(prev => prev + 1);
                }} 
                className="text-tactical-muted hover:text-tactical-red transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-3 border-b border-tactical-border bg-black/40">
              <div className="flex gap-2">
                {activeCategory === 'OPERASI' && (
                  <div className="flex flex-col gap-2 flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-tactical-muted" />
                      <input 
                        type="text" 
                        placeholder={`Cari ${activeCategory?.toLowerCase()}...`}
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="w-full bg-tactical-bg border border-tactical-border rounded-md py-1.5 pl-9 pr-3 text-xs text-tactical-text focus:outline-none focus:border-tactical-green transition-colors"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-2">
                       <select 
                         value={opFilter}
                         onChange={(e) => setOpFilter(e.target.value)}
                         className="flex-1 bg-tactical-bg border border-tactical-border rounded px-2 py-1 text-[10px] text-tactical-text outline-none focus:border-tactical-green uppercase font-mono"
                       >
                         <option value="ALL">SEMUA OPERASI</option>
                         <option value="DN">DALAM NEGRI</option>
                         <option value="LN">LUAR NEGRI</option>
                       </select>
                       <div className="px-2 py-1 bg-tactical-green/10 border border-tactical-green/30 rounded flex items-center gap-2">
                          <span className="text-[8px] text-tactical-muted uppercase font-bold">TOTAL:</span>
                          <span className="text-[10px] font-black text-tactical-green">{
                            [...opsDalamNegeri.map(o => ({...o, cat: 'DN'})), ...opsLuarNegeri.map(o => ({...o, cat: 'LN'}))]
                              .filter(op => {
                                if (opFilter !== 'ALL' && op.cat !== opFilter) return false;
                                if (!searchQuery) return true;
                                const q = searchQuery.toLowerCase();
                                return (op.name?.toLowerCase().includes(q) || op.location?.toLowerCase().includes(q));
                              }).length
                          }</span>
                       </div>
                    </div>
                  </div>
                )}
                {activeCategory === 'INTELIJEN' && (
                  <div className="flex flex-col gap-2 flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-tactical-muted" />
                      <input 
                        type="text" 
                        placeholder="Cari intelijen..."
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="w-full bg-tactical-bg border border-tactical-border rounded-md py-1.5 pl-9 pr-3 text-xs text-tactical-text focus:outline-none focus:border-tactical-cyan transition-colors"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-2">
                       <select 
                         value={intelStatusFilter}
                         onChange={(e) => setIntelStatusFilter(e.target.value)}
                         className="flex-1 bg-tactical-bg border border-tactical-border rounded px-2 py-1 text-[10px] text-tactical-text outline-none focus:border-tactical-cyan uppercase font-mono"
                       >
                         <option value="ALL">SEMUA STATUS</option>
                         {[...new Set(intelReports.map(i => i.threat_level))].filter(Boolean).map(status => (
                           <option key={status} value={status}>{status}</option>
                         ))}
                       </select>
                       <div className="px-2 py-1 bg-tactical-cyan/10 border border-tactical-cyan/30 rounded flex items-center gap-2">
                          <span className="text-[8px] text-tactical-muted uppercase font-bold">TOTAL:</span>
                          <span className="text-[10px] font-black text-tactical-cyan">{
                            intelReports.filter(intel => {
                              if (intelStatusFilter !== 'ALL' && intel.threat_level !== intelStatusFilter) return false;
                              if (!searchQuery) return true;
                              const q = searchQuery.toLowerCase();
                              return (intel.title?.toLowerCase().includes(q) || 
                                     intel.location_tag?.toLowerCase().includes(q));
                            }).length
                          }</span>
                       </div>
                    </div>
                  </div>
                )}
                {activeCategory !== 'OPERASI' && activeCategory !== 'LOGISTIK' && activeCategory !== 'INTELIJEN' && (
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-tactical-muted" />
                    <input 
                      type="text" 
                      placeholder={`Cari ${activeCategory?.toLowerCase()}...`}
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="w-full bg-tactical-bg border border-tactical-border rounded-md py-1.5 pl-9 pr-3 text-xs text-tactical-text focus:outline-none focus:border-tactical-green transition-colors"
                    />
                  </div>
                )}
                {activeCategory === 'LOGISTIK' && (
                  <div className="flex flex-col gap-2 flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-tactical-muted" />
                      <input 
                        type="text" 
                        placeholder="Cari logistik..."
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="w-full bg-tactical-bg border border-tactical-border rounded-md py-1.5 pl-9 pr-3 text-xs text-tactical-text focus:outline-none focus:border-tactical-green transition-colors"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-2">
                       <select 
                         value={logisticCategoryFilter}
                         onChange={(e) => setLogisticCategoryFilter(e.target.value)}
                         className="flex-1 bg-tactical-bg border border-tactical-border rounded px-2 py-1 text-[10px] text-tactical-text outline-none focus:border-tactical-green uppercase font-mono"
                       >
                         <option value="ALL">SEMUA KATEGORI</option>
                         {[...new Set(logistics.map(l => l.category))].filter(Boolean).map(cat => (
                           <option key={cat} value={cat}>{cat}</option>
                         ))}
                       </select>
                       <div className="px-2 py-1 bg-tactical-green/10 border border-tactical-green/30 rounded flex items-center gap-2">
                          <span className="text-[8px] text-tactical-muted uppercase font-bold">TOTAL:</span>
                          <span className="text-[10px] font-black text-tactical-green">{
                            aggregatedLogistics.filter(item => {
                              if (logisticCategoryFilter !== 'ALL' && item.category !== logisticCategoryFilter) return false;
                              if (!searchQuery) return true;
                              const q = searchQuery.toLowerCase();
                              return item.item_name?.toLowerCase().includes(q) || 
                                     item.category?.toLowerCase().includes(q);
                            }).length
                          }</span>
                       </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {activeCategory === 'KESATUAN' ? (
                units
                  .filter(u => {
                    if (!searchQuery) return true;
                    const q = searchQuery.toLowerCase();
                    return (u.unit_name?.toLowerCase().includes(q) || 
                            u.unit_type?.toLowerCase().includes(q) || 
                            u.location?.toLowerCase().includes(q));
                  })
                  .map((u, i) => (
                  <div 
                    key={`unit-${u.id}-${i}`} 
                    onClick={() => {
                      if (u.coordinates) {
                        const coords = u.coordinates.split(',');
                        if (coords.length === 2) {
                          const lat = parseFloat(coords[0]);
                          const lng = parseFloat(coords[1]);
                          if (!isNaN(lat) && !isNaN(lng)) {
                            setCenter([lat, lng]);
                            setZoom(10);
                            setMoveTrigger(prev => prev + 1);
                          }
                        }
                      }
                      setExtSelectedEntity({...u, type: 'UNIT'});
                      setExtActiveModal(null);
                    }}
                    className="p-4 border-b border-tactical-border/50 hover:bg-tactical-green/5 transition-all cursor-pointer group relative overflow-hidden"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full border border-tactical-green/30 bg-black/40 flex items-center justify-center overflow-hidden shrink-0 group-hover:border-tactical-green transition-colors">
                        <img src={u.logo_url || "/logo_puskodal.png"} alt="" className="w-7 h-7 object-contain" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[12px] font-bold text-tactical-text group-hover:text-tactical-green transition-colors truncate uppercase leading-tight">
                          {u.unit_name}
                        </div>
                        <div className="text-[10px] font-mono text-tactical-muted flex items-center gap-1 mt-0.5">
                          <Activity size={10} className="text-tactical-green" /> {u.unit_type || 'KESATUAN'}
                        </div>
                        <div className="text-[9px] text-tactical-muted flex items-center gap-1 truncate mt-0.5">
                          <MapPin size={8} /> {u.location}
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setExtSelectedEntity({...u, type: 'UNIT'});
                            setExtActiveModal('UNIT_DETAIL');
                          }}
                          className="mt-2 text-[9px] font-bold text-tactical-green hover:underline flex items-center gap-1 uppercase"
                        >
                          <Eye size={10} /> Lihat Detail
                        </button>
                      </div>
                      <ChevronRight size={14} className="text-tactical-muted group-hover:text-tactical-green group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                ))
              ) : activeCategory === 'OPERASI' ? (
                [...opsDalamNegeri.map(o => ({...o, category: 'DN'})), ...opsLuarNegeri.map(o => ({...o, category: 'LN'}))]
                  .filter(op => {
                    if (opFilter !== 'ALL' && op.category !== opFilter) return false;
                    if (!searchQuery) return true;
                    const q = searchQuery.toLowerCase();
                    return (op.name?.toLowerCase().includes(q) || 
                            op.location?.toLowerCase().includes(q));
                  })
                  .map((op, i) => (
                  <div 
                    key={`op-${op.id}-${i}`} 
                    onClick={() => {
                      if (op.coordinates) {
                        const coords = op.coordinates.split(',');
                        if (coords.length === 2) {
                          const lat = parseFloat(coords[0]);
                          const lng = parseFloat(coords[1]);
                          if (!isNaN(lat) && !isNaN(lng)) {
                            setCenter([lat, lng]);
                            setZoom(10);
                            setMoveTrigger(prev => prev + 1);
                          }
                        }
                      }
                    }}
                    className="p-4 border-b border-tactical-border/50 hover:bg-tactical-green/5 transition-all cursor-pointer group relative overflow-hidden"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full border border-tactical-red/30 bg-black/40 flex items-center justify-center overflow-hidden shrink-0 group-hover:border-tactical-red transition-colors">
                        <Crosshair size={18} className="text-tactical-red" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[12px] font-bold text-tactical-text group-hover:text-tactical-red transition-colors truncate uppercase leading-tight">
                          {op.name}
                        </div>
                        <div className="text-[10px] font-mono text-tactical-muted flex items-center gap-1 mt-0.5">
                          <span className={cn(
                            "px-1.5 py-0.5 rounded text-[8px] border font-bold uppercase",
                            op.category === 'DN' ? "border-blue-500 text-blue-400 bg-blue-500/10" : "border-cyan-400 text-cyan-300 bg-cyan-400/10"
                          )}>{op.category === 'DN' ? 'Dalam Negeri' : 'Luar Negeri'}</span>
                          <Activity size={10} className="text-tactical-red ml-1" /> {op.status}
                        </div>
                        <div className="text-[9px] text-tactical-muted flex items-center gap-1 truncate mt-0.5">
                          <MapPin size={8} /> {op.location}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <ChevronRight size={14} className="text-tactical-muted group-hover:text-tactical-red group-hover:translate-x-1 transition-all" />
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            if (op.coordinates) {
                              const coords = op.coordinates.split(',');
                              if (coords.length === 2) {
                                const lat = parseFloat(coords[0]);
                                const lng = parseFloat(coords[1]);
                                if (!isNaN(lat) && !isNaN(lng)) {
                                  setCenter([lat, lng]);
                                  setZoom(15);
                                  setMoveTrigger(prev => prev + 1);
                                }
                              }
                            }
                            setExtSelectedEntity(op);
                            setExtActiveModal('OPERASI_DETAIL');
                          }}
                          className="px-2 py-1 bg-tactical-red/20 border border-tactical-red/40 text-[9px] font-black text-tactical-red rounded hover:bg-tactical-red hover:text-white transition-all whitespace-nowrap"
                        >
                          LIHAT DETAIL
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : activeCategory === 'INTELIJEN' ? (
                intelReports
                  .filter(intel => {
                    if (intelStatusFilter !== 'ALL' && intel.threat_level !== intelStatusFilter) return false;
                    if (!searchQuery) return true;
                    const q = searchQuery.toLowerCase();
                    return (intel.title?.toLowerCase().includes(q) || 
                            intel.location_tag?.toLowerCase().includes(q) ||
                            intel.threat_level?.toLowerCase().includes(q));
                  })
                  .map((intel, i) => (
                  <div 
                    key={`intel-${intel.id}-${i}`} 
                    onClick={() => {
                      if (intel.coordinates) {
                        const coords = intel.coordinates.split(',');
                        if (coords.length === 2) {
                          const lat = parseFloat(coords[0]);
                          const lng = parseFloat(coords[1]);
                          if (!isNaN(lat) && !isNaN(lng)) {
                            setCenter([lat, lng]);
                            setZoom(10);
                            setMoveTrigger(prev => prev + 1);
                          }
                        }
                      }
                    }}
                    className="p-4 border-b border-tactical-border/50 hover:bg-tactical-green/5 transition-all cursor-pointer group relative overflow-hidden"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full animate-pulse shrink-0" style={{ backgroundColor: 
                        intel.threat_level === 'STABIL' ? '#10b981' :
                        intel.threat_level === 'TERJAGA' ? '#3b82f6' :
                        intel.threat_level === 'MENINGKAT' ? '#f59e0b' :
                        intel.threat_level === 'TINGGI' ? '#f97316' : '#ef4444'
                      }} />
                      <div className="min-w-0 flex-1">
                        <div className="text-[12px] font-bold text-tactical-text group-hover:text-tactical-cyan transition-colors truncate uppercase leading-tight">
                          {intel.title}
                        </div>
                        <div className="text-[10px] font-mono flex items-center gap-1 mt-0.5" style={{ color: 
                          intel.threat_level === 'STABIL' ? '#10b981' :
                          intel.threat_level === 'TERJAGA' ? '#3b82f6' :
                          intel.threat_level === 'MENINGKAT' ? '#f59e0b' :
                          intel.threat_level === 'TINGGI' ? '#f97316' : '#ef4444'
                        }}>
                          {intel.threat_level}
                        </div>
                        <div className="text-[9px] text-tactical-muted flex items-center gap-1 truncate mt-0.5">
                          <MapPin size={8} /> {intel.location_tag}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <ChevronRight size={14} className="text-tactical-muted group-hover:text-tactical-cyan group-hover:translate-x-1 transition-all" />
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setExtSelectedEntity(intel);
                            setExtActiveModal('INTEL_DETAIL');
                          }}
                          className="px-2 py-1 bg-tactical-cyan/20 border border-tactical-cyan/40 text-[9px] font-black text-tactical-cyan rounded hover:bg-tactical-cyan hover:text-black transition-all whitespace-nowrap"
                        >
                          LIHAT DETAIL
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : activeCategory === 'LOGISTIK' ? (
                aggregatedLogistics
                  .filter(item => {
                    if (logisticCategoryFilter !== 'ALL' && item.category !== logisticCategoryFilter) return false;
                    if (!searchQuery) return true;
                    const q = searchQuery.toLowerCase();
                    return item.item_name?.toLowerCase().includes(q) || 
                           item.category?.toLowerCase().includes(q) ||
                           item.unit_names.some((un: string) => un.toLowerCase().includes(q));
                  })
                  .map((item, i) => (
                  <div 
                    key={`log-${item.id}-${i}`} 
                    onClick={() => {
                      setExtSelectedEntity({...item, type: 'LOGISTIK', name: item.item_name, quantity: item.total_quantity});
                      setExtActiveModal('LOGISTIK_DETAIL');
                    }}
                    className="p-4 border-b border-tactical-border/50 hover:bg-tactical-green/5 transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-black/40 border border-tactical-border/50 flex items-center justify-center overflow-hidden shrink-0 group-hover:border-tactical-green transition-colors">
                        {item.image_url ? (
                          <img src={item.image_url} alt="" className="w-full h-full object-contain p-1" />
                        ) : (
                          <Package size={18} className="text-tactical-green/30" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[12px] font-bold text-tactical-text group-hover:text-tactical-green transition-colors truncate uppercase leading-tight">
                          {item.item_name}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full border border-tactical-muted/30 text-tactical-muted uppercase font-mono">{item.category}</span>
                          <span className="text-[10px] font-mono text-tactical-text font-bold">{item.total_quantity} {item.unit}</span>
                        </div>
                        {/* Removed: TERSEBAR DI X SATUAN */}
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <ChevronRight size={14} className="text-tactical-muted group-hover:text-tactical-green group-hover:translate-x-1 transition-all self-end" />
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setExtSelectedEntity({...item, type: 'LOGISTIK', name: item.item_name, quantity: item.total_quantity});
                            setExtActiveModal('LOGISTIK_DETAIL');
                          }}
                          className="px-2 py-1 bg-tactical-green/20 border border-tactical-green/40 text-[9px] font-black text-tactical-green rounded hover:bg-tactical-green hover:text-black transition-all whitespace-nowrap"
                        >
                          LIHAT MAP
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>


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
        <div className="text-tactical-green font-mono text-sm tracking-widest animate-pulse">MENYIAPKAN ANTARMUKA TAKTIS...</div>
      </div>
    }>
      <MapContent />
    </Suspense>
  );
}

