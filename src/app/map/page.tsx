"use client";

import dynamic from "next/dynamic";
import { Map as MapIcon, Navigation } from "lucide-react";

// Dynamically import MapComponent with no SSR
const MapComponent = dynamic(
  () => import("@/components/map/MapComponent"),
  { ssr: false, loading: () => (
    <div className="w-full h-[600px] bg-tactical-bg border border-tactical-border flex items-center justify-center flex-col gap-4">
      <div className="w-12 h-12 border-4 border-tactical-green border-t-transparent rounded-full animate-spin"></div>
      <div className="text-tactical-green font-mono text-sm tracking-widest animate-pulse">ESTABLISHING SATELLITE LINK...</div>
    </div>
  )}
);

export default function MapPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-tactical-text flex items-center gap-2">
            <MapIcon className="text-tactical-green" />
            TACTICAL MAP
          </h2>
          <p className="text-tactical-muted font-mono text-sm mt-1">GIS & LIVE TRACKING</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 flex items-center gap-2 text-xs font-mono bg-tactical-green/10 text-tactical-green border border-tactical-green rounded hover:bg-tactical-green/20 transition-colors">
            <Navigation className="w-4 h-4" />
            ROUTE OPERATION
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <MapComponent />
        </div>
        
        <div className="space-y-4">
          <div className="tactical-glass tactical-border p-4">
            <h3 className="text-tactical-text font-bold mb-3 font-mono text-sm border-b border-tactical-border pb-2">
              LAYER CONTROL
            </h3>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-tactical-muted hover:text-tactical-text cursor-pointer">
                <input type="checkbox" defaultChecked className="accent-tactical-green" />
                Mako & Posko
              </label>
              <label className="flex items-center gap-2 text-sm text-tactical-muted hover:text-tactical-text cursor-pointer">
                <input type="checkbox" defaultChecked className="accent-tactical-green" />
                Unit Personil
              </label>
              <label className="flex items-center gap-2 text-sm text-tactical-muted hover:text-tactical-text cursor-pointer">
                <input type="checkbox" defaultChecked className="accent-tactical-green" />
                Radius Operasi
              </label>
              <label className="flex items-center gap-2 text-sm text-tactical-red hover:text-tactical-text cursor-pointer">
                <input type="checkbox" defaultChecked className="accent-tactical-red" />
                Titik Ancaman
              </label>
            </div>
          </div>

          <div className="tactical-glass tactical-border p-4">
            <h3 className="text-tactical-text font-bold mb-3 font-mono text-sm border-b border-tactical-border pb-2">
              LIVE TRACKING
            </h3>
            <div className="space-y-3">
              <div className="p-2 border border-tactical-border bg-tactical-bg rounded">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-tactical-text">Tim Alpha</span>
                  <span className="text-[10px] text-tactical-green px-1 rounded bg-tactical-green/10 border border-tactical-green/30">MOVING</span>
                </div>
                <div className="text-[10px] font-mono text-tactical-muted">Lat: -6.2341, Lng: 106.8452</div>
              </div>
              <div className="p-2 border border-tactical-border bg-tactical-bg rounded">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-tactical-text">Tim Bravo</span>
                  <span className="text-[10px] text-yellow-500 px-1 rounded bg-yellow-500/10 border border-yellow-500/30">STANDBY</span>
                </div>
                <div className="text-[10px] font-mono text-tactical-muted">Lat: -6.2111, Lng: 106.8122</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
