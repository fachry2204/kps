"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Shield, MapPin, Target, ArrowLeft, Loader2, Search, User, X, AlertCircle, Save, Plus, Edit } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateOpDalamNegeri, updateOpLuarNegeri, searchPersonnel, getPersonnelAssignment, assignPersonnelToOp, getOpAssignments } from "@/app/actions";
import dynamic from "next/dynamic";
import { Crosshair } from "lucide-react";

const LocationPicker = dynamic(() => import("../units/LocationPicker"), { 
  ssr: false,
  loading: () => <div className="h-[300px] bg-tactical-bg flex items-center justify-center text-tactical-green font-mono text-xs uppercase">Connecting to Satellite...</div>
});

interface EditOperationFormProps {
  id: string;
  type: "DALAM_NEGERI" | "LUAR_NEGERI";
  initialData: any;
}

export default function EditOperationForm({ id, type, initialData }: EditOperationFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: initialData?.operation_name || initialData?.name || "",
    location: initialData?.location || "",
    coordinates: initialData?.coordinates || "",
    personnel: initialData?.personnel || 0,
    status: initialData?.status || "ACTIVE",
    type: initialData?.type || "",
    mission_objectives: initialData?.mission_objectives || "",
    readiness: 100
  });

  const [showMap, setShowMap] = useState(false);

  // Personnel State
  const [commander, setCommander] = useState<any>(initialData?.commander || null);
  const [members, setMembers] = useState<any[]>(initialData?.members || []);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTarget, setSearchTarget] = useState<"COMMANDER" | "MEMBER" | null>(null);

  // Move Modal State
  const [personnelToMove, setPersonnelToMove] = useState<any>(null);
  const [pendingAssignment, setPendingAssignment] = useState<any>(null);

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
    const assignment = await getPersonnelAssignment(person.id);
    
    // Check if person is already in THIS operation
    if (commander?.id === person.id || members.find(m => m.id === person.id)) {
      alert("Personil sudah terdaftar dalam operasi ini.");
      setSearchTarget(null);
      setSearchQuery("");
      return;
    }

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
    setIsSubmitting(true);
    try {
      const finalForce = (commander ? 1 : 0) + members.length;
      const res = type === "DALAM_NEGERI" 
        ? await updateOpDalamNegeri(Number(id), {...formData, personnel: finalForce.toString()})
        : await updateOpLuarNegeri(Number(id), {...formData, personnel: finalForce.toString()});
        
      if (res.success) {
        // Re-assign Commander if changed (In a real app, you'd check if changed, here we just re-run)
        if (commander) {
          await assignPersonnelToOp({
            personnelId: commander.id,
            opType: type,
            opId: Number(id),
            role: "KOMANDAN",
            moveIfAssigned: true
          });
        }

        // Assign Members
        for (const member of members) {
          await assignPersonnelToOp({
            personnelId: member.id,
            opType: type,
            opId: Number(id),
            role: "ANGGOTA",
            moveIfAssigned: true
          });
        }

        router.push(type === "DALAM_NEGERI" ? `/gelar-operasi/dalam-negeri/detail/${id}` : `/gelar-operasi/luar-negeri/detail/${id}`);
        router.refresh();
      } else {
        alert("Gagal: " + res.error);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const backLink = type === "DALAM_NEGERI" ? `/gelar-operasi/dalam-negeri/detail/${id}` : `/gelar-operasi/luar-negeri/detail/${id}`;

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
            <Edit className="text-tactical-cyan" /> EDIT DATA OPERASI
          </h2>
          <p className="text-tactical-muted font-mono text-xs mt-1 uppercase tracking-widest">
            Modify Tactical Deployment Parameters
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="tactical-glass tactical-border p-8"
          >
            <form id="editForm" onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-xs font-mono text-tactical-muted uppercase tracking-widest font-bold">Nama Satgas / Operasi</label>
                  <input 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-tactical-bg/50 border border-tactical-border rounded-lg p-2.5 text-sm text-tactical-text focus:border-tactical-cyan outline-none font-mono"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-mono text-tactical-muted uppercase tracking-widest font-bold">Lokasi Penugasan</label>
                  <input 
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full bg-tactical-bg/50 border border-tactical-border rounded-lg p-2.5 text-sm text-tactical-text focus:border-tactical-cyan outline-none font-mono"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-mono text-tactical-muted uppercase tracking-widest font-bold">Tipe Operasi</label>
                  <input 
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full bg-tactical-bg/50 border border-tactical-border rounded-lg p-2.5 text-sm text-tactical-text focus:border-tactical-cyan outline-none font-mono"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-mono text-tactical-muted uppercase tracking-widest font-bold">Status</label>
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full bg-tactical-bg/50 border border-tactical-border rounded-lg p-2.5 text-sm text-tactical-text focus:border-tactical-cyan outline-none font-mono appearance-none"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="STANDBY">STANDBY</option>
                    <option value="MONITORING">MONITORING</option>
                    <option value="ON_ROTATION">ON ROTATION</option>
                  </select>
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
                        className="w-full bg-tactical-bg/50 border border-tactical-border rounded-lg p-2.5 pl-12 text-sm text-tactical-text focus:border-tactical-cyan outline-none font-mono transition-all"
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
              </div>
            </form>
          </motion.div>

          <div className="grid grid-cols-1 gap-8">
            <div className="tactical-glass tactical-border p-6 space-y-4">
              <h3 className="text-sm font-bold text-tactical-text font-mono uppercase tracking-widest border-b border-tactical-border pb-2 flex justify-between items-center">
                Komandan Operasi
                <button onClick={() => setSearchTarget("COMMANDER")} className="text-[10px] text-tactical-cyan hover:underline flex items-center gap-1"><Plus size={10} /> UBAH</button>
              </h3>
              {commander ? (
                <div className="flex items-center justify-between p-3 bg-tactical-panel/50 border border-tactical-cyan/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <User size={20} className="text-tactical-cyan" />
                    <div>
                      <div className="text-sm font-bold text-tactical-text">{commander.name}</div>
                      <div className="text-[10px] font-mono text-tactical-muted uppercase">{commander.rank}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-tactical-muted italic text-center py-4">No Commander</div>
              )}
            </div>

            <div className="tactical-glass tactical-border p-6 space-y-4">
              <h3 className="text-sm font-bold text-tactical-text font-mono uppercase tracking-widest border-b border-tactical-border pb-2 flex justify-between items-center">
                Anggota Operasi ({members.length})
                <button onClick={() => setSearchTarget("MEMBER")} className="text-[10px] text-tactical-cyan hover:underline flex items-center gap-1"><Plus size={10} /> TAMBAH</button>
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {members.map(member => (
                  <div key={member.id} className="flex items-center justify-between p-2 bg-tactical-panel/30 border border-tactical-border rounded">
                    <div className="text-xs font-bold text-tactical-text">{member.name} <span className="text-[9px] text-tactical-muted ml-2 font-normal">{member.rank}</span></div>
                    <button onClick={() => setMembers(members.filter(m => m.id !== member.id))} className="text-tactical-muted hover:text-tactical-red">
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="tactical-glass border-l-4 border-l-tactical-cyan p-6 bg-tactical-cyan/5">
            <h3 className="text-sm font-bold text-tactical-text font-mono mb-4 uppercase">Update Command</h3>
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-tactical-muted">Deployment Force</span>
                <span className="text-tactical-cyan font-bold">{(commander ? 1 : 0) + members.length} Total Personnel</span>
              </div>
              <div className="flex justify-between text-xs font-mono">
                <span className="text-tactical-muted">Status</span>
                <span className="text-tactical-cyan">{formData.status}</span>
              </div>
            </div>
            <p className="text-xs text-tactical-muted font-mono mb-6 italic border-t border-tactical-cyan/20 pt-4">Ensure all personnel assignments are validated before confirming updates.</p>
            <button 
              form="editForm"
              disabled={isSubmitting}
              className="w-full py-4 bg-tactical-cyan text-black font-black text-sm font-mono rounded hover:bg-tactical-cyan/80 transition-all flex items-center justify-center gap-2 uppercase tracking-widest disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              SAVE CHANGES
            </button>
          </div>
        </div>
      </div>

      {/* Overlays (Search & Move Confirmation) - Same as AddOperationForm */}
      {/* ... Omitting search/move logic here for brevity in this scratch, but I will include it in the final file ... */}
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
                <h3 className="text-xl font-bold text-tactical-text uppercase tracking-tighter flex items-center gap-2"><Search className="text-tactical-cyan" /> CARI PERSONIL</h3>
                <button onClick={() => setSearchTarget(null)} className="text-tactical-muted hover:text-tactical-red"><X size={24} /></button>
              </div>
              <div className="space-y-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-tactical-muted" />
                  <input autoFocus placeholder="Nama atau NRP..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-tactical-bg border border-tactical-border rounded-lg p-3 pl-10 text-sm text-tactical-text focus:border-tactical-cyan outline-none font-mono" />
                </div>
                <div className="space-y-2 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                  {isSearching ? <div className="flex justify-center py-10"><Loader2 className="animate-spin text-tactical-cyan" size={32} /></div> : searchResults.map(person => (
                    <button key={person.id} onClick={() => handleSelectPersonnel(person)} className="w-full flex items-center justify-between p-4 bg-tactical-panel/50 border border-tactical-border rounded-lg hover:border-tactical-cyan hover:bg-tactical-cyan/5 transition-all text-left">
                      <div><div className="text-sm font-bold text-tactical-text">{person.name}</div><div className="text-[10px] font-mono text-tactical-muted uppercase">{person.rank} | {person.nrp}</div></div>
                      <Plus size={20} className="text-tactical-muted" />
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {personnelToMove && (
          <div className="fixed inset-0 z-[1100] flex items-start justify-center p-4 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="fixed inset-0 bg-black/95 backdrop-blur-md" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.9 }} 
              className="relative w-full max-w-md tactical-glass border-2 border-tactical-yellow p-8 text-center my-8"
            >
              <AlertCircle size={48} className="text-tactical-yellow mx-auto mb-4" />
              <h3 className="text-xl font-bold text-tactical-text uppercase mb-2">PINDAHKAN PERSONIL?</h3>
              <p className="text-sm text-tactical-text font-mono mb-6">Personil <span className="text-tactical-yellow font-bold">{personnelToMove.name}</span> sedang di: <br/><span className="text-tactical-cyan uppercase">{personnelToMove.currentOp}</span></p>
              <div className="grid grid-cols-2 gap-4"><button onClick={() => { setPersonnelToMove(null); setPendingAssignment(null); }} className="py-3 border border-tactical-border rounded text-xs font-mono text-tactical-text hover:bg-tactical-panel">BATAL</button><button onClick={confirmMove} className="py-3 bg-tactical-yellow text-black font-bold text-xs font-mono rounded hover:bg-tactical-yellow/80 uppercase">PINDAHKAN</button></div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
