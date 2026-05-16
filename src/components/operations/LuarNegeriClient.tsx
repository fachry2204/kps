"use client";

import { motion } from "framer-motion";
import { Shield, MapPin, Users, ArrowRight, Activity, Plus, Crosshair } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LuarNegeriClient({ initialOperations }: { initialOperations: any[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const filteredSatgas = initialOperations.filter(s => 
    (s.name || s.operation_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.location || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-tactical-border pb-6">
        <div>
          <h2 className="text-2xl font-bold text-tactical-text tracking-tighter flex items-center gap-3">
            <Shield className="text-tactical-green" /> GELAR OPERASI LUAR NEGERI
          </h2>
          <p className="text-tactical-muted font-mono text-xs mt-1 uppercase tracking-widest">
            International Task Force Deployment & Operational Status
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Activity className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tactical-muted" />
            <input 
              type="text"
              placeholder="Cari Satgas / Lokasi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-tactical-panel border border-tactical-border rounded-md pl-10 pr-4 py-2 text-sm font-mono text-tactical-text focus:outline-none focus:border-tactical-green w-full md:w-64 transition-all"
            />
          </div>
          <Link 
            href="/gelar-operasi/luar-negeri/tambah"
            className="flex items-center gap-2 px-4 py-2 bg-tactical-green/10 text-tactical-green border border-tactical-green/30 rounded-md font-mono text-xs font-bold hover:bg-tactical-green hover:text-black transition-all whitespace-nowrap"
          >
            <Plus size={16} /> TAMBAH OPERASI
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSatgas.map((satgas, i) => (
          <motion.div
            key={satgas.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="tactical-glass tactical-border p-6 group hover:border-tactical-green/50 transition-all cursor-pointer relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-tactical-green/5 blur-3xl -mr-16 -mt-16 group-hover:bg-tactical-green/10 transition-all"></div>
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-sm font-bold text-tactical-text group-hover:text-tactical-green transition-colors leading-tight">{satgas.name || satgas.operation_name}</h3>
                  <div className="flex items-center gap-1.5 text-xs font-mono text-tactical-muted mt-1">
                    <MapPin size={12} className="text-tactical-red" /> {satgas.location}
                  </div>
                  {satgas.coordinates && (
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-tactical-cyan mt-0.5">
                      <Crosshair size={10} className="text-tactical-cyan" /> {satgas.coordinates}
                    </div>
                  )}
                </div>
                <span className={`text-[10px] font-bold font-mono px-2 py-1 rounded border ${
                  satgas.status === 'ACTIVE' || satgas.status === 'ONGOING'
                    ? 'bg-tactical-green/10 text-tactical-green border-tactical-green/30' 
                    : satgas.status === 'STANDBY'
                    ? 'bg-tactical-cyan/10 text-tactical-cyan border-tactical-cyan/30'
                    : 'bg-tactical-muted/10 text-tactical-muted border-tactical-border'
                }`}>
                  {satgas.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-2 bg-tactical-bg/50 border border-tactical-border rounded">
                  <div className="text-[9px] font-mono text-tactical-muted mb-1 uppercase">Komandan</div>
                  <div className="text-xs font-bold text-tactical-text truncate">{satgas.commander_name || 'BELUM ADA'}</div>
                  <div className="text-[8px] font-mono text-tactical-muted uppercase">{satgas.commander_rank || '-'}</div>
                </div>
                <div className="p-2 bg-tactical-bg/50 border border-tactical-border rounded">
                  <div className="text-[9px] font-mono text-tactical-muted mb-1 uppercase text-xs">Personil</div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Users size={12} className="text-tactical-cyan" />
                    <span className="text-xs font-bold text-tactical-text">{satgas.actual_personnel || 0} PX</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-tactical-border/30">
                  <button 
                    onClick={() => window.location.href = `/gelar-operasi/luar-negeri/detail/${satgas.id}`}
                    className="w-full py-2 bg-tactical-green/10 border border-tactical-green/30 rounded flex items-center justify-center gap-2 text-[11px] font-bold text-tactical-green hover:bg-tactical-green hover:text-black transition-all uppercase tracking-widest"
                  >
                    Lihat Data Operasi <ArrowRight size={14} />
                  </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
