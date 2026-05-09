"use client";

import { Users, Search, Filter, Download, UserPlus } from "lucide-react";

export default function PersonnelPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-tactical-text flex items-center gap-2">
            <Users className="text-tactical-green" />
            DATABASE PERSONIL
          </h2>
          <p className="text-tactical-muted font-mono text-sm mt-1">PERSONNEL MANAGEMENT SYSTEM</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 flex items-center gap-2 text-xs font-mono bg-tactical-bg text-tactical-muted border border-tactical-border rounded hover:text-tactical-text transition-colors">
            <Download className="w-4 h-4" />
            EXPORT
          </button>
          <button className="px-4 py-2 flex items-center gap-2 text-xs font-mono bg-tactical-green/10 text-tactical-green border border-tactical-green rounded hover:bg-tactical-green/20 transition-colors">
            <UserPlus className="w-4 h-4" />
            TAMBAH DATA
          </button>
        </div>
      </div>

      <div className="tactical-glass tactical-border p-4">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tactical-muted" />
            <input 
              type="text" 
              placeholder="Cari NIK, Nama, atau Pangkat..." 
              className="w-full bg-tactical-bg border border-tactical-border rounded pl-10 pr-4 py-2 text-sm text-tactical-text focus:outline-none focus:border-tactical-green"
            />
          </div>
          <button className="px-4 py-2 flex items-center gap-2 text-sm bg-tactical-bg border border-tactical-border rounded text-tactical-muted hover:text-tactical-text">
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { name: "Letkol. Inf. Sudirman", id: "NRP. 1194002341", role: "Komandan Batalyon", unit: "Grup 1", status: "Aktif" },
          { name: "Mayor. Inf. Bambang", id: "NRP. 1198005672", role: "Wadan Batalyon", unit: "Grup 1", status: "Aktif" },
          { name: "Kapten. Inf. Anton", id: "NRP. 1201008913", role: "Danki", unit: "Sat-81", status: "Tugas Luar" },
          { name: "Lettu. Inf. Junaedi", id: "NRP. 1205001244", role: "Danton", unit: "Grup 2", status: "Aktif" },
        ].map((person, i) => (
          <div key={i} className="tactical-glass tactical-border p-4 hover:border-tactical-green cursor-pointer transition-colors group">
            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 bg-tactical-bg border border-tactical-border rounded overflow-hidden flex-shrink-0">
                {/* Placeholder for Photo */}
                <div className="w-full h-full bg-tactical-muted/20 flex items-center justify-center">
                  <Users className="w-6 h-6 text-tactical-muted opacity-50" />
                </div>
              </div>
              <div className="flex-1 overflow-hidden">
                <h3 className="text-sm font-bold text-tactical-text truncate group-hover:text-tactical-green">{person.name}</h3>
                <p className="text-xs font-mono text-tactical-muted">{person.id}</p>
                
                <div className="mt-3 space-y-1">
                  <div className="text-xs text-tactical-text/80">{person.role}</div>
                  <div className="text-xs font-mono text-tactical-muted bg-tactical-bg px-2 py-0.5 rounded inline-block">
                    {person.unit}
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-tactical-border flex justify-between items-center">
              <span className={`text-[10px] font-bold px-2 py-1 rounded ${
                person.status === 'Aktif' ? 'bg-tactical-green/20 text-tactical-green' : 'bg-yellow-500/20 text-yellow-500'
              }`}>
                {person.status.toUpperCase()}
              </span>
              <button className="text-xs text-tactical-muted hover:text-tactical-text">Detail &rarr;</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
