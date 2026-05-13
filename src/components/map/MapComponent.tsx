"use client";

import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, LayersControl, LayerGroup, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Crosshair, ShieldAlert, Plus, Minus, MapPin, Truck, Users, Target, ClipboardList, X, ChevronLeft, ChevronRight, Search, Radio, MessageSquare, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// Fix leafet default icon issue in Next.js
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const tacticalIcon = new L.DivIcon({
  className: 'custom-tactical-icon',
  html: `<div style="background-color: #ff3333; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px #ff3333; animation: pulse 2s infinite;"></div>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6]
});

const createIntelIcon = (threatLevel: string) => {
  const isHigh = threatLevel === 'HIGH' || threatLevel === 'SEVERE';
  return new L.DivIcon({
    className: 'custom-intel-icon',
    html: `<div style="background-color: #ff3333; width: ${isHigh ? '20px' : '16px'}; height: ${isHigh ? '20px' : '16px'}; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 15px #ff3333; display: flex; align-items: center; justify-content: center; position: relative;">
             ${isHigh ? `<div style="position: absolute; inset: -4px; border: 2px solid #ff3333; border-radius: 50%; animation: pulse-high 0.8s infinite;"></div>` : ''}
             <div style="width: ${isHigh ? '10px' : '8px'}; height: ${isHigh ? '10px' : '8px'}; background-color: white; border-radius: 50%; animation: pulse 1s infinite;"></div>
           </div>`,
    iconSize: isHigh ? [20, 20] : [16, 16],
    iconAnchor: isHigh ? [10, 10] : [8, 8]
  });
};

const opIcon = new L.DivIcon({
  className: 'custom-op-icon',
  html: `<div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background: #000; border: 2px solid #ff0000; box-shadow: 0 0 10px rgba(255, 0, 0, 0.8); z-index: 1;"></div>
            <div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; border: 3px solid #ff0000; animation: pulse-high 2s infinite; z-index: 0;"></div>
            <img src="https://upload.wikimedia.org/wikipedia/commons/6/61/Lambang_Kopassus.svg" style="width: 24px; height: 24px; object-fit: contain; z-index: 2; filter: drop-shadow(0 0 3px rgba(255,0,0,0.5));" />
         </div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18]
});

