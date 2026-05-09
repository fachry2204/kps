"use client";

import { Building2, ChevronRight, Shield, Plus, MapPin, X, Users, Target } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { getUnitMembers } from "@/app/actions";

const LocationPicker = dynamic(() => import("./LocationPicker"), { 
  ssr: false,
  loading: () => <div className="h-[400px] bg-tactical-bg flex items-center justify-center text-tactical-green font-mono text-xs">INITIALIZING SATELLITE...</div>
});

interface Unit {
  id: number;
  unit_name: string;
  unit_type: string;
  logo_url: string | null;
  location: string;
  coordinates: string | null;
  status: string;
  strength: number;
  commander_name: string;
}

interface UnitsClientProps {
  units: Unit[];
}

export default function UnitsClient({ units }: UnitsClientProps) {
  const [activeUnitMap, setActiveUnitMap] = useState<Unit | null>(null);
  const [activeUnitDetail, setActiveUnitDetail] = useState<Unit | null>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  useEffect(() => {
    if (activeUnitDetail) {
      loadMembers(activeUnitDetail.id);
    } else {
      setMembers([]);
    }
  }, [activeUnitDetail]);

  const loadMembers = async (id: number) => {
    setLoadingMembers(true);
    try {
      const data = await getUnitMembers(id);
      setMembers(data);
    } catch (error) {
      console.error("Failed to load members:", error);
    } finally {
      setLoadingMembers(false);
    }
  };

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
        <Link href="/units/add">
          <button className="px-4 py-2 flex items-center gap-2 text-xs font-mono bg-tactical-green/10 text-tactical-green border border-tactical-green rounded hover:bg-tactical-green/20 transition-colors">
            <Plus className="w-4 h-4" />
            TAMBAHKAN KESATUAN
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {units.map((unit, i) => (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            key={unit.id} 
            className="tactical-glass tactical-border p-6"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-tactical-green/10 border border-tactical-green rounded flex items-center justify-center overflow-hidden">
                  {unit.logo_url ? (
                    <img src={unit.logo_url} alt={unit.unit_name} className="w-full h-full object-contain p-1" />
                  ) : (
                    <Shield className="w-6 h-6 text-tactical-green" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-tactical-text tracking-wide">{unit.unit_name}</h3>
                  <p className="text-sm font-mono text-tactical-muted">{unit.location}</p>
                  <div className="flex items-center gap-3 mt-1">
                    {unit.coordinates && (
                      <p className="text-[10px] font-mono text-tactical-cyan flex items-center gap-1">
                        <Shield size={10} /> {unit.coordinates}
                      </p>
                    )}
                    <button 
                      onClick={() => setActiveUnitMap(unit)}
                      className="text-[10px] font-mono text-tactical-green hover:underline flex items-center gap-1"
                    >
                      <MapPin size={10} /> LIHAT LOKASI
                    </button>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setActiveUnitDetail(unit)}
                className="px-3 py-1.5 bg-tactical-green/10 border border-tactical-green/30 text-tactical-green text-[10px] font-bold font-mono rounded hover:bg-tactical-green hover:text-tactical-bg transition-all tracking-tighter"
              >
                LIHAT SATUAN
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-3 bg-tactical-bg border border-tactical-border rounded">
                <div className="text-xs text-tactical-muted font-mono mb-1">KOMANDAN</div>
                <div className="font-bold text-sm text-tactical-text">{unit.commander_name || 'BELUM DITENTUKAN'}</div>
              </div>
              <div className="p-3 bg-tactical-bg border border-tactical-border rounded">
                <div className="text-xs text-tactical-muted font-mono mb-1">KEKUATAN PERSONIL</div>
                <div className="font-bold text-sm text-tactical-text">{unit.strength} Personil</div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono text-tactical-muted mb-2">
                <span>TACTICAL READINESS</span>
                <span className="text-tactical-green">
                  95%
                </span>
              </div>
              <div className="w-full h-2 bg-tactical-bg rounded overflow-hidden">
                <div 
                  className="h-full bg-tactical-green"
                  style={{ width: `95%` }}
                ></div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Map Modal */}
      <AnimatePresence>
        {activeUnitMap && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveUnitMap(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl tactical-glass tactical-border overflow-hidden"
            >
              <div className="p-4 border-b border-tactical-border flex justify-between items-center bg-tactical-panel">
                <div>
                  <h3 className="text-lg font-bold text-tactical-text flex items-center gap-2">
                    <MapPin className="text-tactical-green" size={18} />
                    LOKASI: {activeUnitMap.unit_name}
                  </h3>
                  <p className="text-xs font-mono text-tactical-muted uppercase">{activeUnitMap.location}</p>
                </div>
                <button 
                  onClick={() => setActiveUnitMap(null)}
                  className="p-2 hover:bg-tactical-border rounded-full text-tactical-muted hover:text-tactical-red transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-4">
                <LocationPicker 
                  initialLocation={activeUnitMap.coordinates?.split(',').map(Number) as [number, number] || [-6.1754, 106.8272]}
                  onLocationSelected={() => {}} // Read-only mode for this view
                  hasLocation={!!activeUnitMap.coordinates}
                />
                <div className="mt-4 flex justify-between items-center text-[10px] font-mono text-tactical-muted italic">
                  <span>* KOORDINAT: {activeUnitMap.coordinates}</span>
                  <span className="text-tactical-cyan">TACTICAL GRID PREVIEW ACTIVE</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Unit Detail Modal */}
      <AnimatePresence>
        {activeUnitDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveUnitDetail(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-5xl max-h-[90vh] tactical-glass tactical-border flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 border-b border-tactical-border bg-tactical-panel/50 flex justify-between items-center">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-tactical-bg border border-tactical-border rounded-lg flex items-center justify-center overflow-hidden">
                    {activeUnitDetail.logo_url ? (
                      <img src={activeUnitDetail.logo_url} alt={activeUnitDetail.unit_name} className="w-full h-full object-contain p-2" />
                    ) : (
                      <Shield className="w-10 h-10 text-tactical-green" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-tactical-text tracking-tighter">{activeUnitDetail.unit_name}</h2>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-xs font-mono text-tactical-green bg-tactical-green/10 px-2 py-0.5 rounded border border-tactical-green/30">
                        {activeUnitDetail.unit_type}
                      </span>
                      <span className="text-xs font-mono text-tactical-muted flex items-center gap-1">
                        <MapPin size={12} /> {activeUnitDetail.location}
                      </span>
                      <button 
                        onClick={() => setActiveUnitMap(activeUnitDetail)}
                        className="text-[10px] font-mono text-tactical-green hover:underline flex items-center gap-1"
                      >
                        <MapPin size={10} /> LIHAT MAP
                      </button>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveUnitDetail(null)}
                  className="p-2 hover:bg-tactical-border rounded-full text-tactical-muted hover:text-tactical-red transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Section */}
                <div className="lg:col-span-1 space-y-6">
                  <div className="tactical-glass tactical-border p-4 space-y-4">
                    <h3 className="text-sm font-bold text-tactical-text font-mono border-b border-tactical-border pb-2">PROFIL SATUAN</h3>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="text-[10px] font-mono text-tactical-muted">KOMANDAN</div>
                        <div className="text-sm font-bold text-tactical-green">{activeUnitDetail.commander_name || 'BELUM DITENTUKAN'}</div>
                      </div>
                      <div>
                        <div className="text-[10px] font-mono text-tactical-muted">KEKUATAN PERSONIL</div>
                        <div className="text-sm font-bold text-tactical-text">{activeUnitDetail.strength} Personil Terdaftar</div>
                      </div>
                      <div>
                        <div className="text-[10px] font-mono text-tactical-muted">STATUS OPERASIONAL</div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-2 h-2 rounded-full bg-tactical-green animate-pulse"></div>
                          <span className="text-xs font-bold text-tactical-text">READY FOR DEPLOYMENT</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="tactical-glass tactical-border p-4">
                    <h3 className="text-sm font-bold text-tactical-text font-mono border-b border-tactical-border pb-2 mb-4 flex items-center gap-2">
                      <Target size={16} className="text-tactical-red" /> CAPABILITIES
                    </h3>
                    <div className="space-y-2">
                      {['Strategic Operations', 'Counter Terrorism', 'Unconventional Warfare', 'Direct Action'].map(cap => (
                        <div key={cap} className="flex items-center justify-between text-[11px] font-mono">
                          <span className="text-tactical-muted">{cap}</span>
                          <span className="text-tactical-green">A+</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Personnel List Section */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold text-tactical-text font-mono flex items-center gap-2">
                      <Users size={16} className="text-tactical-cyan" /> DAFTAR ANGGOTA
                    </h3>
                    <span className="text-[10px] font-mono text-tactical-muted uppercase">ACTIVE DUTY PERSONNEL</span>
                  </div>

                  <div className="tactical-glass tactical-border overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-tactical-panel/80 text-[10px] font-mono text-tactical-muted uppercase border-b border-tactical-border">
                          <th className="px-4 py-3 font-medium">NAMA / NRP</th>
                          <th className="px-4 py-3 font-medium">PANGKAT</th>
                          <th className="px-4 py-3 font-medium">SPESIALISASI</th>
                          <th className="px-4 py-3 font-medium text-right">STATUS</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {loadingMembers ? (
                          <tr>
                            <td colSpan={4} className="px-4 py-10 text-center font-mono text-tactical-muted text-xs">
                              LOADING PERSONNEL DATA...
                            </td>
                          </tr>
                        ) : members.length > 0 ? (
                          members.map((member) => (
                            <tr key={member.id} className="border-b border-tactical-border/30 hover:bg-tactical-green/5 transition-colors">
                              <td className="px-4 py-3">
                                <div className="font-bold text-tactical-text">{member.name}</div>
                                <div className="text-[10px] font-mono text-tactical-muted">{member.nrp}</div>
                              </td>
                              <td className="px-4 py-3 text-tactical-muted font-mono text-xs">{member.rank}</td>
                              <td className="px-4 py-3 text-tactical-cyan font-mono text-xs">{member.specialization}</td>
                              <td className="px-4 py-3 text-right">
                                <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                                  member.status === 'READY' ? 'bg-tactical-green/10 text-tactical-green border border-tactical-green/30' : 'bg-tactical-muted/10 text-tactical-muted'
                                }`}>
                                  {member.status}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="px-4 py-10 text-center font-mono text-tactical-muted text-xs">
                              BELUM ADA ANGGOTA TERDAFTAR
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-tactical-border bg-tactical-panel/30 flex justify-end">
                <button 
                  onClick={() => setActiveUnitDetail(null)}
                  className="px-6 py-2 bg-tactical-border text-tactical-text text-sm font-mono rounded hover:bg-tactical-muted/20 transition-colors"
                >
                  TUTUP PROFILE
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
