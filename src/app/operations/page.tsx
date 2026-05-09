"use client";

import { Crosshair, Play, CheckCircle, Clock, MapPin } from "lucide-react";
import { motion } from "framer-motion";

export default function OperationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-tactical-text flex items-center gap-2">
            <Crosshair className="text-tactical-cyan" />
            OPERASI MILITER
          </h2>
          <p className="text-tactical-muted font-mono text-sm mt-1">MISSION CONTROL & TRACKING</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 text-xs font-mono bg-tactical-cyan/10 text-tactical-cyan border border-tactical-cyan rounded hover:bg-tactical-cyan/20 transition-colors">
            BUAT OPERASI BARU
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Operations List */}
        <div className="lg:col-span-2 space-y-4">
          {[
            { name: "OPS BADAI SELATAN", commander: "Letkol. Arman", loc: "Sektor 4 Alpha", status: "Active", progress: 65, units: 3 },
            { name: "OPS ELANG MALAM", commander: "Mayor. Budi", loc: "Perbatasan Utara", status: "Standby", progress: 10, units: 2 },
            { name: "OPS SAPU BERSIH", commander: "Kapten. Candra", loc: "Sektor 2", status: "Completed", progress: 100, units: 4 },
          ].map((ops, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={ops.name} 
              className="tactical-glass tactical-border p-5 hover:border-tactical-cyan transition-colors group cursor-pointer"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-tactical-text group-hover:text-tactical-cyan transition-colors">{ops.name}</h3>
                  <div className="flex gap-4 mt-2 text-sm text-tactical-muted font-mono">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Cmdr: {ops.commander}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {ops.loc}</span>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-bold rounded border ${
                  ops.status === 'Active' ? 'bg-tactical-cyan/10 border-tactical-cyan text-tactical-cyan' :
                  ops.status === 'Completed' ? 'bg-tactical-green/10 border-tactical-green text-tactical-green' :
                  'bg-yellow-500/10 border-yellow-500 text-yellow-500'
                }`}>
                  {ops.status.toUpperCase()}
                </span>
              </div>
              
              <div className="mt-4">
                <div className="flex justify-between text-xs font-mono text-tactical-muted mb-1">
                  <span>PROGRESS TRACKER</span>
                  <span>{ops.progress}%</span>
                </div>
                <div className="w-full h-1.5 bg-tactical-bg rounded overflow-hidden">
                  <div 
                    className={`h-full ${
                      ops.progress === 100 ? 'bg-tactical-green' : 'bg-tactical-cyan shadow-[0_0_8px_rgba(0,240,255,0.8)]'
                    }`} 
                    style={{ width: `${ops.progress}%` }}
                  ></div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tactical Briefing Panel */}
        <div className="tactical-glass tactical-border p-5 h-fit sticky top-24">
          <h3 className="text-tactical-text font-bold mb-4 font-mono text-sm border-b border-tactical-border pb-2">
            TACTICAL BRIEFING
          </h3>
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-tactical-muted mx-auto flex items-center justify-center mb-4">
              <Crosshair className="w-8 h-8 text-tactical-muted" />
            </div>
            <p className="text-tactical-muted text-sm font-mono">Pilih operasi untuk melihat detail briefing, struktur komando, dan live tracking.</p>
          </div>
          <div className="mt-4 space-y-2">
            <div className="p-3 border border-tactical-border bg-tactical-bg rounded flex items-center gap-3 opacity-50">
              <CheckCircle className="w-4 h-4 text-tactical-muted" />
              <span className="text-sm font-mono">Mission Objectives</span>
            </div>
            <div className="p-3 border border-tactical-border bg-tactical-bg rounded flex items-center gap-3 opacity-50">
              <CheckCircle className="w-4 h-4 text-tactical-muted" />
              <span className="text-sm font-mono">Command Hierarchy</span>
            </div>
            <div className="p-3 border border-tactical-border bg-tactical-bg rounded flex items-center gap-3 opacity-50">
              <CheckCircle className="w-4 h-4 text-tactical-muted" />
              <span className="text-sm font-mono">Operation Analytics</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
