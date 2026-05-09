"use client";

import dynamic from "next/dynamic";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

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

export default function MapPage() {
  const router = useRouter();
  const [isFullScreen, setIsFullScreen] = useState(true);

  useEffect(() => {
    if (!isFullScreen) {
      router.push("/");
    }
  }, [isFullScreen, router]);

  if (!isFullScreen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-tactical-bg overflow-hidden">
      {/* Full Screen Close Button */}
      <button 
        onClick={() => setIsFullScreen(false)}
        className="absolute top-6 right-6 z-[1000] p-3 bg-tactical-red/20 border border-tactical-red text-tactical-red rounded-full hover:bg-tactical-red hover:text-white transition-all shadow-[0_0_20px_rgba(255,51,51,0.3)] group"
        title="Exit Full Screen"
      >
        <X className="w-6 h-6 group-hover:scale-110 transition-transform" />
      </button>

      {/* Map Content */}
      <div className="w-full h-full">
        <MapComponent isFullScreen={true} />
      </div>
      
      {/* Optional Overlay Header */}
      <div className="absolute top-6 left-6 z-[1000] pointer-events-none">
        <div className="tactical-glass tactical-border p-4 flex items-center gap-4">
          <img src="https://upload.wikimedia.org/wikipedia/commons/6/61/Lambang_Kopassus.svg" alt="Kopassus" className="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(204,0,0,0.5)]" />
          <div>
            <h2 className="text-xl font-bold text-tactical-text tracking-wider">TACTICAL MAP KOPASSUS</h2>
          </div>
        </div>
      </div>
    </div>
  );
}

