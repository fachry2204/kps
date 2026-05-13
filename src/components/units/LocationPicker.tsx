"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

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

function MapController({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom);
  }, [center, zoom, map]);
  return null;
}

function MapEvents({ onLocationSelected }: { onLocationSelected: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onLocationSelected(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

interface LocationPickerProps {
  initialLocation: [number, number];
  onLocationSelected: (lat: number, lng: number) => void;
  hasLocation?: boolean;
  zoom?: number;
}

export default function LocationPicker({ 
  initialLocation, 
  onLocationSelected, 
  hasLocation = true,
  zoom = 13 
}: LocationPickerProps) {
  const [mounted, setMounted] = useState(false);
  const markerRef = useRef<L.Marker>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const latLng = marker.getLatLng();
          onLocationSelected(latLng.lat, latLng.lng);
        }
      },
    }),
    [onLocationSelected],
  );

  return (
    <div className="w-full h-[300px] rounded-lg overflow-hidden border border-tactical-border">
      {!mounted ? (
        <div className="w-full h-full bg-tactical-bg flex items-center justify-center text-tactical-green font-mono text-xs">
          LOADING TACTICAL GRID...
        </div>
      ) : (
        <MapContainer 
          center={initialLocation} 
          zoom={zoom} 
          style={{ height: '100%', width: '100%' }}
          attributionControl={false}
        >
          <TileLayer
            url="https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
            subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
          />
          {hasLocation && (
            <Marker 
              draggable={true}
              eventHandlers={eventHandlers}
              position={initialLocation} 
              icon={customIcon}
              ref={markerRef}
            />
          )}
          <MapEvents onLocationSelected={onLocationSelected} />
          <MapController center={initialLocation} zoom={zoom} />
        </MapContainer>
      )}
    </div>
  );
}
