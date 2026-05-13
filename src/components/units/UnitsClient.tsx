"use client";

import { Building2, ChevronRight, Shield, Plus, MapPin, X, Users, Target, Search, Edit, Trash2, ArrowRight, Package, Truck, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { getUnitMembers, deleteUnit, getLogisticsByUnit, addLogistics, deleteLogistics } from "@/app/actions";
import { useRouter } from "next/navigation";

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
  commander_rank: string | null;
  commander_nrp: string | null;
}

interface UnitsClientProps {
  units: Unit[];
}

export default function UnitsClient({ units }: UnitsClientProps) {
  const router = useRouter();
  const [activeUnitMap, setActiveUnitMap] = useState<Unit | null>(null);
  const [activeUnitDetail, setActiveUnitDetail] = useState<Unit | null>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [memberSearchQuery, setMemberSearchQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<'PERSONNEL' | 'LOGISTICS'>('PERSONNEL');
  const [unitLogistics, setUnitLogistics] = useState<any[]>([]);
  const [loadingLogistics, setLoadingLogistics] = useState(false);
  const [showAddLogistics, setShowAddLogistics] = useState(false);
  const [newLogistics, setNewLogistics] = useState({
    item_name: '',
    category: 'Weaponry',
    quantity: 0,
    unit: 'pcs',
    min_stock_level: 5,
    condition_status: 'GOOD'
  });

  useEffect(() => {
    if (activeUnitDetail) {
      loadMembers(activeUnitDetail.id);
      loadLogistics(activeUnitDetail.id);
      setActiveTab('PERSONNEL');
    } else {
      setMembers([]);
      setUnitLogistics([]);
    }
  }, [activeUnitDetail]);

  const loadLogistics = async (id: number) => {
    setLoadingLogistics(true);
    try {
      const data = await getLogisticsByUnit(id);
      setUnitLogistics(data);
    } catch (error) {
      console.error("Failed to load logistics:", error);
    } finally {
      setLoadingLogistics(false);
    }
  };

  const handleAddLogistics = async () => {
    if (!activeUnitDetail) return;
    if (!newLogistics.item_name) {
      alert("Nama barang harus diisi");
      return;
    }
    
    const res = await addLogistics({
      ...newLogistics,
      unit_id: activeUnitDetail.id
    });

    if (res.success) {
      loadLogistics(activeUnitDetail.id);
      setShowAddLogistics(false);
      setNewLogistics({
        item_name: '',
        category: 'Weaponry',
        quantity: 0,
        unit: 'pcs',
        min_stock_level: 5,
        condition_status: 'GOOD'
      });
    } else {
      alert("Gagal menambahkan logistik: " + res.error);
    }
  };

  const handleDeleteLogistics = async (id: number) => {
    if (confirm("Hapus barang ini dari kesatuan?")) {
      const res = await deleteLogistics(id);
      if (res.success && activeUnitDetail) {
        loadLogistics(activeUnitDetail.id);
      }
    }
  };

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

  const handleDelete = async (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus kesatuan ini? Semua data personil akan dilepas dari satuan ini.")) {
      try {
        const response = await deleteUnit(id);
        if (response.success) {
          setActiveUnitDetail(null);
          router.refresh();
        } else {
          alert("Gagal menghapus: " + response.error);
        }
      } catch (error) {
        console.error("Delete failed:", error);
      }
    }
  };

  const filteredUnits = units.filter(unit => 
    unit.unit_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (unit.commander_name && unit.commander_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tactical-muted" />
            <input 
              type="text" 
              placeholder="Cari Satuan / Personil..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 bg-tactical-bg border border-tactical-border rounded pl-10 pr-4 py-2 text-sm text-tactical-text focus:outline-none focus:border-tactical-green transition-colors"
            />
          </div>
          <Link href="/kesatuan/add">
            <button className="px-4 py-2 flex items-center gap-2 text-xs font-mono bg-tactical-green/10 text-tactical-green border border-tactical-green rounded hover:bg-tactical-green/20 transition-colors">
              <Plus className="w-4 h-4" />
              TAMBAHKAN KESATUAN
            </button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredUnits.map((unit, i) => (
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
                  <img 
                    src={unit.logo_url || "https://upload.wikimedia.org/wikipedia/commons/6/61/Lambang_Kopassus.svg"} 
                    alt={unit.unit_name} 
                    className="w-full h-full object-contain p-1 drop-shadow-[0_0_5px_rgba(0,255,0,0.5)]" 
                  />
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

            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-3 bg-tactical-bg border border-tactical-border rounded">
                <div className="text-xs text-tactical-muted font-mono mb-1">KOMANDAN</div>
                <div className="font-bold text-sm text-tactical-text">{unit.commander_name || 'BELUM DITENTUKAN'}</div>
                {unit.commander_rank && (
                  <div className="text-[10px] font-mono text-tactical-muted uppercase mt-0.5">{unit.commander_rank}</div>
                )}
              </div>
              <div className="p-3 bg-tactical-bg border border-tactical-border rounded">
                <div className="text-xs text-tactical-muted font-mono mb-1">KEKUATAN PERSONIL</div>
                <div className="font-bold text-sm text-tactical-text">{unit.strength} Personil</div>
              </div>
            </div>

            <div className="pt-4 border-t border-tactical-border/30">
              <button 
                onClick={() => setActiveUnitDetail(unit)}
                className="w-full py-2 bg-tactical-green/10 border border-tactical-green/30 rounded flex items-center justify-center gap-2 text-[11px] font-bold text-tactical-green hover:bg-tactical-green hover:text-black transition-all uppercase tracking-widest"
              >
                Lihat Data Kesatuan <ArrowRight size={14} />
              </button>
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
                    <img 
                      src={activeUnitDetail.logo_url || "https://upload.wikimedia.org/wikipedia/commons/6/61/Lambang_Kopassus.svg"} 
                      alt={activeUnitDetail.unit_name} 
                      className="w-full h-full object-contain p-2 drop-shadow-[0_0_5px_rgba(0,255,0,0.5)]" 
                    />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-tactical-text tracking-tighter">{activeUnitDetail.unit_name}</h2>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-xs font-mono text-tactical-green bg-tactical-green/10 px-2 py-0.5 rounded border border-tactical-green/30 uppercase tracking-wider">
                        {activeUnitDetail.unit_type.replace(/_/g, ' ')}
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
                        {activeUnitDetail.commander_rank && (
                          <div className="text-[10px] font-mono text-tactical-muted uppercase">{activeUnitDetail.commander_rank}</div>
                        )}
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

                {/* Main Content Area with Tabs */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex border-b border-tactical-border mb-4">
                    <button 
                      onClick={() => setActiveTab('PERSONNEL')}
                      className={`px-6 py-2 font-mono text-xs font-bold transition-all ${activeTab === 'PERSONNEL' ? 'text-tactical-green border-b-2 border-tactical-green bg-tactical-green/5' : 'text-tactical-muted hover:text-tactical-text'}`}
                    >
                      <Users size={14} className="inline mr-2" /> PERSONEL
                    </button>
                    <button 
                      onClick={() => setActiveTab('LOGISTICS')}
                      className={`px-6 py-2 font-mono text-xs font-bold transition-all ${activeTab === 'LOGISTICS' ? 'text-tactical-cyan border-b-2 border-tactical-cyan bg-tactical-cyan/5' : 'text-tactical-muted hover:text-tactical-text'}`}
                    >
                      <Package size={14} className="inline mr-2" /> LOGISTIK
                    </button>
                  </div>

                  {activeTab === 'PERSONNEL' ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <h3 className="text-sm font-bold text-tactical-text font-mono flex items-center gap-2">
                            <Users size={16} className="text-tactical-cyan" /> DAFTAR ANGGOTA
                          </h3>
                          <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-tactical-muted" />
                            <input 
                              type="text"
                              placeholder="Cari Anggota..."
                              value={memberSearchQuery}
                              onChange={(e) => setMemberSearchQuery(e.target.value)}
                              className="bg-tactical-bg border border-tactical-border rounded pl-8 pr-3 py-1.5 text-[10px] font-mono text-tactical-text focus:outline-none focus:border-tactical-cyan w-48 transition-all"
                            />
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-tactical-muted uppercase">ACTIVE DUTY PERSONNEL</span>
                      </div>

                      <div className="tactical-glass tactical-border overflow-hidden">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-tactical-panel/80 text-[10px] font-mono text-tactical-muted uppercase border-b border-tactical-border">
                              <th className="px-4 py-3 font-medium">NAMA / NRP</th>
                              <th className="px-4 py-3 font-medium">PANGKAT</th>
                              <th className="px-4 py-3 font-medium">JABATAN</th>
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
                            ) : (() => {
                              const allMembers = [
                                ...(activeUnitDetail.commander_name ? [{
                                  id: -1,
                                  name: activeUnitDetail.commander_name,
                                  rank: activeUnitDetail.commander_rank,
                                  nrp: activeUnitDetail.commander_nrp || 'N/A',
                                  unit_role: 'Komandan Kesatuan',
                                  status: 'READY'
                                }] : []),
                                ...members
                              ].filter(m => 
                                m.name.toLowerCase().includes(memberSearchQuery.toLowerCase()) || 
                                m.nrp.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
                                (m.unit_role && m.unit_role.toLowerCase().includes(memberSearchQuery.toLowerCase()))
                              );

                              return allMembers.length > 0 ? (
                                allMembers.map((member) => (
                                  <tr key={member.id} className={`border-b border-tactical-border/30 hover:bg-tactical-green/5 transition-colors ${member.id === -1 ? 'bg-tactical-green/5' : ''}`}>
                                    <td className="px-4 py-3">
                                      <div className={`font-bold ${member.id === -1 ? 'text-tactical-green' : 'text-tactical-text'}`}>{member.name}</div>
                                      <div className="text-[10px] font-mono text-tactical-muted">{member.nrp}</div>
                                    </td>
                                    <td className="px-4 py-3 text-tactical-muted font-mono text-xs">{member.rank}</td>
                                    <td className="px-4 py-3">
                                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                                        member.id === -1 ? 'bg-tactical-green/10 text-tactical-green border-tactical-green/30' : 'bg-tactical-panel text-tactical-text border-tactical-border'
                                      }`}>
                                        {member.unit_role || 'Anggota'}
                                      </span>
                                    </td>
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
                                    TIDAK ADA ANGGOTA YANG COCOK
                                  </td>
                                </tr>
                              );
                            })()}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    /* Logistics Section */
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-sm font-bold text-tactical-text font-mono flex items-center gap-2">
                          <Truck size={16} className="text-tactical-cyan" /> INVENTARIS SATUAN
                        </h3>
                        <button 
                          onClick={() => setShowAddLogistics(true)}
                          className="px-3 py-1.5 bg-tactical-cyan/10 border border-tactical-cyan/30 text-tactical-cyan text-[10px] font-mono rounded hover:bg-tactical-cyan hover:text-tactical-bg transition-all flex items-center gap-2"
                        >
                          <Plus size={12} /> TAMBAH LOGISTIK
                        </button>
                      </div>

                      {showAddLogistics && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-4 tactical-glass border border-tactical-cyan/30 rounded-lg space-y-3"
                        >
                          <div className="grid grid-cols-2 gap-3">
                            <div className="col-span-2">
                              <label className="text-[10px] font-mono text-tactical-muted uppercase">Nama Barang</label>
                              <input 
                                type="text" 
                                value={newLogistics.item_name}
                                onChange={(e) => setNewLogistics({...newLogistics, item_name: e.target.value})}
                                className="w-full bg-tactical-bg border border-tactical-border rounded px-3 py-1.5 text-xs text-tactical-text focus:border-tactical-cyan outline-none"
                                placeholder="Contoh: Senjata SS2-V4"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-mono text-tactical-muted uppercase">Kategori</label>
                              <select 
                                value={newLogistics.category}
                                onChange={(e) => setNewLogistics({...newLogistics, category: e.target.value})}
                                className="w-full bg-tactical-bg border border-tactical-border rounded px-3 py-1.5 text-xs text-tactical-text focus:border-tactical-cyan outline-none"
                              >
                                <option value="Weaponry">Weaponry</option>
                                <option value="Ammunition">Ammunition</option>
                                <option value="Vehicles">Vehicles</option>
                                <option value="Communications">Communications</option>
                                <option value="Protection">Protection</option>
                                <option value="Medical">Medical</option>
                                <option value="Supplies">Supplies</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-[10px] font-mono text-tactical-muted uppercase">Jumlah</label>
                              <div className="flex gap-2">
                                <input 
                                  type="number" 
                                  value={newLogistics.quantity}
                                  onChange={(e) => setNewLogistics({...newLogistics, quantity: parseInt(e.target.value)})}
                                  className="w-full bg-tactical-bg border border-tactical-border rounded px-3 py-1.5 text-xs text-tactical-text focus:border-tactical-cyan outline-none"
                                />
                                <input 
                                  type="text" 
                                  value={newLogistics.unit}
                                  onChange={(e) => setNewLogistics({...newLogistics, unit: e.target.value})}
                                  className="w-20 bg-tactical-bg border border-tactical-border rounded px-3 py-1.5 text-xs text-tactical-text text-center focus:border-tactical-cyan outline-none"
                                  placeholder="unit"
                                />
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-end gap-2 pt-2 border-t border-tactical-border/30">
                            <button onClick={() => setShowAddLogistics(false)} className="px-3 py-1.5 text-[10px] font-mono text-tactical-muted hover:text-tactical-text">BATAL</button>
                            <button onClick={handleAddLogistics} className="px-4 py-1.5 bg-tactical-cyan text-tactical-bg text-[10px] font-mono font-bold rounded hover:bg-tactical-cyan/80 transition-colors">SIMPAN LOGISTIK</button>
                          </div>
                        </motion.div>
                      )}

                      <div className="tactical-glass tactical-border overflow-hidden">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-tactical-panel/80 text-[10px] font-mono text-tactical-muted uppercase border-b border-tactical-border">
                              <th className="px-4 py-3 font-medium">BARANG</th>
                              <th className="px-4 py-3 font-medium">KATEGORI</th>
                              <th className="px-4 py-3 font-medium">STOK</th>
                              <th className="px-4 py-3 font-medium text-right">AKSI</th>
                            </tr>
                          </thead>
                          <tbody className="text-sm">
                            {loadingLogistics ? (
                              <tr>
                                <td colSpan={4} className="px-4 py-10 text-center font-mono text-tactical-muted text-xs">
                                  FETCHING LOGISTICS DATA...
                                </td>
                              </tr>
                            ) : unitLogistics.length > 0 ? (
                              unitLogistics.map((item) => (
                                <tr key={item.id} className="border-b border-tactical-border/30 hover:bg-tactical-cyan/5 transition-colors">
                                  <td className="px-4 py-3">
                                    <div className="font-bold text-tactical-text">{item.item_name}</div>
                                    <div className="text-[10px] font-mono text-tactical-muted uppercase">ITEM-{item.id}</div>
                                  </td>
                                  <td className="px-4 py-3">
                                    <span className="text-[10px] font-mono text-tactical-muted uppercase">{item.category}</span>
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="font-mono text-xs">
                                      <span className={item.quantity < item.min_stock_level ? 'text-tactical-red font-bold underline decoration-dotted' : 'text-tactical-text'}>
                                        {item.quantity}
                                      </span>
                                      <span className="text-tactical-muted ml-1">{item.unit}</span>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 text-right">
                                    <button 
                                      onClick={() => handleDeleteLogistics(item.id)}
                                      className="p-1.5 text-tactical-red hover:bg-tactical-red/10 rounded transition-colors"
                                      title="Remove from Unit"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={4} className="px-4 py-10 text-center font-mono text-tactical-muted text-xs uppercase tracking-widest">
                                  BELUM ADA DATA LOGISTIK UNTUK SATUAN INI
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-tactical-border bg-tactical-panel/30 flex justify-between items-center">
                {activeUnitDetail && (
                  <div className="flex gap-3">
                    <button 
                      onClick={() => router.push(`/kesatuan/edit/${activeUnitDetail.id}`)}
                      className="px-4 py-2 bg-tactical-cyan/10 border border-tactical-cyan/30 text-tactical-cyan text-xs font-mono rounded flex items-center gap-2 hover:bg-tactical-cyan hover:text-tactical-bg transition-all"
                    >
                      <Edit size={14} /> EDIT DATA
                    </button>
                    <button 
                      onClick={() => handleDelete(activeUnitDetail.id)}
                      className="px-4 py-2 bg-tactical-red/10 border border-tactical-red/30 text-tactical-red text-xs font-mono rounded flex items-center gap-2 hover:bg-tactical-red hover:text-tactical-bg transition-all"
                    >
                      <Trash2 size={14} /> DELETE DATA
                    </button>
                  </div>
                )}
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
