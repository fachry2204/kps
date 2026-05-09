"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, LayersControl, LayerGroup, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Crosshair, ShieldAlert, Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

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
  
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.5 });
  }, [center, zoom, map]);

  useMapEvents({
    zoomend() {
      if (onZoomEnd) onZoomEnd(map.getZoom());
    }
  });
  
  return null;
}

function ZoomController({ zoom }: { zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setZoom(zoom);
  }, [zoom, map]);
  return null;
}

export default function MapComponent({ 
  isFullScreen = false,
  targetCenter = [-0.7893, 113.9213],
  targetZoom = 5,
  activeCategory = null,
  units = [],
  searchQuery = ""
}: { 
  isFullScreen?: boolean;
  targetCenter?: [number, number];
  targetZoom?: number;
  activeCategory?: string | null;
  units?: any[];
  searchQuery?: string;
}) {
  const [mounted, setMounted] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(targetZoom);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setCurrentZoom(targetZoom);
  }, [targetZoom]);

  if (!mounted) return (
    <div className={cn(
      "w-full bg-tactical-bg flex items-center justify-center text-tactical-green",
      isFullScreen ? "h-screen" : "h-[600px]"
    )}>
      INITIALIZING SATELLITE LINK...
    </div>
  );

  const center: [number, number] = [-0.7893, 113.9213]; // Indonesia Center
  
  return (
    <div className={cn(
      "relative w-full overflow-hidden transition-all duration-500",
      isFullScreen 
        ? "h-screen w-screen" 
        : "h-[600px] rounded-lg tactical-border border-tactical-green"
    )}>
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
        <MapViewUpdater center={targetCenter} zoom={targetZoom} onZoomEnd={setCurrentZoom} />
        <ZoomController zoom={currentZoom} />
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
                <Marker key={unit.id} position={[lat, lng]} icon={createUnitIcon(unit.logo_url)}>
                  <Popup className="tactical-popup">
                    <div className="font-bold text-tactical-bg">{unit.unit_name}</div>
                    <div className="text-xs">Type: {unit.unit_type}</div>
                    <div className="text-xs">Location: {unit.location}</div>
                  </Popup>
                </Marker>
              );
            })}
          </>
        )}

        {(!activeCategory || activeCategory === 'INTELIJEN') && (!searchQuery || 'unidentified activity'.includes(searchQuery.toLowerCase())) && (
          <>
            <Marker position={[-6.25, 106.85]} icon={tacticalIcon}>
              <Popup>
                <div className="font-bold text-tactical-bg text-red-600">Unidentified Activity</div>
              </Popup>
            </Marker>
            <Circle 
              center={[-6.25, 106.85]} 
              radius={2000} 
              pathOptions={{ color: '#ff3333', fillColor: '#ff3333', fillOpacity: 0.2, weight: 1, dashArray: '5, 5' }} 
            />
          </>
        )}

        {(!activeCategory || activeCategory === 'OPERASI') && (!searchQuery || 'operasi satgas papua'.includes(searchQuery.toLowerCase())) && (
          <>
            <Marker position={[-4.2699, 138.0804]} icon={customIcon}>
              <Popup className="tactical-popup">
                <div className="font-bold text-tactical-bg">Operasi Satgas Papua</div>
                <div className="text-xs">Status: Active</div>
              </Popup>
            </Marker>
            <Circle 
              center={[-4.2699, 138.0804]} 
              radius={10000} 
              pathOptions={{ color: '#ffb700', fillColor: '#ffb700', fillOpacity: 0.2, weight: 1, dashArray: '5, 5' }} 
            />
          </>
        )}
      </MapContainer>

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
    </div>
  );
}
