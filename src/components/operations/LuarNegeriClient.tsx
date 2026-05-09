"use client";

import { motion } from "framer-motion";
import { Globe, MapPin, Users, Calendar, ArrowRight, Target, Activity } from "lucide-react";
import { useState } from "react";

import { SATGAS_LUAR_NEGERI as SATGAS_KONGA } from "@/lib/constants";

export default function LuarNegeriClient({ initialOperations }: { initialOperations: any[] }) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSatgas = SATGAS_KONGA.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-tactical-border pb-6">
        <div>
          <h2 className="text-2xl font-bold text-tactical-text tracking-tighter flex items-center gap-3">
            <Globe className="text-tactical-cyan" /> GELAR OPERASI LUAR NEGERI
          </h2>
          <p className="text-tactical-muted font-mono text-xs mt-1 uppercase tracking-widest">
            International Peacekeeping & Foreign Deployment (KONTINGEN GARUDA)
          </p>
        </div>
        
        <div className="relative">
          <Activity className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tactical-muted" />
          <input 
            type="text"
            placeholder="Search Konga / Mission Area..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-tactical-panel border border-tactical-border rounded-md pl-10 pr-4 py-2 text-sm font-mono text-tactical-text focus:outline-none focus:border-tactical-cyan w-full md:w-80 transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSatgas.map((satgas, i) => (
          <motion.div
            key={satgas.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="tactical-glass tactical-border p-6 group hover:border-tactical-cyan/50 transition-all cursor-pointer relative overflow-hidden"
          >
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-tactical-cyan/5 blur-3xl -mr-16 -mt-16 group-hover:bg-tactical-cyan/10 transition-all"></div>
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-tactical-text group-hover:text-tactical-cyan transition-colors">{satgas.name}</h3>
                  <div className="flex items-center gap-1.5 text-xs font-mono text-tactical-muted mt-1">
                    <MapPin size={12} className="text-tactical-red" /> {satgas.location}
                  </div>
                </div>
                <span className={`text-[10px] font-bold font-mono px-2 py-1 rounded border ${
                  satgas.status === 'ACTIVE' 
                    ? 'bg-tactical-green/10 text-tactical-green border-tactical-green/30' 
                    : satgas.status === 'ON_ROTATION'
                    ? 'bg-tactical-yellow/10 text-tactical-yellow border-tactical-yellow/30'
                    : 'bg-tactical-cyan/10 text-tactical-cyan border-tactical-cyan/30'
                }`}>
                  {satgas.status}
                </span>
              </div>

              <div className="mb-6">
                <div className="p-2 bg-tactical-bg/50 border border-tactical-border rounded">
                  <div className="text-[9px] font-mono text-tactical-muted mb-1 uppercase text-center">Personil Bertugas</div>
                  <div className="flex items-center justify-center gap-1.5">
                    <Users size={12} className="text-tactical-cyan" />
                    <span className="text-xs font-bold text-tactical-text">{satgas.personnel} Personil</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-tactical-border/30">
                  <button 
                    onClick={() => window.location.href = `/gelar-operasi/luar-negeri/detail/${satgas.id}`}
                    className="w-full py-2 bg-tactical-cyan/10 border border-tactical-cyan/30 rounded flex items-center justify-center gap-2 text-[11px] font-bold text-tactical-cyan hover:bg-tactical-cyan hover:text-black transition-all uppercase tracking-widest"
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
