"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Shield, MapPin, Target, Plus, ArrowLeft, Loader2, Search, User, X, AlertCircle, Crosshair, Package, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { addOpDalamNegeri, addOpLuarNegeri, searchPersonnel, getPersonnelAssignment, assignPersonnelToOp, addOperationLogistics, getLogistics } from "@/app/actions";
import dynamic from "next/dynamic";

const LocationPicker = dynamic(() => import("../units/LocationPicker"), { 
  ssr: false,
  loading: () => <div className="h-[300px] bg-tactical-bg flex items-center justify-center text-tactical-green font-mono text-xs uppercase">Connecting to Satellite...</div>
});

interface AddOperationFormProps {
  type: "DALAM_NEGERI" | "LUAR_NEGERI";
}

export default function AddOperationForm({ type }: AddOperationFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    coordinates: "",
    personnel: "0",
    status: "ACTIVE",
    readiness: "100",
    type: "",
    mission_objectives: ""
  });
  
  const [operationLogistics, setOperationLogistics] = useState<any[]>([
    { item_name: '', quantity: 1, unit: 'pcs' }
  ]);

  const [showMap, setShowMap] = useState(false);
  const [geocoding, setGeocoding] = useState(false);

  // Personnel State
  const [commander, setCommander] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTarget, setSearchTarget] = useState<"COMMANDER" | "MEMBER" | null>(null);

  // Move Modal State
  const [personnelToMove, setPersonnelToMove] = useState<any>(null);
  const [pendingAssignment, setPendingAssignment] = useState<any>(null);
  
  // Logistics Master Data
  const [masterLogistics, setMasterLogistics] = useState<any[]>([]);
  const [logisticsSearch, setLogisticsSearch] = useState<string[]>([]); // To track search strings for each row
  const [showLogisticsDropdown, setShowLogisticsDropdown] = useState<number | null>(null);

  useEffect(() => {
    async function fetchLogistics() {
      const logs = await getLogistics();
      // Group by name for the selection dropdown
      const grouped: any[] = [];
      const names = new Set();
      logs.forEach((l: any) => {
        if (!names.has(l.item_name)) {
          grouped.push(l);
          names.add(l.item_name);
        }
      });
      setMasterLogistics(grouped);
    }
    fetchLogistics();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length > 1) {
        setIsSearching(true);
        const results = await searchPersonnel(searchQuery);
        setSearchResults(results);
        setIsSearching(false);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSelectPersonnel = async (person: any) => {
    // Check if person is already assigned
    const assignment = await getPersonnelAssignment(person.id);
    
    if (assignment) {
      setPersonnelToMove({
        ...person,
        currentOp: assignment.op_name,
        currentLocation: assignment.op_location
      });
      setPendingAssignment({ person, target: searchTarget });
      return;
    }

    addPersonnel(person, searchTarget);
  };

  const addPersonnel = (person: any, target: any) => {
    if (target === "COMMANDER") {
      setCommander(person);
    } else {
      if (!members.find(m => m.id === person.id)) {
        setMembers([...members, person]);
      }
    }
    setSearchTarget(null);
    setSearchQuery("");
    setSearchResults([]);
  };

  const confirmMove = () => {
    if (pendingAssignment) {
      addPersonnel(pendingAssignment.person, pendingAssignment.target);
    }
    setPersonnelToMove(null);
    setPendingAssignment(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commander) {
      alert("Komandan Operasi harus dipilih.");
      return;
    }

    setIsSubmitting(true);
    try {
      const finalForce = (commander ? 1 : 0) + members.length;
      const res = type === "DALAM_NEGERI" 
        ? await addOpDalamNegeri({...formData, personnel: finalForce.toString()})
        : await addOpLuarNegeri({...formData, personnel: finalForce.toString()});
        
      if (res.success && res.id) {
        const opId = res.id;
        
        // Assign Commander
        await assignPersonnelToOp({
          personnelId: commander.id,
          opType: type,
          opId: opId,
          role: "KOMANDAN",
          moveIfAssigned: true // We already confirmed or it's new
        });

        // Assign Members
        for (const member of members) {
          await assignPersonnelToOp({
            personnelId: member.id,
            opType: type,
            opId: opId,
            role: "ANGGOTA",
            moveIfAssigned: true
          });
        }

        // Add Logistics
        const validLogistics = operationLogistics.filter(l => l.item_name.trim() !== '');
        if (validLogistics.length > 0) {
          await addOperationLogistics(opId, type, validLogistics);
        }

        router.push(type === "DALAM_NEGERI" ? "/gelar-operasi/dalam-negeri" : "/gelar-operasi/luar-negeri");
        router.refresh();
      } else {
        alert("Gagal: " + (res as any).error);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const backLink = type === "DALAM_NEGERI" ? "/gelar-operasi/dalam-negeri" : "/gelar-operasi/luar-negeri";

  return (
    <div className="w-full space-y-8">
      <div className="flex items-center gap-4 border-b border-tactical-border pb-6">
        <button 
          onClick={() => router.push(backLink)}
          className="p-2 hover:bg-tactical-border rounded-full text-tactical-muted hover:text-tactical-text transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-tactical-text tracking-tighter flex items-center gap-3">
            <Plus className="text-tactical-green" /> INITIALIZE {type === "DALAM_NEGERI" ? "DOMESTIC" : "INTERNATIONAL"} OPERATION
          </h2>
          <p className="text-tactical-muted font-mono text-xs mt-1 uppercase tracking-widest">
            Tactical Deployment Configuration Portal
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form (2 columns wide) */}
        <div className="lg:col-span-2 space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="tactical-glass tactical-border p-8"
          >
            <form id="opForm" onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-xs font-mono text-tactical-muted uppercase tracking-widest font-bold">Nama Satgas / Operasi</label>
                  <div className="relative">
                    <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-tactical-green" />
                    <input 
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-tactical-bg/50 border border-tactical-border rounded-lg p-2.5 pl-12 text-sm text-tactical-text focus:border-tactical-green outline-none font-mono transition-all"
                      placeholder="ENTER TASK FORCE NAME..."
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-mono text-tactical-muted uppercase tracking-widest font-bold">Lokasi Penugasan</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-tactical-red" />
                    <input 
                      required
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      className="w-full bg-tactical-bg/50 border border-tactical-border rounded-lg p-2.5 pl-12 text-sm text-tactical-text focus:border-tactical-green outline-none font-mono transition-all"
                      placeholder="ENTER GEOGRAPHIC LOCATION..."
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-mono text-tactical-muted uppercase tracking-widest font-bold">Tipe Operasi</label>
                  <div className="relative">
                    <Target className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-tactical-yellow" />
                    <input 
                      required
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                      className="w-full bg-tactical-bg/50 border border-tactical-border rounded-lg p-2.5 pl-12 text-sm text-tactical-text focus:border-tactical-green outline-none font-mono transition-all"
                      placeholder="ENTER MISSION TYPE..."
                    />
                  </div>
                </div>

                <div className="md:col-span-2 space-y-3">
                  <label className="text-xs font-mono text-tactical-muted uppercase tracking-widest font-bold">Koordinat GPS / Pin Lokasi</label>
                  <div className="flex gap-4">
                    <div className="relative flex-1">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-tactical-cyan" />
                      <input 
                        required
                        value={formData.coordinates}
                        onChange={(e) => setFormData({...formData, coordinates: e.target.value})}
                        className="w-full bg-tactical-bg/50 border border-tactical-border rounded-lg p-2.5 pl-12 text-sm text-tactical-text focus:border-tactical-green outline-none font-mono transition-all"
                        placeholder="LAT, LONG (e.g. -6.1754, 106.8272)"
                      />
                    </div>
                    <button 
                      type="button"
                      onClick={() => setShowMap(!showMap)}
                      className="px-6 py-2.5 bg-tactical-cyan/10 border border-tactical-cyan text-tactical-cyan text-[10px] font-bold font-mono rounded flex items-center gap-2 hover:bg-tactical-cyan/20 transition-all uppercase"
                    >
                      <Crosshair size={16} />
                      {showMap ? "Hide Map" : "Open Map"}
                    </button>
                  </div>

                  {showMap && (
                    <div className="pt-4 border-t border-tactical-border mt-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-mono text-tactical-muted uppercase">Tactical Grid Overlay</span>
                        <button 
                          type="button" 
                          onClick={() => setShowMap(false)}
                          className="text-[10px] font-mono text-tactical-red hover:underline uppercase"
                        >
                          Close Map Link
                        </button>
                      </div>
                      <div className="rounded-lg overflow-hidden border border-tactical-border h-[350px]">
                        <LocationPicker 
                          initialLocation={(() => {
                            if (formData.coordinates && formData.coordinates.includes(',')) {
                              const parts = formData.coordinates.split(',').map((p: string) => parseFloat(p.trim()));
                              if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
                                return [parts[0], parts[1]] as [number, number];
                              }
                            }
                            return [-0.7893, 113.9213];
                          })()} 
                          onLocationSelected={(lat, lng) => setFormData({...formData, coordinates: `${lat.toFixed(6)}, ${lng.toFixed(6)}`})}
                          hasLocation={!!formData.coordinates}
                          zoom={formData.coordinates ? 13 : 5}
                        />
                      </div>
                      <p className="text-[10px] font-mono text-tactical-muted mt-2 uppercase italic text-center">
                        * Click or drag the pin on the map to lock mission coordinates
                      </p>
                    </div>
                  )}
                </div>
                <div className="md:col-span-2 space-y-3">
                  <label className="text-xs font-mono text-tactical-muted uppercase tracking-widest font-bold">Mission Objectives</label>
                  <textarea 
                    required
                    value={formData.mission_objectives}
                    onChange={(e) => setFormData({...formData, mission_objectives: e.target.value})}
                    className="w-full bg-tactical-bg/50 border border-tactical-border rounded-lg p-3 text-sm text-tactical-text focus:border-tactical-green outline-none font-mono transition-all h-32 resize-none"
                    placeholder="DESCRIBE MISSION OBJECTIVES AND KEY RESULTS..."
                  />
                </div>

                <div className="md:col-span-2 space-y-4 pt-4 border-t border-tactical-border/30">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-mono text-tactical-muted uppercase tracking-widest font-bold flex items-center gap-2">
                      <Package className="text-tactical-cyan w-4 h-4" /> LOGISTIK & PERALATAN OPERASI
                    </label>
                    <button 
                      type="button"
                      onClick={() => setOperationLogistics([...operationLogistics, { item_name: '', quantity: 1, unit: 'pcs' }])}
                      className="text-[10px] font-mono text-tactical-cyan hover:underline flex items-center gap-1"
                    >
                      <Plus size={10} /> TAMBAH BARANG
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {operationLogistics.map((item, index) => (
                      <div key={index} className="flex gap-4 items-end animate-in fade-in slide-in-from-top-1">
                        <div className="flex-1 space-y-1 relative">
                          <input 
                            value={item.item_name}
                            onFocus={() => setShowLogisticsDropdown(index)}
                            onChange={(e) => {
                              const newLog = [...operationLogistics];
                              newLog[index].item_name = e.target.value;
                              setOperationLogistics(newLog);
                              setShowLogisticsDropdown(index);
                            }}
                            className="w-full bg-tactical-bg/30 border border-tactical-border rounded p-2 text-xs text-tactical-text focus:border-tactical-cyan outline-none font-mono"
                            placeholder="Cari Alutsista dari Logistik..."
                          />
                          <AnimatePresence>
                            {showLogisticsDropdown === index && (
                              <>
                                <div 
                                  className="fixed inset-0 z-10" 
                                  onClick={() => setShowLogisticsDropdown(null)} 
                                />
                                <motion.div 
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -10 }}
                                  className="absolute left-0 right-0 top-full mt-1 bg-tactical-panel border border-tactical-cyan/30 rounded shadow-xl z-20 max-h-48 overflow-y-auto custom-scrollbar"
                                >
                                  {masterLogistics
                                    .filter(ml => ml.item_name.toLowerCase().includes(item.item_name.toLowerCase()))
                                    .map((ml, i) => (
                                      <button
                                        key={i}
                                        type="button"
                                        onClick={() => {
                                          const newLog = [...operationLogistics];
                                          newLog[index].item_name = ml.item_name;
                                          newLog[index].unit = ml.unit;
                                          setOperationLogistics(newLog);
                                          setShowLogisticsDropdown(null);
                                        }}
                                        className="w-full p-2 text-left text-[11px] font-mono hover:bg-tactical-cyan/10 text-tactical-text border-b border-tactical-border/30 last:border-0"
                                      >
                                        <div className="flex justify-between items-center">
                                          <span>{ml.item_name}</span>
                                          <span className="text-[9px] text-tactical-muted bg-tactical-bg px-1 rounded">{ml.category}</span>
                                        </div>
                                      </button>
                                    ))
                                  }
                                  {masterLogistics.filter(ml => ml.item_name.toLowerCase().includes(item.item_name.toLowerCase())).length === 0 && (
                                    <div className="p-4 text-[10px] font-mono text-tactical-muted italic text-center">
                                      Tidak ada data logistik ditemukan
                                    </div>
                                  )}
                                </motion.div>
                              </>
                            )}
                          </AnimatePresence>
                        </div>
                        <div className="w-24 space-y-1">
                          <input 
                            type="number"
                            value={item.quantity}
                            onChange={(e) => {
                              const newLog = [...operationLogistics];
                              newLog[index].quantity = parseInt(e.target.value);
                              setOperationLogistics(newLog);
                            }}
                            className="w-full bg-tactical-bg/30 border border-tactical-border rounded p-2 text-xs text-tactical-text focus:border-tactical-cyan outline-none font-mono text-center"
                            placeholder="Qty"
                          />
                        </div>
                        <div className="w-20 space-y-1">
                          <input 
                            value={item.unit}
                            readOnly
                            className="w-full bg-tactical-bg/10 border border-tactical-border/50 rounded p-2 text-xs text-tactical-muted outline-none font-mono text-center"
                            placeholder="Unit"
                          />
                        </div>
                        <button 
                          type="button"
                          onClick={() => setOperationLogistics(operationLogistics.filter((_, i) => i !== index))}
                          className="p-2 text-tactical-muted hover:text-tactical-red transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </form>
          </motion.div>

          {/* Personnel Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Commander Section */}
            <div className="tactical-glass tactical-border p-6 space-y-4">
              <h3 className="text-sm font-bold text-tactical-text font-mono uppercase tracking-widest border-b border-tactical-border pb-2 flex justify-between items-center">
                Komandan Operasi
                {!commander && <button onClick={() => setSearchTarget("COMMANDER")} className="text-[10px] text-tactical-cyan hover:underline flex items-center gap-1"><Plus size={10} /> PILIH</button>}
              </h3>
              {commander ? (
                <div className="flex items-center justify-between p-3 bg-tactical-panel/50 border border-tactical-cyan/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-tactical-cyan/10 rounded-full flex items-center justify-center text-tactical-cyan border border-tactical-cyan/20">
                      <User size={20} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-tactical-text">{commander.name}</div>
                      <div className="text-[10px] font-mono text-tactical-muted uppercase">{commander.rank} | {commander.nrp}</div>
                    </div>
                  </div>
                  <button onClick={() => setCommander(null)} className="text-tactical-muted hover:text-tactical-red transition-colors">
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="text-xs text-tactical-muted italic font-mono text-center py-4 border border-dashed border-tactical-border rounded-lg">
                  No Commander Assigned
                </div>
              )}
            </div>

            {/* Members Section */}
            <div className="tactical-glass tactical-border p-6 space-y-4">
              <h3 className="text-sm font-bold text-tactical-text font-mono uppercase tracking-widest border-b border-tactical-border pb-2 flex justify-between items-center">
                Anggota Operasi ({members.length})
                <button onClick={() => setSearchTarget("MEMBER")} className="text-[10px] text-tactical-cyan hover:underline flex items-center gap-1"><Plus size={10} /> TAMBAH</button>
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {members.length > 0 ? (
                  members.map(member => (
                    <div key={member.id} className="flex items-center justify-between p-2 bg-tactical-panel/30 border border-tactical-border rounded flex-shrink-0">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-tactical-panel rounded-full flex items-center justify-center text-tactical-muted text-xs">
                          <User size={14} />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-tactical-text">{member.name}</div>
                          <div className="text-[9px] font-mono text-tactical-muted">{member.rank}</div>
                        </div>
                      </div>
                      <button onClick={() => setMembers(members.filter(m => m.id !== member.id))} className="text-tactical-muted hover:text-tactical-red transition-colors">
                        <X size={14} />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-tactical-muted italic font-mono text-center py-4 border border-dashed border-tactical-border rounded-lg">
                    No Members Assigned
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Sidebar */}
        <div className="space-y-8">
          <div className="tactical-glass border-l-4 border-l-tactical-green p-6">
            <h3 className="text-sm font-bold text-tactical-text font-mono mb-4 uppercase">Operational Readiness</h3>
            <div className="space-y-4">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-tactical-muted">Status</span>
                <span className="text-tactical-green font-bold">READY</span>
              </div>
              <div className="flex justify-between text-xs font-mono">
                <span className="text-tactical-muted">Chain of Command</span>
                <span className={commander ? "text-tactical-green" : "text-tactical-red"}>{commander ? "ESTABLISHED" : "PENDING"}</span>
              </div>
              <div className="flex justify-between text-xs font-mono">
                <span className="text-tactical-muted">Deployment Force</span>
                <span className="text-tactical-cyan">{(commander ? 1 : 0) + members.length} Total Personnel</span>
              </div>
            </div>
            <div className="mt-8">
              <button 
                form="opForm"
                disabled={isSubmitting || !commander}
                className="w-full py-4 bg-tactical-green text-black font-black text-sm font-mono rounded hover:bg-tactical-green/80 transition-all flex items-center justify-center gap-2 uppercase tracking-widest disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Target size={20} />}
                INITIALIZE DEPLOYMENT
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Personnel Search Overlay */}
      <AnimatePresence>
        {searchTarget && (
          <div className="fixed inset-0 z-[1000] flex items-start justify-center p-4 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSearchTarget(null)}
              className="fixed inset-0 bg-black/90 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl tactical-glass tactical-border p-8 my-8"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold text-tactical-text flex items-center gap-2 uppercase tracking-tighter">
                    <Search className="text-tactical-cyan" /> CARI PERSONIL
                  </h3>
                  <p className="text-xs font-mono text-tactical-muted uppercase mt-1">Assign to {searchTarget === 'COMMANDER' ? 'Commander' : 'Member'} Role</p>
                </div>
                <button onClick={() => setSearchTarget(null)} className="text-tactical-muted hover:text-tactical-red">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-tactical-muted" />
                  <input 
                    autoFocus
                    placeholder="Masukkan Nama atau NRP..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-tactical-bg border border-tactical-border rounded-lg p-3 pl-10 text-sm text-tactical-text focus:border-tactical-cyan outline-none font-mono"
                  />
                </div>

                <div className="space-y-2 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                  {isSearching ? (
                    <div className="flex justify-center py-10">
                      <Loader2 className="animate-spin text-tactical-cyan" size={32} />
                    </div>
                  ) : searchResults.length > 0 ? (
                    searchResults.map(person => (
                      <button 
                        key={person.id}
                        onClick={() => handleSelectPersonnel(person)}
                        className="w-full flex items-center justify-between p-4 bg-tactical-panel/50 border border-tactical-border rounded-lg hover:border-tactical-cyan hover:bg-tactical-cyan/5 transition-all text-left"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-tactical-bg rounded-full flex items-center justify-center text-tactical-muted">
                            <User size={20} />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-tactical-text">{person.name}</div>
                            <div className="text-[10px] font-mono text-tactical-muted uppercase">{person.rank} | {person.nrp}</div>
                            <div className="text-[10px] font-mono text-tactical-cyan mt-0.5">{person.specialization}</div>
                          </div>
                        </div>
                        <Plus size={20} className="text-tactical-muted" />
                      </button>
                    ))
                  ) : searchQuery.length > 1 ? (
                    <div className="text-center py-10 text-tactical-muted font-mono text-xs uppercase">No Results Found</div>
                  ) : (
                    <div className="text-center py-10 text-tactical-muted font-mono text-xs uppercase">Type to Search Personnel...</div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Move Confirmation Modal */}
      <AnimatePresence>
        {personnelToMove && (
          <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/95 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-md tactical-glass border-2 border-tactical-yellow p-8 text-center"
            >
              <AlertCircle size={48} className="text-tactical-yellow mx-auto mb-4" />
              <h3 className="text-xl font-bold text-tactical-text uppercase tracking-tighter mb-2">DUPLICATE ASSIGNMENT DETECTED</h3>
              <p className="text-sm text-tactical-text font-mono mb-6">
                Personil <span className="text-tactical-yellow font-bold">{personnelToMove.name}</span> saat ini sedang menjalankan operasi di:
                <br />
                <span className="text-tactical-cyan uppercase mt-2 block">{personnelToMove.currentOp} ({personnelToMove.currentLocation})</span>
              </p>
              <div className="space-y-3">
                <p className="text-xs text-tactical-muted uppercase tracking-widest">Apakah Anda ingin memindahkan personil tersebut ke Gelar Operasi saat ini?</p>
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <button 
                    onClick={() => { setPersonnelToMove(null); setPendingAssignment(null); }}
                    className="py-3 border border-tactical-border rounded text-xs font-mono text-tactical-text hover:bg-tactical-panel transition-all"
                  >
                    BATAL
                  </button>
                  <button 
                    onClick={confirmMove}
                    className="py-3 bg-tactical-yellow text-black font-bold text-xs font-mono rounded hover:bg-tactical-yellow/80 transition-all uppercase"
                  >
                    PINDAHKAN
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
