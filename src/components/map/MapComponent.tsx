"use client";

import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, LayersControl, LayerGroup, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Building2, Building, Shield, Crosshair, Users, Activity, Package, MapPin, Search, ChevronRight, ChevronLeft, X, Clock, AlertTriangle, Eye, Target, ClipboardList, Truck, MessageSquare, Video, Minus, Plus, Database, RotateCcw } from "lucide-react";
import { getOpAssignments, getOperationAssets, getLogistics, getUnitMembers, getLogisticsByUnit, getUnitActivities, getLogisticsDistribution, getLogisticsDistributionDetails, getAllLogisticsLocations } from "@/app/actions";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import "maplibre-gl/dist/maplibre-gl.css";
import maplibregl from "maplibre-gl";
import "@maplibre/maplibre-gl-leaflet";

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

const getIntelColor = (threatLevel: string) => {
  switch (threatLevel?.toUpperCase()) {
    case 'STABIL': return '#10b981';
    case 'TERJAGA': return '#3b82f6';
    case 'MENINGKAT': return '#f59e0b';
    case 'TINGGI': return '#f97316';
    case 'KRITIS':
    case 'HIGH':
    case 'SEVERE': return '#ef4444';
    default: return '#ef4444';
  }
};

const createIntelIcon = (threatLevel: string) => {
  const color = getIntelColor(threatLevel);
  let size = 28;
  
  switch (threatLevel?.toUpperCase()) {
    case 'STABIL': size = 20; break;
    case 'TERJAGA': size = 22; break;
    case 'MENINGKAT': size = 24; break;
    case 'TINGGI': size = 26; break;
    case 'KRITIS':
    case 'HIGH':
    case 'SEVERE': size = 30; break;
  }

  const isCritical = threatLevel === 'KRITIS' || threatLevel === 'HIGH' || threatLevel === 'SEVERE' || threatLevel === 'TINGGI';

  return new L.DivIcon({
    className: 'custom-intel-icon',
    html: `<div style="background-color: ${color}; width: ${size}px; height: ${size}px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 20px ${color}; display: flex; align-items: center; justify-content: center; position: relative;">
             ${isCritical ? `<div style="position: absolute; inset: -6px; border: 2px solid ${color}; border-radius: 50%; animation: pulse-high 1.2s infinite;"></div>` : ''}
             <div style="z-index: 2; color: white;"><svg width="${size/1.6}" height="${size/1.6}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z"/><circle cx="12" cy="12" r="3"/></svg></div>
           </div>`,
    iconSize: [size, size],
    iconAnchor: [size/2, size/2]
  });
};

const createOpIcon = (category: string) => {
  const color = category === 'DN' ? '#3b82f6' : '#22d3ee';
  const shadowColor = category === 'DN' ? 'rgba(59, 130, 246, 0.8)' : 'rgba(34, 211, 238, 0.8)';
  
  return new L.DivIcon({
    className: 'custom-op-icon',
    html: `<div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
              <div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background: ${color}; border: 2px solid white; box-shadow: 0 0 15px ${shadowColor}; z-index: 1;"></div>
              <div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; border: 3px solid ${color}; animation: pulse-high 2s infinite; z-index: 0;"></div>
              <img src="/logo_puskodal.png" style="width: 24px; height: 24px; object-fit: contain; z-index: 2; filter: drop-shadow(0 0 3px rgba(0,0,0,0.3));" />
           </div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18]
  });
};

const createUnitIcon = (logoUrl?: string) => {
  const actualLogo = logoUrl || "/logo_puskodal.png";
  return new L.DivIcon({
    className: 'custom-unit-icon',
    html: `<div style="width: 40px; height: 40px; border-radius: 50%; overflow: hidden; border: 2px solid var(--color-tactical-green); background-color: var(--color-tactical-bg); display: flex; align-items: center; justify-content: center; box-shadow: 0 0 10px var(--color-tactical-green);">
             <img src="${actualLogo}" style="width: 80%; height: 80%; object-fit: contain;" />
           </div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20]
  });
};

