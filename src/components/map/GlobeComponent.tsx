"use client";

import React, { useEffect, useRef, useState } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, AlertCircle, X } from 'lucide-react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

interface GlobeComponentProps {
  units?: any[];
  intelReports?: any[];
  opsDalamNegeri?: any[];
  opsLuarNegeri?: any[];
  onMarkerClick?: (lat: number, lng: number) => void;
  targetLocation?: { lat: number, lng: number };
  setSelectedEntity?: (entity: any) => void;
  setActiveModal?: (modal: any) => void;
  activeCategory?: string | null;
  highlightedLocations?: any[];
  setHighlightedLocations?: (locs: any[]) => void;
  onMapChange?: (center: [number, number], zoom: number) => void;
}

export default function GlobeComponent({ 
  units = [], 
  intelReports = [], 
  opsDalamNegeri = [], 
  opsLuarNegeri = [],
  onMarkerClick,
  targetLocation,
  setSelectedEntity,
  setActiveModal,
  activeCategory = null,
  highlightedLocations = [],
  setHighlightedLocations,
  onMapChange
}: GlobeComponentProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleReset = () => {
    if (!map.current) return;
    map.current.flyTo({ 
      center: [113.9213, -0.7893], 
      zoom: 2, 
      pitch: 0, 
      bearing: 0,
      padding: { top: 0, bottom: 150, left: 0, right: 0 },
      duration: 2000,
      essential: true
    });
  };

  useEffect(() => {
    if (!mapContainer.current) return;

    try {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: {
          version: 8,
          sources: {
            'satellite': {
              type: 'raster',
              tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
              tileSize: 256,
              attribution: '© Esri'
            },
            'labels': {
              type: 'raster',
              tiles: [
                'https://a.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png',
                'https://b.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png',
                'https://c.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png',
                'https://d.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png'
              ],
              tileSize: 256,
              attribution: '© CartoDB'
            }
          },
          layers: [
            { id: 'satellite-layer', type: 'raster', source: 'satellite', minzoom: 0, maxzoom: 19 },
            { id: 'labels-layer', type: 'raster', source: 'labels', minzoom: 2, maxzoom: 19, paint: { 'raster-opacity': 0.8 } }
          ]
        },
        center: [113.9213, -0.7893],
        zoom: 2,
        pitch: 0,
        bearing: 0,
        antialias: true,
        padding: { top: 0, bottom: 150, left: 0, right: 0 },
        attributionControl: false
      } as any);

        map.current.on('style.load', () => {
          if (!map.current) return;
          try {
            if (typeof (map.current as any).setProjection === 'function') {
              (map.current as any).setProjection({ type: 'globe' });
            }
            if (typeof (map.current as any).setFog === 'function') {
              (map.current as any).setFog({
                color: 'rgb(0, 5, 10)',
                'high-color': 'rgb(16, 185, 129)',
                'horizon-blend': 0.15,
                'space-color': 'rgb(0, 0, 0)',
                'star-intensity': 0.6
              });
            }

            // Add source for intel radius circles
            map.current.addSource('intel-radius', {
              type: 'geojson',
              data: { type: 'FeatureCollection', features: [] }
            });

            map.current.addLayer({
              id: 'intel-radius-layer',
              type: 'fill',
              source: 'intel-radius',
              paint: {
                'fill-color': ['get', 'color'],
                'fill-opacity': 0.15,
                'fill-outline-color': ['get', 'color']
              }
            });

          } catch (e) { console.warn("3D advanced features failed:", e); }
        });

      map.current.on('click', (e) => {
        if (e.originalEvent.defaultPrevented) return;
        handleReset();
        if (setSelectedEntity) setSelectedEntity(null);
        if (setActiveModal) setActiveModal(null);
      });

      map.current.on('moveend', () => {
        if (map.current && onMapChange) {
          const center = map.current.getCenter();
          const zoom = map.current.getZoom();
          onMapChange([center.lat, center.lng], zoom);
        }
      });

    } catch (err: any) {
      console.error("Map initialization failed:", err);
      setError(err.message);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Sync Marker styles with Detailed Tactical Requirements
  useEffect(() => {
    if (!map.current) return;

    // Clear old markers immediately
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Global Pulse Animation Style
    const styleId = 'globe-custom-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.innerHTML = `
        @keyframes globe-pulse { 0% { transform: scale(1); opacity: 0.8; } 100% { transform: scale(1.6); opacity: 0; } }
        @keyframes triangle-blink { 0% { transform: scale(1); filter: brightness(1); } 50% { transform: scale(1.2); filter: brightness(1.8); } 100% { transform: scale(1); filter: brightness(1); } }
        .globe-marker-container { pointer-events: auto; }
        .globe-tactical-popup .maplibregl-popup-content { background: transparent !important; box-shadow: none !important; padding: 0 !important; }
        .globe-tactical-popup .maplibregl-popup-tip { border-top-color: rgba(10, 15, 20, 0.95) !important; border-bottom-color: rgba(10, 15, 20, 0.95) !important; }
      `;
      document.head.appendChild(style);
    }

    const addMarker = (element: HTMLDivElement, lat: number, lng: number, data: any, type: string) => {
      const marker = new maplibregl.Marker({ element })
        .setLngLat([lng, lat])
        .addTo(map.current!);
      
      element.addEventListener('click', (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        if (onMarkerClick) onMarkerClick(lat, lng);
        
        if (type === 'UNIT') {
          if (setSelectedEntity) setSelectedEntity({ ...data, type: 'UNIT', pos: [lat, lng] });
        } else if (type === 'OPERASI') {
          if (setSelectedEntity) setSelectedEntity(data);
          if (setActiveModal) setActiveModal('OPERASI_DETAIL');
        } else if (type === 'INTEL') {
          const color = getIntelColor(data.threat_level);
          const content = `
            <div style="padding: 16px; background: rgba(10, 15, 20, 0.95); border: 2px solid ${color}44; color: white; border-radius: 8px; min-width: 300px; font-family: monospace; position: relative; box-shadow: 0 0 30px rgba(0,0,0,0.5);">
              <div style="font-weight: 900; color: #ef4444; font-size: 18px; text-transform: uppercase; margin-bottom: 4px;">${data.title}</div>
              <div style="font-size: 10px; color: #a3a3a3; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px;">INTELIJEN REPORT</div>
              
              <div style="background: ${color}11; border: 1px solid ${color}33; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
                <div style="font-size: 9px; color: #a3a3a3; text-transform: uppercase; margin-bottom: 4px;">TINGKAT ANCAMAN</div>
                <div style="font-size: 16px; font-weight: 900; color: ${color}; display: flex; align-items: center; gap: 8px;">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  ${data.threat_level}
                </div>
              </div>

              <div style="font-size: 12px; font-style: italic; color: #e0e0e0; margin-bottom: 16px; line-height: 1.5;">
                "${data.content}"
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 12px;">
                 <div style="display: flex; align-items: center; gap: 4px; font-size: 10px; color: #a3a3a3;">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="12" r="3"/></svg>
                    ${data.location_tag}
                 </div>
                 <div style="padding: 6px 12px; background: rgba(34, 211, 238, 0.1); border: 1px solid #22d3ee; color: #22d3ee; font-size: 11px; font-weight: 900; border-radius: 4px; cursor: pointer; text-transform: uppercase;">LIHAT DETAIL</div>
                 <div style="font-size: 10px; color: #a3a3a3;">${new Date(data.created_at).toLocaleDateString()}</div>
              </div>
            </div>
          `;

          new maplibregl.Popup({ offset: 20, closeButton: true, className: 'globe-tactical-popup' })
            .setLngLat([lng, lat])
            .setHTML(content)
            .addTo(map.current!);
          
          if (setSelectedEntity) setSelectedEntity(data);
        } else if (type === 'HIGHLIGHT') {
          // Logistics highlight click logic - Show Popup
          const color = data.type === 'UNIT' ? '#ff3333' : 
                        data.type === 'DALAM_NEGERI' ? '#3b82f6' : '#22d3ee';
          
          let content = `
            <div style="padding: 12px; background: rgba(10, 15, 20, 0.95); border: 1px solid ${color}44; color: white; border-radius: 4px; min-width: 220px; font-family: monospace;">
              <div style="font-weight: 900; color: ${color}; text-transform: uppercase; font-size: 14px; margin-bottom: 2px;">${data.name}</div>
              <div style="font-size: 10px; color: #a3a3a3; text-transform: uppercase; margin-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 4px;">
                ${data.type === 'UNIT' ? 'KESATUAN' : 'OPERASI'}
              </div>
          `;

          if (data.items_summary) {
            content += `<div style="display: flex; flex-col gap: 4px; max-height: 120px; overflow-y: auto;">`;
            data.items_summary.split('\n').forEach((item: string) => {
              content += `
                <div style="font-size: 11px; margin-bottom: 4px; display: flex; justify-content: space-between; gap: 10px;">
                  <span style="font-weight: bold;">${item.split(' (')[0]}</span>
                  <span style="color: #a3a3a3;">${item.includes('(') ? item.split(' (')[1].replace(')', '') : ''}</span>
                </div>
              `;
            });
            content += `</div>`;
          } else {
            content += `
              <div style="margin-top: 8px; display: flex; flex-direction: column; gap: 4px;">
                <div style="font-size: 12px; font-weight: 900; text-transform: uppercase;">Logistik : ${data.asset_name || 'LOGISTIK'}</div>
                <div style="font-size: 12px; font-weight: 900; text-transform: uppercase;">Jumlah : ${data.quantity || 0} Unit</div>
              </div>
            `;
          }

          content += `</div>`;

          new maplibregl.Popup({ offset: 20, closeButton: true, className: 'globe-tactical-popup' })
            .setLngLat([lng, lat])
            .setHTML(content)
            .addTo(map.current!);
          
          // Do NOT set selected entity to avoid radial menu
        }
      });
      
      markersRef.current.push(marker);
    };

    // --- UNIT MARKERS (Circle + Gold + Logo) ---
    if ((!activeCategory || activeCategory === 'KESATUAN') && highlightedLocations.length === 0) {
      units.forEach(unit => {
        if (!unit.coordinates) return;
        const coords = unit.coordinates.replace(/[()]/g, '').split(',').map((c: string) => parseFloat(c.trim()));
        if (coords.length !== 2 || isNaN(coords[0])) return;

        const el = document.createElement('div');
        el.className = 'globe-marker-container';
        el.innerHTML = `
          <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background: rgba(0,0,0,0.8); border: 2px solid #c9a041; box-shadow: 0 0 15px rgba(201,160,65,0.4); z-index: 2;"></div>
            <div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; border: 3px solid #c9a041; animation: globe-pulse 2s infinite; z-index: 1;"></div>
            <img src="${unit.logo_url || '/logo_puskodal.png'}" style="width: 28px; height: 28px; object-fit: contain; z-index: 3; border-radius: 50%;" />
          </div>
        `;
        addMarker(el, coords[0], coords[1], unit, 'UNIT');
      });
    }

    // --- OPERATION MARKERS ---
    if ((!activeCategory || activeCategory === 'OPERASI') && highlightedLocations.length === 0) {
      const allOps = [...opsDalamNegeri.map(o => ({...o, cat: 'DN'})), ...opsLuarNegeri.map(o => ({...o, cat: 'LN'}))];
      allOps.forEach(op => {
        if (!op.coordinates) return;
        const coords = op.coordinates.replace(/[()]/g, '').split(',').map((c: string) => parseFloat(c.trim()));
        if (coords.length !== 2 || isNaN(coords[0])) return;

        const color = op.cat === 'DN' ? '#3b82f6' : '#22d3ee';
        const el = document.createElement('div');
        el.className = 'globe-marker-container';
        el.innerHTML = `
          <div style="position: relative; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; border: 2px solid ${color}; animation: globe-pulse 2s infinite; opacity: 0.5; z-index: 1;"></div>
            <div style="position: relative; width: 32px; height: 32px; border-radius: 50%; background: ${color}; border: 2px solid black; box-shadow: 0 0 10px ${color}66; z-index: 2; display: flex; align-items: center; justify-content: center;">
               <img src="/logo_puskodal.png" style="width: 20px; height: 20px; object-fit: contain; z-index: 3;" />
            </div>
          </div>
        `;
        addMarker(el, coords[0], coords[1], op, 'OPERASI');
      });
    }

    // --- INTEL MARKERS ---
    if ((!activeCategory || activeCategory === 'INTELIJEN') && highlightedLocations.length === 0) {
      intelReports.forEach(intel => {
        if (!intel.coordinates) return;
        const coords = intel.coordinates.replace(/[()]/g, '').split(',').map((c: string) => parseFloat(c.trim()));
        if (coords.length !== 2 || isNaN(coords[0])) return;

        const color = getIntelColor(intel.threat_level);
        
        const el = document.createElement('div');
        el.className = 'globe-marker-container';
        el.innerHTML = `
          <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background: rgba(0,0,0,0.85); border: 2px solid ${color}; box-shadow: 0 0 15px ${color}66; z-index: 2;"></div>
            <div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; border: 2px solid ${color}; animation: globe-pulse 1.5s infinite; z-index: 1;"></div>
            <div style="z-index: 3; color: ${color};"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z"/><circle cx="12" cy="12" r="3"/></svg></div>
          </div>
        `;
        addMarker(el, coords[0], coords[1], intel, 'INTEL');
      });
    }

    // --- LOGISTICS HIGHLIGHT MARKERS (Triangles) ---
    if (highlightedLocations.length > 0) {
      highlightedLocations.forEach((loc, idx) => {
        if (!loc.coordinates) return;
        const coords = loc.coordinates.replace(/[()]/g, '').split(',').map((c: string) => parseFloat(c.trim()));
        if (coords.length !== 2 || isNaN(coords[0])) return;

        const color = loc.type === 'UNIT' ? '#ff3333' : 
                      loc.type === 'DALAM_NEGERI' ? '#3b82f6' : '#22d3ee';
        
        const el = document.createElement('div');
        el.className = 'globe-marker-container';
        el.innerHTML = `
          <div style="position: relative; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; animation: triangle-blink 2s infinite;">
            <div style="width: 32px; height: 32px; background: ${color}; border: 2px solid black; border-radius: 4px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 15px ${color}66;">
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
            </div>
          </div>
        `;
        addMarker(el, coords[0], coords[1], loc, 'HIGHLIGHT');
      });
    }

    // --- RADIUS CIRCLES DATA UPDATE ---
    if (map.current && map.current.getSource('intel-radius')) {
      const createCircle = (center: [number, number], radiusInKm: number) => {
        const coords = {
          latitude: center[0],
          longitude: center[1]
        };
        const km = radiusInKm;
        const ret = [];
        const distanceX = km / (111.32 * Math.cos(coords.latitude * Math.PI / 180));
        const distanceY = km / 110.574;

        let theta, x, y;
        for (let i = 0; i < 64; i++) {
          theta = (i / 64) * (2 * Math.PI);
          x = distanceX * Math.cos(theta);
          y = distanceY * Math.sin(theta);
          ret.push([coords.longitude + x, coords.latitude + y]);
        }
        ret.push(ret[0]);
        return [ret];
      };

      const features = intelReports
        .filter(intel => intel.coordinates && (!activeCategory || activeCategory === 'INTELIJEN') && highlightedLocations.length === 0)
        .map(intel => {
          const coords = intel.coordinates.replace(/[()]/g, '').split(',').map((c: string) => parseFloat(c.trim()));
          const color = getIntelColor(intel.threat_level);
          return {
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: createCircle([coords[0], coords[1]], 50) // 50km radius
            },
            properties: { color }
          };
        });

      (map.current.getSource('intel-radius') as maplibregl.GeoJSONSource).setData({
        type: 'FeatureCollection',
        features: features as any
      });
    }

  }, [units, intelReports, opsDalamNegeri, opsLuarNegeri, onMarkerClick, setSelectedEntity, setActiveModal, activeCategory, highlightedLocations]);

  const getIntelColor = (status: string) => {
    const s = status?.toUpperCase();
    if (s === 'STABIL') return '#10b981';
    if (s === 'TERJAGA') return '#3b82f6';
    if (s === 'MENINGKAT') return '#f97316';
    if (s === 'TINGGI') return '#facc15';
    if (s === 'KRITIS') return '#ef4444';
    return '#10b981';
  };

  // Handle fly-to targeting
  useEffect(() => {
    if (targetLocation && map.current) {
      map.current.flyTo({ center: [targetLocation.lng, targetLocation.lat], zoom: 15, pitch: 45, duration: 2500, essential: true });
    }
  }, [targetLocation]);

  const handleZoomIn = () => map.current?.zoomIn();
  const handleZoomOut = () => map.current?.zoomOut();

  if (error) {
    return (
      <div className="w-full h-full bg-black flex flex-col items-center justify-center text-tactical-red p-10 text-center">
        <AlertCircle size={48} className="mb-4" />
        <h3 className="text-xl font-black uppercase">Satellite Link Failure</h3>
        <p className="text-sm font-mono mt-2 opacity-70">{error}</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      <div ref={mapContainer} className="absolute inset-0 w-full h-full" />
      
      {/* Reset Highlights Button */}
      {highlightedLocations.length > 0 && setHighlightedLocations && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1001] pointer-events-auto">
          <button 
            onClick={() => setHighlightedLocations([])}
            className="bg-tactical-red border border-white/20 text-white px-6 py-2.5 rounded-full text-[11px] font-black shadow-[0_0_20px_rgba(255,0,0,0.3)] hover:bg-red-700 transition-all flex items-center gap-2 uppercase tracking-widest"
          >
            <X size={14} /> Reset Tampilan Logistik
          </button>
        </div>
      )}

      <div className="absolute bottom-10 right-10 z-[1001] flex flex-col gap-4">
        <div className="flex flex-col bg-black/80 backdrop-blur-xl border border-tactical-green/40 rounded-xl overflow-hidden shadow-[0_0_30px_rgba(0,255,0,0.15)] pointer-events-auto">
          <button onClick={handleZoomIn} className="p-4 text-tactical-green hover:bg-tactical-green/20 transition-all border-b border-tactical-green/10" title="Zoom In"><ZoomIn size={20} /></button>
          <button onClick={handleZoomOut} className="p-4 text-tactical-green hover:bg-tactical-green/20 transition-all border-b border-tactical-green/10" title="Zoom Out"><ZoomOut size={20} /></button>
          <button onClick={handleReset} className="p-4 text-tactical-green hover:bg-tactical-green/20 transition-all" title="Reset Camera"><RotateCcw size={20} /></button>
        </div>
      </div>
    </div>
  );
}