const createUnitIcon = (logoUrl?: string) => {
  const actualLogo = logoUrl || "https://upload.wikimedia.org/wikipedia/commons/6/61/Lambang_Kopassus.svg";
  return new L.DivIcon({
    className: 'custom-unit-icon',
    html: `<div style="width: 40px; height: 40px; border-radius: 50%; overflow: hidden; border: 2px solid var(--color-tactical-green); background-color: var(--color-tactical-bg); display: flex; align-items: center; justify-content: center; box-shadow: 0 0 10px var(--color-tactical-green);">
             <img src="${actualLogo}" style="width: 80%; height: 80%; object-fit: contain;" />
           </div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20]
  });
};

function MapViewUpdater({ center, zoom, onZoomEnd }: { center: [number, number], zoom: number, onZoomEnd?: (zoom: number) => void }) {
  const map = useMap();
  const lastCenterRef = React.useRef<string>(JSON.stringify(center));
  const lastZoomRef = React.useRef<number>(zoom);
  
  useEffect(() => {
    const currentCenterStr = JSON.stringify(center);
    const centerChanged = currentCenterStr !== lastCenterRef.current;
    const zoomChanged = zoom !== lastZoomRef.current;
    
    // IF CENTER PROP CHANGED: Explicitly fly to the new target location (Marker Click)
    if (centerChanged) {
      map.flyTo(center, zoom, { 
        duration: 1.5, // Fast and responsive for direct navigation
        easeLinearity: 0.25,
        animate: true
      });
      lastCenterRef.current = currentCenterStr;
      lastZoomRef.current = zoom;
    } 
    // IF ONLY ZOOM CHANGED: Zoom into current view (Slider/Manual Zoom)
    else if (zoomChanged) {
      map.flyTo(map.getCenter(), zoom, {
        duration: 0.5,
        animate: true
      });
      lastZoomRef.current = zoom;
    }
  }, [center, zoom, map]);


  useMapEvents({
    zoomend() {
      if (onZoomEnd) onZoomEnd(map.getZoom());
    },
    click(e) {
      // If user clicks on empty map space (not caught by marker stopPropagation)
      const target = e.originalEvent.target as HTMLElement;
      if (target.classList.contains('leaflet-container')) {
        // Trigger a global reset event or call a prop
      }
    }
  });
  
  return null;
}

function MapEventsHandler({ onMapClick }: { onMapClick: () => void }) {
  useMapEvents({
    click() {
      onMapClick();
    }
  });
  return null;
}

// Removed ZoomController to prevent conflicts with flyTo

export default function MapComponent({ 
  isFullScreen = false,
  targetCenter = [-0.7893, 113.9213],
  targetZoom = 5,
  activeCategory = null,
  units = [],
  intelReports = [],
  opsDalamNegeri = [],
  opsLuarNegeri = [],
  searchQuery = "",
  singleMarker = null,
  onMarkerClick
}: { 
  isFullScreen?: boolean;
  targetCenter?: [number, number];
  targetZoom?: number;
  activeCategory?: string | null;
  units?: any[];
  intelReports?: any[];
  opsDalamNegeri?: any[];
  opsLuarNegeri?: any[];
  searchQuery?: string;
  singleMarker?: [number, number] | null;
  onMarkerClick?: (center: [number, number], zoom: number) => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(targetZoom);
  const [selectedEntity, setSelectedEntity] = useState<any>(null);
  const [activeModal, setActiveModal] = useState<'PERSONNEL' | 'KEGIATAN' | 'PERSONNEL_DETAIL' | 'SENJATA' | 'ALUTSISTA' | 'SENJATA_DETAIL' | 'ALUTSISTA_DETAIL' | 'OPERASI_DETAIL' | null>(null);
  const [selectedPersonnel, setSelectedPersonnel] = useState<any>(null);
  const [selectedWeapon, setSelectedWeapon] = useState<any>(null);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [selectedOperation, setSelectedOperation] = useState<any>(null);
  const [modalSearchQuery, setModalSearchQuery] = useState('');
  const [opActiveTab, setOpActiveTab] = useState('Informasi');
  const [detailReturnModal, setDetailReturnModal] = useState<'PERSONNEL' | 'SENJATA' | 'ALUTSISTA' | 'OPERASI_DETAIL' | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setCurrentZoom(targetZoom);
  }, [targetZoom]);

  return (
    <div className={cn(
      "relative w-full overflow-hidden transition-all duration-500",
      isFullScreen 
        ? "h-screen w-screen" 
        : "h-[600px] rounded-lg tactical-border border-tactical-green"
    )}>
      {!mounted ? (
        <div className="w-full h-full bg-tactical-bg flex items-center justify-center text-tactical-green">
          INITIALIZING SATELLITE LINK...
        </div>
      ) : (
        <>
          {/* Overlay UI elements */}
          <div className="absolute top-4 right-4 z-[400] flex flex-col gap-2 pointer-events-none">
            <div className="tactical-glass p-3 rounded pointer-events-auto border-tactical-border border">
              <div className="text-tactical-green font-mono text-xs mb-2">TARGET LOCK</div>
              <div className="flex items-center gap-2 text-tactical-text text-sm">
                <Crosshair className="w-4 h-4 text-tactical-red" />
                Sektor A: Aktif
              </div>
            </div>
          </div>

          <MapContainer 
            center={targetCenter} 
            zoom={targetZoom} 
            style={{ height: '100%', width: '100%', backgroundColor: '#f8f9fa' }}
            zoomControl={false}
            attributionControl={false}
          >
        <style>
          {`
            @keyframes pulse {
              0% { transform: scale(0.95); opacity: 0.8; }
              50% { transform: scale(1.05); opacity: 1; }
              100% { transform: scale(0.95); opacity: 0.8; }
            }
            @keyframes pulse-high {
              0% { transform: scale(1); opacity: 0.8; }
              70% { transform: scale(2); opacity: 0; }
              100% { transform: scale(1); opacity: 0; }
            }
            @keyframes rotate-slow {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
            .tactical-popup .leaflet-popup-content-wrapper {
              background: rgba(10, 15, 20, 0.9) !important;
              color: #e0e0e0 !important;
              border: 1px solid rgba(0, 255, 0, 0.3) !important;
              border-radius: 4px !important;
              box-shadow: 0 0 20px rgba(0, 255, 0, 0.2) !important;
              backdrop-filter: blur(8px);
            }
            .tactical-popup .leaflet-popup-tip {
              background: rgba(10, 15, 20, 0.9) !important;
              border: 1px solid rgba(0, 255, 0, 0.3) !important;
            }
            .tactical-popup .leaflet-popup-content {
              margin: 12px !important;
              min-width: 200px !important;
              max-width: 400px !important;
            }
            .radial-item-glow {
              box-shadow: 0 0 15px rgba(201, 160, 65, 0.3);
            }
            .radial-item-glow:hover {
              box-shadow: 0 0 25px rgba(201, 160, 65, 0.6);
              border-color: #c9a041 !important;
            }
            .custom-scrollbar::-webkit-scrollbar {
              width: 4px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: rgba(0, 0, 0, 0.2);
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: var(--color-tactical-green);
              border-radius: 10px;
            }
          `}
        </style>
        <MapViewUpdater center={targetCenter} zoom={currentZoom} onZoomEnd={setCurrentZoom} />
        <LayersControl position="bottomright">
          <LayersControl.BaseLayer checked name="Google Maps Roadmap">
            <TileLayer
              url="https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
              subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Google Maps Satellite">
            <LayerGroup>
              <TileLayer
                url="https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
                subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
              />
              <TileLayer
                url="https://{s}.google.com/vt/lyrs=h&x={x}&y={y}&z={z}"
                subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
                zIndex={1000}
              />
            </LayerGroup>
          </LayersControl.BaseLayer>
        </LayersControl>
        <MapEventsHandler onMapClick={() => {
          setSelectedEntity(null);
          if (onMarkerClick) onMarkerClick([-0.7893, 113.9213], 5);
        }} />

        {(!activeCategory || activeCategory === 'KESATUAN') && (
          <>
            {units
              .filter(unit => {
                if (!searchQuery) return true;
                const q = searchQuery.toLowerCase();
                return (unit.unit_name?.toLowerCase().includes(q) || 
                        unit.location?.toLowerCase().includes(q) ||
                        unit.unit_type?.toLowerCase().includes(q));
              })
              .map((unit) => {
              if (!unit.coordinates) return null;
              const coordsStr = unit.coordinates.split(',');
              if (coordsStr.length !== 2) return null;
              const lat = parseFloat(coordsStr[0]);
              const lng = parseFloat(coordsStr[1]);
              if (isNaN(lat) || isNaN(lng)) return null;

              return (
                <Marker 
                  key={unit.id} 
                  position={[lat, lng]} 
                  icon={createUnitIcon(unit.logo_url)}
                  eventHandlers={{
                    click: (e) => {
                      L.DomEvent.stopPropagation(e);
                      if (onMarkerClick) onMarkerClick([lat, lng], 18);
                      setSelectedEntity({ ...unit, pos: [lat, lng], type: 'UNIT' });
                    }
                  }}
                />
              );
            })}
          </>
        )}

        {(!activeCategory || activeCategory === 'INTELIJEN') && (
          <>
            {intelReports
              .filter(intel => {
                if (!searchQuery) return true;
                const q = searchQuery.toLowerCase();
                return (intel.title?.toLowerCase().includes(q) || 
                        intel.location_tag?.toLowerCase().includes(q));
              })
              .map((intel) => {
              if (!intel.coordinates) return null;
              const coordsStr = intel.coordinates.split(',');
              if (coordsStr.length !== 2) return null;
              const lat = parseFloat(coordsStr[0]);
              const lng = parseFloat(coordsStr[1]);
              if (isNaN(lat) || isNaN(lng)) return null;

              return (
                <LayerGroup key={`intel-${intel.id}`}>
                  <Marker 
                    position={[lat, lng]} 
                    icon={createIntelIcon(intel.threat_level)}
                    eventHandlers={{
                      click: (e) => {
                        if (onMarkerClick) onMarkerClick([lat, lng], 13);
                        // setSelectedEntity removed to prevent radial menu
                        L.DomEvent.stopPropagation(e);
                      }
                    }}
                  >
                    <Popup className="tactical-popup" autoPan={false}>
                      <div className="flex flex-col gap-2">
                        <div className="border-b border-tactical-red/30 pb-2">
                          <div className="font-bold text-tactical-red text-sm tracking-tight uppercase">{intel.title}</div>
                          <div className="text-[10px] font-mono text-tactical-muted uppercase">INTELIJEN REPORT</div>
                        </div>

                        <div className="bg-tactical-red/5 border border-tactical-red/20 p-2 rounded">
                          <div className="text-[9px] font-mono text-tactical-muted uppercase">TINGKAT ANCAMAN</div>
                          <div className="text-xs font-bold text-tactical-red flex items-center gap-2">
                            <ShieldAlert size={12} /> {intel.threat_level}
                          </div>
                        </div>

                        <div className="text-[10px] font-mono text-tactical-text mt-1 line-clamp-2 italic">
                          "{intel.content}"
                        </div>

                        <div className="mt-1 pt-2 border-t border-tactical-border/30 flex justify-between items-center">
                          <div className="text-[9px] font-mono text-tactical-muted flex items-center gap-1">
                            <MapPin size={8} /> {intel.location_tag}
                          </div>
                          <div className="text-[9px] font-mono text-tactical-muted">
                            {new Date(intel.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                  <Circle 
                    center={[lat, lng]} 
                    radius={intel.threat_level === 'HIGH' ? 5000 : 2000} 
                    pathOptions={{ color: '#ff3333', fillColor: '#ff3333', fillOpacity: 0.1, weight: 1, dashArray: '5, 5' }} 
                  />
                </LayerGroup>
              );
            })}
          </>
        )}
        
        {(!activeCategory || activeCategory === 'OPERASI') && (
          <>
            {[...opsDalamNegeri.map(o => ({...o, cat: 'DOMESTIC'})), ...opsLuarNegeri.map(o => ({...o, cat: 'INTERNATIONAL'}))]
              .filter(op => {
                if (!searchQuery) return true;
                const q = searchQuery.toLowerCase();
                return (op.name?.toLowerCase().includes(q) || 
                        op.location?.toLowerCase().includes(q));
              })
              .map((op) => {
              if (!op.coordinates) return null;
              const coordsStr = op.coordinates.split(',');
              if (coordsStr.length !== 2) return null;
              const lat = parseFloat(coordsStr[0]);
              const lng = parseFloat(coordsStr[1]);
              if (isNaN(lat) || isNaN(lng)) return null;

              return (
                <LayerGroup key={`op-${op.cat}-${op.id}`}>
                  <Marker 
                    position={[lat, lng]} 
                    icon={opIcon}
                    eventHandlers={{
                      click: (e) => {
                        L.DomEvent.stopPropagation(e);
                        if (onMarkerClick) onMarkerClick([lat, lng], 15);
                        setSelectedOperation(op);
                        setOpActiveTab('Informasi');
                        setActiveModal('OPERASI_DETAIL');
                      }
                    }}

                  >
                  </Marker>
                  <Circle 
                    center={[lat, lng]} 
                    radius={10000} 
                    pathOptions={{ color: '#ffb700', fillColor: '#ffb700', fillOpacity: 0.1, weight: 1, dashArray: '5, 5' }} 
                  />
                </LayerGroup>
              );
            })}
          </>
        )}
        {singleMarker && (
          <Marker 
            position={singleMarker} 
            icon={customIcon}
            eventHandlers={{
              click: () => {
                if (onMarkerClick) onMarkerClick(singleMarker, 16);
              }
            }}
          >
            <Popup className="tactical-popup" autoPan={false}>
              <div className="font-bold text-tactical-bg">LOKASI OPERASI</div>
              <div className="text-[10px] font-mono">GRID: {singleMarker[0].toFixed(6)}, {singleMarker[1].toFixed(6)}</div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Radial Menu Overlay */}
      <AnimatePresence>
        {selectedEntity && selectedEntity.type === 'UNIT' && (
          <div className="absolute inset-0 z-[1100] pointer-events-none flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
            <motion.div 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="relative w-[500px] h-[500px] pointer-events-none"
            >
              {/* Central Unit Info */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border-4 border-[#c9a041]/50 bg-black/60 flex flex-col items-center justify-center shadow-[0_0_50px_rgba(201,160,65,0.4)] pointer-events-auto backdrop-blur-md z-20">
                 <div className="absolute inset-0 rounded-full border border-[#c9a041]/20 animate-pulse"></div>
                 <img src={selectedEntity.logo_url || "https://upload.wikimedia.org/wikipedia/commons/6/61/Lambang_Kopassus.svg"} className="w-20 h-20 object-contain drop-shadow-[0_0_10px_rgba(201,160,65,0.5)]" />
                 <div className="mt-2 text-center">
                    <div className="text-[10px] text-[#c9a041] font-bold tracking-widest">{selectedEntity.unit_code || 'U-03'}</div>
                     <div className="text-base font-black text-white tracking-tight italic uppercase leading-tight px-4">{selectedEntity.unit_name || selectedEntity.name}</div>
                     <div className="mt-1 px-8 text-[7px] text-gray-400 font-mono line-clamp-2 uppercase opacity-70 leading-none">{selectedEntity.location}</div>
                  </div>
              </div>

              {/* Pulsing rings */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full border border-[#c9a041]/20 animate-pulse pointer-events-none"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full border border-dashed border-[#c9a041]/10 animate-[rotate-slow_20s_linear_infinite] pointer-events-none"></div>

              {/* Radial Items */}
              {/* TOP: Alutsista */}
               <RadialItem 
                angle={-90} 
                distance={160} 
                icon={<Truck className="w-8 h-8 text-[#c9a041]" />} 
                label="Alutsista" 
                onClick={() => setActiveModal('ALUTSISTA')}
              />
              
              {/* RIGHT: Personel */}
              <RadialItem 
                angle={0} 
                distance={160} 
                icon={<Users className="w-8 h-8 text-[#c9a041]" />} 
                label="Personel" 
                onClick={() => setActiveModal('PERSONNEL')}
              />

              {/* BOTTOM: Senjata */}
               <RadialItem 
                angle={90} 
                distance={160} 
                icon={<Target className="w-8 h-8 text-[#c9a041]" />} 
                label="Senjata" 
                onClick={() => setActiveModal('SENJATA')}
              />

              {/* LEFT: Kegiatan */}
              <RadialItem 
                angle={180} 
                distance={160} 
                icon={<ClipboardList className="w-8 h-8 text-[#c9a041]" />} 
                label="Kegiatan" 
                onClick={() => setActiveModal('KEGIATAN')}
              />

              {/* Close Button */}
              <button 
                onClick={() => setSelectedEntity(null)}
                className="absolute top-10 right-10 p-2 bg-red-900/40 border border-red-500 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all pointer-events-auto"
              >
                <X size={24} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Personnel & Activities Modals */}
      <AnimatePresence>
        {activeModal && (
          <div className="absolute inset-0 z-[1200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={cn(
                "w-full max-w-5xl bg-tactical-bg border-2 rounded-lg overflow-hidden transition-all duration-300",
                activeModal === 'OPERASI_DETAIL' 
                  ? "border-tactical-red shadow-[0_0_50px_rgba(255,51,51,0.2)]" 
                  : "border-tactical-green shadow-[0_0_50px_rgba(0,255,0,0.2)]"
              )}
            >
              {/* Modal Header */}
              <div className={cn(
                "flex justify-between items-center p-4 border-b transition-colors duration-300",
                activeModal === 'OPERASI_DETAIL' 
                  ? "bg-tactical-red/10 border-tactical-red/30" 
                  : "bg-tactical-green/10 border-tactical-green/30"
              )}>
                <div className="flex items-center gap-3">
                  {activeModal === 'PERSONNEL_DETAIL' || activeModal === 'SENJATA_DETAIL' || activeModal === 'ALUTSISTA_DETAIL' ? (
                    <button 
                      onClick={() => {
                        if (detailReturnModal) {
                          setActiveModal(detailReturnModal as any);
                        } else {
                          setActiveModal(activeModal === 'PERSONNEL_DETAIL' ? 'PERSONNEL' : activeModal === 'SENJATA_DETAIL' ? 'SENJATA' : 'ALUTSISTA');
                        }
                      }}
                      className={cn(
                        "p-1.5 rounded-md transition-colors mr-2",
                        detailReturnModal === 'OPERASI_DETAIL' ? "hover:bg-tactical-red/20 text-tactical-red" : "hover:bg-tactical-green/20 text-tactical-green"
                      )}
                    >
                      <ChevronLeft size={20} />
                    </button>
                   ) : activeModal === 'KEGIATAN' || activeModal === 'SENJATA' || activeModal === 'ALUTSISTA' || activeModal === 'OPERASI_DETAIL' ? (
                    <button 
                      onClick={() => {
                        setActiveModal(null);
                      }}
                      className={cn(
                        "p-1.5 rounded-md transition-colors mr-2",
                        activeModal === 'OPERASI_DETAIL' ? "hover:bg-tactical-red/20 text-tactical-red" : "hover:bg-tactical-green/20 text-tactical-green"
                      )}
                    >
                      <ChevronLeft size={20} />
                    </button>
                  ) : null}
                  
                  {activeModal === 'KEGIATAN' || activeModal === 'SENJATA' || activeModal === 'ALUTSISTA' || activeModal === 'SENJATA_DETAIL' || activeModal === 'ALUTSISTA_DETAIL' || activeModal === 'OPERASI_DETAIL' ? (
                    <div className="flex items-center gap-3">
                      {activeModal === 'KEGIATAN' ? <ClipboardList className="text-tactical-green" /> : 
                       activeModal === 'SENJATA' || activeModal === 'SENJATA_DETAIL' ? <Target className="text-tactical-green" /> :
                       activeModal === 'OPERASI_DETAIL' ? <ShieldAlert className="text-tactical-red" /> :
                       <Truck className="text-tactical-green" />}
                      <div>
                        <div className="text-[10px] text-tactical-muted font-mono leading-none">U-10</div>
                        <div className="text-lg font-black text-tactical-text tracking-widest uppercase leading-tight">
                          {activeModal === 'OPERASI_DETAIL' ? selectedOperation?.name : selectedEntity?.unit_name}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      {activeModal === 'PERSONNEL' || activeModal === 'PERSONNEL_DETAIL' ? <Users className="text-tactical-green" /> : <ClipboardList className="text-tactical-green" />}
                      <h3 className="text-lg font-bold text-tactical-text tracking-widest uppercase">
                        {activeModal === 'PERSONNEL' ? `DAFTAR PERSONIL - ${selectedEntity?.unit_name}` : 
                         activeModal === 'PERSONNEL_DETAIL' ? `PROFIL PERSONIL` :
                         `LAPORAN KEGIATAN - ${selectedEntity?.unit_name}`}
                      </h3>
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => setActiveModal(null)}
                  className={cn(
                    "p-1.5 rounded-md transition-colors",
                    activeModal === 'OPERASI_DETAIL' ? "hover:bg-tactical-red/20 text-tactical-red" : "hover:bg-tactical-green/20 text-tactical-green"
                  )}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                {activeModal === 'PERSONNEL' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { id: 1, name: "Agus Setiawan", rank: "Mayor Inf", nrp: "1109001234", spec: "Penanggulangan Teror", photo: "https://i.pravatar.cc/150?u=1" },
                      { id: 2, name: "Budi Santoso", rank: "Lettu Inf", nrp: "1112005678", spec: "Para Komando", photo: "https://i.pravatar.cc/150?u=2" },
                      { id: 3, name: "Dedi Kurniawan", rank: "Serka", nrp: "1115009012", spec: "Sniper", photo: "https://i.pravatar.cc/150?u=3" },
                      { id: 4, name: "Eko Prasetyo", rank: "Sertu", nrp: "1118003456", spec: "Intelijen Tempur", photo: "https://i.pravatar.cc/150?u=4" },
                      { id: 5, name: "Fajar Ramadhan", rank: "Pratu", nrp: "1120007890", spec: "Komunikasi", photo: "https://i.pravatar.cc/150?u=5" },
                      { id: 6, name: "Guntur Pratama", rank: "Serda", nrp: "1122004567", spec: "Demolisi", photo: "https://i.pravatar.cc/150?u=6" },
                    ].map((p, i) => (
                      <div key={i} className="flex items-center gap-4 p-3 bg-tactical-green/5 border border-tactical-green/20 rounded group hover:bg-tactical-green/10 transition-colors">
                        <div className="w-14 h-14 rounded overflow-hidden border border-tactical-green/30">
                          <img src={p.photo} alt={p.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-tactical-text uppercase truncate">{p.name}</div>
                          <div className="text-[10px] font-mono text-tactical-muted">{p.rank} | NRP: {p.nrp}</div>
                          <button 
                            onClick={() => {
                              setSelectedPersonnel(p);
                              setDetailReturnModal('PERSONNEL');
                              setActiveModal('PERSONNEL_DETAIL');
                            }}
                            className="mt-2 text-[9px] font-bold text-tactical-green hover:underline flex items-center gap-1"
                          >
                            <Plus size={10} /> LIHAT DETAIL PROFIL
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : activeModal === 'PERSONNEL_DETAIL' && selectedPersonnel ? (
                  <div className="flex flex-col gap-6 custom-scrollbar pb-4">
                    {/* SECTION 1: HEADER DATA */}
                    <div className={cn(
                      "flex flex-col md:flex-row gap-6 p-4 rounded-lg border transition-all duration-300",
                      detailReturnModal === 'OPERASI_DETAIL' ? "bg-tactical-red/5 border-tactical-red/20" : "bg-tactical-green/5 border-tactical-green/20"
                    )}>
                      <div className={cn(
                        "w-full md:w-40 h-52 rounded overflow-hidden border-2 shadow-lg transition-all duration-300",
                        detailReturnModal === 'OPERASI_DETAIL' ? "border-tactical-red/30 shadow-[0_0_20px_rgba(255,51,51,0.2)]" : "border-tactical-green/30 shadow-[0_0_20px_rgba(0,255,0,0.2)]"
                      )}>
                         <img src={selectedPersonnel.photo} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className={cn(
                          "border-b pb-2",
                          detailReturnModal === 'OPERASI_DETAIL' ? "border-tactical-red/30" : "border-tactical-green/30"
                        )}>
                           <h4 className="text-2xl font-black text-tactical-text uppercase tracking-tight">{selectedPersonnel.name}</h4>
                           <p className={cn(
                             "font-mono text-sm font-bold",
                             detailReturnModal === 'OPERASI_DETAIL' ? "text-tactical-red" : "text-tactical-green"
                           )}>{selectedPersonnel.rank} / {selectedPersonnel.nrp}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div>
                              <div className="text-[10px] text-tactical-muted uppercase">Jabatan</div>
                              <div className="text-xs font-bold text-tactical-text">{selectedPersonnel.spec} / Dan-Tim</div>
                           </div>
                           <div>
                              <div className="text-[10px] text-tactical-muted uppercase">Satuan</div>
                              <div className="text-xs font-bold text-tactical-text">{selectedEntity?.unit_name || 'KOPASSUS'}</div>
                           </div>
                        </div>
                        <div className={cn(
                          "inline-flex items-center gap-2 px-3 py-1 border rounded-full transition-all duration-300",
                          detailReturnModal === 'OPERASI_DETAIL' ? "bg-tactical-red/20 border-tactical-red/40" : "bg-tactical-green/20 border-tactical-green/40"
                        )}>
                           <div className={cn(
                             "w-2 h-2 rounded-full animate-pulse",
                             detailReturnModal === 'OPERASI_DETAIL' ? "bg-tactical-red" : "bg-tactical-green"
                           )}></div>
                           <span className={cn(
                             "text-[10px] font-bold uppercase",
                             detailReturnModal === 'OPERASI_DETAIL' ? "text-tactical-red" : "text-tactical-green"
                           )}>Status: Active Duty</span>
                        </div>

                        <div className={cn(
                          "mt-4 p-3 border rounded flex flex-col gap-1 transition-all duration-300",
                          detailReturnModal === 'OPERASI_DETAIL' ? "bg-tactical-red/10 border-tactical-red/30" : "bg-tactical-green/10 border-tactical-green/30"
                        )}>
                           <div className="text-[9px] text-tactical-muted uppercase font-bold tracking-widest flex items-center gap-2">
                              <Target size={10} className={detailReturnModal === 'OPERASI_DETAIL' ? "text-tactical-red" : "text-tactical-green"} /> Penugasan Saat Ini
                           </div>
                           <div className="text-[11px] font-bold text-tactical-text uppercase">Operasi Pengamanan Objek Vital Nasional - Sektor Papua</div>
                           <div className="text-[9px] text-tactical-muted italic font-mono uppercase">Misi Utama: Pengawasan Infrastruktur Strategis Nasional</div>
                        </div>
                      </div>
                    </div>

                    {/* SECTION 2: DATA PRIBADI */}
                    <div className="space-y-4">
                       <h5 className={cn(
                         "text-xs font-bold flex items-center gap-2 border-l-2 pl-2 uppercase tracking-widest",
                         detailReturnModal === 'OPERASI_DETAIL' ? "text-tactical-red border-tactical-red" : "text-tactical-green border-tactical-green"
                       )}>Data Pribadi Personil</h5>
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-tactical-bg/50 p-4 border border-tactical-border/50 rounded">
                          {[
                            { label: "Tanggal Lahir", value: "12 Januari 1990" },
                            { label: "Jenis Kelamin", value: "Laki-laki" },
                            { label: "Agama", value: "Islam" },
                            { label: "Golongan Darah", value: "O+" },
                            { label: "Pendidikan Terakhir", value: "S1 Hukum - UNHAN" },
                            { label: "Nomor HP", value: "0812-3456-7890" },
                            { label: "Email", value: "agus.setiawan@puskodal.id" },
                            { label: "Alamat", value: "Jl. Cijantung No. 12, Jakarta Timur", span: "col-span-2" },
                          ].map((item, idx) => (
                            <div key={idx} className={item.span || ""}>
                               <div className="text-[9px] text-tactical-muted uppercase">{item.label}</div>
                               <div className="text-[11px] font-bold text-tactical-text">{item.value}</div>
                            </div>
                          ))}
                       </div>
                    </div>

                    {/* SECTION 3: RIWAYAT PENDIDIKAN */}
                    <div className="space-y-4">
                       <h5 className={cn(
                         "text-xs font-bold flex items-center gap-2 border-l-2 pl-2 uppercase tracking-widest",
                         detailReturnModal === 'OPERASI_DETAIL' ? "text-tactical-red border-tactical-red" : "text-tactical-green border-tactical-green"
                       )}>Riwayat Pendidikan</h5>
                       <div className="space-y-2">
                          {[
                            { title: "AKMIL", year: "2012", location: "Magelang" },
                            { title: "SUSSARCAB INF", year: "2013", location: "Cipatat" },
                            { title: "DIK KOMANDO", year: "2014", location: "Batujajar" },
                            { title: "PARA DASAR", year: "2012", location: "Bandung" },
                          ].map((edu, idx) => (
                            <div key={idx} className="flex justify-between items-center p-2 bg-tactical-green/5 border-l-2 border-tactical-green/40">
                               <div className="text-xs font-bold text-tactical-text">{edu.title}</div>
                               <div className="text-[10px] font-mono text-tactical-muted">{edu.location} ({edu.year})</div>
                            </div>
                          ))}
                       </div>
                    </div>

                    {/* SECTION 4: PENUGASAN & PRESTASI */}
                    <div className="space-y-6">
                       <div className="space-y-4">
                          <h5 className={cn(
                            "text-xs font-bold flex items-center gap-2 border-l-2 pl-2 uppercase tracking-widest",
                            detailReturnModal === 'OPERASI_DETAIL' ? "text-tactical-red border-tactical-red" : "text-tactical-green border-tactical-green"
                          )}>Riwayat Penugasan</h5>
                          <div className="space-y-2">
                            {["Ops Trisula (Papua)", "Ops Aman Nusa", "Misi PBB Lebanon"].map((item, idx) => (
                               <div key={idx} className="text-[11px] p-2 bg-tactical-bg border border-tactical-border rounded flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-tactical-green"></div>
                                  {item}
                               </div>
                            ))}
                          </div>
                       </div>
                       <div className="space-y-4">
                          <h5 className={cn(
                            "text-xs font-bold flex items-center gap-2 border-l-2 pl-2 uppercase tracking-widest",
                            detailReturnModal === 'OPERASI_DETAIL' ? "text-tactical-red border-tactical-red" : "text-tactical-green border-tactical-green"
                          )}>Prestasi & Penghargaan</h5>
                          <div className="space-y-2">
                            {["Satya Lencana Ksatria Yudha", "Dharma Nusa", "Wira Karya"].map((item, idx) => (
                               <div key={idx} className="text-[11px] p-2 bg-tactical-green/5 border border-tactical-green/20 rounded flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>
                                  {item}
                               </div>
                            ))}
                          </div>
                       </div>
                    </div>

                    {/* SECTION 5: SERTIFIKASI & KEAHLIAN */}
                    <div className="space-y-6">
                       <div className="space-y-4">
                          <h5 className={cn(
                            "text-xs font-bold flex items-center gap-2 border-l-2 pl-2 uppercase tracking-widest",
                            detailReturnModal === 'OPERASI_DETAIL' ? "text-tactical-red border-tactical-red" : "text-tactical-green border-tactical-green"
                          )}>Sertifikasi</h5>
                          <div className="space-y-2">
                            {["Advanced Combat Medic", "EOD Specialist", "Language Proficiency (Eng)"].map((item, idx) => (
                               <div key={idx} className="text-[11px] p-2 bg-tactical-bg border border-tactical-border rounded italic text-tactical-muted">
                                  - {item}
                               </div>
                            ))}
                          </div>
                       </div>
                       <div className="space-y-4">
                          <h5 className={cn(
                            "text-xs font-bold flex items-center gap-2 border-l-2 pl-2 uppercase tracking-widest",
                            detailReturnModal === 'OPERASI_DETAIL' ? "text-tactical-red border-tactical-red" : "text-tactical-green border-tactical-green"
                          )}>Spesialisasi</h5>
                          <div className="flex flex-wrap gap-2">
                            {["Anti Teror", "Sniper", "Junggle Warfare", "Free Fall"].map((item, idx) => (
                               <span 
                                 key={idx} 
                                 className={cn(
                                   "px-2 py-1 text-[9px] font-bold rounded border uppercase transition-colors duration-300",
                                   detailReturnModal === 'OPERASI_DETAIL' 
                                     ? "bg-tactical-red/20 text-tactical-red border-tactical-red/30" 
                                     : "bg-tactical-green/20 text-tactical-green border-tactical-green/30"
                                 )}
                               >
                                 {item}
                               </span>
                            ))}
                          </div>
                       </div>
                    </div>
                    
                    <button 
                      onClick={() => {
                        if (detailReturnModal) {
                          setActiveModal(detailReturnModal as any);
                        } else {
                          setActiveModal('PERSONNEL');
                        }
                      }}
                      className={cn(
                        "text-xs font-bold flex items-center gap-2 mt-6 pt-4 border-t border-tactical-border",
                        detailReturnModal === 'OPERASI_DETAIL' ? "text-tactical-red/70 hover:text-tactical-red" : "text-tactical-muted hover:text-tactical-green"
                      )}
                    >
                      &larr; KEMBALI KE {detailReturnModal === 'OPERASI_DETAIL' ? 'DETAIL OPERASI' : 'DAFTAR PERSONIL'}
                    </button>
                  </div>
                ) : activeModal === 'KEGIATAN' ? (
                  <div className="space-y-8">
                    {/* Header: Postur & Kegiatan */}
                    <div className="flex items-center gap-2">
                       <div className="w-1 h-6 bg-red-600"></div>
                       <h4 className="text-xl font-bold text-tactical-text uppercase tracking-widest">Postur & Kegiatan</h4>
                       <span className="text-sm text-tactical-muted ml-2">2 kegiatan</span>
                    </div>

                    {/* Section: Postur Unit Saat Ini */}
                    <div className="space-y-4">
                       <h5 className="text-xs font-bold text-tactical-muted uppercase tracking-widest">Postur Unit Saat Ini</h5>
                       <div className="bg-[#0f2419] border border-green-900/50 p-6 rounded flex divide-x divide-green-900/30 shadow-[inset_0_0_20px_rgba(0,255,0,0.05)]">
                          <div className="flex-1 text-center py-2">
                             <div className="text-4xl font-black text-tactical-green">{selectedEntity?.strength || 450}</div>
                             <div className="text-[10px] text-tactical-muted uppercase mt-1 font-bold tracking-widest">Personil Aktif</div>
                          </div>
                          <div className="flex-1 text-center py-2">
                             <div className="text-4xl font-black text-yellow-500">{selectedEntity?.logistics_count || 12}</div>
                             <div className="text-[10px] text-tactical-muted uppercase mt-1 font-bold tracking-widest">Aset Operasional</div>
                          </div>
                       </div>
                    </div>

                    {/* Section: Kegiatan Terjadwal */}
                    <div className="space-y-4">
                       <h5 className="text-xs font-bold text-tactical-muted uppercase tracking-widest">Kegiatan Terjadwal</h5>
                       <div className="space-y-3">
                          {/* Domestic Activity */}
                          <div className="bg-[#1a2333] border border-blue-900/50 p-5 rounded group hover:bg-[#1e2a3d] transition-colors cursor-pointer border-l-4 border-l-blue-500 shadow-lg">
                             <div className="flex justify-between items-start">
                                <div className="text-lg font-bold text-tactical-text uppercase tracking-wider">Operasi Cendrawasih</div>
                                <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded font-bold border border-blue-500/30">DALAM NEGERI</span>
                             </div>
                             <div className="text-[11px] text-tactical-muted mt-1">Tipe: Pengamanan Wilayah</div>
                             <div className="text-[10px] text-tactical-muted mt-2 font-mono flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                                STATUS: BERJALAN | ESTIMASI SELESAI: 20 DES 2026
                             </div>
                          </div>

                          {/* International Activity */}
                          <div className="bg-[#241a33] border border-purple-900/50 p-5 rounded group hover:bg-[#2b1e3d] transition-colors cursor-pointer border-l-4 border-l-purple-500 shadow-lg">
                             <div className="flex justify-between items-start">
                                <div className="text-lg font-bold text-tactical-text uppercase tracking-wider">Satgas Konga XXIII-Q</div>
                                <span className="text-[10px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded font-bold border border-purple-900/30">LUAR NEGERI</span>
                             </div>
                             <div className="text-[11px] text-tactical-muted mt-1">Tipe: UN Peacekeeping Mission</div>
                             <div className="text-[10px] text-tactical-muted mt-2 font-mono flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                                STATUS: PERSIAPAN | LOKASI: LEBANON
                             </div>
                          </div>
                       </div>
                    </div>
                  </div>
                ) : activeModal === 'SENJATA' ? (
                  <div className="space-y-8 pb-4">
                    {/* Header: Senjata & Amunisi */}
                    <div className="flex items-center justify-between gap-4">
                       <div className="flex items-center gap-2">
                          <div className="w-1 h-6 bg-red-600"></div>
                          <h4 className="text-xl font-bold text-tactical-text uppercase tracking-widest whitespace-nowrap">Senjata & Amunisi</h4>
                       </div>
                       
                       {/* Search Input */}
                       <div className="relative flex-1 max-w-[300px]">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tactical-muted" />
                          <input 
                            type="text" 
                            placeholder="Smartsearch: Nama / No Registrasi..."
                            value={modalSearchQuery}
                            onChange={(e) => setModalSearchQuery(e.target.value)}
                            className="w-full bg-black/40 border border-tactical-green/30 rounded-md py-1.5 pl-9 pr-3 text-xs text-tactical-text placeholder:text-tactical-muted/50 focus:outline-none focus:border-tactical-green transition-all"
                          />
                       </div>
                    </div>

                    {/* List of Weapons */}
                    <div className="space-y-4">
                       {[
                         { name: "Senapan Serbu SS2-V1", qty: "5 unit", status: "Siap" },
                         { name: "Senapan Penembak Jitu SPR-2", qty: "2 unit", status: "Siap" },
                         { name: "Granat Tangan", qty: "20 buah", status: "Siap" },
                         { name: "Amunisi 5.56mm", qty: "5.000 butir", status: "Tersedia" },
                         { name: "Amunisi 7.62mm", qty: "2.000 butir", status: "Tersedia" },
                       ].filter(item => 
                         item.name.toLowerCase().includes(modalSearchQuery.toLowerCase())
                       ).map((item, idx) => (
                         <div 
                           key={idx} 
                           onClick={() => {
                             setSelectedWeapon(item);
                             setActiveModal('SENJATA_DETAIL');
                           }}
                           className="bg-tactical-green/5 border border-tactical-green/10 p-4 rounded-lg group hover:bg-tactical-green/10 transition-all cursor-pointer flex justify-between items-center"
                         >
                            <div>
                               <div className="text-sm font-bold text-tactical-text uppercase tracking-wider">{item.name}</div>
                               <div className="text-[11px] text-tactical-muted mt-1">Jumlah: {item.qty}</div>
                            </div>
                            <ChevronRight size={16} className="text-tactical-muted group-hover:text-tactical-green transition-colors" />
                         </div>
                       ))}
                    </div>
                  </div>
                ) : activeModal === 'ALUTSISTA' ? (
                  <div className="space-y-8 pb-4">
                    {/* Header: Alutsista */}
                    <div className="flex items-center justify-between gap-4">
                       <div className="flex items-center gap-2">
                          <div className="w-1 h-6 bg-red-600"></div>
                          <h4 className="text-xl font-bold text-tactical-text uppercase tracking-widest whitespace-nowrap">Alutsista</h4>
                          <span className="text-sm text-tactical-muted ml-2">5 aset</span>
                       </div>

                       {/* Search Input */}
                       <div className="relative flex-1 max-w-[300px]">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tactical-muted" />
                          <input 
                            type="text" 
                            placeholder="Smartsearch: Nama / Model..."
                            value={modalSearchQuery}
                            onChange={(e) => setModalSearchQuery(e.target.value)}
                            className="w-full bg-black/40 border border-tactical-green/30 rounded-md py-1.5 pl-9 pr-3 text-xs text-tactical-text placeholder:text-tactical-muted/50 focus:outline-none focus:border-tactical-green transition-all"
                          />
                       </div>
                    </div>

                    {/* List of Assets */}
                    <div className="space-y-4">
                       {[
                         { name: "Kendaraan Lapis Baja", model: "BTR-50", status: "Siap" },
                         { name: "UAV", model: "DJI Phantom 4 Pro", status: "Aktif" },
                         { name: "Radio", model: "Motorola APX 8000", status: "Layak" },
                         { name: "Tenda Lapangan", model: "Tenda Pelatihan", status: "Siap" },
                         { name: "Genset Portable", model: "Yamaha EF2000iS", status: "Siap" },
                       ].filter(item => 
                         item.name.toLowerCase().includes(modalSearchQuery.toLowerCase()) || 
                         item.model.toLowerCase().includes(modalSearchQuery.toLowerCase())
                       ).map((item, idx) => (
                         <div 
                           key={idx} 
                           onClick={() => {
                             setSelectedAsset(item);
                             setActiveModal('ALUTSISTA_DETAIL');
                           }}
                           className="bg-tactical-green/5 border border-tactical-green/10 p-4 rounded-lg group hover:bg-tactical-green/10 transition-all cursor-pointer flex justify-between items-center"
                         >
                            <div>
                               <div className="text-sm font-bold text-tactical-text uppercase tracking-wider">{item.name}</div>
                               <div className="text-[11px] text-tactical-muted mt-1">Model: {item.model}</div>
                            </div>
                            <ChevronRight size={16} className="text-tactical-muted group-hover:text-tactical-green transition-colors" />
                         </div>
                       ))}
                    </div>
                  </div>
                ) : activeModal === 'SENJATA_DETAIL' && selectedWeapon ? (
                  <div className="space-y-8 pb-4">
                    {/* Weapon Info */}
                    <div className="bg-tactical-bg p-4 rounded border border-tactical-green/20">
                       <div className="flex justify-between items-start mb-4 border-b border-tactical-green/20 pb-2">
                          <h4 className="text-xl font-bold text-tactical-green uppercase tracking-widest">{selectedWeapon.name}</h4>
                          <div className="text-right">
                             <div className="text-[10px] text-tactical-muted uppercase leading-none mb-1">Jumlah Di Kesatuan</div>
                             <div className="text-lg font-black text-tactical-green leading-none">{selectedWeapon.qty}</div>
                          </div>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div>
                             <div className="text-[10px] text-tactical-muted uppercase">Produksi</div>
                             <div className="text-sm font-bold text-tactical-text">PT Pindad (Persero)</div>
                          </div>
                          <div>
                             <div className="text-[10px] text-tactical-muted uppercase">Tahun Produksi</div>
                             <div className="text-sm font-bold text-tactical-text">2022</div>
                          </div>
                          <div>
                             <div className="text-[10px] text-tactical-muted uppercase">Kaliber</div>
                             <div className="text-sm font-bold text-tactical-text">5.56 x 45 mm NATO</div>
                          </div>
                          <div>
                             <div className="text-[10px] text-tactical-muted uppercase">Jarak Efektif</div>
                             <div className="text-sm font-bold text-tactical-text">400 - 600 m</div>
                          </div>
                       </div>
                    </div>

                    {/* Unit Registry */}
                    {!selectedWeapon.name.toLowerCase().includes('granat') && !selectedWeapon.name.toLowerCase().includes('amunisi') && (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center border-l-2 border-red-600 pl-2">
                           <h5 className="text-xs font-bold text-tactical-muted uppercase tracking-widest">Registrasi Unit Senjata</h5>
                           {/* Unit Search */}
                           <div className="relative max-w-[200px]">
                              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-tactical-muted" />
                              <input 
                                type="text" 
                                placeholder="Cari S/N atau Status..."
                                value={modalSearchQuery}
                                onChange={(e) => setModalSearchQuery(e.target.value)}
                                className="bg-black/40 border border-tactical-green/20 rounded py-1 pl-7 pr-2 text-[10px] text-tactical-text focus:outline-none focus:border-tactical-green w-full"
                              />
                           </div>
                        </div>
                        <div className="space-y-2">
                            {[
                              { sn: "SS2-V1-001/2022", status: "Baik" },
                              { sn: "SS2-V1-002/2022", status: "Baik" },
                              { sn: "SS2-V1-003/2022", status: "Perbaikan" },
                              { sn: "SS2-V1-004/2022", status: "Baik" },
                              { sn: "SS2-V1-005/2022", status: "Rusak" },
                            ].filter(u => 
                              u.sn.toLowerCase().includes(modalSearchQuery.toLowerCase()) ||
                              u.status.toLowerCase().includes(modalSearchQuery.toLowerCase())
                            ).map((unit, idx) => (
                              <div key={idx} className="flex justify-between items-center p-3 bg-tactical-bg border border-tactical-border rounded group hover:border-tactical-green/30 transition-all">
                                  <div className="space-y-1">
                                    <div className="text-[11px] font-mono text-tactical-text">{unit.sn}</div>
                                    <div className="text-[9px] font-bold text-tactical-muted uppercase tracking-wider">{selectedWeapon.name}</div>
                                  </div>
                                  <div className={cn(
                                    "px-3 py-1 rounded text-[9px] font-black uppercase tracking-widest",
                                    unit.status === 'Baik' ? "bg-emerald-500/20 text-emerald-500 border border-emerald-500/30" :
                                    unit.status === 'Perbaikan' ? "bg-yellow-500/20 text-yellow-500 border border-yellow-500/30" :
                                    "bg-red-600/20 text-red-500 border border-red-600/30"
                                  )}>
                                    {unit.status}
                                  </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    <button 
                      onClick={() => {
                        if (detailReturnModal) {
                          setActiveModal(detailReturnModal as any);
                        } else {
                          setActiveModal('SENJATA');
                        }
                      }}
                      className={cn(
                        "text-xs font-bold flex items-center gap-2 mt-6 pt-4 border-t border-tactical-border",
                        detailReturnModal === 'OPERASI_DETAIL' ? "text-tactical-red/70 hover:text-tactical-red" : "text-tactical-muted hover:text-tactical-green"
                      )}
                    >
                      &larr; KEMBALI KE {detailReturnModal === 'OPERASI_DETAIL' ? 'DETAIL OPERASI' : 'DAFTAR SENJATA'}
                    </button>
                  </div>
                 ) : activeModal === 'ALUTSISTA_DETAIL' && selectedAsset ? (
                   <div className="space-y-8 pb-4">
                     {/* Asset Info */}
                     <div className={cn(
                       "p-4 rounded border transition-colors duration-300",
                       detailReturnModal === 'OPERASI_DETAIL' ? "bg-tactical-red/5 border-tactical-red/20" : "bg-tactical-bg border border-tactical-green/20"
                     )}>
                        <div className={cn(
                          "flex justify-between items-start mb-4 border-b pb-2",
                          detailReturnModal === 'OPERASI_DETAIL' ? "border-tactical-red/20" : "border-tactical-green/20"
                        )}>
                           <h4 className={cn(
                             "text-xl font-bold uppercase tracking-widest",
                             detailReturnModal === 'OPERASI_DETAIL' ? "text-tactical-red" : "text-tactical-green"
                           )}>{selectedAsset.name}</h4>
                           <div className="text-right">
                              <div className="text-[10px] text-tactical-muted uppercase leading-none mb-1">Jumlah Di Kesatuan</div>
                              <div className={cn(
                                "text-lg font-black leading-none",
                                detailReturnModal === 'OPERASI_DETAIL' ? "text-tactical-red" : "text-tactical-green"
                              )}>1 Unit</div>
                           </div>
                        </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div>
                             <div className="text-[10px] text-tactical-muted uppercase">Manufaktur</div>
                             <div className="text-sm font-bold text-tactical-text">Industri Pertahanan Nasional</div>
                          </div>
                          <div>
                             <div className="text-[10px] text-tactical-muted uppercase">Model / Varian</div>
                             <div className="text-sm font-bold text-tactical-text">{selectedAsset.model}</div>
                          </div>
                          <div>
                             <div className="text-[10px] text-tactical-muted uppercase">Tahun Perolehan</div>
                             <div className="text-sm font-bold text-tactical-text">2021</div>
                          </div>
                          <div>
                             <div className="text-[10px] text-tactical-muted uppercase">Kapasitas / Power</div>
                             <div className="text-sm font-bold text-tactical-text">Standar Militer</div>
                          </div>
                       </div>
                    </div>

                    {/* Unit Registry */}
                    <div className="space-y-4">
                       <div className="flex justify-between items-center border-l-2 border-red-600 pl-2">
                          <h5 className="text-xs font-bold text-tactical-muted uppercase tracking-widest">Registrasi Unit Alutsista</h5>
                          {/* Unit Search */}
                          <div className="relative max-w-[200px]">
                             <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-tactical-muted" />
                             <input 
                               type="text" 
                               placeholder="Cari S/N atau Status..."
                               value={modalSearchQuery}
                               onChange={(e) => setModalSearchQuery(e.target.value)}
                               className="bg-black/40 border border-tactical-green/20 rounded py-1 pl-7 pr-2 text-[10px] text-tactical-text focus:outline-none focus:border-tactical-green w-full"
                             />
                          </div>
                       </div>
                       <div className="space-y-2">
                          {[
                            { sn: "ALT-REG-001/V2", status: "Baik" },
                            { sn: "ALT-REG-002/V2", status: "Baik" },
                            { sn: "ALT-REG-003/V2", status: "Perbaikan" },
                          ].filter(u => 
                            u.sn.toLowerCase().includes(modalSearchQuery.toLowerCase()) ||
                            u.status.toLowerCase().includes(modalSearchQuery.toLowerCase())
                          ).map((unit, idx) => (
                             <div key={idx} className="flex justify-between items-center p-3 bg-tactical-bg border border-tactical-border rounded group hover:border-tactical-green/30 transition-all">
                                <div className="space-y-1">
                                   <div className="text-[11px] font-mono text-tactical-text">{unit.sn}</div>
                                   <div className="text-[9px] font-bold text-tactical-muted uppercase tracking-wider">{selectedAsset.name}</div>
                                </div>
                                <div className={cn(
                                   "px-3 py-1 rounded text-[9px] font-black uppercase tracking-widest",
                                   unit.status === 'Baik' ? "bg-emerald-500/20 text-emerald-500 border border-emerald-500/30" :
                                   unit.status === 'Perbaikan' ? "bg-yellow-500/20 text-yellow-500 border border-yellow-500/30" :
                                   "bg-red-600/20 text-red-500 border border-red-600/30"
                                )}>
                                   {unit.status}
                                </div>
                             </div>
                          ))}
                       </div>
                    </div>

                    <button 
                      onClick={() => {
                        if (detailReturnModal) {
                          setActiveModal(detailReturnModal as any);
                        } else {
                          setActiveModal('ALUTSISTA');
                        }
                      }}
                      className={cn(
                        "text-xs font-bold flex items-center gap-2 mt-6 pt-4 border-t border-tactical-border",
                        detailReturnModal === 'OPERASI_DETAIL' ? "text-tactical-red/70 hover:text-tactical-red" : "text-tactical-muted hover:text-tactical-green"
                      )}
                    >
                      &larr; KEMBALI KE {detailReturnModal === 'OPERASI_DETAIL' ? 'DETAIL OPERASI' : 'DAFTAR ALUTSISTA'}
                    </button>
                  </div>
                ) : activeModal === 'OPERASI_DETAIL' && selectedOperation ? (
                  <div className="space-y-6 pb-4">
                    {/* Operation Tabs */}
                    <div className="flex border-b border-tactical-border">
                        {['Informasi', 'Personel', 'Komunikasi'].map((tab) => (
                          <div 
                            key={tab} 
                            onClick={() => setOpActiveTab(tab)}
                            className={cn(
                              "px-6 py-3 text-xs font-bold uppercase tracking-widest cursor-pointer transition-all",
                              opActiveTab === tab 
                                ? (activeModal === 'OPERASI_DETAIL' ? "text-tactical-red border-b-2 border-tactical-red bg-tactical-red/5" : "text-tactical-green border-b-2 border-tactical-green bg-tactical-green/5")
                                : "text-tactical-muted hover:text-tactical-text"
                            )}
                          >
                            {tab} {tab === 'Personel' && "(2)"}
                          </div>
                        ))}
                    </div>

                    {opActiveTab === 'Informasi' ? (
                      <div className="space-y-6">
                         {/* Badges & Action */}
                         <div className="flex justify-between items-center">
                            <div className="flex gap-2">
                               <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-[10px] font-bold uppercase rounded">Berlangsung</span>
                               <span className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 text-[10px] font-bold uppercase rounded">Prioritas: Sedang</span>
                               <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/30 text-blue-500 text-[10px] font-bold uppercase rounded">Latihan</span>
                            </div>

                            {/* Lihat Lokasi Button */}
                            <button 
                              onClick={() => {
                                if (selectedOperation.coordinates) {
                                  const coords = selectedOperation.coordinates.split(',');
                                  if (coords.length === 2) {
                                    const lat = parseFloat(coords[0]);
                                    const lng = parseFloat(coords[1]);
                                    if (!isNaN(lat) && !isNaN(lng)) {
                                      if (onMarkerClick) onMarkerClick([lat, lng], 15);
                                      setActiveModal(null);
                                    }
                                  }
                                }
                              }}
                              className="flex items-center gap-2 px-4 py-2 bg-tactical-red/10 border border-tactical-red/30 rounded text-[10px] font-black text-tactical-red hover:bg-tactical-red hover:text-white transition-all shadow-[0_0_15px_rgba(255,51,51,0.2)] group"
                            >
                              <MapPin size={12} className="group-hover:scale-110 transition-transform" />
                              LIHAT LOKASI
                            </button>
                         </div>

                         {/* Description */}
                         <div className="p-4 bg-tactical-bg border border-tactical-border rounded-lg">
                            <p className="text-xs text-tactical-muted leading-relaxed">
                               Latihan gabungan operasi khusus dan anti-teror di wilayah Yogyakarta untuk meningkatkan kemampuan respons cepat dan koordinasi antar unit.
                            </p>
                         </div>

                         {/* Grid Info */}
                         <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-tactical-bg border border-tactical-border rounded-lg space-y-2">
                               <div className="flex items-center gap-2 text-tactical-muted">
                                  <MapPin size={14} className="text-yellow-500" />
                                  <span className="text-[10px] font-bold uppercase">Lokasi</span>
                               </div>
                               <div>
                                  <div className="text-sm font-bold text-tactical-text">{selectedOperation.location}</div>
                                  <div className="text-[10px] font-mono text-tactical-muted">{selectedOperation.coordinates}</div>
                               </div>
                            </div>
                            <div className="p-4 bg-tactical-bg border border-tactical-border rounded-lg space-y-2">
                               <div className="flex items-center gap-2 text-tactical-muted">
                                  <ClipboardList size={14} className="text-yellow-500" />
                                  <span className="text-[10px] font-bold uppercase">Periode</span>
                               </div>
                               <div>
                                  <div className="text-sm font-bold text-tactical-text">15/1/2026</div>
                                  <div className="text-[10px] font-mono text-tactical-muted">s/d 30/1/2026</div>
                               </div>
                            </div>
                         </div>

                         {/* Objective */}
                         <div className="p-4 bg-tactical-bg border border-tactical-border rounded-lg space-y-2">
                            <div className="text-[10px] font-bold text-tactical-muted uppercase tracking-widest">Objektif Operasi</div>
                            <p className="text-xs text-tactical-text">Meningkatkan kemampuan respons cepat dan koordinasi dalam skenario anti-teror</p>
                         </div>

                         {/* Resources Summary */}
                         <div className="grid grid-cols-2 gap-4">
                             <div className="p-4 bg-tactical-bg border border-tactical-border rounded-lg space-y-1">
                                <div className="flex items-center gap-2 text-tactical-muted">
                                   <Users size={14} className={activeModal === 'OPERASI_DETAIL' ? "text-tactical-red" : "text-tactical-green"} />
                                   <span className="text-[10px] font-bold uppercase">Personel</span>
                                </div>
                                <div className="text-xl font-black text-tactical-text">2</div>
                                <div className="text-[9px] text-tactical-muted uppercase tracking-wider">Orang di-deploy</div>
                             </div>
                             <div className="p-4 bg-tactical-bg border border-tactical-border rounded-lg space-y-1">
                                <div className="flex items-center gap-2 text-tactical-muted">
                                   <Target size={14} className={activeModal === 'OPERASI_DETAIL' ? "text-tactical-red" : "text-tactical-green"} />
                                   <span className="text-[10px] font-bold uppercase">Logistik</span>
                                </div>
                                <div className="text-xl font-black text-tactical-text">3</div>
                                <div className="text-[9px] text-tactical-muted uppercase tracking-wider">Item Terdeploy</div>
                             </div>
                         </div>

                         {/* Logistics List */}
                         <div className="p-4 bg-tactical-bg border border-tactical-border rounded-lg space-y-4">
                            <div className="text-[10px] font-bold text-tactical-muted uppercase tracking-widest">Logistik Terdeploy</div>
                            <div className="space-y-2">
                               {[
                                 { name: "Amunisi Latihan", qty: "10000 butir", type: 'AMUNISI' },
                                 { name: "Granat Asap", qty: "50 unit", type: 'GRANAT' },
                                 { name: "Senapan Serbu SS2-V1", qty: "2 unit", type: 'SENJATA' }
                               ].map((item, idx) => (
                                 <div 
                                   key={idx} 
                                   onClick={() => {
                                      setSelectedWeapon({
                                        name: item.name,
                                        qty: item.qty,
                                        production: "PT Pindad (Persero)",
                                        year: "2022"
                                      });
                                      setDetailReturnModal('OPERASI_DETAIL');
                                      setActiveModal('SENJATA_DETAIL');
                                   }}
                                   className="flex justify-between items-center p-3 bg-black/40 border border-tactical-border rounded-md hover:border-tactical-green/50 transition-all cursor-pointer group"
                                 >
                                    <div>
                                       <div className="text-xs font-bold text-tactical-text group-hover:text-tactical-green transition-colors uppercase tracking-wider">{item.name}</div>
                                       <div className="text-[10px] text-tactical-muted">Jumlah: {item.qty}</div>
                                    </div>
                                    <ChevronRight size={14} className="text-tactical-muted group-hover:text-tactical-green" />
                                 </div>
                               ))}
                            </div>
                         </div>
                      </div>
                    ) : opActiveTab === 'Personel' ? (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h5 className="text-xs font-bold text-tactical-muted uppercase tracking-widest border-l-2 border-red-600 pl-2">Personel Terdeploy</h5>
                          <div className="text-[10px] text-tactical-green font-mono">2 AKTIF</div>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                          {[
                            { name: "Fachry Dwiyansyah", rank: "Lettu Inf", nrp: "11120034450889", role: "Dan-Tim", photo: "https://i.pravatar.cc/150?u=fachry" },
                            { name: "Budi Setiawan", rank: "Serda", nrp: "21130045560990", role: "Wadan-Tim", photo: "https://i.pravatar.cc/150?u=budi" }
                          ].map((person, idx) => (
                            <div 
                              key={idx} 
                              onClick={() => {
                                setSelectedPersonnel(person);
                                setDetailReturnModal('OPERASI_DETAIL');
                                setActiveModal('PERSONNEL_DETAIL');
                              }}
                              className="flex items-center gap-4 p-4 bg-black/40 border border-tactical-border rounded-lg hover:border-tactical-green/50 transition-all cursor-pointer group"
                            >
                              <div className="w-12 h-12 rounded bg-tactical-dark border border-tactical-border overflow-hidden">
                                <img src={person.photo} alt={person.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                              </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-0.5">
                                    <div className="text-sm font-bold text-tactical-text group-hover:text-tactical-green transition-colors uppercase tracking-wider">{person.rank} {person.name}</div>
                                    <div className="px-1.5 py-0.5 bg-tactical-green/10 border border-tactical-green/30 rounded text-[8px] font-black text-tactical-green uppercase tracking-widest leading-none">{person.role}</div>
                                  </div>
                                  <div className="text-[10px] text-tactical-muted font-mono">{person.nrp}</div>
                                </div>

                              {/* Communication Buttons */}
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                  }}
                                  className="flex items-center gap-2 px-3 py-1.5 bg-tactical-green/10 border border-tactical-green/20 rounded text-[9px] font-black text-tactical-green hover:bg-tactical-green hover:text-black transition-all group/btn"
                                >
                                  <MessageSquare size={12} className="group-hover/btn:scale-110 transition-transform" />
                                  CHAT
                                </button>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                  }}
                                  className="flex items-center gap-2 px-3 py-1.5 bg-tactical-red/10 border border-tactical-red/20 rounded text-[9px] font-black text-tactical-red hover:bg-tactical-red hover:text-white transition-all shadow-[0_0_15px_rgba(255,51,51,0.1)] group/btn"
                                >
                                  <Video size={12} className="group-hover/btn:scale-110 transition-transform" />
                                  VCON
                                </button>
                              </div>
                              <div className="text-right">
                                <ChevronRight size={14} className="text-tactical-muted ml-auto" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[400px]">
                            {/* CHAT CARD */}
                            <div className="flex flex-col bg-black/40 border border-tactical-border rounded-lg overflow-hidden">
                              <div className="p-3 bg-tactical-green/10 border-b border-tactical-green/30 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <MessageSquare size={14} className="text-tactical-green" />
                                  <span className="text-[11px] font-black uppercase tracking-widest text-tactical-text">Tactical Chat</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                  <span className="text-[9px] font-mono text-emerald-500">SECURE</span>
                                </div>
                              </div>
                              <div className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar">
                                {[
                                  { sender: "DANTIM", text: "Melaporkan posisi di koordinat -1.740, 103.652. Situasi kondusif.", time: "14:20" },
                                  { sender: "PUSKODAL", text: "Diterima. Lanjutkan pemantauan di Sektor A.", time: "14:22" },
                                  { sender: "DANTIM", text: "Visual target terkonfirmasi. Menunggu instruksi selanjutnya.", time: "14:25" }
                                ].map((msg, i) => (
                                  <div key={i} className={cn(
                                    "max-w-[85%] space-y-1",
                                    msg.sender === 'PUSKODAL' ? "ml-auto" : ""
                                  )}>
                                    <div className="flex items-center gap-2">
                                      <span className={cn(
                                        "text-[9px] font-black uppercase tracking-tighter",
                                        msg.sender === 'PUSKODAL' ? "text-tactical-green" : "text-yellow-500"
                                      )}>{msg.sender}</span>
                                      <span className="text-[8px] text-tactical-muted font-mono">{msg.time}</span>
                                    </div>
                                    <div className={cn(
                                      "p-3 text-[11px] rounded-lg",
                                      msg.sender === 'PUSKODAL' ? "bg-tactical-green/20 border border-tactical-green/30 text-tactical-text" : "bg-white/5 border border-white/10 text-tactical-muted"
                                    )}>
                                      {msg.text}
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <div className="p-3 bg-black/60 border-t border-tactical-border">
                                <div className="flex gap-2">
                                  <input 
                                    type="text" 
                                    placeholder="Ketik pesan taktis..."
                                    className="flex-1 bg-tactical-bg border border-tactical-border rounded px-3 py-1.5 text-[10px] text-tactical-text focus:outline-none focus:border-tactical-green"
                                  />
                                  <button className="px-3 py-1.5 bg-tactical-green/20 border border-tactical-green text-tactical-green rounded text-[10px] font-black hover:bg-tactical-green hover:text-black transition-all">
                                    SEND
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* VCON CARD */}
                            <div className="flex flex-col bg-black/40 border border-tactical-border rounded-lg overflow-hidden">
                              <div className="p-3 bg-tactical-red/10 border-b border-tactical-red/30 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <Video size={14} className="text-tactical-red" />
                                  <span className="text-[11px] font-black uppercase tracking-widest text-tactical-text">VCON System</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-tactical-red animate-pulse"></div>
                                  <span className="text-[9px] font-mono text-tactical-red">LIVE</span>
                                </div>
                              </div>
                              <div className="flex-1 relative bg-tactical-dark overflow-hidden group">
                                {/* Tactical Camera Feed Simulation */}
                                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1590233465191-100230230230?auto=format&fit=crop&q=80')] bg-cover bg-center grayscale opacity-40 group-hover:grayscale-0 transition-all duration-700"></div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60"></div>
                                
                                {/* Overlay UI */}
                                <div className="absolute inset-4 flex flex-col justify-between pointer-events-none">
                                  <div className="flex justify-between items-start">
                                    <div className="p-2 border-l-2 border-t-2 border-tactical-red/60 space-y-1">
                                      <div className="text-[8px] font-mono text-tactical-red">CAM-01 / SECTOR-P</div>
                                      <div className="text-[10px] font-black text-white">RECON-ALPHA</div>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-[8px] font-mono text-emerald-500">SIGNAL: 98%</div>
                                      <div className="text-[8px] font-mono text-tactical-muted">LATENCY: 12ms</div>
                                    </div>
                                  </div>

                                  <div className="flex justify-center">
                                    <div className="w-32 h-32 border border-tactical-red/20 rounded-full flex items-center justify-center">
                                      <div className="w-1 h-1 bg-tactical-red rounded-full"></div>
                                      <div className="absolute w-24 h-0.5 bg-tactical-red/10 rotate-45 animate-pulse"></div>
                                      <div className="absolute w-24 h-0.5 bg-tactical-red/10 -rotate-45 animate-pulse"></div>
                                    </div>
                                  </div>

                                  <div className="flex justify-between items-end">
                                    <div className="text-[8px] font-mono text-tactical-muted">
                                      COORD: -1.740961, 103.652457<br />
                                      ELEV: 124m MSL
                                    </div>
                                    <div className="flex gap-1">
                                      <div className="w-1 h-4 bg-emerald-500/40"></div>
                                      <div className="w-1 h-2 bg-emerald-500/40"></div>
                                      <div className="w-1 h-6 bg-emerald-500/40"></div>
                                    </div>
                                  </div>
                                </div>

                                {/* Controls Overlay */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 backdrop-blur-sm transition-all duration-300 pointer-events-auto">
                                  <button className="px-6 py-2 bg-tactical-red border border-tactical-red text-white text-[10px] font-black rounded tracking-widest hover:bg-white hover:text-black transition-all shadow-[0_0_20px_rgba(255,51,51,0.4)]">
                                    JOIN VCON CHANNEL
                                  </button>
                                </div>
                              </div>
                              <div className="p-3 bg-black/60 border-t border-tactical-border flex items-center justify-between">
                                <div className="flex -space-x-2">
                                  <img src="https://i.pravatar.cc/150?u=1" className="w-6 h-6 rounded-full border border-tactical-bg" />
                                  <img src="https://i.pravatar.cc/150?u=2" className="w-6 h-6 rounded-full border border-tactical-bg" />
                                  <div className="w-6 h-6 rounded-full bg-tactical-border flex items-center justify-center text-[8px] font-bold text-tactical-muted">+3</div>
                                </div>
                                <button className="text-[9px] font-bold text-tactical-red hover:underline">VIEW ALL PARTICIPANTS</button>
                              </div>
                            </div>
                          </div>
                    )}
                  </div>
                ) : null}
              </div>

              {/* Modal Footer */}
              <div className={cn(
                "p-4 border-t transition-colors duration-300 flex justify-end",
                activeModal === 'OPERASI_DETAIL' ? "bg-tactical-red/5 border-tactical-red/30" : "bg-tactical-green/5 border-tactical-green/30"
              )}>
                <button 
                   onClick={() => {
                    if (activeModal === 'PERSONNEL_DETAIL' || activeModal === 'SENJATA_DETAIL' || activeModal === 'ALUTSISTA_DETAIL') {
                      if (detailReturnModal) {
                        setActiveModal(detailReturnModal as any);
                      } else {
                        setActiveModal(activeModal === 'PERSONNEL_DETAIL' ? 'PERSONNEL' : activeModal === 'SENJATA_DETAIL' ? 'SENJATA' : 'ALUTSISTA');
                      }
                    } else {
                      setActiveModal(null);
                    }
                  }}
                  className={cn(
                    "px-8 py-2.5 border text-xs font-black font-mono tracking-[0.2em] transition-all shadow-lg active:scale-95",
                    activeModal === 'OPERASI_DETAIL' 
                      ? "bg-tactical-red/20 border-tactical-red text-tactical-red hover:bg-tactical-red hover:text-white" 
                      : "bg-tactical-green/20 border-tactical-green text-tactical-green hover:bg-tactical-green hover:text-black"
                  )}
                >
                  {activeModal === 'PERSONNEL_DETAIL' ? 'KEMBALI' : 'TUTUP LAPORAN'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Zoom Slider Control */}
      <div className="absolute bottom-6 left-6 z-[400] pointer-events-auto">
        <div className="tactical-glass p-2 rounded-lg border border-tactical-green/30 flex items-center gap-3">
          <button 
            onClick={() => setCurrentZoom(prev => Math.max(3, prev - 0.5))}
            className="p-1 hover:bg-tactical-green/20 rounded text-tactical-green transition-colors"
            title="Zoom Out"
          >
            <Minus size={14} />
          </button>
          
          <div className="flex flex-col">
            <input 
              type="range"
              min="3"
              max="18"
              step="0.5"
              value={currentZoom}
              onChange={(e) => setCurrentZoom(parseFloat(e.target.value))}
              className="w-32 h-1 bg-tactical-bg rounded-lg appearance-none cursor-pointer accent-tactical-green"
              style={{
                background: `linear-gradient(to right, var(--color-tactical-green) 0%, var(--color-tactical-green) ${((currentZoom - 3) / (18 - 3)) * 100}%, var(--color-tactical-bg) ${((currentZoom - 3) / (18 - 3)) * 100}%, var(--color-tactical-bg) 100%)`
              }}
            />
          </div>

          <button 
            onClick={() => setCurrentZoom(prev => Math.min(18, prev + 0.5))}
            className="p-1 hover:bg-tactical-green/20 rounded text-tactical-green transition-colors"
            title="Zoom In"
          >
            <Plus size={14} />
          </button>

          <div className="bg-tactical-green/10 border border-tactical-green/30 rounded px-2 py-0.5 min-w-[40px] text-center">
            <span className="text-[10px] font-bold font-mono text-tactical-green">{currentZoom.toFixed(1)}x</span>
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  );
}

function RadialItem({ angle, distance, icon, label, onClick }: { angle: number, distance: number, icon: React.ReactNode, label: string, onClick: () => void }) {
  const x = Math.cos(angle * Math.PI / 180) * distance;
  const y = Math.sin(angle * Math.PI / 180) * distance;

  return (
    <motion.button
      initial={{ x: 0, y: 0, opacity: 0 }}
      animate={{ x, y, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      onClick={onClick}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border-2 border-[#c9a041]/40 bg-black/80 flex flex-col items-center justify-center pointer-events-auto radial-item-glow transition-all"
    >
      <div className="mb-1">{icon}</div>
      <span className="text-[10px] font-bold text-white uppercase tracking-tighter">{label}</span>
    </motion.button>
  );
}