function MapViewUpdater({ center, zoom, moveTrigger, onZoomEnd, onMoveEnd }: { 
  center: [number, number], 
  zoom: number, 
  moveTrigger: number, 
  onZoomEnd?: (zoom: number) => void,
  onMoveEnd?: (center: [number, number]) => void 
}) {
  const map = useMap();
  const lastCenterRef = React.useRef<string>("");
  const lastTriggerRef = React.useRef(moveTrigger);

  useEffect(() => {
    if (!map) return;
    
    // Only flyTo if moveTrigger has changed and is greater than 0
    // This prevents auto-centering during normal zooming/panning
    if (moveTrigger > 0 && moveTrigger !== lastTriggerRef.current) {
      map.flyTo(center, zoom, {
        duration: 1.5,
        easeLinearity: 0.25,
        animate: true
      });
      lastTriggerRef.current = moveTrigger;
    }
  }, [moveTrigger, center, zoom, map]);


  useMapEvents({
    zoomend() {
      // Still update external zoom for UI sync, but carefully
      const newZoom = map.getZoom();
      if (Math.abs(newZoom - zoom) > 0.1 && onZoomEnd) {
        onZoomEnd(newZoom);
      }
      
      const newCenter = map.getCenter();
      if (onMoveEnd) onMoveEnd([newCenter.lat, newCenter.lng]);
    },
    moveend() {
      const newCenter = map.getCenter();
      const newZoom = map.getZoom();
      if (onMoveEnd) onMoveEnd([newCenter.lat, newCenter.lng]);
      if (onZoomEnd) onZoomEnd(newZoom);
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

function MapLibreLayer({ url }: { url: string }) {
  const map = useMap();
  
  useEffect(() => {
    if (!map) return;
    
    // @ts-ignore
    const glLayer = L.maplibreGL({
      style: url,
    });
    
    glLayer.addTo(map);
    return () => {
      map.removeLayer(glLayer);
    };
  }, [map, url]);
  
  return null;
}

function MapEventsHandler({ 
  onReset, 
  selectable, 
  onSelectCoordinates 
}: { 
  onReset: (center: [number, number], zoom: number) => void;
  selectable?: boolean;
  onSelectCoordinates?: (coords: [number, number]) => void;
}) {
  const map = useMap();
  useMapEvents({
    click(e) {
      if (selectable && onSelectCoordinates) {
        onSelectCoordinates([e.latlng.lat, e.latlng.lng]);
      } else {
        // Removed auto-reset zoom to 5 on click to prevent unintended zoom out
        // Just let the map be
      }
    },
    popupclose() {
      // When a popup closes, don't force zoom out to 5
      // Keep current zoom and center
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
  opFilter = "ALL",
  intelStatusFilter = "ALL",
  singleMarker = null,
  onMarkerClick,
  externalSelectedEntity,
  externalActiveModal = null,
  moveTrigger = 0,
  showControls = false,
  selectable = false,
  onSelectCoordinates,
  className = "",
  hideMap = false,
  highlightedLocations = [],
  setHighlightedLocations = () => {},
  onMapChange,
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
  opFilter?: string;
  intelStatusFilter?: string;
  singleMarker?: [number, number] | null;
  onMarkerClick?: (center: [number, number], zoom: number) => void;
  externalSelectedEntity?: any;
  externalActiveModal?: any;
  moveTrigger?: number;
  showControls?: boolean;
  selectable?: boolean;
  onSelectCoordinates?: (coords: [number, number]) => void;
  className?: string;
  hideMap?: boolean;
  highlightedLocations?: any[];
  setHighlightedLocations?: (locs: any[]) => void;
  onMapChange?: (center: [number, number], zoom: number) => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(targetZoom);
  const [currentCenter, setCurrentCenter] = useState<[number, number]>(targetCenter);
  const [selectedEntity, setSelectedEntity] = useState<any>(null);
  const [activeModal, setActiveModal] = useState<'PERSONNEL' | 'KEGIATAN' | 'PERSONNEL_DETAIL' | 'SENJATA' | 'LOGISTIK' | 'SENJATA_DETAIL' | 'LOGISTIK_DETAIL' | 'OPERASI_DETAIL' | 'INTEL' | 'INTEL_DETAIL' | 'UNIT_DETAIL' | 'LOGISTIK_USAGE' | null>(null);
  const [isLogisticsLoading, setIsLogisticsLoading] = useState(false);
  const [selectedPersonnel, setSelectedPersonnel] = useState<any>(null);
  const [selectedWeapon, setSelectedWeapon] = useState<any>(null);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [selectedOperation, setSelectedOperation] = useState<any>(null);
  const [modalSearchQuery, setModalSearchQuery] = useState('');
  const [opActiveTab, setOpActiveTab] = useState('Informasi');
  const [detailReturnModal, setDetailReturnModal] = useState<'PERSONNEL' | 'KEGIATAN' | 'PERSONNEL_DETAIL' | 'SENJATA' | 'LOGISTIK' | 'SENJATA_DETAIL' | 'LOGISTIK_DETAIL' | 'OPERASI_DETAIL' | 'INTEL' | 'INTEL_DETAIL' | 'UNIT_DETAIL' | 'LOGISTIK_USAGE' | null>(null);
  const [opAssignments, setOpAssignments] = useState<any[]>([]);
  const [opAssets, setOpAssets] = useState<any[]>([]);
  const [allLogistics, setAllLogistics] = useState<any[]>([]);
  const [unitPersonnel, setUnitPersonnel] = useState<any[]>([]);
  const [unitLogistics, setUnitLogistics] = useState<any[]>([]);
  const [unitActivities, setUnitActivities] = useState<any[]>([]);
  const [selectedIntel, setSelectedIntel] = useState<any>(null);
  const [logisticsDistribution, setLogisticsDistribution] = useState<{kesatuan: number, ops_dn: number, ops_ln: number}>({ kesatuan: 0, ops_dn: 0, ops_ln: 0 });
  const [distributionDetails, setDistributionDetails] = useState<{units: any[], ops_dn: any[], ops_ln: any[]}>({ units: [], ops_dn: [], ops_ln: [] });
  const [activeDistributionTab, setActiveDistributionTab] = useState<'KESATUAN' | 'OPS_DN' | 'OPS_LN'>('KESATUAN');

  useEffect(() => {
    if (externalSelectedEntity) {
      setSelectedEntity(externalSelectedEntity);
    }
  }, [externalSelectedEntity]);

  useEffect(() => {
    if (externalActiveModal) {
      setActiveModal(externalActiveModal);
    } else if (externalActiveModal === null && activeModal) {
      setActiveModal(null);
    }
  }, [externalActiveModal]);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    getLogistics().then(data => setAllLogistics(data));
  }, []);

  useEffect(() => {
    if (selectedOperation) {
      const type = (selectedOperation.type === 'DALAM_NEGERI' || selectedOperation.category === 'DN') ? 'DALAM_NEGERI' : 'LUAR_NEGERI';
      getOpAssignments(selectedOperation.id, type).then(data => setOpAssignments(data));
      getOperationAssets(selectedOperation.id, type).then(data => setOpAssets(data));
    }
  }, [selectedOperation]);

  useEffect(() => {
    if (selectedEntity && selectedEntity.type === 'UNIT') {
      getUnitMembers(selectedEntity.id).then(data => setUnitPersonnel(data));
      getLogisticsByUnit(selectedEntity.id).then(data => setUnitLogistics(data));
      getUnitActivities(selectedEntity.id).then(data => setUnitActivities(data));
    }
  }, [selectedEntity]);

  useEffect(() => {
    if (activeModal === 'LOGISTIK_DETAIL' && selectedAsset) {
      const itemName = selectedAsset.name || selectedAsset.item_name;
      if (itemName) {
        getLogisticsDistribution(itemName).then(data => setLogisticsDistribution(data));
        getLogisticsDistributionDetails(itemName).then(data => setDistributionDetails(data));
      }
    }
  }, [selectedAsset, activeModal]);

  useEffect(() => {
    if (externalActiveModal) {
      if (externalActiveModal === 'LOGISTIK_MAP' && externalSelectedEntity) {
        const itemName = externalSelectedEntity.name || externalSelectedEntity.item_name;
        getLogisticsDistributionDetails(itemName).then(data => {
          const allLocs = [
            ...(data.units || []).map((u: any) => ({ ...u, type: 'UNIT', asset_name: itemName })),
            ...(data.ops_dn || []).map((o: any) => ({ ...o, type: 'DALAM_NEGERI', asset_name: itemName })),
            ...(data.ops_ln || []).map((o: any) => ({ ...o, type: 'LUAR_NEGERI', asset_name: itemName }))
          ];
          setHighlightedLocations(allLocs);
          setActiveModal(null);
        });
      } else {
        setActiveModal(externalActiveModal);
      }
      
      if (externalSelectedEntity) {
        if (externalActiveModal === 'OPERASI_DETAIL') setSelectedOperation(externalSelectedEntity);
        if (externalActiveModal === 'INTEL_DETAIL') setSelectedIntel(externalSelectedEntity);
        if (externalActiveModal === 'LOGISTIK_DETAIL' || externalActiveModal === 'LOGISTIK_MAP') setSelectedAsset(externalSelectedEntity);
      }
    } else if (externalSelectedEntity && externalSelectedEntity.type === 'UNIT') {
      // If we have an external selected entity but NO active modal, 
      // it means we want to show the radial menu for this unit
      setSelectedEntity(externalSelectedEntity);
      setActiveModal(null);
    }
  }, [externalActiveModal, externalSelectedEntity]);

  useEffect(() => {
    setCurrentZoom(targetZoom);
  }, [targetZoom]);

  useEffect(() => {
    setCurrentCenter(targetCenter);
  }, [targetCenter]);


  return (
    <div 
      className={cn(
        "relative w-full overflow-hidden transition-all duration-500",
        isFullScreen 
          ? "h-screen w-screen" 
          : "h-full rounded-lg tactical-border border-tactical-green",
        hideMap ? "pointer-events-none" : "pointer-events-auto",
        className
      )}
    >
      {!mounted ? (
        <div className="w-full h-full bg-tactical-bg flex items-center justify-center text-tactical-green">
          INITIALIZING SATELLITE LINK...
        </div>
      ) : (
        <>
          {/* Overlay UI elements */}

          {isLogisticsLoading && (
            <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[1000] bg-orange-500/90 text-black px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse border border-orange-400 shadow-[0_0_20px_rgba(249,115,22,0.4)]">
              MENGAMBIL DATA SEBARAN LOGISTIK GLOBAL...
            </div>
          )}

          {!hideMap && (
            <MapContainer 
              center={targetCenter} 
              zoom={targetZoom} 
              style={{ height: '100%', width: '100%', backgroundColor: '#f8f9fa' }}
              zoomControl={showControls}
              attributionControl={false}
            >
        <style>
          {`
            @keyframes pulse {
              0% { transform: scale(0.95); opacity: 0.8; }
              50% { transform: scale(1.05); opacity: 1; }
              100% { transform: scale(0.95); opacity: 0.8; }
            }
            @keyframes triangle-blink {
              0% { transform: scale(1); filter: brightness(1); }
              50% { transform: scale(1.1); filter: brightness(1.6); }
              100% { transform: scale(1); filter: brightness(1); }
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
        <MapViewUpdater 
          center={targetCenter} 
          zoom={targetZoom} 
          moveTrigger={moveTrigger} 
          onZoomEnd={(z) => {
            setCurrentZoom(z);
            if (onMapChange) onMapChange(currentCenter, z);
          }} 
          onMoveEnd={(c) => {
            setCurrentCenter(c);
            if (onMapChange) onMapChange(c, currentZoom);
          }}
        />
        <LayersControl position="bottomright">
          <LayersControl.BaseLayer checked name="3D Tactical View (Bldg)">
            <MapLibreLayer url="https://tiles.openfreemap.org/styles/liberty" />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Google Maps Roadmap">
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
          <LayersControl.BaseLayer name="Google Maps Terrain">
            <TileLayer
              url="https://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}"
              subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
            />
          </LayersControl.BaseLayer>
        </LayersControl>
        <MapEventsHandler 
          onReset={(c, z) => {
            setSelectedEntity(null);
            if (onMarkerClick) onMarkerClick(c, z);
          }} 
          selectable={selectable}
          onSelectCoordinates={onSelectCoordinates}
        />

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
                      // Use zoom level 15 instead of 18 for better reliability
                      if (onMarkerClick) onMarkerClick([lat, lng], 13);
                      setSelectedEntity({ ...unit, pos: [lat, lng], type: 'UNIT' });
                    }
                  }}
                >
                  <Popup className="tactical-popup" autoPan={false}>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-start gap-2 bg-tactical-green/5 border border-tactical-green/20 p-2 rounded">
                        <MapPin className="w-3 h-3 text-tactical-green mt-0.5 shrink-0" />
                        <div>
                          <div className="text-[9px] font-mono text-tactical-muted uppercase">LOKASI / ALAMAT</div>
                          <div className="text-[11px] font-bold text-tactical-text leading-tight">{unit.location}</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <div className="bg-tactical-bg/50 p-1.5 rounded border border-tactical-border/50">
                          <div className="text-[8px] text-tactical-muted uppercase">KEKUATAN</div>
                          <div className="text-xs font-bold text-tactical-text">{unit.strength || 0} PERS</div>
                        </div>
                        <div className="bg-tactical-bg/50 p-1.5 rounded border border-tactical-border/50">
                          <div className="text-[8px] text-tactical-muted uppercase">STATUS</div>
                          <div className="text-xs font-bold text-tactical-green uppercase">{unit.status || 'ACTIVE'}</div>
                        </div>
                      </div>

                      <button 
                        onClick={() => {
                          setSelectedEntity({ ...unit, pos: [lat, lng], type: 'UNIT' });
                        }}
                        className="mt-2 w-full py-2 bg-tactical-green/20 border border-tactical-green/40 text-[10px] font-black text-tactical-green rounded hover:bg-tactical-green hover:text-black transition-all uppercase shadow-[0_0_15px_rgba(34,197,94,0.2)]"
                      >
                        INFO KESATUAN
                      </button>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </>
        )}

        {(!activeCategory || activeCategory === 'INTELIJEN') && (
          <>
            {intelReports
              .filter(intel => {
                if (intelStatusFilter && intelStatusFilter !== 'ALL' && intel.threat_level !== intelStatusFilter) return false;
                if (!searchQuery) return true;
                const q = searchQuery.toLowerCase();
                return (intel.title?.toLowerCase().includes(q) || 
                        intel.location_tag?.toLowerCase().includes(q) ||
                        intel.threat_level?.toLowerCase().includes(q));
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
                          <div className="text-xs font-bold flex items-center gap-2" style={{ color: getIntelColor(intel.threat_level) }}>
                            <Shield size={12} /> {intel.threat_level}
                          </div>
                        </div>

                        <div className="text-[10px] font-mono text-tactical-text mt-1 line-clamp-2 italic">
                          "{intel.content}"
                        </div>

                        <div className="mt-1 pt-2 border-t border-tactical-border/30 flex justify-between items-center">
                          <div className="text-[9px] font-mono text-tactical-muted flex items-center gap-1 max-w-[80px] truncate">
                            <MapPin size={8} /> {intel.location_tag}
                          </div>
                          
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedIntel(intel);
                              setActiveModal('INTEL_DETAIL');
                            }}
                            className="px-4 py-2 bg-tactical-cyan/20 border border-tactical-cyan/40 text-[10px] font-black text-tactical-cyan rounded hover:bg-tactical-cyan hover:text-black transition-all uppercase whitespace-nowrap shadow-[0_0_10px_rgba(34,211,238,0.2)]"
                          >
                            LIHAT DETAIL
                          </button>

                          <div className="text-[9px] font-mono text-tactical-muted shrink-0">
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
            {[...opsDalamNegeri.map(o => ({...o, category: 'DN'})), ...opsLuarNegeri.map(o => ({...o, category: 'LN'}))]
              .filter(op => {
                if (opFilter && opFilter !== 'ALL' && op.category !== opFilter) return false;
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
                <LayerGroup key={`op-${op.category}-${op.id}`}>
                  <Marker 
                    position={[lat, lng]} 
                    icon={createOpIcon(op.category)}
                    eventHandlers={{
                      click: (e) => {
                        L.DomEvent.stopPropagation(e);
                        if (onMarkerClick) onMarkerClick([lat, lng], 13);
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

        {highlightedLocations.length > 0 && (
          <>
            {highlightedLocations.map((loc, idx) => {
               if (!loc.coordinates) return null;
               // Robust parsing: strip parentheses and trim whitespace
               const cleanCoords = loc.coordinates.replace(/[()]/g, '').split(',');
               if (cleanCoords.length !== 2) return null;
               const lat = parseFloat(cleanCoords[0].trim());
               const lng = parseFloat(cleanCoords[1].trim());
               if (isNaN(lat) || isNaN(lng)) return null;

               const markerColor = loc.type === 'UNIT' ? '#ff3333' : 
                                 loc.type === 'DALAM_NEGERI' ? '#3b82f6' : 
                                 '#22d3ee';
               
               const shadowColor = loc.type === 'UNIT' ? 'rgba(255,51,51,0.8)' : 
                                 loc.type === 'DALAM_NEGERI' ? 'rgba(59,130,246,0.8)' : 
                                 'rgba(34,211,238,0.8)';
               
               return (
                 <Marker 
                    key={`highlight-${loc.type || 'L'}-${loc.id || idx}-${idx}`} 
                    position={[lat, lng]} 
                    icon={L.divIcon({
                      className: 'custom-highlight-icon',
                      html: `<div class="flex items-center justify-center" style="animation: triangle-blink 1.5s infinite;">
                               <div style="width: 32px; height: 32px; background: ${markerColor}; border: 2px solid black; border-radius: 4px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 15px ${shadowColor};">
                                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
                               </div>
                             </div>`,
                      iconSize: [40, 40],
                      iconAnchor: [20, 20]
                    })}
                    eventHandlers={{
                      click: (e) => {
                        if (onMarkerClick) onMarkerClick([lat, lng], 13);
                      }
                    }}
                  >
                   <Popup className="tactical-popup" minWidth={280}>
                      <div className="font-bold uppercase mb-1" style={{ color: markerColor }}>{loc.name}</div>
                      <div className="text-[10px] text-tactical-muted uppercase font-mono">
                        {loc.type === 'UNIT' ? 'KESATUAN' : 
                         loc.type === 'DALAM_NEGERI' ? 'OPERASI DALAM NEGERI' : 
                         'OPERASI LUAR NEGERI'}
                      </div>
                       {loc.items_summary ? (
                         <div className="flex flex-col gap-1.5 max-h-[180px] overflow-y-auto pr-2 custom-scrollbar">
                           <div className="text-[9px] text-tactical-muted uppercase font-black tracking-widest mb-1">Daftar Logistik & Qty:</div>
                           {loc.items_summary.split('\n').map((item: string, i: number) => (
                             <div key={i} className="text-[11px] text-white flex items-center gap-2 py-1 border-b border-white/5 last:border-0">
                               <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: markerColor }}></div>
                               <span className="font-bold truncate">{item.split(' (')[0]}</span>
                               <span className="text-tactical-muted font-mono text-[10px] ml-auto shrink-0 uppercase">
                                 {item.includes('(') ? item.split(' (')[1].replace(')', '') : ''}
                               </span>
                             </div>
                           ))}
                         </div>
                       ) : (
                         <div className="mt-2 space-y-1">
                            <div className="text-[11px] font-black text-white uppercase">Logistik : {loc.asset_name || selectedAsset?.name || 'LOGISTIK'}</div>
                            <div className="text-[11px] font-black text-white uppercase">Jumlah : {loc.quantity} Unit</div>
                          </div>
                       )}
                   </Popup>
                 </Marker>
               );
            })}
            <div className="absolute bottom-6 right-24 z-[1000] pointer-events-auto">
               <button 
                 onClick={() => setHighlightedLocations([])}
                 className="bg-tactical-red border border-white/20 text-white px-6 py-2.5 rounded-full text-[11px] font-black shadow-2xl hover:bg-red-700 transition-all flex items-center gap-2"
               >
                 <X size={16} /> BERSIHKAN TAMPILAN LOGISTIK DI MAP
               </button>
            </div>
          </>
        )}

        {singleMarker && (
          <Marker 
            position={singleMarker} 
            icon={customIcon}
            eventHandlers={{
              click: () => {
                if (onMarkerClick) onMarkerClick(singleMarker, 13);
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
      )}

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
              <div 
                onClick={() => setActiveModal('UNIT_DETAIL')}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border-4 border-[#c9a041]/50 bg-black/60 flex flex-col items-center justify-center shadow-[0_0_50px_rgba(201,160,65,0.4)] pointer-events-auto backdrop-blur-md z-20 cursor-pointer hover:border-[#c9a041] transition-all group"
              >
                 <div className="absolute inset-0 rounded-full border border-[#c9a041]/20 animate-pulse"></div>
                 <img src={selectedEntity.logo_url || "/logo_puskodal.png"} className="w-20 h-20 object-contain drop-shadow-[0_0_10px_rgba(201,160,65,0.5)]" />
                 <div className="mt-2 text-center">
                    <div className="text-[10px] text-[#c9a041] font-bold tracking-widest">{selectedEntity.unit_code || 'U-03'}</div>
                     <div className="text-base font-black text-white tracking-tight italic uppercase leading-tight px-4">{selectedEntity.unit_name || selectedEntity.name}</div>
                     <div className="mt-2 px-6 text-[10px] text-gray-300 font-medium line-clamp-3 uppercase leading-tight max-w-[180px] drop-shadow-md">
                        <MapPin className="w-2 h-2 inline-block mr-1 text-[#c9a041]" />
                        {selectedEntity.location}
                     </div>
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
                onClick={() => setActiveModal('LOGISTIK')}
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

                  
                  {activeModal === 'KEGIATAN' || activeModal === 'SENJATA' || activeModal === 'LOGISTIK' || activeModal === 'SENJATA_DETAIL' || activeModal === 'LOGISTIK_DETAIL' || activeModal === 'OPERASI_DETAIL' || activeModal === 'INTEL_DETAIL' ? (
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => {
                          setActiveModal(null);
                        }}
                        className="mr-2 p-1.5 hover:bg-tactical-green/20 rounded-md transition-colors text-tactical-green border border-tactical-green/30"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      {activeModal === 'KEGIATAN' ? <ClipboardList className="text-tactical-green" /> : 
                       activeModal === 'SENJATA' || activeModal === 'SENJATA_DETAIL' ? <Target className="text-tactical-green" /> :
                       activeModal === 'OPERASI_DETAIL' ? <Shield className="text-tactical-red" /> :
                       <Package className="text-tactical-green" />}
                      <div>
                        <div className="text-[10px] text-tactical-muted font-mono leading-none">{selectedEntity?.unit_code || 'U-10'}</div>
                        <div className="text-lg font-black text-tactical-text tracking-widest uppercase leading-tight">
                          {activeModal === 'OPERASI_DETAIL' ? selectedOperation?.name : 
                           activeModal === 'LOGISTIK' ? 'DATABASE LOGISTIK UTAMA' : 
                           activeModal === 'INTEL_DETAIL' ? selectedIntel?.title :
                           selectedEntity?.unit_name}
                        </div>
                      </div>
                    </div>
                  ) : activeModal === 'PERSONNEL' || activeModal === 'PERSONNEL_DETAIL' ? (
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => {
                          if (activeModal === 'PERSONNEL_DETAIL') setActiveModal('PERSONNEL');
                          else if (detailReturnModal) setActiveModal(detailReturnModal as any);
                          else setActiveModal('UNIT_DETAIL');
                        }}
                        className="mr-2 p-1.5 hover:bg-tactical-green/20 rounded-md transition-colors text-tactical-green border border-tactical-green/30"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <Users className="text-tactical-green" />
                      <h3 className="text-lg font-bold text-tactical-text tracking-widest uppercase">
                        {activeModal === 'PERSONNEL' ? `DAFTAR PERSONIL - ${selectedEntity?.unit_name}` : `PROFIL PERSONIL`}
                      </h3>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <ClipboardList className="text-tactical-green" />
                      <h3 className="text-lg font-bold text-tactical-text tracking-widest uppercase">
                        LAPORAN KEGIATAN - {selectedEntity?.unit_name}
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
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                       <h4 className="text-sm font-bold text-tactical-muted uppercase tracking-widest border-l-2 border-tactical-green pl-2">Personel Terdeploy ({unitPersonnel.length})</h4>
                    </div>
                    <div className="overflow-x-auto border border-tactical-border rounded-lg bg-black/40">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-tactical-border bg-tactical-green/10">
                            <th className="p-2 text-[10px] font-black text-tactical-green uppercase tracking-widest">No</th>
                            <th className="p-2 text-[10px] font-black text-tactical-green uppercase tracking-widest">Foto</th>
                            <th className="p-2 text-[10px] font-black text-tactical-green uppercase tracking-widest">Nama Lengkap</th>
                            <th className="p-2 text-[10px] font-black text-tactical-green uppercase tracking-widest text-center">Pangkat / NRP</th>
                            <th className="p-2 text-[10px] font-black text-tactical-green uppercase tracking-widest text-center">Spesialisasi</th>
                            <th className="p-2 text-[10px] font-black text-tactical-green uppercase tracking-widest text-right">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-tactical-border/30">
                           {unitPersonnel.length > 0 ? unitPersonnel.map((p, i) => (
                            <tr key={i} className="hover:bg-tactical-green/5 transition-colors group">
                              <td className="p-2 text-xs font-mono text-tactical-muted">{i + 1}</td>
                              <td className="p-2">
                                <div className="w-12 h-12 rounded border border-tactical-green/30 overflow-hidden bg-black/40 shadow-[0_0_10px_rgba(57,255,20,0.1)]">
                                  <img 
                                    src={p.photo_url || `https://i.pravatar.cc/150?u=${p.id}`} 
                                    alt={p.name} 
                                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" 
                                  />
                                </div>
                              </td>
                              <td className="p-2">
                                <div className="text-xs font-black text-tactical-text uppercase tracking-tight">{p.name}</div>
                              </td>
                              <td className="p-2 text-center">
                                <div className="text-[9px] text-tactical-muted uppercase font-mono font-black">{p.rank} / {p.nrp || '-'}</div>
                              </td>
                              <td className="p-2 text-center">
                                <span className="px-2 py-0.5 bg-tactical-green/10 border border-tactical-green/30 rounded text-[8px] font-black text-tactical-green uppercase tracking-wider">
                                  {p.unit_role || p.specialization || 'OPERASI'}
                                </span>
                              </td>
                              <td className="p-2 text-right">
                                <button 
                                  onClick={() => {
                                    setSelectedPersonnel({
                                      ...p,
                                      photo: p.photo_url || "https://i.pravatar.cc/150?u=" + p.id,
                                      spec: p.specialization || "OPERASIONAL"
                                    });
                                    setDetailReturnModal('PERSONNEL');
                                    setActiveModal('PERSONNEL_DETAIL');
                                  }}
                                  className="p-1.5 hover:bg-tactical-green/20 rounded-md transition-all text-tactical-muted hover:text-tactical-green bg-tactical-green/5 border border-tactical-green/20"
                                >
                                  <Eye size={14} />
                                </button>
                              </td>
                            </tr>
                          )) : (
                            <tr>
                              <td colSpan={6} className="p-10 text-center text-tactical-muted text-[10px] uppercase font-mono italic">
                                Belum ada data personel terdeploy.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
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
                        setActiveModal(null);
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
                       <span className="text-sm text-tactical-muted ml-2">{unitActivities.length} kegiatan</span>
                    </div>

                     {/* Section: Postur Unit Saat Ini */}
                     <div className="space-y-4">
                        <h5 className="text-xs font-bold text-tactical-muted uppercase tracking-widest">Postur Unit Saat Ini</h5>
                        <div className="bg-[#0f2419] border border-green-900/50 p-4 rounded grid grid-cols-2 md:grid-cols-4 divide-x divide-green-900/30 shadow-[inset_0_0_20px_rgba(0,255,0,0.05)]">
                           <div className="text-center py-1">
                              <div className="text-2xl font-black text-tactical-green">{unitPersonnel.length}</div>
                              <div className="text-[9px] text-tactical-muted uppercase mt-0.5 font-bold tracking-widest leading-tight">Personil<br/>Aktif</div>
                           </div>
                           <div className="text-center py-1">
                              <div className="text-2xl font-black text-yellow-500">{unitLogistics.length}</div>
                              <div className="text-[9px] text-tactical-muted uppercase mt-0.5 font-bold tracking-widest leading-tight">Aset<br/>Operasional</div>
                           </div>
                           <div className="text-center py-1">
                              <div className="text-2xl font-black text-blue-500">{unitActivities.filter(a => a.category === 'DALAM_NEGERI').length}</div>
                              <div className="text-[9px] text-tactical-muted uppercase mt-0.5 font-bold tracking-widest leading-tight">Tugas<br/>Dalam Negeri</div>
                           </div>
                           <div className="text-center py-1">
                              <div className="text-2xl font-black text-cyan-400">{unitActivities.filter(a => a.category === 'LUAR_NEGERI').length}</div>
                              <div className="text-[9px] text-tactical-muted uppercase mt-0.5 font-bold tracking-widest leading-tight">Tugas<br/>Luar Negeri</div>
                           </div>
                        </div>
                     </div>

                    {/* Section: Kegiatan Terjadwal */}
                    <div className="space-y-4">
                       <h5 className="text-xs font-bold text-tactical-muted uppercase tracking-widest">Kegiatan Terjadwal</h5>
                       <div className="space-y-3">
                          {unitActivities.length > 0 ? unitActivities.map((act, idx) => (
                            <div 
                              key={idx}
                              onClick={() => {
                                setSelectedOperation({
                                  ...act,
                                  category: act.category === 'DALAM_NEGERI' ? 'DN' : 'LN'
                                });
                                setDetailReturnModal('KEGIATAN');
                                setActiveModal('OPERASI_DETAIL');
                              }}
                              className={cn(
                                "border p-5 rounded group hover:bg-opacity-20 transition-colors cursor-pointer border-l-4 shadow-lg",
                                act.category === 'DALAM_NEGERI' 
                                  ? "bg-blue-900/10 border-blue-900/50 border-l-blue-500 hover:bg-blue-900" 
                                  : "bg-purple-900/10 border-purple-900/50 border-l-purple-500 hover:bg-purple-900"
                              )}
                            >
                               <div className="flex justify-between items-start">
                                  <div className="text-lg font-bold text-tactical-text uppercase tracking-wider">{act.name}</div>
                                  <span className={cn(
                                    "text-[10px] px-2 py-0.5 rounded font-bold border",
                                    act.category === 'DALAM_NEGERI'
                                      ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                                      : "bg-purple-500/20 text-purple-400 border-purple-500/30"
                                  )}>
                                    {act.category === 'DALAM_NEGERI' ? 'DALAM NEGERI' : 'LUAR NEGERI'}
                                  </span>
                               </div>
                               <div className="text-[11px] text-tactical-muted mt-1 uppercase">Tipe: {act.type || 'OPERASI TAKTIS'}</div>
                               <div className="text-[10px] text-tactical-muted mt-2 font-mono flex items-center gap-2">
                                  <div className={cn(
                                    "w-1.5 h-1.5 rounded-full animate-pulse",
                                    act.status === 'ONGOING' ? "bg-green-500" : "bg-blue-500"
                                  )}></div>
                                  STATUS: {act.status} | MULAI: {act.created_at ? new Date(act.created_at).toLocaleDateString() : 'N/A'}
                                </div>
                             </div>
                           )) : (
                             <div className="text-center py-12 border border-dashed border-tactical-border rounded-lg bg-black/20">
                                <ClipboardList className="w-12 h-12 text-tactical-muted/30 mx-auto mb-3" />
                                <div className="text-xs text-tactical-muted font-mono uppercase">Tidak ada kegiatan operasional aktif untuk unit ini.</div>
                             </div>
                           )}
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
                    <div className="overflow-x-auto border border-tactical-border rounded-lg bg-black/40">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-tactical-border bg-tactical-red/10">
                            <th className="p-4 text-xs font-black text-tactical-red uppercase tracking-widest">No</th>
                            <th className="p-4 text-xs font-black text-tactical-red uppercase tracking-widest">Gambar</th>
                            <th className="p-4 text-xs font-black text-tactical-red uppercase tracking-widest">Nama Senjata</th>
                            <th className="p-4 text-xs font-black text-tactical-red uppercase tracking-widest text-center">Kategori</th>
                            <th className="p-4 text-xs font-black text-tactical-red uppercase tracking-widest text-center">Stok</th>
                            <th className="p-4 text-xs font-black text-tactical-red uppercase tracking-widest text-right">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-tactical-border/30">
                           {(unitLogistics.length > 0 ? unitLogistics.filter(l => l.category?.toLowerCase().includes('senjata')) : []).filter(item => 
                            (item.name || item.item_name).toLowerCase().includes(modalSearchQuery.toLowerCase())
                          ).map((item, idx) => (
                            <tr key={idx} className="hover:bg-tactical-red/5 transition-colors group">
                              <td className="p-4 text-sm font-mono text-tactical-muted">{idx + 1}</td>
                              <td className="p-4">
                                <div className="w-14 h-14 rounded border border-tactical-red/30 overflow-hidden bg-black/40 flex items-center justify-center p-2 shadow-[0_0_10px_rgba(255,51,51,0.1)]">
                                  {item.image_url ? (
                                    <img src={item.image_url} alt={item.name || item.item_name} className="w-full h-full object-contain" />
                                  ) : (
                                    <Target size={24} className="text-tactical-red/30" />
                                  )}
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="text-sm font-bold text-tactical-text uppercase tracking-tight">{item.name || item.item_name}</div>
                              </td>
                              <td className="p-4 text-center">
                                <span className="px-3 py-1 bg-tactical-red/10 border border-tactical-red/30 rounded text-[10px] font-black text-tactical-red uppercase tracking-wider">
                                  {item.category || item.item_category}
                                </span>
                              </td>
                              <td className="p-4 text-center text-sm font-black text-tactical-red font-mono">
                                {item.quantity || item.qty} {item.unit || 'UNIT'}
                              </td>
                              <td className="p-4 text-right flex items-center justify-end gap-2">
                                <button 
                                  onClick={async () => {
                                    const itemName = item.name || item.item_name;
                                    const data = await getLogisticsDistributionDetails(itemName);
                                    const allLocs = [
                                      ...(data.units || []).map((u: any) => ({ ...u, type: 'UNIT' })),
                                      ...(data.ops_dn || []).map((o: any) => ({ ...o, type: 'DALAM_NEGERI' })),
                                      ...(data.ops_ln || []).map((o: any) => ({ ...o, type: 'LUAR_NEGERI' }))
                                    ];
                                    setHighlightedLocations(allLocs);
                                    setActiveModal(null);
                                    setSelectedEntity(null);
                                  }}
                                  className="px-3 py-1.5 bg-tactical-red/10 border border-tactical-red/30 rounded text-[10px] font-black text-tactical-red hover:bg-tactical-red hover:text-white transition-all flex items-center gap-1.5 uppercase"
                                >
                                  <MapPin size={12} /> LIHAT MAP
                                </button>
                                <button 
                                  onClick={() => {
                                    setSelectedWeapon({
                                      ...item,
                                      name: item.name || item.item_name,
                                      qty: (item.quantity || item.qty) + " " + (item.unit || 'UNIT'),
                                      status: item.condition_status || "Siap"
                                    });
                                    setActiveModal('SENJATA_DETAIL');
                                  }}
                                  className="p-2 hover:bg-tactical-red/20 rounded-md transition-all text-tactical-muted hover:text-tactical-red bg-tactical-red/5 border border-tactical-red/20"
                                >
                                  <Eye size={18} />
                                </button>
                              </td>
                            </tr>
                          ))}
                          {(unitLogistics.filter(l => l.category?.toLowerCase().includes('senjata')).length === 0) && (
                            <tr>
                              <td colSpan={6} className="p-10 text-center text-tactical-muted text-[10px] uppercase font-mono italic">
                                Tidak ada data senjata untuk kesatuan ini.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                                ) : activeModal === 'LOGISTIK' ? (
                  <div className="space-y-8 pb-4">
                    <div className="flex items-center justify-between gap-4">
                       <div className="flex items-center gap-2">
                          <div className="w-1 h-6 bg-tactical-green"></div>
                          <h4 className="text-xl font-bold text-tactical-text uppercase tracking-widest whitespace-nowrap">Daftar Logistik Utama</h4>
                          <span className="text-sm text-tactical-muted ml-2">{(unitLogistics.length > 0 ? unitLogistics : allLogistics).length} item</span>
                       </div>
                       <div className="relative flex-1 max-w-[300px]">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tactical-muted" />
                          <input 
                            type="text" 
                            placeholder="Cari Logistik..."
                            value={modalSearchQuery}
                            onChange={(e) => setModalSearchQuery(e.target.value)}
                            className="w-full bg-black/40 border border-tactical-green/30 rounded-md py-1.5 pl-9 pr-3 text-xs text-tactical-text placeholder:text-tactical-muted/50 focus:outline-none focus:border-tactical-green transition-all"
                          />
                       </div>
                    </div>

                    <div className="overflow-x-auto border border-tactical-border rounded-lg bg-black/40">
                      <table className="w-full text-left border-collapse">
                         <thead>
                          <tr className="border-b border-tactical-border bg-tactical-green/10">
                            <th className="p-4 text-xs font-black text-tactical-green uppercase tracking-widest">No</th>
                            <th className="p-4 text-xs font-black text-tactical-green uppercase tracking-widest">Gambar</th>
                            <th className="p-4 text-xs font-black text-tactical-green uppercase tracking-widest">Nama Barang</th>
                            <th className="p-4 text-xs font-black text-tactical-green uppercase tracking-widest text-center">Kategori</th>
                            <th className="p-4 text-xs font-black text-tactical-green uppercase tracking-widest text-center">Stok</th>
                            <th className="p-4 text-xs font-black text-tactical-green uppercase tracking-widest text-right">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-tactical-border/30">
                           {(unitLogistics.length > 0 ? unitLogistics : allLogistics).filter(item => {
                            if (!modalSearchQuery) return true;
                            const q = modalSearchQuery.toLowerCase();
                            return (item.name || item.item_name)?.toLowerCase().includes(q) || 
                                   (item.category || item.item_category)?.toLowerCase().includes(q);
                          }).map((item, idx) => (
                            <tr key={idx} className="hover:bg-tactical-green/5 transition-colors group">
                              <td className="p-4 text-sm font-mono text-tactical-muted">{idx + 1}</td>
                              <td className="p-4">
                                <div className="w-14 h-14 rounded border border-tactical-green/30 overflow-hidden bg-black/40 flex items-center justify-center p-2 shadow-[0_0_10px_rgba(57,255,20,0.1)]">
                                  {item.image_url ? (
                                    <img src={item.image_url} alt={item.name || item.item_name} className="w-full h-full object-contain" />
                                  ) : (
                                    <Package size={24} className="text-tactical-green/30" />
                                  )}
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="text-sm font-bold text-tactical-text uppercase tracking-tight">{item.name || item.item_name}</div>
                              </td>
                              <td className="p-4 text-center">
                                <span className="px-3 py-1 bg-tactical-green/10 border border-tactical-green/30 rounded text-[10px] font-black text-tactical-green uppercase tracking-wider">
                                  {item.category || item.item_category}
                                </span>
                              </td>
                              <td className="p-4 text-center text-sm font-black text-tactical-green font-mono">
                                {item.quantity || item.qty} {item.unit || 'UNIT'}
                              </td>
                              <td className="p-4 text-right flex items-center justify-end gap-2">
                                <button 
                                  onClick={async () => {
                                    const itemName = item.name || item.item_name;
                                    const data = await getLogisticsDistributionDetails(itemName);
                                    const allLocs = [
                                      ...(data.units || []).map((u: any) => ({ ...u, type: 'UNIT' })),
                                      ...(data.ops_dn || []).map((o: any) => ({ ...o, type: 'DALAM_NEGERI' })),
                                      ...(data.ops_ln || []).map((o: any) => ({ ...o, type: 'LUAR_NEGERI' }))
                                    ];
                                    setHighlightedLocations(allLocs);
                                    setActiveModal(null);
                                    setSelectedEntity(null);
                                  }}
                                  className="px-3 py-1.5 bg-tactical-green/10 border border-tactical-green/30 rounded text-[10px] font-black text-tactical-green hover:bg-tactical-green hover:text-black transition-all flex items-center gap-1.5 uppercase"
                                >
                                  <MapPin size={12} /> LIHAT MAP
                                </button>
                                <button 
                                  onClick={() => {
                                    setSelectedAsset({
                                      ...item,
                                      name: item.name || item.item_name,
                                      model: item.category || item.item_category || 'LOGISTIK'
                                    });
                                    setDetailReturnModal('LOGISTIK');
                                    setActiveModal('LOGISTIK_DETAIL');
                                  }}
                                  className="p-2 hover:bg-tactical-green/20 rounded-md transition-all text-tactical-muted hover:text-tactical-green bg-tactical-green/5 border border-tactical-green/20"
                                >
                                  <Eye size={18} />
                                </button>
                              </td>
                            </tr>
                          ))}
                          {(unitLogistics.length === 0 && allLogistics.length === 0) && (
                            <tr>
                              <td colSpan={6} className="p-10 text-center text-tactical-muted text-[10px] uppercase font-mono italic">
                                Tidak ada data logistik tersedia.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
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
                        setActiveModal(null);
                      }}
                      className={cn(
                        "text-xs font-bold flex items-center gap-2 mt-6 pt-4 border-t border-tactical-border",
                        detailReturnModal === 'OPERASI_DETAIL' ? "text-tactical-red/70 hover:text-tactical-red" : "text-tactical-muted hover:text-tactical-green"
                      )}
                    >
                      &larr; KEMBALI KE {detailReturnModal === 'OPERASI_DETAIL' ? 'DETAIL OPERASI' : 'DAFTAR LOGISTIK'}
                    </button>
                  </div>
                 ) : activeModal === 'LOGISTIK_DETAIL' && selectedAsset ? (
                  <div className="space-y-8 pb-4">
                    {/* Header Asset */}
                     <div className="bg-tactical-bg p-4 rounded-lg border border-tactical-green/20 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-3">
                           <div className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-tactical-green animate-pulse"></div>
                              <span className="text-[9px] font-black text-tactical-green tracking-widest uppercase">TERDATA DI DATABASE</span>
                           </div>
                        </div>
                        
                        <div className="flex flex-col md:flex-row gap-6 items-start">
                           <div className="w-24 h-24 bg-black/40 border-2 border-tactical-green/30 rounded-lg p-3 flex items-center justify-center shadow-[0_0_20px_rgba(0,255,0,0.05)]">
                             {selectedAsset.image_url ? (
                               <img src={selectedAsset.image_url} alt={selectedAsset.name} className="w-full h-full object-contain" />
                             ) : (
                               <Package size={60} className="text-tactical-green/20" />
                             )}
                          </div>
                           <div className="flex-1 pt-1">
                              <div className="text-[9px] text-tactical-green font-mono uppercase tracking-[0.3em] mb-1">LOGISTIK ID: {selectedAsset.id || 'N/A'}</div>
                              <h4 className="text-xl font-black text-tactical-text uppercase tracking-tight leading-none mb-3">{selectedAsset.name || selectedAsset.item_name}</h4>
                             
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                                 <div className="space-y-0.5">
                                    <div className="text-[8px] text-tactical-muted uppercase font-bold tracking-widest">Kategori</div>
                                    <div className="text-[11px] font-bold text-tactical-text uppercase">{selectedAsset.category || selectedAsset.item_category || 'Logistik'}</div>
                                 </div>
                                 <div className="space-y-0.5">
                                    <div className="text-[8px] text-tactical-muted uppercase font-bold tracking-widest">Kondisi</div>
                                    <div className="text-[11px] font-bold text-tactical-green uppercase">{selectedAsset.condition_status || 'BAIK'}</div>
                                 </div>
                                 <div className="space-y-0.5">
                                    <div className="text-[8px] text-tactical-muted uppercase font-bold tracking-widest">Tipe</div>
                                    <div className="text-[11px] font-bold text-tactical-text">STANDAR MILITER</div>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>

                    {/* Sebaran Logistik Distribution Cards */}
                    <div className="space-y-4">
                       <div className="flex items-center gap-2 border-l-2 border-tactical-green pl-2">
                          <h5 className="text-xs font-bold text-tactical-muted uppercase tracking-widest">Sebaran Logistik</h5>
                       </div>
                        <div className="grid grid-cols-3 gap-3">
                           {/* Kesatuan */}
                           <div className="bg-black/60 border border-tactical-border rounded p-3 flex flex-col items-center justify-between gap-3 group hover:border-tactical-red/50 transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                              <div className="text-center">
                                 <div className="text-[9px] text-tactical-muted uppercase font-mono mb-1 tracking-widest">KESATUAN</div>
                                 <div className="text-xl font-black text-tactical-red">{logisticsDistribution.kesatuan} Unit</div>
                              </div>
                              <button 
                                onClick={() => {
                                  const name = selectedAsset?.name || selectedAsset?.item_name;
                                  setHighlightedLocations(distributionDetails.units.map((u: any) => ({ ...u, asset_name: name })));
                                  if (distributionDetails.units.length > 0 && distributionDetails.units[0].coordinates) {
                                    const coords = distributionDetails.units[0].coordinates.split(',');
                                    if (onMarkerClick) onMarkerClick([parseFloat(coords[0]), parseFloat(coords[1])], 12);
                                    setActiveModal(null);
                                  }
                                }}
                                className="w-full py-2 bg-tactical-red/10 border border-tactical-red/30 rounded text-[9px] font-black text-tactical-red hover:bg-tactical-red hover:text-white transition-all uppercase flex items-center justify-center"
                              >
                                 LIHAT MAP
                              </button>
                               <button 
                                 onClick={() => {
                                   setActiveDistributionTab("KESATUAN");
                                   setActiveModal("LOGISTIK_USAGE");
                                 }}
                                 className="w-full py-1.5 bg-tactical-muted/10 border border-tactical-muted/30 rounded text-[8px] font-bold text-tactical-muted hover:bg-tactical-muted hover:text-white transition-all uppercase flex items-center justify-center gap-2 mt-1"
                               >
                                  <Database size={10} /> DATA KESATUAN
                               </button>
                           </div>
                           {/* Operasi Dalam Negri */}
                           <div className="bg-black/60 border border-tactical-border rounded p-3 flex flex-col items-center justify-between gap-3 group hover:border-blue-500/50 transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                              <div className="text-center">
                                 <div className="text-[9px] text-tactical-muted uppercase font-mono mb-1 tracking-widest">OPS DALAM NEGERI</div>
                                 <div className="text-xl font-black text-blue-500">{logisticsDistribution.ops_dn} Unit</div>
                              </div>
                              <button 
                                onClick={() => {
                                  const name = selectedAsset?.name || selectedAsset?.item_name;
                                  setHighlightedLocations(distributionDetails.ops_dn.map((o: any) => ({ ...o, asset_name: name })));
                                  if (distributionDetails.ops_dn.length > 0 && distributionDetails.ops_dn[0].coordinates) {
                                    const coords = distributionDetails.ops_dn[0].coordinates.split(',');
                                    if (onMarkerClick) onMarkerClick([parseFloat(coords[0]), parseFloat(coords[1])], 12);
                                    setActiveModal(null);
                                  }
                                }}
                                className="w-full py-2 bg-blue-500/10 border border-blue-500/30 rounded text-[9px] font-black text-blue-500 hover:bg-blue-500 hover:text-white transition-all uppercase flex items-center justify-center"
                              >
                                 LIHAT MAP
                              </button>
                               <button 
                                 onClick={() => {
                                   setActiveDistributionTab("OPS_DN");
                                   setActiveModal("LOGISTIK_USAGE");
                                 }}
                                 className="w-full py-1.5 bg-blue-500/10 border border-blue-500/30 rounded text-[8px] font-bold text-blue-500 hover:bg-blue-500 hover:text-white transition-all uppercase flex items-center justify-center gap-2 mt-1"
                               >
                                  <Database size={10} /> DATA OPERASI DL
                               </button>
                           </div>
                           {/* Operasi Luar Negri */}
                           <div className="bg-black/60 border border-tactical-border rounded p-3 flex flex-col items-center justify-between gap-3 group hover:border-cyan-400/50 transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                              <div className="text-center">
                                 <div className="text-[9px] text-tactical-muted uppercase font-mono mb-1 tracking-widest">OPS LUAR NEGERI</div>
                                 <div className="text-xl font-black text-cyan-400">{logisticsDistribution.ops_ln} Unit</div>
                              </div>
                              <button 
                                onClick={() => {
                                  const name = selectedAsset?.name || selectedAsset?.item_name;
                                  setHighlightedLocations(distributionDetails.ops_ln.map((o: any) => ({ ...o, asset_name: name })));
                                  if (distributionDetails.ops_ln.length > 0 && distributionDetails.ops_ln[0].coordinates) {
                                    const coords = distributionDetails.ops_ln[0].coordinates.split(',');
                                    if (onMarkerClick) onMarkerClick([parseFloat(coords[0]), parseFloat(coords[1])], 12);
                                    setActiveModal(null);
                                  }
                                }}
                                className="w-full py-2 bg-cyan-400/10 border border-cyan-400/30 rounded text-[9px] font-black text-cyan-400 hover:bg-cyan-400 hover:text-white transition-all uppercase flex items-center justify-center"
                              >
                                 LIHAT MAP
                              </button>
                               <button 
                                 onClick={() => {
                                   setActiveDistributionTab("OPS_LN");
                                   setActiveModal("LOGISTIK_USAGE");
                                 }}
                                 className="w-full py-1.5 bg-cyan-400/10 border border-cyan-400/30 rounded text-[8px] font-bold text-cyan-400 hover:bg-cyan-400 hover:text-white transition-all uppercase flex items-center justify-center gap-2 mt-1"
                               >
                                  <Database size={10} /> DATA OPERASI LN
                               </button>
                           </div>
                        </div>
                    </div>



                    <button 
                      onClick={() => {
                        if (detailReturnModal) {
                          setActiveModal(detailReturnModal);
                        } else {
                          setActiveModal('LOGISTIK');
                        }
                      }}
                      className="text-xs font-bold flex items-center gap-2 mt-6 pt-4 border-t border-tactical-border text-tactical-muted hover:text-tactical-green transition-all"
                    >
                      &larr; KEMBALI KE {detailReturnModal || 'DAFTAR LOGISTIK'}
                    </button>
                  </div>
                ) : activeModal === 'OPERASI_DETAIL' && selectedOperation ? (
                  <div className="space-y-6 pb-4">
                    {/* Operation Tabs */}
                    <div className="flex border-b border-tactical-border">
                        {['Informasi', 'Personel', 'Logistik'].map((tab) => (
                          <div 
                            key={tab} 
                            onClick={() => setOpActiveTab(tab)}
                            className={cn(
                              "px-6 py-3 text-xs font-bold uppercase tracking-widest cursor-pointer transition-all",
                              opActiveTab === tab 
                                ? (selectedOperation.category === 'DN' ? "text-blue-500 border-b-2 border-blue-500 bg-blue-500/5" : "text-cyan-400 border-b-2 border-cyan-400 bg-cyan-400/5")
                                : "text-tactical-muted hover:text-tactical-text"
                            )}
                          >
                            {tab} {tab === 'Personel' ? `(${opAssignments.length})` : tab === 'Logistik' ? `(${opAssets.length})` : ""}
                          </div>
                        ))}
                    </div>

                    {opActiveTab === 'Informasi' ? (
                      <div className="space-y-6">
                         {/* Badges & Action */}
                         <div className="flex justify-between items-center">
                            <div className="flex gap-2">
                               <span className={cn(
                                  "px-3 py-1 border text-[10px] font-bold uppercase rounded",
                                  selectedOperation.category === 'DN' ? "bg-blue-500/10 border-blue-500/30 text-blue-500" : "bg-cyan-400/10 border-cyan-400/30 text-cyan-400"
                                )}>
                                  {selectedOperation.category === 'DN' ? 'DALAM NEGERI' : 'LUAR NEGERI'}
                                </span>
                                <span className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 text-[10px] font-bold uppercase rounded">Status: {selectedOperation.status}</span>
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

                          {/* Tactical Communication Actions */}
                          <div className="p-4 bg-black/40 border border-tactical-border rounded-lg space-y-4">
                             <div className="text-[10px] font-bold text-tactical-muted uppercase tracking-widest flex items-center gap-2">
                                <Shield className="w-3 h-3 text-tactical-green" />
                                KOMUNIKASI TAKTIS SECURE
                             </div>
                             <div className="grid grid-cols-2 gap-4">
                                <button 
                                  onClick={() => router.push(`/komunikasi/chat?opId=${selectedOperation.id}`)}
                                  className="flex items-center justify-center gap-3 py-3 bg-tactical-green/10 border border-tactical-green/30 rounded text-xs font-black text-tactical-green hover:bg-tactical-green hover:text-black transition-all shadow-[0_0_15px_rgba(57,255,20,0.1)] group"
                                >
                                   <MessageSquare size={16} className="group-hover:scale-110 transition-transform" />
                                   BUKA CHAT OPERASI
                                </button>
                                <button 
                                  onClick={() => router.push(`/komunikasi/vcon?opId=${selectedOperation.id}`)}
                                  className="flex items-center justify-center gap-3 py-3 bg-tactical-red/10 border border-tactical-red/30 rounded text-xs font-black text-tactical-red hover:bg-tactical-red hover:text-white transition-all shadow-[0_0_15px_rgba(255,51,51,0.1)] group"
                                >
                                   <Video size={16} className="group-hover:scale-110 transition-transform" />
                                   INITIALIZE VCON
                                </button>
                             </div>
                          </div>

                          {/* Description */}
                          <div className="p-4 bg-tactical-bg border border-tactical-border rounded-lg">
                             <div className="text-[10px] text-tactical-muted font-mono uppercase mb-2">OBJEKTIF OPERASI</div>
                             <p className="text-xs text-tactical-text leading-relaxed">
                                {selectedOperation.objective || selectedOperation.description || "Tidak ada deskripsi operasi."}
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
                             <div className="text-[10px] font-bold text-tactical-muted uppercase tracking-widest">Komandan Lapangan</div>
                             <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded bg-tactical-red/10 border border-tactical-red/30 flex items-center justify-center">
                                   <Users size={20} className="text-tactical-red" />
                                </div>
                                <div>
                                  <div className="text-sm font-bold text-tactical-text uppercase">{selectedOperation.commander_name || selectedOperation.commander || "TBA"}</div>
                                  <div className="text-[10px] text-tactical-muted uppercase font-mono">{selectedOperation.commander_rank || "DAN-TIM / SAT-81 GULTOR"}</div>
                                </div>
                             </div>
                          </div>

                         {/* Resources Summary */}
                         <div className="grid grid-cols-2 gap-4">
                             <div className="p-4 bg-tactical-bg border border-tactical-border rounded-lg space-y-1">
                                <div className="flex items-center gap-2 text-tactical-muted">
                                   <Users size={14} className="text-tactical-red" />
                                   <span className="text-[10px] font-bold uppercase">Personel</span>
                                </div>
                                <div className="text-xl font-black text-tactical-text">{opAssignments.length}</div>
                                <div className="text-[9px] text-tactical-muted uppercase tracking-wider">Orang di-deploy</div>
                             </div>
                             <div className="p-4 bg-tactical-bg border border-tactical-border rounded-lg space-y-1">
                                <div className="flex items-center gap-2 text-tactical-muted">
                                   <Target size={14} className="text-tactical-red" />
                                   <span className="text-[10px] font-bold uppercase">Logistik</span>
                                </div>
                                <div className="text-xl font-black text-tactical-text">{opAssets.length}</div>
                                <div className="text-[9px] text-tactical-muted uppercase tracking-wider">Item Terdeploy</div>
                             </div>
                         </div>

                      </div>
                    ) : opActiveTab === 'Personel' ? (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h5 className="text-xs font-bold text-tactical-muted uppercase tracking-widest border-l-2 border-red-600 pl-2">Personel Terdeploy</h5>
                          <div className="text-[10px] text-tactical-green font-mono">{opAssignments.length} AKTIF</div>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                           {opAssignments.length > 0 ? opAssignments.map((person, idx) => (
                            <div 
                              key={idx} 
                              onClick={() => {
                                setSelectedPersonnel(person);
                                setDetailReturnModal('OPERASI_DETAIL');
                                setActiveModal('PERSONNEL_DETAIL');
                              }}
                              className="flex items-center gap-6 p-5 bg-black/40 border border-tactical-border rounded-lg hover:border-tactical-green/50 transition-all cursor-pointer group shadow-lg"
                            >
                              <div className="w-16 h-16 rounded bg-tactical-dark border border-tactical-border overflow-hidden shadow-[0_0_15px_rgba(57,255,20,0.1)]">
                                <img 
                                  src={person.photo || `https://i.pravatar.cc/150?u=${person.id || idx}`} 
                                  alt={person.name} 
                                  className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" 
                                />
                              </div>
                              <div className="flex-1">
                                <div className="text-sm font-bold text-tactical-text group-hover:text-tactical-green transition-colors uppercase tracking-widest">{person.name}</div>
                                <div className="text-xs text-tactical-muted uppercase font-mono mt-1 font-bold">{person.rank || 'PERSONEL'} / {person.nrp || 'NO NRP'}</div>
                                <div className="text-xs text-tactical-green mt-2 font-black tracking-widest">{person.role || 'GELAR OPERASI'}</div>
                              </div>
                              <ChevronRight size={20} className="text-tactical-muted group-hover:text-tactical-green transition-all" />
                            </div>
                          )) : (
                            <div className="text-[10px] text-tactical-muted font-mono italic p-4 text-center">Belum ada personel terdeploy untuk operasi ini.</div>
                          )}
                        </div>
                      </div>
                    ) : opActiveTab === 'Logistik' ? (
                       <div className="space-y-4">
                         <div className="flex justify-between items-center">
                            <h5 className="text-xs font-bold text-tactical-muted uppercase tracking-widest border-l-2 border-tactical-green pl-2">Logistik Terdeploy</h5>
                            <div className="text-[10px] text-tactical-green font-mono">{opAssets.length} ITEM AKTIF</div>
                          </div>
                          
                          <div className="overflow-x-auto border border-tactical-border rounded-lg bg-black/40">
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="border-b border-tactical-border bg-tactical-red/5">
                                  <th className="p-4 text-xs font-black text-tactical-red uppercase tracking-widest">No</th>
                                  <th className="p-4 text-xs font-black text-tactical-red uppercase tracking-widest">Nama Barang</th>
                                  <th className="p-4 text-xs font-black text-tactical-red uppercase tracking-widest text-center">Kategori</th>
                                  <th className="p-4 text-xs font-black text-tactical-red uppercase tracking-widest text-center">Jumlah</th>
                                  <th className="p-4 text-xs font-black text-tactical-red uppercase tracking-widest text-right">Aksi</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-tactical-border/30">
                                 {opAssets.length > 0 ? opAssets.map((item, idx) => (
                                  <tr key={idx} className="hover:bg-tactical-red/5 transition-colors group">
                                    <td className="p-4 text-sm font-mono text-tactical-muted">{idx + 1}</td>
                                    <td className="p-4">
                                      <div className="text-sm font-bold text-tactical-text uppercase tracking-tight">{item.asset_name || item.name || item.item_name}</div>
                                    </td>
                                    <td className="p-4 text-center">
                                      <span className="px-3 py-1 bg-tactical-red/10 border border-tactical-red/30 rounded text-[10px] font-black text-tactical-red uppercase tracking-wider">
                                        {item.category || item.item_category || 'LOGISTIK'}
                                      </span>
                                    </td>
                                    <td className="p-4 text-center text-sm font-black text-tactical-red font-mono">
                                      {item.qty || item.quantity} {item.unit || 'Unit'}
                                    </td>
                                    <td className="p-4 text-right">
                                      <button 
                                        onClick={() => {
                                          setSelectedAsset({
                                            ...item,
                                            name: item.asset_name || item.name || item.item_name
                                          });
                                          setDetailReturnModal('OPERASI_DETAIL');
                                          setActiveModal('LOGISTIK_DETAIL');
                                        }}
                                        className="p-2 hover:bg-tactical-red/20 rounded-md transition-all text-tactical-muted hover:text-tactical-red bg-tactical-red/5 border border-tactical-red/20"
                                      >
                                        <Eye size={18} />
                                      </button>
                                    </td>
                                  </tr>
                                )) : (
                                  <tr>
                                    <td colSpan={5} className="p-10 text-center text-[10px] text-tactical-muted font-mono italic uppercase">
                                      Belum ada logistik terdeploy untuk operasi ini.
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                       </div>
                     ) : null}

                     <button 
                       onClick={() => {
                         setActiveModal('KEGIATAN');
                       }}
                       className="text-xs font-bold flex items-center gap-2 mt-6 pt-4 border-t border-tactical-border text-tactical-muted hover:text-tactical-green transition-all"
                     >
                       &larr; KEMBALI KE DAFTAR OPERASI
                     </button>
                   </div>
                ) : activeModal === 'INTEL_DETAIL' && selectedIntel ? (
                  <div className="space-y-8 pb-4">
                    <div className="bg-tactical-bg p-6 rounded-lg border border-tactical-cyan/20 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4">
                        <div className="flex items-center gap-2">
                           <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: getIntelColor(selectedIntel.threat_level) }}></div>
                           <span className="text-[10px] font-black tracking-widest" style={{ color: getIntelColor(selectedIntel.threat_level) }}>{selectedIntel.threat_level}</span>
                        </div>
                      </div>
                      
                      <div className="mb-6">
                        <div className="text-[10px] text-tactical-cyan font-mono uppercase tracking-widest mb-1">INTEL REPORT ID: {selectedIntel.id}</div>
                        <h4 className="text-2xl font-black text-tactical-text uppercase tracking-tight">{selectedIntel.title}</h4>
                        <div className="flex items-center gap-4 mt-2">
                           <div className="flex items-center gap-1 text-[10px] text-tactical-muted uppercase font-mono">
                              <MapPin size={10} className="text-tactical-cyan" /> {selectedIntel.location_tag}
                           </div>
                           <div className="flex items-center gap-1 text-[10px] text-tactical-muted uppercase font-mono">
                              <Clock size={10} className="text-tactical-cyan" /> {new Date(selectedIntel.created_at).toLocaleString()}
                           </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                           <div className="p-4 bg-black/40 border border-tactical-border rounded">
                              <div className="text-[10px] text-tactical-muted font-mono uppercase mb-2">ISI LAPORAN</div>
                              <div className="text-sm text-tactical-text leading-relaxed font-medium">
                                 {selectedIntel.content}
                              </div>
                           </div>
                           
                           {/* New Fields */}
                           <div className="grid grid-cols-1 gap-4">
                              <div className="p-3 bg-black/20 border border-tactical-border/50 rounded">
                                 <div className="text-[9px] text-tactical-muted font-mono uppercase mb-1">LAPSUS</div>
                                 <div className="text-xs text-tactical-text leading-relaxed font-mono italic">
                                    {selectedIntel.lapsus || "TIDAK ADA DATA"}
                                 </div>
                              </div>
                              <div className="p-3 bg-black/20 border border-tactical-border/50 rounded">
                                 <div className="text-[9px] text-tactical-muted font-mono uppercase mb-1">LAPORAN PERIODIK</div>
                                 <div className="text-xs text-tactical-text leading-relaxed font-mono italic">
                                    {selectedIntel.laporan_periodik || "TIDAK ADA DATA"}
                                 </div>
                              </div>
                              <div className="p-3 bg-black/20 border border-tactical-border/50 rounded">
                                 <div className="text-[9px] text-tactical-muted font-mono uppercase mb-1">PREDIKSI ANCAMAN</div>
                                 <div className="text-xs text-tactical-text leading-relaxed font-mono italic">
                                    {selectedIntel.prediksi_ancaman || "TIDAK ADA DATA"}
                                 </div>
                              </div>
                           </div>
                           <div className="flex gap-4">
                              <div className="flex-1 p-3 bg-tactical-cyan/5 border border-tactical-cyan/20 rounded">
                                 <div className="text-[9px] text-tactical-muted font-mono uppercase mb-1">SUMBER DATA</div>
                                 <div className="text-xs font-bold text-tactical-text">HUMINT / OSINT</div>
                              </div>
                              <div className="flex-1 p-3 bg-tactical-cyan/5 border border-tactical-cyan/20 rounded">
                                 <div className="text-[9px] text-tactical-muted font-mono uppercase mb-1">KLASIFIKASI</div>
                                 <div className="text-xs font-bold text-tactical-red">RAHASIA</div>
                              </div>
                           </div>
                        </div>

                        <div className="space-y-4">
                           <div className="h-48 bg-tactical-dark rounded border border-tactical-border relative overflow-hidden group">
                              <img 
                                src="https://images.unsplash.com/photo-1590233465191-100230230230?auto=format&fit=crop&q=80" 
                                className="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-all"
                                alt="Satellite"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40"></div>
                              <div className="absolute bottom-3 left-3">
                                 <div className="text-[8px] font-mono text-tactical-cyan">SATELLITE RECONNAISSANCE</div>
                                 <div className="text-[10px] font-black text-white">GRID: {selectedIntel.coordinates}</div>
                              </div>
                              <div className="absolute inset-0 border border-tactical-cyan/10 pointer-events-none"></div>
                           </div>
                           <button className="w-full py-3 bg-tactical-cyan/20 border border-tactical-cyan/40 text-tactical-cyan text-[10px] font-black tracking-widest uppercase hover:bg-tactical-cyan hover:text-black transition-all">
                              LIHAT SEBARAN ANCAMAN
                           </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : activeModal === 'UNIT_DETAIL' && selectedEntity ? (
                  <div className="space-y-8 pb-4">
                    <div className="bg-tactical-bg p-4 rounded-lg border border-tactical-green/20 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4">
                        <div className="flex items-center gap-2">
                           <div className="text-right">
                              <div className="text-[9px] text-tactical-muted font-mono uppercase leading-none">Status Kesiapan</div>
                              <div className="text-[10px] font-black text-tactical-green uppercase tracking-widest mt-1">SIAP TEMPUR / {selectedEntity.status || 'ACTIVE'}</div>
                           </div>
                           <div className="w-8 h-8 rounded-full bg-tactical-green/10 border border-tactical-green/30 flex items-center justify-center">
                              <Shield className="text-tactical-green w-4 h-4 animate-pulse" />
                           </div>
                        </div>
                      </div>

                      <div className="flex flex-col md:flex-row gap-6 items-center">
                        <div className="w-20 h-20 rounded-full border-2 border-tactical-green/30 bg-black/40 p-3 flex items-center justify-center shadow-[0_0_20px_rgba(0,255,0,0.1)]">
                           <img src={selectedEntity.logo_url || "/logo_puskodal.png"} className="w-full h-full object-contain" />
                        </div>
                        <div className="flex-1 pt-0">
                           <div className="text-[9px] text-tactical-green font-mono uppercase tracking-[0.3em] mb-0.5">{selectedEntity.unit_code || 'U-10'}</div>
                           <h4 className="text-xl font-black text-tactical-text uppercase tracking-tight leading-none mb-3">{selectedEntity.unit_name || selectedEntity.name}</h4>
                           
                           <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-3">
                              <div className="space-y-0.5">
                                 <div className="text-[8px] text-tactical-muted uppercase font-bold tracking-widest">Komandan</div>
                                 <div className="text-[10px] font-bold text-tactical-text uppercase">{selectedEntity.commander_rank} {selectedEntity.commander_name || 'N/A'}</div>
                              </div>
                              <div className="space-y-0.5">
                                 <div className="text-[8px] text-tactical-muted uppercase font-bold tracking-widest">NRP / ID</div>
                                 <div className="text-[10px] font-bold text-tactical-green font-mono">{selectedEntity.commander_nrp || 'NO NRP'}</div>
                              </div>
                              <div className="space-y-0.5">
                                 <div className="text-[8px] text-tactical-muted uppercase font-bold tracking-widest">Kekuatan</div>
                                 <div className="text-[10px] font-bold text-tactical-text">{selectedEntity.strength || unitPersonnel.length} PERS</div>
                              </div>
                              <div className="space-y-0.5">
                                 <div className="text-[8px] text-tactical-muted uppercase font-bold tracking-widest">Lokasi Markas</div>
                                 <div className="text-[10px] font-bold text-tactical-text uppercase truncate max-w-[150px]">{selectedEntity.location}</div>
                              </div>
                              <div className="space-y-0.5">
                                 <div className="text-[8px] text-tactical-muted uppercase font-bold tracking-widest">Operasi DN</div>
                                 <div className="text-[10px] font-bold text-blue-500">{unitActivities.filter(a => a.category === 'DN' || a.type === 'DALAM_NEGERI').length} TUGAS</div>
                              </div>
                              <div className="space-y-0.5">
                                 <div className="text-[8px] text-tactical-muted uppercase font-bold tracking-widest">Operasi LN</div>
                                 <div className="text-[10px] font-bold text-cyan-400">{unitActivities.filter(a => a.category === 'LN' || a.type === 'LUAR_NEGERI').length} TUGAS</div>
                              </div>
                           </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="tactical-glass p-5 rounded-lg border border-tactical-border/50">
                          <div className="flex items-center justify-between mb-4">
                             <h5 className="text-[10px] font-black text-tactical-muted uppercase tracking-widest">Ringkasan Operasional</h5>
                             <Activity size={14} className="text-tactical-green" />
                          </div>
                          <div className="space-y-4">
                             <div className="flex justify-between items-end border-b border-tactical-border/30 pb-2">
                                <span className="text-[10px] text-tactical-muted uppercase">Personel Siap</span>
                                <span className="text-sm font-bold text-tactical-green">100%</span>
                             </div>
                             <div className="flex justify-between items-end border-b border-tactical-border/30 pb-2">
                                <span className="text-[10px] text-tactical-muted uppercase">Alutsista Tersedia</span>
                                <span className="text-sm font-bold text-tactical-green">{unitLogistics.length} ITEMS</span>
                             </div>
                             <div className="flex justify-between items-end border-b border-tactical-border/30 pb-2">
                                <span className="text-[10px] text-tactical-muted uppercase">Operasi Berjalan</span>
                                <span className="text-sm font-bold text-tactical-text">{unitActivities.length} AKTIF</span>
                             </div>
                          </div>
                       </div>
                       
                       <div className="tactical-glass p-5 rounded-lg border border-tactical-border/50 flex flex-col justify-between gap-4">
                          <div className="text-[10px] font-black text-tactical-muted uppercase tracking-widest">Akses Cepat Data</div>
                          <div className="flex gap-3">
                             <button 
                               onClick={() => router.push(`/messages?unit_id=${selectedEntity.id}`)} 
                               className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-500/10 border border-blue-500/30 rounded hover:bg-blue-500/20 transition-all group"
                             >
                                <MessageSquare size={16} className="text-blue-500 group-hover:scale-110 transition-transform" />
                                <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Chat Kesatuan</span>
                             </button>
                             <button 
                               onClick={() => router.push(`/vcon?unit_id=${selectedEntity.id}`)} 
                               className="flex-1 flex items-center justify-center gap-2 py-3 bg-cyan-500/10 border border-cyan-500/30 rounded hover:bg-cyan-500/20 transition-all group"
                             >
                                <Video size={16} className="text-cyan-500 group-hover:scale-110 transition-transform" />
                                <span className="text-[10px] font-black text-cyan-500 uppercase tracking-widest">Vcon Kesatuan</span>
                             </button>
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                             <button onClick={() => setActiveModal('PERSONNEL')} className="flex flex-col items-center gap-2 p-3 bg-tactical-green/5 border border-tactical-green/20 rounded hover:bg-tactical-green/10 transition-all">
                                <Users size={16} className="text-tactical-green" />
                                <span className="text-[8px] font-bold uppercase">Personel</span>
                             </button>
                             <button onClick={() => setActiveModal('SENJATA')} className="flex flex-col items-center gap-2 p-3 bg-tactical-green/5 border border-tactical-green/20 rounded hover:bg-tactical-green/10 transition-all">
                                <Target size={16} className="text-tactical-green" />
                                <span className="text-[8px] font-bold uppercase">Senjata</span>
                             </button>
                             <button onClick={() => setActiveModal('LOGISTIK')} className="flex flex-col items-center gap-2 p-3 bg-tactical-green/5 border border-tactical-green/20 rounded hover:bg-tactical-green/10 transition-all">
                                <Package size={16} className="text-tactical-green" />
                                <span className="text-[8px] font-bold uppercase">Logistik</span>
                             </button>
                          </div>
                       </div>
                    </div>
                  </div>
                                 ) : activeModal === 'LOGISTIK_USAGE' && selectedAsset ? (
                   <div className="space-y-6 pb-4">
                     <div className="flex items-center justify-between border-b border-tactical-border pb-4">
                        <div className="flex items-center gap-3">
                           <div className={cn(
                             "w-10 h-10 rounded border flex items-center justify-center bg-black/40",
                             activeDistributionTab === 'KESATUAN' ? "border-tactical-red/30 text-tactical-red" :
                             activeDistributionTab === 'OPS_DN' ? "border-blue-500/30 text-blue-500" :
                             "border-cyan-400/30 text-cyan-400"
                           )}>
                              <Database size={20} />
                           </div>
                           <div>
                              <div className="text-[10px] text-tactical-muted uppercase font-mono tracking-widest">DATA PEMAKAI LOGISTIK</div>
                              <h4 className="text-xl font-black text-tactical-text uppercase tracking-tight">
                                {activeDistributionTab === 'KESATUAN' ? 'KESATUAN / SATUAN' :
                                 activeDistributionTab === 'OPS_DN' ? 'OPERASI DALAM NEGERI' :
                                 'OPERASI LUAR NEGERI'}
                              </h4>
                           </div>
                        </div>
                        <div className="text-right">
                           <div className="text-[10px] text-tactical-muted uppercase">TOTAL ASSET</div>
                           <div className={cn(
                             "text-2xl font-black",
                             activeDistributionTab === 'KESATUAN' ? "text-tactical-red" :
                             activeDistributionTab === 'OPS_DN' ? "text-blue-500" :
                             "text-cyan-400"
                           )}>
                             {activeDistributionTab === 'KESATUAN' ? logisticsDistribution.kesatuan :
                              activeDistributionTab === 'OPS_DN' ? logisticsDistribution.ops_dn :
                              logisticsDistribution.ops_ln} Unit
                           </div>
                        </div>
                     </div>

                     <div className="overflow-x-auto border border-tactical-border rounded-lg bg-black/40">
                        <table className="w-full text-left border-collapse">
                           <thead>
                               <tr className={cn(
                                "border-b border-tactical-border",
                                activeDistributionTab === 'KESATUAN' ? "bg-tactical-red/10" :
                                activeDistributionTab === 'OPS_DN' ? "bg-blue-500/10" :
                                "bg-cyan-400/10"
                              )}>
                                 <th className={cn(
                                   "p-4 text-xs font-black uppercase tracking-widest",
                                   activeDistributionTab === 'KESATUAN' ? "text-tactical-red" :
                                   activeDistributionTab === 'OPS_DN' ? "text-blue-500" :
                                   "text-cyan-400"
                                 )}>No</th>
                                 <th className={cn(
                                   "p-4 text-xs font-black uppercase tracking-widest",
                                   activeDistributionTab === 'KESATUAN' ? "text-tactical-red" :
                                   activeDistributionTab === 'OPS_DN' ? "text-blue-500" :
                                   "text-cyan-400"
                                 )}>Nama Unit / Operasi</th>
                                 <th className={cn(
                                   "p-4 text-xs font-black uppercase tracking-widest text-center",
                                   activeDistributionTab === 'KESATUAN' ? "text-tactical-red" :
                                   activeDistributionTab === 'OPS_DN' ? "text-blue-500" :
                                   "text-cyan-400"
                                 )}>Status</th>
                                 <th className={cn(
                                   "p-4 text-xs font-black uppercase tracking-widest text-center",
                                   activeDistributionTab === 'KESATUAN' ? "text-tactical-red" :
                                   activeDistributionTab === 'OPS_DN' ? "text-blue-500" :
                                   "text-cyan-400"
                                 )}>Jumlah</th>
                                 <th className={cn(
                                   "p-4 text-xs font-black uppercase tracking-widest text-right",
                                   activeDistributionTab === 'KESATUAN' ? "text-tactical-red" :
                                   activeDistributionTab === 'OPS_DN' ? "text-blue-500" :
                                   "text-cyan-400"
                                 )}>Aksi</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-tactical-border/30">
                              {(activeDistributionTab === 'KESATUAN' ? distributionDetails.units :
                                activeDistributionTab === 'OPS_DN' ? distributionDetails.ops_dn :
                                distributionDetails.ops_ln).length > 0 ? (
                                (activeDistributionTab === 'KESATUAN' ? distributionDetails.units :
                                 activeDistributionTab === 'OPS_DN' ? distributionDetails.ops_dn :
                                 distributionDetails.ops_ln).map((usage, idx) => (
                                   <tr key={idx} className="hover:bg-tactical-cyan/5 transition-colors group">
                                     <td className="p-4 text-sm font-mono text-tactical-muted">{idx + 1}</td>
                                     <td className="p-4 text-sm font-bold text-tactical-text uppercase tracking-tight">{usage.name}</td>
                                     <td className="p-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                           <div className={cn(
                                             "w-2 h-2 rounded-full animate-pulse",
                                             activeDistributionTab === 'KESATUAN' ? "bg-tactical-red" :
                                             activeDistributionTab === 'OPS_DN' ? "bg-blue-500" :
                                             "bg-cyan-400"
                                           )}></div>
                                           <span className="text-[10px] font-black text-tactical-text uppercase tracking-widest">AKTIF</span>
                                        </div>
                                     </td>
                                     <td className={cn(
                                       "p-4 text-center text-sm font-black font-mono",
                                       activeDistributionTab === 'KESATUAN' ? "text-tactical-red" :
                                       activeDistributionTab === 'OPS_DN' ? "text-blue-500" :
                                       "text-cyan-400"
                                     )}>
                                        {usage.quantity} Unit
                                     </td>
                                     <td className="p-4 text-right">
                                        <button 
                                          onClick={() => {
                                            if (usage.coordinates) {
                                              const coords = usage.coordinates.split(',');
                                              setHighlightedLocations([{
                                                ...usage,
                                                type: activeDistributionTab === 'KESATUAN' ? 'UNIT' : 
                                                      activeDistributionTab === 'OPS_DN' ? 'DALAM_NEGERI' : 'LUAR_NEGERI'
                                              }]);
                                              if (onMarkerClick) onMarkerClick([parseFloat(coords[0]), parseFloat(coords[1])], 12);
                                              setActiveModal(null);
                                            }
                                          }}
                                          className={cn(
                                            "flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-all bg-black/40 border border-white/5 text-[10px] font-black uppercase tracking-widest whitespace-nowrap",
                                            activeDistributionTab === 'KESATUAN' ? "hover:bg-tactical-red/20 text-tactical-red border-tactical-red/30" :
                                            activeDistributionTab === 'OPS_DN' ? "hover:bg-blue-500/20 text-blue-500 border-blue-500/30" :
                                            "hover:bg-cyan-400/20 text-cyan-400 border-cyan-400/30"
                                          )}
                                        >
                                           LIHAT MAP
                                        </button>
                                     </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                   <td colSpan={5} className="p-10 text-center text-tactical-muted text-[10px] uppercase font-mono italic">
                                      Data penggunaan aset tidak ditemukan untuk kategori ini.
                                   </td>
                                </tr>
                              )}
                           </tbody>
                        </table>
                     </div>

                     <button 
                       onClick={() => {
                         setActiveModal('LOGISTIK_DETAIL');
                       }}
                       className="text-xs font-bold flex items-center gap-2 mt-6 pt-4 border-t border-tactical-border text-tactical-muted hover:text-tactical-green transition-all"
                     >
                       &larr; KEMBALI KE DETAIL LOGISTIK
                     </button>
                   </div>
                 ) : null}
              </div>

              {/* Modal Footer */}
              <div className={cn(
                "p-4 border-t transition-colors duration-300 flex justify-end",
                activeModal === 'OPERASI_DETAIL' ? "bg-tactical-red/5 border-tactical-red/30" : 
                activeModal === 'INTEL_DETAIL' ? "bg-tactical-cyan/5 border-tactical-cyan/30" :
                "bg-tactical-green/5 border-tactical-green/30"
              )}>
                <button 
                  onClick={() => {
                    setActiveModal(null);
                  }}
                  className={cn(
                    "px-8 py-2.5 border text-xs font-black font-mono tracking-[0.2em] transition-all shadow-lg active:scale-95",
                    activeModal === 'OPERASI_DETAIL' 
                      ? "bg-tactical-red/20 border-tactical-red text-tactical-red hover:bg-tactical-red hover:text-white" 
                      : activeModal === 'INTEL_DETAIL'
                      ? "bg-tactical-cyan/20 border-tactical-cyan text-tactical-cyan hover:bg-tactical-cyan hover:text-black"
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
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setCurrentZoom(val);
                if (onMapChange) onMapChange(currentCenter, val);
              }}
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

          <button 
            onClick={() => {
              const defaultCenter: [number, number] = [-0.7893, 113.9213];
              const defaultZoom = 5;
              setCurrentZoom(defaultZoom);
              setCurrentCenter(defaultCenter);
              if (onMapChange) onMapChange(defaultCenter, defaultZoom);
              // Also trigger onMarkerClick to sync parent's targetLocation
              if (onMarkerClick) onMarkerClick(defaultCenter, defaultZoom);
            }}
            className="p-1.5 hover:bg-tactical-green/20 rounded text-tactical-green transition-colors border border-tactical-green/20"
            title="Reset Map"
          >
            <RotateCcw size={14} />
          </button>
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