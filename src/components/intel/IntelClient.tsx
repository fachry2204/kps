"use client";

import { ShieldAlert, AlertTriangle, Lock, FileText, Brain, Eye, Edit2, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

interface IntelClientProps {
  reports: any[];
}

export default function IntelClient({ reports }: IntelClientProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-tactical-text flex items-center gap-2">
            <ShieldAlert className="text-tactical-red" />
            INTELIJEN DASHBOARD
          </h2>
          <p className="text-tactical-muted font-mono text-sm mt-1">THREAT ANALYSIS & ENCRYPTED COMMS (DATABASE ACTIVE)</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 flex items-center gap-2 text-xs font-mono bg-tactical-red/10 text-tactical-red border border-tactical-red rounded hover:bg-tactical-red/20 transition-colors">
            <ShieldAlert className="w-4 h-4" />
            TAMBAHKAN DATA INTELEGEN
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Threat Level */}
        <div className="tactical-glass tactical-border p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-tactical-red"></div>
          <AlertTriangle className="w-16 h-16 text-tactical-red mb-4 animate-pulse" />
          <h3 className="text-tactical-muted text-xs font-mono mb-2">CURRENT HEAT LEVEL</h3>
          <div className="text-5xl font-bold text-tactical-text tracking-wider mb-2">ELEVATED</div>
          <p className="text-tactical-red text-sm font-mono">CODE: RED-7 Alpha</p>
        </div>

        {/* AI Analysis */}
        <div className="tactical-glass tactical-border p-6 md:col-span-2">
          <h3 className="text-tactical-text font-bold mb-4 font-mono text-sm flex items-center gap-2 border-b border-tactical-border pb-2">
            <Brain className="w-4 h-4 text-tactical-cyan" />
            AI THREAT ANALYSIS
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-tactical-bg border border-tactical-border rounded">
              <div className="text-tactical-muted text-xs font-mono mb-1">RISK SCORING</div>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold text-yellow-500">84</span>
                <span className="text-tactical-muted text-sm mb-1">/100</span>
              </div>
              <div className="w-full bg-tactical-panel h-2 rounded mt-2 overflow-hidden">
                <div className="bg-yellow-500 h-full w-[84%]"></div>
              </div>
            </div>
            <div className="p-4 bg-tactical-bg border border-tactical-border rounded flex flex-col justify-between">
              <div className="text-tactical-muted text-xs font-mono mb-1">DATA ENCRYPTION</div>
              <div className="flex items-center gap-2 text-tactical-green font-mono text-sm">
                <Lock className="w-4 h-4" />
                AES-256 GCM SECURE
              </div>
              <div className="text-[10px] text-tactical-muted font-mono mt-2">
                KEY ROTATION: ACTIVE
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Intel Reports */}
      <div className="tactical-glass tactical-border p-6">
        <h3 className="text-tactical-text font-bold mb-4 font-mono text-sm border-b border-tactical-border pb-2 flex items-center gap-2">
          <FileText className="w-4 h-4" />
          LAPORAN INTELIJEN TERKINI (FROM DB)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-tactical-border text-xs font-mono text-tactical-muted">
                <th className="py-3 px-4">KODE</th>
                <th className="py-3 px-4">TANGGAL</th>
                <th className="py-3 px-4">JUDUL LAPORAN</th>
                <th className="py-3 px-4">ANCAMAN</th>
                <th className="py-3 px-4">LOKASI</th>
                <th className="py-3 px-4 text-right">AKSI</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {reports.map((row, i) => (
                <motion.tr 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i }}
                  key={row.id} 
                  className="border-b border-tactical-border/50 hover:bg-tactical-border/30 transition-colors"
                >
                  <td className="py-3 px-4 font-mono text-tactical-text">INT-24-00{row.id}</td>
                  <td className="py-3 px-4 text-tactical-muted">{format(new Date(row.created_at), 'dd MMM yyyy')}</td>
                  <td className="py-3 px-4 text-tactical-text">{row.title}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs rounded border ${
                      row.threat_level === 'SEVERE' || row.threat_level === 'HIGH' ? 'bg-tactical-red/10 border-tactical-red text-tactical-red' :
                      row.threat_level === 'ELEVATED' ? 'bg-yellow-500/10 border-yellow-500 text-yellow-500' :
                      'bg-tactical-green/10 border-tactical-green text-tactical-green'
                    }`}>
                      {row.threat_level}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-tactical-muted">{row.location_tag}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-1.5 text-tactical-cyan hover:bg-tactical-cyan/20 hover:text-white rounded transition-colors" title="View">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-yellow-500 hover:bg-yellow-500/20 hover:text-yellow-400 rounded transition-colors" title="Edit">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-tactical-red hover:bg-tactical-red/20 hover:text-red-400 rounded transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
