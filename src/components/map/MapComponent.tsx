"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, LayersControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Crosshair, ShieldAlert } from "lucide-react";

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

export default function MapComponent() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="w-full h-[600px] bg-tactical-bg flex items-center justify-center text-tactical-green">INITIALIZING SATELLITE LINK...</div>;

  const center: [number, number] = [-6.200000, 106.816666]; // Jakarta
  
  return (
    <div className="relative w-full h-[600px] rounded-lg overflow-hidden tactical-border border-tactical-green">
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
        center={center} 
        zoom={11} 
        style={{ height: '100%', width: '100%', backgroundColor: '#070b09' }}
        zoomControl={false}
      >
        <LayersControl position="bottomright">
          <LayersControl.BaseLayer checked name="Tactical Dark">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Satellite">
            <TileLayer
              attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          </LayersControl.BaseLayer>
        </LayersControl>

        <Marker position={[-6.2, 106.8]} icon={customIcon}>
          <Popup className="tactical-popup">
            <div className="font-bold text-tactical-bg">Mako Kopasus</div>
            <div className="text-xs">Status: Secure</div>
          </Popup>
        </Marker>

        <Marker position={[-6.25, 106.85]} icon={tacticalIcon}>
          <Popup>
            <div className="font-bold text-tactical-bg text-red-600">Unidentified Activity</div>
          </Popup>
        </Marker>

        <Circle 
          center={[-6.2, 106.8]} 
          radius={5000} 
          pathOptions={{ color: 'var(--color-tactical-green)', fillColor: 'var(--color-tactical-green)', fillOpacity: 0.1, weight: 1 }} 
        />
        
        <Circle 
          center={[-6.25, 106.85]} 
          radius={2000} 
          pathOptions={{ color: '#ff3333', fillColor: '#ff3333', fillOpacity: 0.2, weight: 1, dashArray: '5, 5' }} 
        />
      </MapContainer>
    </div>
  );
}
