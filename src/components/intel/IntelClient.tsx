"use client";

import { ShieldAlert, AlertTriangle, Lock, FileText, Brain, Eye, Edit2, Trash2, MapPin, Crosshair, Shield, Activity } from "lucide-react";
import { motion } from "framer-motion";
import { format, subDays, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import { useState } from "react";
import { addIntelReport, deleteIntelReport, updateIntelReport } from "@/app/actions";
import { useRouter } from "next/navigation";
import { X, Save, Loader2, Plus, Info } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import DocumentUploader from "../common/DocumentUploader";
import DocumentList from "../common/DocumentList";

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
    is_classified: true,
    lapsus: "",
    laporan_periodik: "",
    prediksi_ancaman: ""
  });

  const [showMap, setShowMap] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [dateFilter, setDateFilter] = useState("ALL");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [refreshDocs, setRefreshDocs] = useState(0);

  const resetForm = () => {
    setFormData({ 
      title: "", 
      threat_level: "STABLE", 
      content: "", 
      location_tag: "", 
      coordinates: "", 
      is_classified: true,
      lapsus: "",
      laporan_periodik: "",
      prediksi_ancaman: ""
    });
    setEditId(null);
    setShowMap(false);
    setDateFilter("ALL");
    setDateRange({ start: "", end: "" });
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
      is_classified: !!report.is_classified,
      lapsus: report.lapsus || "",
      laporan_periodik: report.laporan_periodik || "",
      prediksi_ancaman: report.prediksi_ancaman || ""
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
            DASHBOARD INTELIJEN
          </h2>
          <p className="text-tactical-muted font-mono text-sm mt-1">ANALISIS ANCAMAN & KOMUNIKASI TERENKRIPSI (DATABASE AKTIF)</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "KRITIS", original: "SEVERE", color: "text-tactical-red", bg: "bg-tactical-red/10", border: "border-tactical-red/30", icon: ShieldAlert },
          { label: "TINGGI", original: "HIGH", color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/30", icon: AlertTriangle },
          { label: "MENINGKAT", original: "ELEVATED", color: "text-tactical-yellow", bg: "bg-tactical-yellow/10", border: "border-tactical-yellow/30", icon: Activity },
          { label: "TERJAGA", original: "GUARDED", color: "text-tactical-cyan", bg: "bg-tactical-cyan/10", border: "border-tactical-cyan/30", icon: Shield },
          { label: "STABIL", original: "STABLE", color: "text-status-stabil", bg: "bg-status-stabil/10", border: "border-status-stabil/30", icon: Shield }
        ].map((stat, i) => {
          const count = reports.filter(r => r.threat_level === stat.original || r.threat_level === stat.label).length;
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
              <div className="text-[9px] font-mono text-tactical-muted mt-1 uppercase">Laporan Aktif</div>
              <div className={`mt-2 h-1 w-full bg-tactical-panel rounded-full overflow-hidden`}>
                <div className={`h-full ${stat.color.replace('text-', 'bg-')} transition-all duration-1000`} style={{ width: `${(count / (reports.length || 1)) * 100}%` }}></div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Intel Reports */}
      <div className="tactical-glass tactical-border p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-tactical-border pb-4">
          <h3 className="text-tactical-text font-bold font-mono text-sm flex items-center gap-2">
            <FileText className="w-4 h-4" />
            LAPORAN INTELIJEN TERKINI
          </h3>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Smart Search */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-tactical-muted group-focus-within:text-tactical-cyan transition-colors">
                <Brain size={14} />
              </div>
              <input 
                type="text" 
                placeholder="SMART SEARCH..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-tactical-bg border border-tactical-border rounded px-4 py-2 pl-10 text-xs font-mono text-tactical-text focus:border-tactical-cyan outline-none w-full md:w-64 transition-all uppercase placeholder:text-tactical-muted/50 tracking-wider"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-tactical-bg border border-tactical-border rounded px-4 py-2 pr-10 text-xs font-mono text-tactical-text focus:border-tactical-cyan outline-none appearance-none cursor-pointer uppercase transition-all tracking-wider"
              >
                <option value="ALL">SEMUA STATUS</option>
                <option value="KRITIS">KRITIS</option>
                <option value="TINGGI">TINGGI</option>
                <option value="MENINGKAT">MENINGKAT</option>
                <option value="TERJAGA">TERJAGA</option>
                <option value="STABIL">STABIL</option>
              </select>
              <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none text-tactical-muted">
                <Shield size={12} />
              </div>
            </div>

            {/* Category Filter */}
            <div className="relative">
              <select 
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-tactical-bg border border-tactical-border rounded px-4 py-2 pr-10 text-xs font-mono text-tactical-text focus:border-tactical-cyan outline-none appearance-none cursor-pointer uppercase transition-all tracking-wider"
              >
                <option value="ALL">SEMUA KATEGORI</option>
                <option value="DALAM_NEGERI">DALAM NEGERI</option>
                <option value="LUAR_NEGERI">LUAR NEGERI</option>
              </select>
              <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none text-tactical-muted">
                <MapPin size={12} />
              </div>
            </div>

            {/* Date Filter */}
            <div className="flex items-center gap-2">
              {dateFilter !== "CUSTOM" ? (
                <div className="relative">
                  <select 
                    value={dateFilter}
                    onChange={(e) => {
                      if (e.target.value === "CUSTOM") {
                        setDateFilter("CUSTOM");
                      } else {
                        setDateFilter(e.target.value);
                      }
                    }}
                    className="bg-tactical-bg border border-tactical-border rounded px-4 py-2 pr-10 text-xs font-mono text-tactical-text focus:border-tactical-cyan outline-none appearance-none cursor-pointer uppercase transition-all tracking-wider"
                  >
                    <option value="ALL">SEMUA WAKTU</option>
                    <option value="1W">1 MINGGU TERAKHIR</option>
                    <option value="2W">2 MINGGU TERAKHIR</option>
                    <option value="CUSTOM">PILIH TANGGAL</option>
                  </select>
                  <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none text-tactical-muted">
                    <Activity size={12} />
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 transition-all bg-tactical-panel border border-tactical-cyan/50 rounded px-3 py-1.5 shadow-[0_0_10px_rgba(34,211,238,0.2)]">
                  <div className="relative group">
                    <input 
                      type="date"
                      autoFocus
                      value={dateRange.start}
                      onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                      className="bg-transparent border-none text-[11px] font-mono text-tactical-cyan focus:outline-none transition-all uppercase cursor-pointer"
                    />
                  </div>
                  <span className="text-tactical-muted text-[10px] font-mono mx-1">➜</span>
                  <div className="relative group">
                    <input 
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                      className="bg-transparent border-none text-[11px] font-mono text-tactical-cyan focus:outline-none transition-all uppercase cursor-pointer"
                    />
                  </div>
                  <button 
                    onClick={() => setDateFilter("ALL")}
                    className="ml-2 text-tactical-red hover:scale-110 transition-transform"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>

            {(searchQuery || statusFilter !== "ALL" || categoryFilter !== "ALL" || dateFilter !== "ALL") && (
              <button 
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("ALL");
                  setCategoryFilter("ALL");
                  setDateFilter("ALL");
                  setDateRange({ start: "", end: "" });
                  setCurrentPage(1);
                }}
                className="text-[9px] font-mono text-tactical-red hover:underline uppercase"
              >
                RESET
              </button>
            )}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-tactical-border text-xs font-mono text-tactical-muted">
                <th className="py-3 px-4">WAKTU & TANGGAL</th>
                <th className="py-3 px-4">JUDUL LAPORAN</th>
                <th className="py-3 px-4">OPERASI & KATEGORI</th>
                <th className="py-3 px-4">ANCAMAN</th>
                <th className="py-3 px-4">LOKASI</th>
                <th className="py-3 px-4 text-right">AKSI</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {(() => {
                const filtered = reports.filter(row => {
                  const searchStr = `${row.title} ${row.content} ${row.location_tag} ${row.operation_name}`.toLowerCase();
                  if (searchQuery && !searchStr.includes(searchQuery.toLowerCase())) return false;

                  const statusKeyMap: any = {
                    'STABLE': 'STABIL', 'GUARDED': 'TERJAGA', 'ELEVATED': 'MENINGKAT', 'HIGH': 'TINGGI', 'SEVERE': 'KRITIS',
                    'STABIL': 'STABIL', 'TERJAGA': 'TERJAGA', 'MENINGKAT': 'MENINGKAT', 'TINGGI': 'TINGGI', 'KRITIS': 'KRITIS'
                  };
                  const currentStatus = statusKeyMap[row.threat_level?.toUpperCase()] || 'STABIL';
                  if (statusFilter !== "ALL" && currentStatus !== statusFilter) return false;

                  if (categoryFilter !== "ALL" && row.operation_type !== categoryFilter) return false;

                  // Date Filter Logic
                  const reportDate = new Date(row.created_at);
                  const now = new Date();
                  
                  if (dateFilter === "1W") {
                    const oneWeekAgo = subDays(now, 7);
                    if (reportDate < oneWeekAgo) return false;
                  } else if (dateFilter === "2W") {
                    const twoWeeksAgo = subDays(now, 14);
                    if (reportDate < twoWeeksAgo) return false;
                  } else if (dateFilter === "CUSTOM" && dateRange.start && dateRange.end) {
                    const start = startOfDay(new Date(dateRange.start));
                    const end = endOfDay(new Date(dateRange.end));
                    if (!isWithinInterval(reportDate, { start, end })) return false;
                  }

                  return true;
                });

                const startIndex = (currentPage - 1) * itemsPerPage;
                const paginatedItems = filtered.slice(startIndex, startIndex + itemsPerPage);

                if (filtered.length === 0) {
                  return (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-xs font-mono text-tactical-muted italic">
                        TIDAK ADA DATA INTELIJEN YANG SESUAI DENGAN KRITERIA PENCARIAN.
                      </td>
                    </tr>
                  );
                }

                return paginatedItems.map((row, i) => (
                  <motion.tr 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * i }}
                    key={row.id} 
                    className="border-b border-tactical-border/50 hover:bg-tactical-border/30 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-tactical-text font-mono uppercase">
                          {format(new Date(row.created_at), 'dd MMM yyyy')}
                        </span>
                        <span className="text-[10px] text-tactical-muted font-mono">
                          {format(new Date(row.created_at), 'HH:mm')} WIB
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-tactical-text uppercase tracking-tight">{row.title}</span>
                        <span className="text-[10px] text-tactical-muted italic line-clamp-1">"{row.content.substring(0, 50)}..."</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-tactical-cyan font-mono uppercase">
                          {row.operation_name || 'OPERASI UMUM'}
                        </span>
                        <span className={`text-[9px] font-mono uppercase tracking-tighter ${row.operation_type === 'LUAR_NEGERI' ? 'text-orange-500' : 'text-tactical-green'}`}>
                          {row.operation_type ? row.operation_type.replace('_', ' ') : 'INTERNAL'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {(() => {
                        const statusKeyMap: any = {
                          'STABLE': 'STABIL', 'GUARDED': 'TERJAGA', 'ELEVATED': 'MENINGKAT', 'HIGH': 'TINGGI', 'SEVERE': 'KRITIS',
                          'STABIL': 'STABIL', 'TERJAGA': 'TERJAGA', 'MENINGKAT': 'MENINGKAT', 'TINGGI': 'TINGGI', 'KRITIS': 'KRITIS'
                        };
                        const currentStatus = statusKeyMap[row.threat_level?.toUpperCase()] || 'STABIL';
                        const colors: any = {
                          'STABIL': 'text-status-stabil border-status-stabil/30 bg-status-stabil/5',
                          'TERJAGA': 'text-tactical-cyan border-tactical-cyan/30 bg-tactical-cyan/5',
                          'MENINGKAT': 'text-tactical-yellow border-tactical-yellow/30 bg-tactical-yellow/5',
                          'TINGGI': 'text-orange-500 border-orange-500/30 bg-orange-500/5',
                          'KRITIS': 'bg-tactical-red text-white border-tactical-red shadow-[0_0_15px_rgba(239,68,68,0.5)] animate-pulse'
                        };
                        return (
                          <span className={`px-3 py-1 text-[10px] font-black rounded border ${colors[currentStatus]} tracking-widest uppercase`}>
                            {currentStatus}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="py-3 px-4 text-tactical-muted">{row.location_tag}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleOpenView(row)}
                          className="flex items-center gap-2 px-5 py-2 bg-tactical-cyan text-black text-[11px] font-black font-mono rounded hover:bg-tactical-cyan/80 hover:shadow-[0_0_15px_rgba(34,211,238,0.5)] transition-all uppercase tracking-wider"
                        >
                          <Eye size={14} /> LIHAT DETAIL
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ));
              })()}
            </tbody>
          </table>
        </div>

        {/* Pagination UI */}
        {(() => {
          const filtered = reports.filter(row => {
            const searchStr = `${row.title} ${row.content} ${row.location_tag} ${row.operation_name}`.toLowerCase();
            if (searchQuery && !searchStr.includes(searchQuery.toLowerCase())) return false;
            const statusKeyMap: any = {
              'STABLE': 'STABIL', 'GUARDED': 'TERJAGA', 'ELEVATED': 'MENINGKAT', 'HIGH': 'TINGGI', 'SEVERE': 'KRITIS',
              'STABIL': 'STABIL', 'TERJAGA': 'TERJAGA', 'MENINGKAT': 'MENINGKAT', 'TINGGI': 'TINGGI', 'KRITIS': 'KRITIS'
            };
            const currentStatus = statusKeyMap[row.threat_level?.toUpperCase()] || 'STABIL';
            if (statusFilter !== "ALL" && currentStatus !== statusFilter) return false;
            if (categoryFilter !== "ALL" && row.operation_type !== categoryFilter) return false;
            return true;
          });
          const totalPages = Math.ceil(filtered.length / itemsPerPage);
          if (totalPages <= 1) return null;

          return (
            <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-tactical-border pt-6">
              <div className="text-[10px] font-mono text-tactical-muted uppercase tracking-widest">
                MENAMPILKAN <span className="text-tactical-cyan">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="text-tactical-cyan">{Math.min(currentPage * itemsPerPage, filtered.length)}</span> DARI <span className="text-tactical-text">{filtered.length}</span> DATA INTELIJEN
              </div>
              
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => {
                    setCurrentPage(prev => Math.max(1, prev - 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-tactical-panel border border-tactical-border text-tactical-text text-[10px] font-mono rounded hover:bg-tactical-border disabled:opacity-30 disabled:cursor-not-allowed transition-all uppercase"
                >
                  Prev
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => {
                      setCurrentPage(page);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`w-8 py-1 text-[10px] font-mono rounded border transition-all ${
                      currentPage === page 
                        ? 'bg-tactical-cyan text-black border-tactical-cyan font-black shadow-[0_0_10px_rgba(34,211,238,0.3)]' 
                        : 'bg-tactical-panel border-tactical-border text-tactical-muted hover:border-tactical-cyan/50 hover:text-tactical-cyan'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button 
                  onClick={() => {
                    setCurrentPage(prev => Math.min(totalPages, prev + 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 bg-tactical-panel border border-tactical-border text-tactical-text text-[10px] font-mono rounded hover:bg-tactical-border disabled:opacity-30 disabled:cursor-not-allowed transition-all uppercase"
                >
                  Next
                </button>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Detail Confirmation for Delete */}
      <AnimatePresence>
        {selectedReport && (
          <div key="confirm-delete">
            {/* We'll use a separate state for delete confirmation if needed, but for now we'll put actions in detail modal */}
          </div>
        )}
      </AnimatePresence>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] overflow-y-auto custom-scrollbar bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl tactical-glass tactical-border p-8 my-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-tactical-text uppercase tracking-tighter flex items-center gap-2">
                  <ShieldAlert className="text-tactical-red" /> {editId ? "PERBARUI LAPORAN INTELIJEN" : "INISIALISASI LAPORAN INTELIJEN"}
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
                      <option value="STABIL">STABIL</option>
                      <option value="TERJAGA">TERJAGA</option>
                      <option value="MENINGKAT">MENINGKAT</option>
                      <option value="TINGGI">TINGGI</option>
                      <option value="KRITIS">KRITIS</option>
                    </select>
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-mono text-tactical-muted uppercase">Alamat Lengkap</label>
                    <textarea 
                      required
                      value={formData.location_tag}
                      onChange={(e) => setFormData({...formData, location_tag: e.target.value})}
                      className="w-full bg-tactical-bg border border-tactical-border rounded p-2.5 text-sm text-tactical-text focus:border-tactical-red outline-none font-mono h-24 resize-none"
                      placeholder="MASUKKAN ALAMAT LENGKAP..."
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
                        {showMap ? "Sembunyikan Peta" : "Buka Peta"}
                      </button>
                    </div>

                    {showMap && (
                      <div className="pt-4 border-t border-tactical-border mt-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[10px] font-mono text-tactical-muted uppercase">Hamparan Grid Taktis</span>
                          <button 
                            type="button" 
                            onClick={() => setShowMap(false)}
                            className="text-[10px] font-mono text-tactical-red hover:underline uppercase"
                          >
                            Tutup Tautan Peta
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
                          * Klik atau seret pin pada peta untuk mengunci koordinat intelijen
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
                    placeholder="MASUKKAN DETAIL INTELIJEN MISI..."
                  />
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-tactical-muted uppercase">Lapsus</label>
                    <textarea 
                      value={formData.lapsus}
                      onChange={(e) => setFormData({...formData, lapsus: e.target.value})}
                      className="w-full bg-tactical-bg border border-tactical-border rounded p-2.5 text-sm text-tactical-text focus:border-tactical-red outline-none font-mono h-24 resize-none"
                      placeholder="MASUKKAN LAPSUS..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-tactical-muted uppercase">Laporan Periodik</label>
                    <textarea 
                      value={formData.laporan_periodik}
                      onChange={(e) => setFormData({...formData, laporan_periodik: e.target.value})}
                      className="w-full bg-tactical-bg border border-tactical-border rounded p-2.5 text-sm text-tactical-text focus:border-tactical-red outline-none font-mono h-24 resize-none"
                      placeholder="MASUKKAN LAPORAN PERIODIK..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-tactical-muted uppercase">Prediksi Ancaman</label>
                    <textarea 
                      value={formData.prediksi_ancaman}
                      onChange={(e) => setFormData({...formData, prediksi_ancaman: e.target.value})}
                      className="w-full bg-tactical-bg border border-tactical-border rounded p-2.5 text-sm text-tactical-text focus:border-tactical-red outline-none font-mono h-24 resize-none"
                      placeholder="MASUKKAN PREDIKSI ANCAMAN..."
                    />
                  </div>
                 <div className="space-y-2 pt-4 border-t border-tactical-border">
                  <label className="text-[10px] font-mono text-tactical-muted uppercase font-bold">Lampiran Dokumen (Multi-Upload)</label>
                  {editId ? (
                    <DocumentUploader 
                      relatedId={editId} 
                      category="INTEL" 
                      onSuccess={() => setRefreshDocs(prev => prev + 1)} 
                    />
                  ) : (
                    <div className="p-4 bg-tactical-bg/50 border border-dashed border-white/10 rounded-lg text-center">
                      <p className="text-[10px] text-tactical-muted uppercase">Simpan laporan terlebih dahulu untuk mengaktifkan upload dokumen</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-3 bg-tactical-red text-white font-bold text-xs font-mono rounded hover:bg-tactical-red/80 transition-all flex items-center gap-2 uppercase tracking-widest disabled:opacity-50"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                    ENKRIPSI & SIMPAN DATA
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {showViewModal && selectedReport && (
          <div className="fixed inset-0 z-[2000] overflow-y-auto custom-scrollbar bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 md:p-8">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-6xl tactical-glass border border-tactical-cyan/50 p-6 md:p-8 shadow-[0_0_50px_rgba(34,211,238,0.2)] flex flex-col md:flex-row gap-8 max-h-[90vh] overflow-y-auto custom-scrollbar my-auto"
            >
              <div className="flex-1 space-y-6">
                <div className="flex items-center justify-between border-b border-tactical-border pb-4 mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-tactical-text font-mono flex items-center gap-3 uppercase">
                      <FileText className="text-tactical-cyan" /> DETAIL LAPORAN INTELIJEN
                    </h3>
                    <p className="text-[10px] font-mono text-tactical-muted uppercase mt-1 tracking-widest">ID LAPORAN: #INTEL-{selectedReport.id}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-tactical-muted uppercase tracking-widest font-bold">Judul Laporan / Temuan</label>
                    <div className="w-full bg-tactical-bg/50 border border-tactical-border rounded p-3 text-sm text-tactical-text font-mono font-bold uppercase">
                      {selectedReport.title}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-tactical-muted uppercase tracking-widest font-bold">Tingkat Ancaman</label>
                      {(() => {
                        const statusKeyMap: any = {
                          'STABLE': 'STABIL', 'GUARDED': 'TERJAGA', 'ELEVATED': 'MENINGKAT', 'HIGH': 'TINGGI', 'SEVERE': 'KRITIS',
                          'STABIL': 'STABIL', 'TERJAGA': 'TERJAGA', 'MENINGKAT': 'MENINGKAT', 'TINGGI': 'TINGGI', 'KRITIS': 'KRITIS'
                        };
                        const currentStatus = statusKeyMap[selectedReport.threat_level?.toUpperCase()] || 'STABIL';
                        const colors: any = {
                          'STABIL': 'text-status-stabil border-status-stabil/30 bg-status-stabil/10',
                          'TERJAGA': 'text-tactical-cyan border-tactical-cyan/30 bg-tactical-cyan/10',
                          'MENINGKAT': 'text-tactical-yellow border-tactical-yellow/30 bg-tactical-yellow/10',
                          'TINGGI': 'text-orange-500 border-orange-500/30 bg-orange-500/10',
                          'KRITIS': 'bg-tactical-red text-white border-tactical-red animate-pulse'
                        };
                        return (
                          <div className={`w-full p-3 rounded border ${colors[currentStatus]} text-sm font-black font-mono text-center tracking-widest uppercase`}>
                            {currentStatus}
                          </div>
                        );
                      })()}
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-tactical-muted uppercase tracking-widest font-bold">Label Lokasi / Sektor</label>
                      <div className="w-full bg-tactical-bg/50 border border-tactical-border rounded p-3 text-sm text-tactical-text font-mono uppercase">
                        {selectedReport.location_tag}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-tactical-muted uppercase tracking-widest font-bold">Isi Laporan Intelijen</label>
                    <div className="w-full bg-tactical-bg/50 border border-tactical-border rounded p-3 text-xs text-tactical-text font-mono h-32 overflow-y-auto custom-scrollbar leading-relaxed">
                      {selectedReport.content}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-tactical-muted uppercase tracking-widest font-bold">Lapsus</label>
                      <div className="w-full bg-tactical-bg/30 border border-tactical-border/50 rounded p-3 text-xs text-tactical-text font-mono min-h-[60px] leading-relaxed">
                        {selectedReport.lapsus || "TIDAK ADA DATA"}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-tactical-muted uppercase tracking-widest font-bold">Laporan Periodik</label>
                      <div className="w-full bg-tactical-bg/30 border border-tactical-border/50 rounded p-3 text-xs text-tactical-text font-mono min-h-[60px] leading-relaxed">
                        {selectedReport.laporan_periodik || "TIDAK ADA DATA"}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-tactical-muted uppercase tracking-widest font-bold">Prediksi Ancaman</label>
                      <div className="w-full bg-tactical-bg/30 border border-tactical-border/50 rounded p-3 text-xs text-tactical-text font-mono min-h-[60px] leading-relaxed">
                        {selectedReport.prediksi_ancaman || "TIDAK ADA DATA"}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-tactical-muted uppercase tracking-widest font-bold">Operasi Terkait</label>
                    <div className="w-full bg-tactical-panel/50 border border-tactical-cyan/20 rounded p-3 text-xs text-tactical-cyan font-mono font-bold uppercase flex items-center gap-2">
                       <Activity size={14} /> {selectedReport.operation_name || "OPERASI UMUM / INTERNAL"}
                    </div>
                  </div>
                   <div className="space-y-2 pt-4 border-t border-tactical-border">
                    <label className="text-[10px] font-mono text-tactical-muted uppercase tracking-widest font-bold">Lampiran Dokumen</label>
                    <DocumentList 
                      relatedId={selectedReport.id} 
                      category="INTEL" 
                      refreshTrigger={refreshDocs} 
                    />
                  </div>
                </div>
              </div>

              <div className="flex-1 space-y-6">
                <div className="flex items-center justify-between border-b border-tactical-border pb-4 mb-6">
                   <div>
                    <h3 className="text-xl font-bold text-tactical-text font-mono flex items-center gap-3 uppercase">
                      <MapPin className="text-tactical-red" /> GEOGRAPHIC PREVIEW
                    </h3>
                    <p className="text-[10px] font-mono text-tactical-muted uppercase mt-1 tracking-widest">Visualisasi titik koordinat temuan</p>
                  </div>
                  <button onClick={() => setShowViewModal(false)} className="text-tactical-muted hover:text-tactical-red transition-colors">
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-tactical-muted uppercase tracking-widest font-bold">Koordinat Taktis</label>
                    <div className="w-full bg-tactical-bg/50 border border-tactical-cyan/30 rounded p-3 text-sm text-tactical-cyan font-mono flex items-center gap-2">
                       <Crosshair size={14} className="animate-pulse" /> {selectedReport.coordinates || "DATA TIDAK TERSEDIA"}
                    </div>
                  </div>

                  <div className="h-[300px] rounded border border-tactical-border overflow-hidden">
                    <LocationPicker 
                        initialLocation={(() => {
                          if (selectedReport.coordinates && selectedReport.coordinates.includes(',')) {
                            const parts = selectedReport.coordinates.split(',').map((p: string) => parseFloat(p.trim()));
                            if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
                              return [parts[0], parts[1]] as [number, number];
                            }
                          }
                          return [-0.7893, 113.9213];
                        })()} 
                        onLocationSelected={() => {}}
                        hasLocation={!!selectedReport.coordinates}
                        zoom={selectedReport.coordinates ? 13 : 5}
                    />
                  </div>
                  
                  <div className="flex gap-4 pt-4">
                    <button 
                      onClick={() => {
                        handleOpenEdit(selectedReport);
                        setShowViewModal(false);
                      }}
                      className="flex-1 py-4 bg-tactical-panel border border-tactical-yellow/30 text-tactical-yellow font-black text-sm font-mono rounded hover:bg-tactical-yellow/10 transition-all uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                      <Edit2 size={18} /> EDIT
                    </button>
                    <button 
                      onClick={() => {
                        handleDelete(selectedReport.id);
                        setShowViewModal(false);
                      }}
                      className="flex-1 py-4 bg-tactical-panel border border-tactical-red/30 text-tactical-red font-black text-sm font-mono rounded hover:bg-tactical-red/10 transition-all uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                      <Trash2 size={18} /> HAPUS
                    </button>
                    <button 
                      onClick={() => setShowViewModal(false)}
                      className="flex-1 py-4 bg-tactical-bg border border-tactical-border text-tactical-muted font-black text-sm font-mono rounded hover:bg-tactical-panel transition-all uppercase tracking-widest"
                    >
                      TUTUP
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
