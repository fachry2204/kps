"use client";

import { Building2, ChevronRight, Shield } from "lucide-react";
import { motion } from "framer-motion";

export default function UnitsPage() {
  const units = [
    { name: "Grup 1 / Para Komando", hq: "Serang, Banten", cmdr: "Kolonel Inf. A", strength: 850, readiness: 95 },
    { name: "Grup 2 / Para Komando", hq: "Kartasura, Jawa Tengah", cmdr: "Kolonel Inf. B", strength: 820, readiness: 92 },
    { name: "Grup 3 / Sandi Yudha", hq: "Cijantung, Jakarta", cmdr: "Kolonel Inf. C", strength: 450, readiness: 98 },
    { name: "Satuan 81 / Gultor", hq: "Cijantung, Jakarta", cmdr: "Kolonel Inf. D", strength: 300, readiness: 100 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-tactical-text flex items-center gap-2">
            <Building2 className="text-tactical-green" />
            KESATUAN
          </h2>
          <p className="text-tactical-muted font-mono text-sm mt-1">FORCE STRUCTURE & READINESS</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {units.map((unit, i) => (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            key={i} 
            className="tactical-glass tactical-border p-6"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-tactical-green/10 border border-tactical-green rounded flex items-center justify-center">
                  <Shield className="w-6 h-6 text-tactical-green" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-tactical-text tracking-wide">{unit.name}</h3>
                  <p className="text-sm font-mono text-tactical-muted">{unit.hq}</p>
                </div>
              </div>
              <button className="p-2 hover:bg-tactical-border rounded transition-colors">
                <ChevronRight className="w-5 h-5 text-tactical-muted" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-3 bg-tactical-bg border border-tactical-border rounded">
                <div className="text-xs text-tactical-muted font-mono mb-1">KOMANDAN</div>
                <div className="font-bold text-sm text-tactical-text">{unit.cmdr}</div>
              </div>
              <div className="p-3 bg-tactical-bg border border-tactical-border rounded">
                <div className="text-xs text-tactical-muted font-mono mb-1">KEKUATAN PERSONIL</div>
                <div className="font-bold text-sm text-tactical-text">{unit.strength} Personil</div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono text-tactical-muted mb-2">
                <span>TACTICAL READINESS</span>
                <span className={unit.readiness > 95 ? "text-tactical-green" : "text-yellow-500"}>
                  {unit.readiness}%
                </span>
              </div>
              <div className="w-full h-2 bg-tactical-bg rounded overflow-hidden">
                <div 
                  className={`h-full ${unit.readiness > 95 ? 'bg-tactical-green' : 'bg-yellow-500'}`}
                  style={{ width: `${unit.readiness}%` }}
                ></div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
