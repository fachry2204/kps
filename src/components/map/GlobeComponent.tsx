"use client";

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ZoomIn, ZoomOut, RotateCcw, Shield } from 'lucide-react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

interface GlobeComponentProps {
  units?: any[];
  intelReports?: any[];
  opsDalamNegeri?: any[];
  opsLuarNegeri?: any[];
  onMarkerClick?: (lat: number, lng: number) => void;
  targetLocation?: { lat: number, lng: number };
}

export default function GlobeComponent({ 
  units = [], 
  intelReports = [], 
  opsDalamNegeri = [], 
  opsLuarNegeri = [],
  onMarkerClick,
  targetLocation
}: GlobeComponentProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize MapLibre
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'satellite': {
            type: 'raster',
            tiles: [
              'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
            ],
            tileSize: 256,
            attribution: '© Esri, Maxar, Earthstar Geographics'
          },
          'labels': {
            type: 'raster',
            tiles: [
              'https://mt1.google.com/vt/lyrs=h&x={x}&y={y}&z={z}'
            ],
            tileSize: 256,
            attribution: '© Google'
          }
        },
        layers: [
          {
            id: 'satellite-layer',
            type: 'raster',
            source: 'satellite',
            minzoom: 0,
            maxzoom: 20
          },
          {
            id: 'labels-layer',
            type: 'raster',
            source: 'labels',
            minzoom: 4,
            maxzoom: 20,
            paint: {
              'raster-opacity': 0.8
            }
          }
        ]
      },
      center: [113.9213, -0.7893],
      zoom: 2,
      pitch: 0,
      bearing: 0,
      antialias: true
    } as any);

    map.current.on('style.load', () => {
      if (!map.current) return;

      // Enable Globe Projection
      map.current.setProjection({
        type: 'globe'
      } as any);
      
      // Add atmosphere for tactical feel
      (map.current as any).setFog({
        color: 'rgb(0, 5, 10)',
        'high-color': 'rgb(16, 185, 129)',
        'horizon-blend': 0.15,
        'space-color': 'rgb(0, 0, 0)',
        'star-intensity': 0.6
      });
    });

    return () => {
      map.current?.remove();
    };
  }, []);

  // Handle markers
  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    const addMarkers = (data: any[], color: string, type: string) => {
      data.forEach(item => {
        if (!item.coordinates) return;
        const coords = item.coordinates.replace(/[()]/g, '').split(',').map((c: string) => parseFloat(c.trim()));
        if (coords.length !== 2 || isNaN(coords[0]) || isNaN(coords[1])) return;
        const [lat, lng] = coords;

        const el = document.createElement('div');
        el.className = 'globe-marker';
        el.style.width = '14px';
        el.style.height = '14px';
        el.style.borderRadius = '50%';
        el.style.backgroundColor = color;
        el.style.border = '2px solid white';
        el.style.boxShadow = `0 0 15px ${color}, inset 0 0 5px rgba(0,0,0,0.5)`;
        el.style.cursor = 'pointer';
        el.style.transition = 'transform 0.2s';
        
        el.onmouseenter = () => el.style.transform = 'scale(1.3)';
        el.onmouseleave = () => el.style.transform = 'scale(1)';

        const marker = new maplibregl.Marker(el)
          .setLngLat([lng, lat])
          .setPopup(new maplibregl.Popup({ offset: 25, closeButton: false }).setHTML(`
            <div style="background: rgba(0,10,20,0.9); color: white; padding: 12px; border: 1px solid ${color}; border-radius: 8px; font-family: 'Inter', sans-serif; min-width: 150px; backdrop-filter: blur(5px);">
              <div style="font-size: 9px; color: ${color}; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">${type}</div>
              <div style="font-size: 13px; font-weight: 800; text-transform: uppercase;">${item.unit_name || item.title || item.name}</div>
              <div style="font-size: 10px; color: #888; margin-top: 4px; font-family: monospace;">${lat.toFixed(4)}, ${lng.toFixed(4)}</div>
            </div>
          `))
          .addTo(map.current!);

        el.addEventListener('click', () => {
          if (onMarkerClick) onMarkerClick(lat, lng);
        });

        markersRef.current.push(marker);
      });
    };

    addMarkers(units, '#10b981', 'KESATUAN');
    addMarkers(intelReports, '#ef4444', 'INTELIJEN');
    addMarkers(opsDalamNegeri, '#3b82f6', 'OPERASI DN');
    addMarkers(opsLuarNegeri, '#22d3ee', 'OPERASI LN');

  }, [units, intelReports, opsDalamNegeri, opsLuarNegeri, onMarkerClick]);

  // Handle fly-to targeting
  useEffect(() => {
    if (targetLocation && map.current) {
      map.current.flyTo({
        center: [targetLocation.lng, targetLocation.lat],
        zoom: 15,
        pitch: 45,
        duration: 2500,
        essential: true
      });
    }
  }, [targetLocation]);

  const handleZoomIn = () => map.current?.zoomIn();
  const handleZoomOut = () => map.current?.zoomOut();
  const handleReset = () => {
    map.current?.flyTo({ center: [113.9213, -0.7893], zoom: 2, pitch: 0, bearing: 0 });
  };

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      <div ref={mapContainer} className="absolute inset-0" />

      {/* Control Panel */}
      <div className="absolute bottom-10 right-10 z-[1001] flex flex-col gap-4">
        <div className="flex flex-col bg-black/80 backdrop-blur-xl border border-tactical-green/40 rounded-xl overflow-hidden shadow-[0_0_30px_rgba(0,255,0,0.15)]">
          <button onClick={handleZoomIn} className="p-4 text-tactical-green hover:bg-tactical-green/20 transition-all border-b border-tactical-green/10" title="Zoom In"><ZoomIn size={20} /></button>
          <button onClick={handleZoomOut} className="p-4 text-tactical-green hover:bg-tactical-green/20 transition-all border-b border-tactical-green/10" title="Zoom Out"><ZoomOut size={20} /></button>
          <button onClick={handleReset} className="p-4 text-tactical-green hover:bg-tactical-green/20 transition-all" title="Reset Camera"><RotateCcw size={20} /></button>
        </div>
      </div>

      {/* HUD Header */}
      <div className="absolute top-10 left-10 z-[1001] pointer-events-none">
        <motion.div 
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="bg-black/60 backdrop-blur-xl p-5 rounded-xl border border-tactical-green/30 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-1 h-full bg-tactical-green" />
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center justify-center w-6 h-6 rounded bg-tactical-green/20 border border-tactical-green/40">
              <Shield className="w-3.5 h-3.5 text-tactical-green" />
            </div>
            <div className="text-[10px] text-tactical-green font-black tracking-[0.3em] uppercase font-mono">Satellite Link Active</div>
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter leading-none mb-1">Global Command Sphere</h2>
          <div className="text-[10px] text-tactical-muted uppercase font-mono tracking-widest">Tactical Awareness v5.0 | High-Res Tiling</div>
        </motion.div>
      </div>
      
      <style jsx global>{`
        .maplibregl-popup-content {
          padding: 0 !important;
          background: transparent !important;
          border-radius: 8px !important;
          box-shadow: none !important;
        }
        .maplibregl-popup-tip {
          display: none !important;
        }
      `}</style>
    </div>
  );
}
