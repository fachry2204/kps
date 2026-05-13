"use client";

import { ShieldAlert, AlertTriangle, Lock, FileText, Brain, Eye, Edit2, Trash2, MapPin, Crosshair, Shield, Activity } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { useState } from "react";
import { addIntelReport, deleteIntelReport, updateIntelReport } from "@/app/actions";
import { useRouter } from "next/navigation";
import { X, Save, Loader2, Plus, Info } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";

const LocationPicker = dynamic(() => import("../units/LocationPicker"), { 
  ssr: false,
  loading: () => <div className="h-[300px] bg-tactical-bg flex items-center justify-center text-tactical-green font-mono text-xs uppercase">Connecting to Satellite...</div>
});

interface IntelClientProps {
  reports: any[];
}

export default function IntelClient({ reports }: IntelClientProps) {
  const router = useRouter();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    threat_level: "STABLE",
    content: "",
    location_tag: "",
    coordinates: "",
    is_classified: true
  });

  const [showMap, setShowMap] = useState(false);

  const resetForm = () => {
    setFormData({ title: "", threat_level: "STABLE", content: "", location_tag: "", coordinates: "", is_classified: true });
    setEditId(null);
    setShowMap(false);
  };

  const handleOpenAdd = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleOpenEdit = (report: any) => {
    setFormData({
      title: report.title,
      threat_level: report.threat_level,
      content: report.content,
      location_tag: report.location_tag,
      coordinates: report.coordinates || "",
      is_classified: !!report.is_classified
    });
    setEditId(report.id);
    setShowAddModal(true);
  };

  const handleOpenView = (report: any) => {
    setSelectedReport(report);
    setShowViewModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = editId 
        ? await updateIntelReport(editId, formData)
        : await addIntelReport(formData);
        
      if (res.success) {
        setShowAddModal(false);
        resetForm();
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

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus laporan intelijen ini?")) return;
    try {
      const res = await deleteIntelReport(id);
      if (res.success) {
        router.refresh();
      } else {
        alert("Gagal: " + res.error);
      }
    } catch (error) {
      console.error(error);
    }
  };
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
          <button 
            onClick={handleOpenAdd}
            className="px-4 py-2 flex items-center gap-2 text-xs font-mono bg-tactical-red/10 text-tactical-red border border-tactical-red rounded hover:bg-tactical-red/20 transition-colors"
          >
            <ShieldAlert className="w-4 h-4" />
            TAMBAHKAN DATA INTELEGEN
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "SEVERE", color: "text-tactical-red", bg: "bg-tactical-red/10", border: "border-tactical-red/30", icon: ShieldAlert },
          { label: "HIGH", color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/30", icon: AlertTriangle },
          { label: "ELEVATED", color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/30", icon: Activity },
          { label: "GUARDED", color: "text-tactical-cyan", bg: "bg-tactical-cyan/10", border: "border-tactical-cyan/30", icon: Shield },
          { label: "STABLE", color: "text-tactical-green", bg: "bg-tactical-green/10", border: "border-tactical-green/30", icon: Shield }
        ].map((stat, i) => {
          const count = reports.filter(r => r.threat_level === stat.label).length;
          return (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={stat.label} 
              className={`tactical-glass border ${stat.border} p-4 relative overflow-hidden group`}
            >
              <div className={`absolute -right-2 -top-2 opacity-10 group-hover:opacity-20 transition-opacity ${stat.color}`}>
                <stat.icon size={48} />
              </div>
              <div className="text-[10px] font-mono text-tactical-muted mb-1 uppercase tracking-widest">{stat.label}</div>
              <div className={`text-2xl font-bold ${stat.color}`}>{count}</div>
              <div className="text-[9px] font-mono text-tactical-muted mt-1 uppercase">Reports Active</div>
              <div className={`mt-2 h-1 w-full bg-tactical-panel rounded-full overflow-hidden`}>
                <div className={`h-full ${stat.color.replace('text-', 'bg-')} transition-all duration-1000`} style={{ width: `${(count / (reports.length || 1)) * 100}%` }}></div>
              </div>
            </motion.div>
          );
        })}
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
                      <button 
                        onClick={() => handleOpenView(row)}
                        className="p-1.5 text-tactical-cyan hover:bg-tactical-cyan/20 hover:text-white rounded transition-colors" 
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleOpenEdit(row)}
                        className="p-1.5 text-yellow-500 hover:bg-yellow-500/20 hover:text-yellow-400 rounded transition-colors" 
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(row.id)}
                        className="p-1.5 text-tactical-red hover:bg-tactical-red/20 hover:text-red-400 rounded transition-colors" 
                        title="Delete"
                      >
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

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] overflow-y-auto custom-scrollbar bg-black/80 backdrop-blur-sm">
            <div className="min-h-full flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-2xl tactical-glass tactical-border p-8 my-8"
              >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-tactical-text uppercase tracking-tighter flex items-center gap-2">
                  <ShieldAlert className="text-tactical-red" /> {editId ? "UPDATE INTEL REPORT" : "INITIALIZE INTEL REPORT"}
                </h3>
                <button onClick={() => setShowAddModal(false)} className="text-tactical-muted hover:text-tactical-red">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-tactical-muted uppercase">Laporan / Judul</label>
                    <input 
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full bg-tactical-bg border border-tactical-border rounded p-2.5 text-sm text-tactical-text focus:border-tactical-red outline-none font-mono"
                      placeholder="MISSION TITLE..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-tactical-muted uppercase">Threat Level</label>
                    <select 
                      value={formData.threat_level}
                      onChange={(e) => setFormData({...formData, threat_level: e.target.value})}
                      className="w-full bg-tactical-bg border border-tactical-border rounded p-2.5 text-sm text-tactical-text focus:border-tactical-red outline-none font-mono appearance-none"
                    >
                      <option value="STABLE">STABLE</option>
                      <option value="GUARDED">GUARDED</option>
                      <option value="ELEVATED">ELEVATED</option>
                      <option value="HIGH">HIGH</option>
                      <option value="SEVERE">SEVERE</option>
                    </select>
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-mono text-tactical-muted uppercase">Alamat Lengkap</label>
                    <textarea 
                      required
                      value={formData.location_tag}
                      onChange={(e) => setFormData({...formData, location_tag: e.target.value})}
                      className="w-full bg-tactical-bg border border-tactical-border rounded p-2.5 text-sm text-tactical-text focus:border-tactical-red outline-none font-mono h-24 resize-none"
                      placeholder="ENTER FULL ADDRESS..."
                    />
                  </div>

                  <div className="md:col-span-2 space-y-3">
                    <label className="text-[10px] font-mono text-tactical-muted uppercase font-bold">Koordinat GPS / Pin Lokasi</label>
                    <div className="flex gap-4">
                      <div className="relative flex-1">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-tactical-cyan" />
                        <input 
                          value={formData.coordinates}
                          onChange={(e) => setFormData({...formData, coordinates: e.target.value})}
                          className="w-full bg-tactical-bg/50 border border-tactical-border rounded p-2.5 pl-12 text-sm text-tactical-text focus:border-tactical-red outline-none font-mono transition-all"
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
                        <div className="rounded-lg overflow-hidden border border-tactical-border h-[300px]">
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
                          * Click or drag the pin on the map to lock intelligence coordinates
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-tactical-muted uppercase">Detail Laporan / Isi</label>
                  <textarea 
                    required
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    className="w-full bg-tactical-bg border border-tactical-border rounded p-2.5 text-sm text-tactical-text focus:border-tactical-red outline-none font-mono h-32 resize-none"
                    placeholder="ENTER MISSION INTELLIGENCE DETAILS..."
                  />
                </div>

                <div className="pt-4 flex justify-end">
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-3 bg-tactical-red text-white font-bold text-xs font-mono rounded hover:bg-tactical-red/80 transition-all flex items-center gap-2 uppercase tracking-widest disabled:opacity-50"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                    ENCRYPT & SAVE DATA
                  </button>
                </div>
              </form>
              </motion.div>
            </div>
          </div>
        )}

        {showViewModal && selectedReport && (
          <div className="fixed inset-0 z-[100] overflow-y-auto custom-scrollbar bg-black/80 backdrop-blur-sm">
            <div className="min-h-full flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-2xl tactical-glass tactical-border p-8 my-8"
              >
              <div className="flex justify-between items-center mb-6 border-b border-tactical-border pb-4">
                <div>
                  <h3 className="text-xl font-bold text-tactical-text uppercase tracking-tighter flex items-center gap-2">
                    <Info className="text-tactical-cyan" /> INTEL REPORT DETAILS
                  </h3>
                  <p className="text-[10px] font-mono text-tactical-muted mt-1">CODE: INT-24-00{selectedReport.id} | {format(new Date(selectedReport.created_at), 'dd MMM yyyy')}</p>
                </div>
                <button onClick={() => setShowViewModal(false)} className="text-tactical-muted hover:text-tactical-red">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-tactical-panel border border-tactical-border rounded">
                    <div className="text-[10px] font-mono text-tactical-muted uppercase mb-1">Judul Laporan</div>
                    <div className="text-sm font-bold text-tactical-text">{selectedReport.title}</div>
                  </div>
                  <div className="p-3 bg-tactical-panel border border-tactical-border rounded">
                    <div className="text-[10px] font-mono text-tactical-muted uppercase mb-1">Threat Level</div>
                    <div className={`text-sm font-bold ${
                      selectedReport.threat_level === 'SEVERE' || selectedReport.threat_level === 'HIGH' ? 'text-tactical-red' :
                      selectedReport.threat_level === 'ELEVATED' ? 'text-yellow-500' :
                      'text-tactical-green'
                    }`}>{selectedReport.threat_level}</div>
                  </div>
                  <div className="p-3 bg-tactical-panel border border-tactical-border rounded">
                    <div className="text-[10px] font-mono text-tactical-muted uppercase mb-1">Lokasi / Tag</div>
                    <div className="text-sm font-bold text-tactical-text">{selectedReport.location_tag}</div>
                  </div>
                  <div className="p-3 bg-tactical-panel border border-tactical-border rounded">
                    <div className="text-[10px] font-mono text-tactical-muted uppercase mb-1">Security Status</div>
                    <div className="text-sm font-bold text-tactical-red uppercase">{selectedReport.is_classified ? "TOP SECRET / CLASSIFIED" : "RESTRICTED"}</div>
                  </div>
                </div>

                <div className="p-4 bg-tactical-bg border border-tactical-border rounded">
                  <div className="text-[10px] font-mono text-tactical-muted uppercase mb-2">Detailed Report Content</div>
                  <div className="text-sm text-tactical-text font-mono leading-relaxed whitespace-pre-wrap">{selectedReport.content}</div>
                </div>

                {selectedReport.coordinates && (
                  <div className="space-y-3">
                    <div className="text-[10px] font-mono text-tactical-muted uppercase flex justify-between">
                      <span>Tactical Grid View</span>
                      <span className="text-tactical-cyan">{selectedReport.coordinates}</span>
                    </div>
                    <div className="h-[300px] rounded border border-tactical-border overflow-hidden">
                      <LocationPicker 
                        initialLocation={selectedReport.coordinates.split(',').map(Number) as [number, number]} 
                        onLocationSelected={() => {}}
                        hasLocation={true}
                        zoom={13}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-8 flex justify-end">
                <button 
                  onClick={() => setShowViewModal(false)}
                  className="px-6 py-2 border border-tactical-border text-tactical-text font-bold text-xs font-mono rounded hover:bg-tactical-border/50 transition-all uppercase"
                >
                  Close Detail
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
      </AnimatePresence>
    </div>
  );
}
