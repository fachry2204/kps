"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, MapPin, Users, Target, Shield, Calendar, Activity, Flag,
  AlertTriangle, History, FileText, Edit, Trash2, User, ExternalLink,
  Loader2, Package, Crosshair, Settings, Truck, MessageSquare, Video,
  Search, X, Plus, Filter, ChevronDown
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { deleteOpDalamNegeri, deleteOpLuarNegeri, getLogistics, addOperationAsset, getOperationAssets, deleteOperationAsset, updateOperationAsset, getOperationIntel, addIntelReport, deleteIntelReport, updateIntelReport } from "@/app/actions";
import Link from "next/link";
import dynamic from "next/dynamic";
import DocumentUploader from "../common/DocumentUploader";
import DocumentList from "../common/DocumentList";

const MapComponent = dynamic(() => import("../map/MapComponent"), { 
  ssr: false,
  loading: () => <div className="h-[300px] bg-tactical-bg flex items-center justify-center text-tactical-green font-mono text-xs uppercase">Menyambungkan ke Satelit...</div>
});

export default function OperationDetailClient({ id, initialData }: { id: string, initialData: any }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'SEMUA' | 'SENJATA' | 'ALKAPSUS' | 'RANTIS' | 'OPTIK' | 'HANDAK' | 'LAIN-LAIN'>('SEMUA');
  const [personnelSearch, setPersonnelSearch] = useState("");
  const [opData, setOpData] = useState<any>(initialData);
  const [showAddModal, setShowAddModal] = useState(false);
  const [masterLogistics, setMasterLogistics] = useState<any[]>([]);
  const [showLogisticsDropdown, setShowLogisticsDropdown] = useState(false);
  const [newAsset, setNewAsset] = useState({ asset_name: '', quantity: 1, unit: 'pcs', asset_type: 'SENJATA' as any, description: '' });
  const [editingAsset, setEditingAsset] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [stockWarning, setStockWarning] = useState<{show: boolean, current: number, name: string} | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{show: boolean, id: number, name: string} | null>(null);
  const [opDeleteConfirm, setOpDeleteConfirm] = useState(false);
  const [showIntelModal, setShowIntelModal] = useState(false);
  const [intelReports, setIntelReports] = useState<any[]>([]);
  const [newIntel, setNewIntel] = useState({ title: '', threat_level: 'STABIL', content: '', location_tag: '', coordinates: '', address: '' });
  const [selectedIntelMap, setSelectedIntelMap] = useState<any>(null);
  const [intelSearchQuery, setIntelSearchQuery] = useState('');
  const [intelStatusFilter, setIntelStatusFilter] = useState('ALL');
  const [showIntelDetailModal, setShowIntelDetailModal] = useState(false);
  const [selectedIntelDetail, setSelectedIntelDetail] = useState<any>(null);
  const [showEditIntelModal, setShowEditIntelModal] = useState(false);
  const [editingIntel, setEditingIntel] = useState<any>(null);
  const [intelDeleteConfirm, setIntelDeleteConfirm] = useState<{show: boolean, id: number, title: string} | null>(null);
  const [intelPage, setIntelPage] = useState(1);
  const [refreshDocs, setRefreshDocs] = useState(0);
  const intelItemsPerPage = 10;

  const handleUpdateIntel = async () => {
    if (!editingIntel.title || !editingIntel.content) return;
    setIsSubmitting(true);
    try {
      const res = await updateIntelReport(editingIntel.id, editingIntel);
      if (res.success) {
        const intel = await getOperationIntel(Number(id), pathname.includes('dalam-negeri') ? 'DALAM_NEGERI' : 'LUAR_NEGERI');
        setIntelReports(intel);
        setShowEditIntelModal(false);
        if (selectedIntelDetail?.id === editingIntel.id) {
           setSelectedIntelDetail({...selectedIntelDetail, ...editingIntel});
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteIntel = async () => {
    if (!intelDeleteConfirm) return;
    setIsSubmitting(true);
    try {
      const res = await deleteIntelReport(intelDeleteConfirm.id);
      if (res.success) {
        const intel = await getOperationIntel(Number(id), pathname.includes('dalam-negeri') ? 'DALAM_NEGERI' : 'LUAR_NEGERI');
        setIntelReports(intel);
        setIntelDeleteConfirm(null);
        setShowIntelDetailModal(false);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    async function fetchData() {
      const logs = await getLogistics();
      // Group by name and SUM quantity for READY stock (no unit_id)
      const groupedMap = new Map<string, any>();
      
      logs.filter((l: any) => !l.unit_id).forEach((l: any) => {
        if (groupedMap.has(l.item_name)) {
          const existing = groupedMap.get(l.item_name);
          existing.quantity += Number(l.quantity);
        } else {
          groupedMap.set(l.item_name, { ...l, quantity: Number(l.quantity) });
        }
      });
      
      setMasterLogistics(Array.from(groupedMap.values()));
    }
    fetchData();

    async function fetchIntel() {
      const opType = pathname.includes('/dalam-negeri/') ? 'DALAM_NEGERI' : 'LUAR_NEGERI';
      const intel = await getOperationIntel(Number(id), opType);
      setIntelReports(intel);
    }
    fetchIntel();
  }, [id, pathname]);

  const handleAddAsset = async () => {
    if (!newAsset.asset_name) return;
    
    // Check Stock
    const selectedMaster = masterLogistics.find(ml => ml.item_name === newAsset.asset_name);
    if (selectedMaster && newAsset.quantity > selectedMaster.quantity) {
      setStockWarning({ show: true, current: selectedMaster.quantity, name: selectedMaster.item_name });
      return;
    }

    setIsSubmitting(true);
    const opType = pathname.includes('/dalam-negeri/') ? 'DALAM_NEGERI' : 'LUAR_NEGERI';
    
    const res = await addOperationAsset({
      operation_id: Number(id),
      operation_type: opType,
      asset_name: newAsset.asset_name,
      asset_type: newAsset.asset_type,
      quantity: newAsset.quantity,
      condition_status: 'READY',
      description: newAsset.description || 'Ditambahkan dari halaman detail'
    });

    if (res.success) {
      const updatedAssets = await getOperationAssets(Number(id), opType);
      setOpData({ ...opData, assets: updatedAssets });
      setShowAddModal(false);
      setNewAsset({ asset_name: '', quantity: 1, unit: 'pcs', asset_type: 'SENJATA', description: '' });
    }
    setIsSubmitting(false);
  };

  const handleDeleteAsset = async () => {
    if (!deleteConfirm) return;
    setIsSubmitting(true);
    const res = await deleteOperationAsset(deleteConfirm.id);
    if (res.success) {
      const opType = pathname.includes('/dalam-negeri/') ? 'DALAM_NEGERI' : 'LUAR_NEGERI';
      const updatedAssets = await getOperationAssets(Number(id), opType);
      setOpData({ ...opData, assets: updatedAssets });
      setDeleteConfirm(null);
    }
    setIsSubmitting(false);
  };

  const handleUpdateAsset = async () => {
    if (!editingAsset) return;
    setIsSubmitting(true);
    const res = await updateOperationAsset(editingAsset.id, {
      quantity: editingAsset.quantity,
      condition_status: editingAsset.condition_status,
      description: editingAsset.description
    });
    if (res.success) {
      const opType = pathname.includes('/dalam-negeri/') ? 'DALAM_NEGERI' : 'LUAR_NEGERI';
      const updatedAssets = await getOperationAssets(Number(id), opType);
      setOpData({ ...opData, assets: updatedAssets });
      setShowEditModal(false);
      setEditingAsset(null);
    }
    setIsSubmitting(false);
  };

  const handleAddIntel = async () => {
    if (!newIntel.title || !newIntel.content) return;
    setIsSubmitting(true);
    const opType = pathname.includes('/dalam-negeri/') ? 'DALAM_NEGERI' : 'LUAR_NEGERI';
    const res = await addIntelReport({
      ...newIntel,
      operation_id: Number(id),
      operation_type: opType,
      is_classified: true
    });
    if (res.success) {
      const updatedIntel = await getOperationIntel(Number(id), opType);
      setIntelReports(updatedIntel);
      setShowIntelModal(false);
      setNewIntel({ title: '', threat_level: 'STABIL', content: '', location_tag: '', coordinates: '', address: '' });
    }
    setIsSubmitting(false);
  };

  const filteredMembers = (initialData?.members || []).filter((m: any) => 
    m.name.toLowerCase().includes(personnelSearch.toLowerCase()) ||
    m.nrp.toLowerCase().includes(personnelSearch.toLowerCase()) ||
    m.rank.toLowerCase().includes(personnelSearch.toLowerCase()) ||
    (m.specialization && m.specialization.toLowerCase().includes(personnelSearch.toLowerCase()))
  );

  const details = {
    name: initialData?.operation_name || initialData?.name || (id !== "undefined" ? `SATGAS OPS ${id}` : "SATGAS OPS"),
    code: `OPS-TAC-${id !== "undefined" ? String(id).padStart(3, '0') : "000"}`,
    location: initialData?.location || "Area Penugasan",
    coordinates: initialData?.coordinates || null,
    status: initialData?.status === 'ACTIVE' ? 'AKTIF' : (initialData?.status === 'ONGOING' ? 'BERLANGSUNG' : initialData?.status || "AKTIF"),
    priority: "TINGGI",
    deploymentDate: "12 Jan 2026",
    personnel: (opData?.commander ? 1 : 0) + (opData?.members?.length || 0),
    type: opData?.type || (pathname.includes('/dalam-negeri/') ? 'DALAM_NEGERI' : 'LUAR_NEGERI'),
    commander: opData?.commander || null,
    members: opData?.members || [],
    assets: opData?.assets || [],
    objectives: opData?.mission_objectives || "Tujuan misi belum ditentukan secara eksplisit dalam rencana taktis.",
    intelSummary: "Pengawasan terbaru menunjukkan peningkatan pergerakan di sektor utara. Tim taktis dalam siaga tinggi.",
    totalAlutsista: (opData?.assets || []).filter((a: any) => a.asset_type === 'ALUTSISTA').reduce((sum: number, a: any) => sum + (parseInt(a.quantity) || 0), 0),
    totalSenjata: (opData?.assets || []).filter((a: any) => a.asset_type === 'SENJATA').reduce((sum: number, a: any) => sum + (parseInt(a.quantity) || 0), 0),
    timeline: [
      { date: "10 Mei 2026", event: "Patroli rutin selesai. Tidak ada anomali terdeteksi." },
      { date: "08 Mei 2026", event: "Rotasi personel berhasil. Pasukan baru dikerahkan." },
      { date: "05 Mei 2026", event: "Pertemuan strategis dengan tokoh masyarakat setempat." }
    ]
  };

  const handleDelete = async () => {
    setOpDeleteConfirm(false);
    setIsSubmitting(true);
    try {
      const isDalamNegeri = pathname.includes('/dalam-negeri/');
      const res = isDalamNegeri 
        ? await deleteOpDalamNegeri(Number(id))
        : await deleteOpLuarNegeri(Number(id));
      
      if (res.success) {
        router.push(isDalamNegeri ? '/gelar-operasi/dalam-negeri' : '/gelar-operasi/luar-negeri');
        router.refresh();
      } else {
        alert("Gagal menghapus: " + res.error);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const editLink = pathname.includes('/dalam-negeri/') 
    ? `/gelar-operasi/dalam-negeri/edit/${id}`
    : `/gelar-operasi/luar-negeri/edit/${id}`;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-tactical-border pb-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              if (pathname.includes('/dalam-negeri/')) {
                router.push('/gelar-operasi/dalam-negeri');
              } else if (pathname.includes('/luar-negeri/')) {
                router.push('/gelar-operasi/luar-negeri');
              } else {
                router.push('/gelar-operasi');
              }
            }}
            className="p-2 hover:bg-tactical-border rounded-full text-tactical-muted hover:text-tactical-text transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-tactical-text tracking-tighter uppercase">{details.name}</h2>
              <span className="px-2 py-0.5 bg-tactical-green/10 text-tactical-green border border-tactical-green/30 text-[10px] font-mono rounded font-bold">
                {details.status}
              </span>
            </div>
            <div className="flex items-center gap-4 mt-1">
              <p className="text-tactical-muted font-mono text-xs tracking-widest">{details.code} | {details.type} | {details.location}</p>
              {details.coordinates && (
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-tactical-cyan/10 border border-tactical-cyan/30 rounded text-[9px] font-mono text-tactical-cyan">
                  <Crosshair size={10} /> {details.coordinates}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={() => {
              const base = `/komunikasi/chat?opId=${id}`;
              const commanderParams = details.commander ? `&to=${details.commander.id}&toName=${encodeURIComponent(details.commander.name)}&mode=private` : '';
              router.push(base + commanderParams);
            }}
            className="px-4 py-2 bg-tactical-green/10 border border-tactical-green/30 rounded text-xs font-mono text-tactical-green font-bold hover:bg-tactical-green hover:text-black transition-all flex items-center gap-2 uppercase tracking-widest"
          >
            <MessageSquare size={14} /> CHAT AMAN
          </button>
          <button 
            onClick={() => {
              const base = `/komunikasi/vcon?opId=${id}`;
              const commanderParams = details.commander ? `&to=${details.commander.id}&toName=${encodeURIComponent(details.commander.name)}&mode=private` : '';
              router.push(base + commanderParams);
            }}
            className="px-4 py-2 bg-tactical-red/10 border border-tactical-red/30 rounded text-xs font-mono text-tactical-red font-bold hover:bg-tactical-red hover:text-black transition-all flex items-center gap-2 uppercase tracking-widest"
          >
            <Video size={14} /> VCON AMAN
          </button>
          <div className="w-[1px] h-8 bg-tactical-border mx-1" />
          <Link 
            href={editLink}
            className="px-4 py-2 bg-tactical-cyan/10 border border-tactical-cyan/30 rounded text-xs font-mono text-tactical-cyan font-bold hover:bg-tactical-cyan hover:text-black transition-all flex items-center gap-2"
          >
            <Edit size={14} /> EDIT DATA
          </Link>
          <button 
            onClick={() => setOpDeleteConfirm(true)}
            disabled={isSubmitting}
            className="px-4 py-2 bg-tactical-red/10 border border-tactical-red/30 rounded text-xs font-mono text-tactical-red font-bold hover:bg-tactical-red hover:text-white transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />} HAPUS
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="tactical-glass tactical-border p-4 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                <Users size={48} className="text-tactical-cyan" />
              </div>
              <div className="text-[10px] font-mono text-tactical-muted mb-2 uppercase">Kekuatan Personil</div>
              <div className="text-2xl font-bold text-tactical-text">{details.personnel} <span className="text-xs font-normal text-tactical-muted font-mono">PERSONEL</span></div>
              <div className="text-[9px] font-mono text-tactical-cyan uppercase mt-1">Total Aktif: 12 ANGGOTA + 1 KOMANDAN</div>
            </div>
            
            <div className="tactical-glass tactical-border p-4 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                <Truck size={48} className="text-tactical-yellow" />
              </div>
              <div className="text-[10px] font-mono text-tactical-muted mb-2 uppercase">Jumlah Alutsista</div>
              <div className="text-2xl font-bold text-tactical-text">{details.totalAlutsista} <span className="text-xs font-normal text-tactical-muted font-mono">UNIT</span></div>
              <div className="text-[9px] font-mono text-tactical-yellow uppercase mt-1">KENDARAAN TAKTIS & PENDUKUNG</div>
            </div>

            <div className="tactical-glass tactical-border p-4 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                <FileText size={48} className="text-tactical-cyan" />
              </div>
              <div className="text-[10px] font-mono text-tactical-muted mb-2 uppercase">Jumlah Data Intelijen</div>
              <div className="text-2xl font-bold text-tactical-text">{intelReports.length} <span className="text-xs font-normal text-tactical-muted font-mono">LAPORAN</span></div>
              <div className="text-[9px] font-mono text-tactical-cyan uppercase mt-1 tracking-tighter">DATA INTELIJEN TERKUMPUL</div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="tactical-glass tactical-border p-6">
              <h3 className="text-sm font-bold text-tactical-text font-mono border-b border-tactical-border pb-3 mb-4 flex items-center gap-2 uppercase">
                <Shield size={16} className="text-tactical-yellow" /> Komandan Bertugas
              </h3>
              {details.commander ? (
                <div className="flex items-center gap-4 p-4 bg-tactical-panel/50 border border-tactical-yellow/30 rounded-lg group">
                  <div className="w-24 h-24 bg-tactical-bg border-2 border-tactical-yellow/30 rounded-full flex items-center justify-center text-tactical-muted relative overflow-hidden shadow-[0_0_20px_rgba(201,160,65,0.2)]">
                    {details.commander.photo_url ? (
                      <img src={details.commander.photo_url} alt={details.commander.name} className="w-full h-full object-cover invert grayscale contrast-125 brightness-110 opacity-80 hover:opacity-100 transition-all duration-500" />
                    ) : (
                      <User size={48} />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="text-lg font-bold text-tactical-text uppercase tracking-tighter">{details.commander.name}</div>
                      <div className="flex gap-2">
                        <div className="px-2 py-0.5 bg-tactical-red text-white text-[10px] font-mono font-black rounded uppercase shadow-[0_0_15px_rgba(255,0,0,0.5)] border border-tactical-red/50">
                          {details.commander.rank}
                        </div>
                        <div className="px-2 py-0.5 bg-tactical-red/20 text-tactical-red border border-tactical-red/50 text-[10px] font-mono font-bold rounded uppercase">
                          {details.commander.role || 'KOMANDAN'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-xs font-mono mb-3 mt-1.5">
                      <span className="text-tactical-muted uppercase tracking-wider">NRP: <span className="text-tactical-text font-bold">{details.commander.nrp}</span></span>
                      <span className="text-tactical-muted uppercase tracking-wider">TEL: <span className="text-tactical-cyan font-bold">{details.commander.phone_number || '-'}</span></span>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className="text-[10px] font-mono text-tactical-muted uppercase font-bold tracking-widest mr-1">Spesialis:</span>
                      {details.commander.specialization ? details.commander.specialization.split(", ").map((spec: string, idx: number) => (
                        <div key={idx} className="px-2.5 py-1 bg-tactical-bg border border-tactical-green/30 text-tactical-green text-[11px] font-mono rounded uppercase">
                          {spec}
                        </div>
                      )) : (
                        <div className="px-2.5 py-1 bg-tactical-bg border border-tactical-border text-tactical-muted text-[11px] font-mono rounded uppercase">
                          UMUM
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button 
                      onClick={() => router.push(`/komunikasi/chat?opId=${id}&to=${details.commander.id}&toName=${encodeURIComponent(details.commander.name)}&mode=private`)}
                      className="px-4 py-2 bg-tactical-green/10 hover:bg-tactical-green/20 border border-tactical-green/30 text-tactical-green text-[10px] font-mono font-bold rounded uppercase transition-all flex items-center gap-2"
                    >
                      <MessageSquare size={12} />
                      CHAT KOMANDAN
                    </button>
                    <button 
                      onClick={() => router.push(`/komunikasi/vcon?opId=${id}&to=${details.commander.id}&toName=${encodeURIComponent(details.commander.name)}&mode=private`)}
                      className="px-4 py-2 bg-tactical-cyan/10 hover:bg-tactical-cyan/20 border border-tactical-cyan/30 text-tactical-cyan text-[10px] font-mono font-bold rounded uppercase transition-all flex items-center gap-2"
                    >
                      <Video size={12} />
                      VCON KOMANDAN
                    </button>
                    <Link 
                      href={`/personnel/${details.commander.id}`} 
                      className="px-4 py-2 bg-tactical-yellow/10 hover:bg-tactical-yellow/20 border border-tactical-yellow/30 text-tactical-yellow text-[10px] font-mono font-bold rounded uppercase transition-all flex items-center gap-2"
                    >
                      <ExternalLink size={12} />
                      PROFIL DETAIL
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-xs font-mono text-tactical-muted italic border border-dashed border-tactical-border rounded">
                  Tidak ada komandan yang ditugaskan untuk misi ini.
                </div>
              )}
            </div>

            <div className="tactical-glass tactical-border p-6">
              <div className="flex items-center justify-between border-b border-tactical-border pb-3 mb-4">
                <h3 className="text-base font-bold text-tactical-text font-mono flex items-center gap-2 uppercase">
                  <Users size={18} className="text-tactical-cyan" /> Anggota Bertugas ({details.members.length})
                </h3>
                
                {/* Smart Search */}
                <div className="relative group/search">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-tactical-cyan/50 group-focus-within/search:text-tactical-cyan transition-colors">
                    <Search size={14} />
                  </div>
                  <input 
                    type="text"
                    placeholder="CARI PERSONEL..."
                    onChange={(e) => setPersonnelSearch(e.target.value)}
                    className="bg-tactical-bg/50 border border-tactical-border rounded px-9 py-1.5 text-[10px] font-mono text-tactical-text focus:outline-none focus:border-tactical-cyan focus:ring-1 focus:ring-tactical-cyan/20 w-64 transition-all uppercase tracking-widest"
                  />
                  {personnelSearch && (
                    <button 
                      onClick={() => setPersonnelSearch('')}
                      className="absolute inset-y-0 right-3 flex items-center text-tactical-muted hover:text-tactical-red transition-colors"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {filteredMembers.length > 0 ? (
                  filteredMembers.map((member: any) => (
                    <div key={member.id} className="tactical-glass p-4 border border-tactical-border rounded-lg hover:border-tactical-cyan/50 transition-all group relative overflow-hidden flex flex-col items-center text-center">
                      
                      <div className="w-20 h-20 bg-tactical-bg border-2 border-tactical-border rounded-full flex items-center justify-center text-tactical-muted mb-3 group-hover:border-tactical-cyan/50 transition-colors overflow-hidden shadow-[0_0_15px_rgba(0,0,0,0.3)]">
                        {member.photo_url ? (
                          <img src={member.photo_url} alt={member.name} className="w-full h-full object-cover invert grayscale contrast-125 brightness-110 opacity-80 hover:opacity-100 transition-all duration-500" />
                        ) : (
                          <User size={40} />
                        )}
                      </div>
                      
                      <div className="space-y-2 w-full">
                        <div className="flex items-center justify-center gap-2 mb-1.5">
                          <div className="text-lg font-black text-tactical-text truncate uppercase tracking-tight leading-none">{member.name}</div>
                          <span className="text-xs font-mono text-tactical-yellow font-bold uppercase bg-tactical-yellow/5 px-2 py-0.5 rounded border border-tactical-yellow/20">{member.rank}</span>
                        </div>
                        <div className="flex items-center justify-center gap-3">
                          <span className="text-xs font-mono text-tactical-red font-bold uppercase bg-tactical-red/5 px-2 py-0.5 rounded border border-tactical-red/20">{member.role || 'ANGGOTA'}</span>
                          <span className="text-sm font-mono text-tactical-muted uppercase tracking-tighter">NRP: <span className="text-tactical-text font-bold">{member.nrp}</span></span>
                        </div>
                        
                        <div className="flex flex-wrap justify-center items-center gap-1.5 mt-4">
                          <span className="text-[9px] font-mono text-tactical-muted uppercase font-bold tracking-tight mr-1">Spesialis:</span>
                          {member.specialization ? member.specialization.split(", ").slice(0, 3).map((spec: string, idx: number) => (
                            <span key={idx} className="text-[11px] font-mono text-tactical-green bg-tactical-green/10 border border-tactical-green/30 px-2.5 py-1 rounded uppercase font-bold tracking-tight">
                              {spec}
                            </span>
                          )) : (
                            <span className="text-[11px] font-mono text-tactical-muted bg-tactical-panel px-2.5 py-1 rounded uppercase">
                              UMUM
                            </span>
                          )}
                        </div>

                        <Link 
                          href={`/personnel/${member.id}`}
                          className="mt-6 w-full py-2 bg-tactical-cyan/10 hover:bg-tactical-cyan/20 border border-tactical-cyan/30 text-tactical-cyan text-[10px] font-mono font-bold rounded uppercase transition-all flex items-center justify-center gap-2"
                        >
                          DETAIL PERSONIL
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-8 text-center text-xs font-mono text-tactical-muted italic border border-dashed border-tactical-border rounded">
                    Tidak ada anggota yang ditugaskan.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="tactical-glass tactical-border p-6">
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-between border-b border-tactical-border pb-3">
                <h3 className="text-base font-bold text-tactical-text font-mono flex items-center gap-2 uppercase">
                  <Package size={18} className="text-tactical-cyan" /> ALUTSISTA
                </h3>
                <button 
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-1.5 bg-tactical-cyan/10 border border-tactical-cyan/30 text-tactical-cyan text-[10px] font-mono font-bold rounded flex items-center gap-2 hover:bg-tactical-cyan hover:text-black transition-all uppercase"
                >
                  <Plus size={14} /> TAMBAH ALUTSISTA
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'SEMUA', label: 'SEMUA ASET' },
                  { id: 'SENJATA', label: 'SENJATA JENIS' },
                  { id: 'ALKAPSUS', label: 'ALKAPSUS' },
                  { id: 'RANTIS', label: 'RANTIS' },
                  { id: 'OPTIK', label: 'OPTIK' },
                  { id: 'HANDAK', label: 'HANDAK' },
                  { id: 'LAIN-LAIN', label: 'LAIN-LAIN' }
                ].map((tab) => (
                  <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-4 py-2 rounded font-mono text-[10px] font-bold transition-all border ${
                      activeTab === tab.id 
                        ? 'bg-tactical-cyan text-black border-tactical-cyan shadow-[0_0_15px_rgba(34,211,238,0.3)]' 
                        : 'bg-tactical-panel text-tactical-muted hover:text-tactical-text border-tactical-border'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto mt-6">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-tactical-border text-[10px] font-mono text-tactical-muted uppercase tracking-widest">
                    <th className="py-3 px-4">NAMA ALUTSISTA</th>
                    <th className="py-3 px-4">KATEGORI</th>
                    <th className="py-3 px-4">JUMLAH</th>
                    <th className="py-3 px-4">KONDISI</th>
                    <th className="py-3 px-4">KETERANGAN</th>
                    <th className="py-3 px-4">TANGGAL TAMBAH</th>
                    <th className="py-3 px-4 text-right">AKSI</th>
                  </tr>
                </thead>
                <tbody className="text-xs">
                  {(() => {
                    const filtered = activeTab === 'SEMUA' 
                      ? opData.assets 
                      : opData.assets.filter((a: any) => {
                          if (activeTab === 'SENJATA') return a.category === 'Senjata Jenis' || a.asset_type === 'SENJATA';
                          return a.category?.toUpperCase() === activeTab.toUpperCase();
                        });
                    
                    if (filtered.length === 0) {
                      return (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-tactical-muted font-mono text-[10px] uppercase italic">
                            Belum ada data {activeTab.toLowerCase()} yang ditugaskan untuk operasi ini.
                          </td>
                        </tr>
                      );
                    }

                    return filtered.map((asset: any) => (
                      <tr key={asset.id} className="border-b border-tactical-border/30 hover:bg-tactical-border/10 transition-colors group">
                        <td className="py-3 px-4 font-bold text-tactical-text uppercase tracking-tighter">
                          <div className="flex items-center gap-2">
                            {asset.asset_type === 'ALUTSISTA' || asset.asset_type === 'RANTIS' ? <Truck size={14} className="text-tactical-cyan" /> : <Target size={14} className="text-tactical-yellow" />}
                            {asset.asset_name}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono">
                          <span className="text-[10px] text-tactical-muted bg-tactical-panel border border-tactical-border px-2 py-0.5 rounded uppercase tracking-tighter">
                            {asset.category || '-'}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-tactical-muted uppercase">{asset.quantity} {asset.unit || 'UNIT'}</td>
                        <td className="py-3 px-4">
                          <span className={`text-[9px] font-black font-mono px-2 py-0.5 rounded tracking-widest ${
                            asset.condition_status === 'EFEKTIF' || asset.condition_status === 'READY'
                              ? 'bg-[#22c55e] text-white shadow-[0_0_10px_rgba(34,197,94,0.3)]' 
                              : 'bg-tactical-red text-white shadow-[0_0_10px_rgba(239,68,68,0.3)]'
                          }`}>
                            {asset.condition_status === 'READY' ? 'EFEKTIF' : (asset.condition_status === 'EFEKTIF' ? 'EFEKTIF' : 'TIDAK EFEKTIF')}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-tactical-muted text-[10px] italic max-w-xs truncate">
                          {asset.description && asset.description !== '-' ? asset.description : '-'}
                        </td>
                        <td className="py-3 px-4 font-mono text-tactical-cyan text-[10px] uppercase">
                          {asset.added_at ? new Date(asset.added_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => {
                                setEditingAsset(asset);
                                setShowEditModal(true);
                              }}
                              className="p-1.5 text-tactical-green hover:bg-tactical-green/10 rounded transition-colors"
                              title="Edit Data"
                            >
                              <Edit size={16} />
                            </button>
                            <button 
                              type="button"
                              onClick={() => setDeleteConfirm({ show: true, id: asset.id, name: asset.asset_name })}
                              className="p-1.5 text-tactical-red hover:bg-tactical-red/10 rounded transition-colors"
                              title="Hapus Data"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>
          </div>

          <div className="tactical-glass tactical-border p-6">
            <h3 className="text-sm font-bold text-tactical-text font-mono flex items-center justify-between gap-3 uppercase tracking-tighter border-b border-tactical-border/50 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <FileText className="text-tactical-cyan" size={18} /> LAPORAN INTELIJEN
              </div>
              <div className="flex items-center gap-3">
                <div className="relative w-48 group">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-tactical-muted group-focus-within:text-tactical-cyan transition-colors" />
                   <input 
                    type="text" 
                    placeholder="SMART SEARCH..."
                    value={intelSearchQuery}
                    onChange={(e) => {
                      setIntelSearchQuery(e.target.value);
                      setIntelPage(1);
                    }}
                    className="w-full bg-black/40 border border-tactical-border/50 rounded-md py-1.5 pl-9 pr-3 text-[10px] font-mono text-tactical-text placeholder:text-tactical-muted focus:outline-none focus:border-tactical-cyan transition-all"
                   />
                </div>
                
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-tactical-muted" />
                  <select
                    value={intelStatusFilter}
                    onChange={(e) => {
                      setIntelStatusFilter(e.target.value);
                      setIntelPage(1);
                    }}
                    className="appearance-none bg-black/40 border border-tactical-border/50 rounded-md py-1.5 pl-8 pr-8 text-[10px] font-mono text-tactical-text focus:outline-none focus:border-tactical-cyan transition-all cursor-pointer"
                  >
                    <option value="ALL">SEMUA STATUS</option>
                    <option value="STABIL">STABIL</option>
                    <option value="TERJAGA">TERJAGA</option>
                    <option value="MENINGKAT">MENINGKAT</option>
                    <option value="TINGGI">TINGGI</option>
                    <option value="KRITIS">KRITIS</option>
                  </select>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-tactical-muted">
                    <ChevronDown size={12} />
                  </div>
                </div>

                <button 
                  onClick={() => setShowIntelModal(true)}
                  className="px-3 py-1.5 bg-tactical-cyan/10 border border-tactical-cyan/30 text-tactical-cyan text-[10px] font-bold font-mono rounded hover:bg-tactical-cyan hover:text-black transition-all flex items-center gap-2 uppercase tracking-widest"
                >
                  <Plus size={12} /> TAMBAH INTELIJEN
                </button>
              </div>
            </h3>
            
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-tactical-border/50 bg-tactical-panel/30">
                    <th className="px-4 py-3 text-left text-[10px] font-mono text-tactical-muted uppercase tracking-widest">Waktu</th>
                    <th className="px-4 py-3 text-left text-[10px] font-mono text-tactical-muted uppercase tracking-widest">Informasi / Temuan</th>
                    <th className="px-4 py-3 text-left text-[10px] font-mono text-tactical-muted uppercase tracking-widest">Lokasi & Alamat</th>
                    <th className="px-4 py-3 text-center text-[10px] font-mono text-tactical-muted uppercase tracking-widest">Status</th>
                    <th className="px-4 py-3 text-right text-[10px] font-mono text-tactical-muted uppercase tracking-widest">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-tactical-border/20">
                  {(() => {
                    const filtered = intelReports.filter(intel => {
                      const q = intelSearchQuery.toLowerCase();
                      const matchesSearch = !intelSearchQuery || (
                        intel.title?.toLowerCase().includes(q) || 
                        intel.content?.toLowerCase().includes(q) || 
                        intel.location_tag?.toLowerCase().includes(q) || 
                        intel.address?.toLowerCase().includes(q)
                      );

                      const statusKeyMap: any = {
                        'STABLE': 'STABIL', 'GUARDED': 'TERJAGA', 'ELEVATED': 'MENINGKAT', 'HIGH': 'TINGGI', 'SEVERE': 'KRITIS',
                        'STABIL': 'STABIL', 'TERJAGA': 'TERJAGA', 'MENINGKAT': 'MENINGKAT', 'TINGGI': 'TINGGI', 'KRITIS': 'KRITIS'
                      };
                      const currentStatus = statusKeyMap[intel.threat_level?.toUpperCase()] || 'STABIL';
                      const matchesStatus = intelStatusFilter === 'ALL' || currentStatus === intelStatusFilter;

                      return matchesSearch && matchesStatus;
                    });

                    const totalItems = filtered.length;
                    const totalPages = Math.ceil(totalItems / intelItemsPerPage);
                    const startIndex = (intelPage - 1) * intelItemsPerPage;
                    const paginatedItems = filtered.slice(startIndex, startIndex + intelItemsPerPage);

                    if (filtered.length === 0) {
                      return (
                        <tr>
                          <td colSpan={5} className="py-10 text-center text-xs font-mono text-tactical-muted italic uppercase">
                            BELUM ADA LAPORAN INTELIJEN TERKAIT MISI INI.
                          </td>
                        </tr>
                      );
                    }

                    return paginatedItems.map((intel) => {
                      const statusKeyMap: any = {
                        'STABLE': 'STABIL', 'GUARDED': 'TERJAGA', 'ELEVATED': 'MENINGKAT', 'HIGH': 'TINGGI', 'SEVERE': 'KRITIS',
                        'STABIL': 'STABIL', 'TERJAGA': 'TERJAGA', 'MENINGKAT': 'MENINGKAT', 'TINGGI': 'TINGGI', 'KRITIS': 'KRITIS'
                      };
                      const currentStatus = statusKeyMap[intel.threat_level?.toUpperCase()] || 'STABIL';

                      const colors: any = {
                        'STABIL': 'text-status-stabil border-status-stabil/30 bg-status-stabil/5',
                        'TERJAGA': 'text-tactical-cyan border-tactical-cyan/30 bg-tactical-cyan/5',
                        'MENINGKAT': 'text-tactical-yellow border-tactical-yellow/30 bg-tactical-yellow/5',
                        'TINGGI': 'text-orange-500 border-orange-500/30 bg-orange-500/5',
                        'KRITIS': 'bg-tactical-red text-white border-tactical-red shadow-[0_0_15px_rgba(239,68,68,0.5)] animate-pulse'
                      };
                      return (
                        <tr key={intel.id} className="group hover:bg-tactical-cyan/5 transition-all">
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex flex-col">
                              <span className="text-[11px] font-bold text-tactical-text font-mono uppercase">
                                {new Date(intel.created_at).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </span>
                              <span className="text-[10px] text-tactical-muted font-mono">
                                {new Date(intel.created_at).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4 max-w-md">
                            <div className="space-y-1">
                              <div className="text-xs font-bold text-tactical-text uppercase tracking-tight">{intel.title}</div>
                              <div className="text-[11px] font-mono text-tactical-muted line-clamp-2 italic">"{intel.content}"</div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 text-[10px] font-mono text-tactical-cyan font-bold uppercase">
                                <MapPin size={10} className="text-tactical-red" /> {intel.location_tag || 'SEKTOR KHUSUS'}
                              </div>
                              {intel.address && (
                                <div className="text-[9px] font-mono text-tactical-muted line-clamp-1 max-w-[200px]">{intel.address}</div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className={`inline-block text-[9px] font-black px-2 py-0.5 rounded border ${colors[currentStatus]} tracking-widest`}>
                              {currentStatus}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {intel.coordinates && (
                                <button 
                                  onClick={() => setSelectedIntelMap(intel)}
                                  className="px-3 py-1.5 bg-tactical-cyan/10 border border-tactical-cyan/30 text-tactical-cyan text-[9px] font-bold font-mono rounded hover:bg-tactical-cyan hover:text-black transition-all flex items-center gap-1.5 uppercase tracking-widest"
                                >
                                  <MapPin size={12} /> LIHAT MAP
                                </button>
                              )}
                              <button 
                                onClick={() => {
                                  setSelectedIntelDetail(intel);
                                  setShowIntelDetailModal(true);
                                }}
                                className="flex items-center gap-1 px-3 py-1 bg-tactical-panel/50 border border-tactical-border/50 text-tactical-muted text-[10px] font-mono rounded hover:bg-tactical-cyan/20 hover:text-tactical-cyan hover:border-tactical-cyan/50 transition-all uppercase tracking-tighter"
                              >
                                <ExternalLink size={12} /> LIHAT DETAIL
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>

            {/* Intel Pagination UI */}
            {(() => {
              const filtered = intelReports.filter(intel => {
                const q = intelSearchQuery.toLowerCase();
                const matchesSearch = !intelSearchQuery || (
                  intel.title?.toLowerCase().includes(q) || 
                  intel.content?.toLowerCase().includes(q) || 
                  intel.location_tag?.toLowerCase().includes(q) || 
                  intel.address?.toLowerCase().includes(q)
                );
                const statusKeyMap: any = {
                  'STABLE': 'STABIL', 'GUARDED': 'TERJAGA', 'ELEVATED': 'MENINGKAT', 'HIGH': 'TINGGI', 'SEVERE': 'KRITIS',
                  'STABIL': 'STABIL', 'TERJAGA': 'TERJAGA', 'MENINGKAT': 'MENINGKAT', 'TINGGI': 'TINGGI', 'KRITIS': 'KRITIS'
                };
                const currentStatus = statusKeyMap[intel.threat_level?.toUpperCase()] || 'STABIL';
                const matchesStatus = intelStatusFilter === 'ALL' || currentStatus === intelStatusFilter;
                return matchesSearch && matchesStatus;
              });

              const totalPages = Math.ceil(filtered.length / intelItemsPerPage);
              if (totalPages <= 1) return null;

              return (
                <div className="mt-4 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-tactical-border/30 pt-4 px-2">
                  <div className="text-[10px] font-mono text-tactical-muted uppercase tracking-widest">
                    HLM <span className="text-tactical-cyan">{intelPage}</span> / <span className="text-tactical-text">{totalPages}</span> | TOTAL <span className="text-tactical-text">{filtered.length}</span> LAPORAN
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => setIntelPage(prev => Math.max(1, prev - 1))}
                      disabled={intelPage === 1}
                      className="px-2 py-1 bg-tactical-panel border border-tactical-border text-tactical-text text-[9px] font-mono rounded hover:bg-tactical-border disabled:opacity-30 disabled:cursor-not-allowed transition-all uppercase"
                    >
                      Prev
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setIntelPage(page)}
                        className={`w-7 py-1 text-[9px] font-mono rounded border transition-all ${
                          intelPage === page 
                            ? 'bg-tactical-cyan text-black border-tactical-cyan font-black' 
                            : 'bg-tactical-panel border-tactical-border text-tactical-muted hover:border-tactical-cyan/50 hover:text-tactical-cyan'
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    <button 
                      onClick={() => setIntelPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={intelPage === totalPages}
                      className="px-2 py-1 bg-tactical-panel border border-tactical-border text-tactical-text text-[9px] font-mono rounded hover:bg-tactical-border disabled:opacity-30 disabled:cursor-not-allowed transition-all uppercase"
                    >
                      Next
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>

          <div className="tactical-glass tactical-border p-6">
            <h3 className="text-sm font-bold text-tactical-text font-mono border-b border-tactical-border pb-3 mb-4 flex items-center gap-2 uppercase">
              <Flag size={16} className="text-tactical-cyan" /> Tujuan Misi
            </h3>
            <div className="bg-tactical-bg/50 border border-tactical-border rounded-lg p-4 font-mono text-sm text-tactical-muted leading-relaxed whitespace-pre-wrap">
              {details.objectives}
            </div>
          </div>

          {/* Documents Section */}
          <div className="tactical-glass tactical-border p-6">
            <h3 className="text-sm font-bold text-tactical-text font-mono flex items-center gap-2 uppercase tracking-tighter border-b border-tactical-border/50 pb-3 mb-6">
              <FileText className="text-tactical-green" size={18} /> REPOSITORI DOKUMEN OPERASI
            </h3>
            
            <div className="space-y-8">
              <DocumentUploader 
                relatedId={Number(id)} 
                category={pathname.includes('/dalam-negeri/') ? 'OPS_DN' : 'OPS_LN'} 
                onSuccess={() => setRefreshDocs(prev => prev + 1)} 
              />
              
              <div className="border-t border-tactical-border/30 pt-6">
                <DocumentList 
                  relatedId={Number(id)} 
                  category={pathname.includes('/dalam-negeri/') ? 'OPS_DN' : 'OPS_LN'} 
                  refreshTrigger={refreshDocs} 
                />
              </div>
            </div>
          </div>

          <div className="tactical-glass tactical-border p-6 relative group">
            <h3 className="text-base font-bold text-tactical-text font-mono border-b border-tactical-border pb-3 mb-4 flex justify-between items-center uppercase">
              <span className="flex items-center gap-2"><MapPin size={18} className="text-tactical-red" /> Tampilan Peta Taktis</span>
              <span className="text-xs font-mono text-tactical-cyan uppercase">
                {details.coordinates ? `Grid: ${details.coordinates}` : "KOORDINAT BELUM DIATUR"}
              </span>
            </h3>

            {/* Alamat Lengkap */}
            <div className="mb-4 flex items-start gap-3 p-3 bg-tactical-bg/50 border border-tactical-border rounded-lg">
              <div className="p-2 bg-tactical-red/10 rounded border border-tactical-red/30">
                <MapPin size={16} className="text-tactical-red" />
              </div>
              <div>
                <div className="text-[10px] font-mono text-tactical-muted uppercase mb-1">Alamat Lengkap / Lokasi Operasi</div>
                <div className="text-sm font-bold text-tactical-text uppercase tracking-tight">{details.location}</div>
              </div>
            </div>
            
            <div className="relative h-[450px] rounded-lg overflow-hidden border border-tactical-border/50">
              {(() => {
                const coords = details.coordinates && details.coordinates.includes(',') 
                  ? details.coordinates.split(',').map((p: string) => parseFloat(p.trim())) as [number, number]
                  : null;
                const isValidCoords = coords && !isNaN(coords[0]) && !isNaN(coords[1]);
                
                return (
                  <MapComponent 
                    targetCenter={isValidCoords ? coords : [-0.7893, 113.9213]} 
                    targetZoom={5}
                    singleMarker={isValidCoords ? coords : null}
                    showControls={true}
                  />
                );
              })()}
            </div>
            
            {!details.coordinates && (
              <div className="mt-4 p-3 bg-tactical-red/10 border border-tactical-red/30 rounded flex items-center gap-3">
                <AlertTriangle className="text-tactical-red" size={18} />
                <p className="text-[10px] font-mono text-tactical-text">
                  PERINGATAN: Titik koordinat operasi belum ditentukan. Silakan perbarui data untuk mengunci lokasi.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Alutsista Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="fixed inset-0 bg-black/90 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl tactical-glass tactical-border p-8"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold text-tactical-text flex items-center gap-2 uppercase tracking-tighter">
                    <Plus className="text-tactical-cyan" /> TAMBAH ALUTSISTA OPERASI
                  </h3>
                  <p className="text-xs font-mono text-tactical-muted uppercase mt-1">Daftarkan alutsista tambahan dari logistik pusat</p>
                </div>
                <button onClick={() => setShowAddModal(false)} className="text-tactical-muted hover:text-tactical-red">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2 relative">
                  <label className="text-[10px] font-mono text-tactical-muted uppercase tracking-widest font-bold">Pilih Alutsista (Logistik)</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tactical-muted" />
                    <input 
                      autoFocus
                      value={newAsset.asset_name}
                      onFocus={() => setShowLogisticsDropdown(true)}
                      onChange={(e) => {
                        setNewAsset({...newAsset, asset_name: e.target.value});
                        setShowLogisticsDropdown(true);
                      }}
                      className="w-full bg-tactical-bg border border-tactical-border rounded p-3 pl-10 text-sm text-tactical-text focus:border-tactical-cyan outline-none font-mono"
                      placeholder="Cari Peralatan..."
                    />
                  </div>
                  
                  <AnimatePresence>
                    {showLogisticsDropdown && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowLogisticsDropdown(false)} />
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute left-0 right-0 top-full mt-1 bg-tactical-panel border border-tactical-cyan/30 rounded shadow-2xl z-20 max-h-60 overflow-y-auto custom-scrollbar"
                        >
                          {masterLogistics
                            .filter(ml => ml.item_name.toLowerCase().includes(newAsset.asset_name.toLowerCase()))
                            .map((ml, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => {
                                  setNewAsset({
                                    ...newAsset, 
                                    asset_name: ml.item_name, 
                                    unit: ml.unit,
                                    asset_type: ml.category === 'Senjata Jenis' ? 'SENJATA' : 'ALUTSISTA'
                                  });
                                  setShowLogisticsDropdown(false);
                                }}
                                className="w-full p-3 text-left text-xs font-mono hover:bg-tactical-cyan/10 text-tactical-text border-b border-tactical-border/30 last:border-0 flex justify-between items-center"
                              >
                                <span>{ml.item_name}</span>
                                <span className="text-[10px] text-tactical-muted bg-tactical-bg px-2 py-0.5 rounded uppercase tracking-tighter">{(ml as any).category}</span>
                              </button>
                            ))
                          }
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-tactical-muted uppercase tracking-widest font-bold">Kuantitas</label>
                    <input 
                      type="number"
                      min="1"
                      value={newAsset.quantity}
                      onChange={(e) => setNewAsset({...newAsset, quantity: parseInt(e.target.value) || 1})}
                      className="w-full bg-tactical-bg border border-tactical-border rounded p-3 text-sm text-tactical-text focus:border-tactical-cyan outline-none font-mono text-center"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-tactical-muted uppercase tracking-widest font-bold">Satuan</label>
                    <div className="w-full bg-tactical-bg/50 border border-tactical-border rounded p-3 text-sm text-tactical-muted font-mono text-center">
                      {newAsset.unit || '-'}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-tactical-muted uppercase tracking-widest font-bold">Keterangan</label>
                  <textarea 
                    value={newAsset.description || ''}
                    onChange={(e) => setNewAsset({...newAsset, description: e.target.value})}
                    className="w-full bg-tactical-bg border border-tactical-border rounded p-3 text-sm text-tactical-text focus:border-tactical-cyan outline-none font-mono h-20 resize-none"
                    placeholder="Catatan tambahan..."
                  />
                </div>

                <button 
                  onClick={handleAddAsset}
                  disabled={isSubmitting || !newAsset.asset_name}
                  className="w-full py-4 bg-tactical-cyan text-black font-black text-sm font-mono rounded hover:bg-tactical-cyan/80 transition-all flex items-center justify-center gap-2 uppercase tracking-widest disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
                  TUGASKAN ALUTSISTA
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Alutsista Modal */}
      <AnimatePresence>
        {showEditModal && editingAsset && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEditModal(false)}
              className="fixed inset-0 bg-black/90 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md tactical-glass tactical-border p-8"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold text-tactical-text flex items-center gap-2 uppercase tracking-tighter">
                    <Edit className="text-tactical-green" /> UPDATE ALUTSISTA
                  </h3>
                  <p className="text-xs font-mono text-tactical-muted uppercase mt-1">{editingAsset.asset_name}</p>
                </div>
                <button onClick={() => setShowEditModal(false)} className="text-tactical-muted hover:text-tactical-red">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-tactical-muted uppercase tracking-widest font-bold">Kuantitas</label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="number"
                      min="1"
                      value={editingAsset.quantity}
                      onChange={(e) => setEditingAsset({...editingAsset, quantity: parseInt(e.target.value) || 1})}
                      className="w-full bg-tactical-bg border border-tactical-border rounded p-3 text-sm text-tactical-text focus:border-tactical-green outline-none font-mono text-center"
                    />
                    <span className="text-xs font-mono text-tactical-muted uppercase">{editingAsset.unit || 'UNIT'}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-tactical-muted uppercase tracking-widest font-bold">Status Kondisi</label>
                  <select 
                    value={editingAsset.condition_status}
                    onChange={(e) => setEditingAsset({...editingAsset, condition_status: e.target.value})}
                    className="w-full bg-tactical-bg border border-tactical-border rounded p-3 text-sm text-tactical-text focus:border-tactical-green outline-none font-mono uppercase"
                  >
                    <option value="EFEKTIF">EFEKTIF</option>
                    <option value="TIDAK EFEKTIF">TIDAK EFEKTIF</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-tactical-muted uppercase tracking-widest font-bold">Keterangan</label>
                  <textarea 
                    value={editingAsset.description || ''}
                    onChange={(e) => setEditingAsset({...editingAsset, description: e.target.value})}
                    className="w-full bg-tactical-bg border border-tactical-border rounded p-3 text-sm text-tactical-text focus:border-tactical-green outline-none font-mono h-24 resize-none"
                    placeholder="Catatan tambahan alutsista..."
                  />
                </div>

                <button 
                  onClick={handleUpdateAsset}
                  disabled={isSubmitting}
                  className="w-full py-4 bg-tactical-green text-black font-black text-sm font-mono rounded hover:bg-tactical-green/80 transition-all flex items-center justify-center gap-2 uppercase tracking-widest disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Shield size={20} />}
                  UPDATE DATA
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Stock Warning Modal */}
      <AnimatePresence>
        {stockWarning && stockWarning.show && (
          <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setStockWarning(null)}
              className="fixed inset-0 bg-black/95 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm tactical-glass border border-tactical-red/50 p-8 text-center"
            >
              <div className="w-16 h-16 bg-tactical-red/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-tactical-red/30">
                <AlertTriangle className="text-tactical-red" size={32} />
              </div>
              <h3 className="text-xl font-bold text-tactical-text uppercase tracking-tighter mb-2">Stok Alutsista Kurang</h3>
              <p className="text-sm font-mono text-tactical-muted mb-6 leading-relaxed">
                Permintaan distribusi untuk <span className="text-tactical-red font-bold">{stockWarning.name}</span> melebihi kapasitas inventaris.
              </p>
              
              <div className="bg-tactical-bg/50 border border-tactical-border rounded p-4 mb-6">
                <div className="text-[10px] font-mono text-tactical-muted uppercase tracking-widest mb-1">Stok Tersedia</div>
                <div className="text-3xl font-black text-tactical-red font-mono">{stockWarning.current}</div>
              </div>

              <button 
                onClick={() => setStockWarning(null)}
                className="w-full py-3 bg-tactical-red text-white font-bold font-mono rounded hover:bg-tactical-red/80 transition-all uppercase tracking-widest"
              >
                KEMBALI & SESUAIKAN
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && deleteConfirm.show && (
          <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirm(null)}
              className="fixed inset-0 bg-black/95 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm tactical-glass border border-tactical-red/50 p-8 text-center"
            >
              <div className="w-16 h-16 bg-tactical-red/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-tactical-red/30">
                <Trash2 className="text-tactical-red" size={32} />
              </div>
              <h3 className="text-xl font-bold text-tactical-text uppercase tracking-tighter mb-2">Hapus Alutsista</h3>
              <p className="text-sm font-mono text-tactical-muted mb-6 leading-relaxed">
                Apakah Anda yakin ingin menghapus <span className="text-tactical-red font-bold">"{deleteConfirm.name}"</span> dari operasi ini?
              </p>
              
              <div className="flex gap-4">
                <button 
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-3 bg-tactical-bg border border-tactical-border text-tactical-muted font-bold font-mono rounded hover:bg-tactical-panel transition-all uppercase tracking-widest"
                >
                  TIDAK
                </button>
                <button 
                  onClick={handleDeleteAsset}
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-tactical-red text-white font-bold font-mono rounded hover:bg-tactical-red/80 transition-all uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                  YA
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Operation Delete Confirmation Modal */}
      <AnimatePresence>
        {opDeleteConfirm && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpDeleteConfirm(false)}
              className="fixed inset-0 bg-black/95 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md tactical-glass border border-tactical-red p-10 text-center"
            >
              <div className="w-20 h-20 bg-tactical-red/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-tactical-red/30 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                <AlertTriangle className="text-tactical-red" size={40} />
              </div>
              <h3 className="text-2xl font-bold text-tactical-text uppercase tracking-tighter mb-4">DEKOMISI OPERASI</h3>
              <p className="text-sm font-mono text-tactical-muted mb-8 leading-relaxed">
                PERINGATAN: Menghapus operasi <span className="text-tactical-red font-bold">"{details.name}"</span> akan mengembalikan seluruh logistik ke pusat dan mereset status personel. Tindakan ini tidak dapat dibatalkan.
              </p>
              
              <div className="flex gap-4">
                <button 
                  onClick={() => setOpDeleteConfirm(false)}
                  className="flex-1 py-4 bg-tactical-bg border border-tactical-border text-tactical-muted font-bold font-mono rounded hover:bg-tactical-panel transition-all uppercase tracking-widest"
                >
                  TIDAK
                </button>
                <button 
                  onClick={handleDelete}
                  disabled={isSubmitting}
                  className="flex-1 py-4 bg-tactical-red text-white font-bold font-mono rounded hover:bg-tactical-red/80 transition-all uppercase tracking-widest flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(239,68,68,0.3)]"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
                  YA
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Intelligence Modal */}
      <AnimatePresence>
        {showIntelModal && (
          <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowIntelModal(false)}
              className="fixed inset-0 bg-black/90 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-6xl tactical-glass border border-tactical-cyan/50 p-8 shadow-[0_0_50px_rgba(34,211,238,0.15)] flex flex-col md:flex-row gap-8"
            >
              <div className="flex-1 space-y-6">
                <div className="flex items-center justify-between border-b border-tactical-border pb-4 mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-tactical-text font-mono flex items-center gap-3 uppercase">
                      <FileText className="text-tactical-cyan" /> INPUT LAPORAN INTELIJEN
                    </h3>
                    <p className="text-[10px] font-mono text-tactical-muted uppercase mt-1 tracking-widest">Catat temuan intelijen baru untuk misi ini</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-tactical-muted uppercase tracking-widest font-bold">Judul Laporan / Temuan</label>
                    <input 
                      autoFocus
                      value={newIntel.title}
                      onChange={(e) => setNewIntel({...newIntel, title: e.target.value})}
                      className="w-full bg-tactical-bg border border-tactical-border rounded p-3 text-sm text-tactical-text focus:border-tactical-cyan outline-none font-mono"
                      placeholder="Contoh: Deteksi Pergerakan Massa Sektor C..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-tactical-muted uppercase tracking-widest font-bold">Tingkat Ancaman</label>
                      <select 
                        value={newIntel.threat_level}
                        onChange={(e) => setNewIntel({...newIntel, threat_level: e.target.value})}
                        className="w-full bg-tactical-bg border border-tactical-border rounded p-3 text-sm text-tactical-text focus:border-tactical-cyan outline-none font-mono appearance-none"
                      >
                        <option value="STABIL">STABIL</option>
                        <option value="TERJAGA">TERJAGA</option>
                        <option value="MENINGKAT">MENINGKAT</option>
                        <option value="TINGGI">TINGGI</option>
                        <option value="KRITIS">KRITIS</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-tactical-muted uppercase tracking-widest font-bold">Label Lokasi / Sektor</label>
                      <input 
                        value={newIntel.location_tag}
                        onChange={(e) => setNewIntel({...newIntel, location_tag: e.target.value})}
                        className="w-full bg-tactical-bg border border-tactical-border rounded p-3 text-sm text-tactical-text focus:border-tactical-cyan outline-none font-mono"
                        placeholder="Sektor C-4, Pos Utama, dll..."
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-tactical-muted uppercase tracking-widest font-bold">Isi Laporan Intelijen</label>
                    <textarea 
                      value={newIntel.content}
                      onChange={(e) => setNewIntel({...newIntel, content: e.target.value})}
                      className="w-full bg-tactical-bg border border-tactical-border rounded p-3 text-sm text-tactical-text focus:border-tactical-cyan outline-none font-mono h-32 resize-none"
                      placeholder="Deskripsikan temuan intelijen secara detail..."
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-tactical-muted uppercase tracking-widest font-bold">Alamat Lengkap</label>
                      <textarea 
                        value={newIntel.address}
                        onChange={(e) => setNewIntel({...newIntel, address: e.target.value})}
                        className="w-full bg-tactical-bg border border-tactical-border rounded p-3 text-sm text-tactical-text focus:border-tactical-cyan outline-none font-mono h-20 resize-none"
                        placeholder="Masukkan alamat lengkap lokasi temuan..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 space-y-6">
                <div className="flex items-center justify-between border-b border-tactical-border pb-4 mb-6">
                   <div>
                    <h3 className="text-xl font-bold text-tactical-text font-mono flex items-center gap-3 uppercase">
                      <MapPin className="text-tactical-red" /> GEOGRAPHIC LOCK
                    </h3>
                    <p className="text-[10px] font-mono text-tactical-muted uppercase mt-1 tracking-widest">Klik pada peta untuk mengunci koordinat</p>
                  </div>
                  <button onClick={() => setShowIntelModal(false)} className="text-tactical-muted hover:text-tactical-red transition-colors">
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-tactical-muted uppercase tracking-widest font-bold">Koordinat (Lat, Lng)</label>
                    <div className="relative">
                      <input 
                        value={newIntel.coordinates}
                        onChange={(e) => setNewIntel({...newIntel, coordinates: e.target.value})}
                        className="w-full bg-tactical-bg border border-tactical-border rounded p-3 text-sm text-tactical-text focus:border-tactical-cyan outline-none font-mono"
                        placeholder="-6.1234, 106.1234"
                      />
                      <Crosshair className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tactical-cyan animate-pulse" />
                    </div>
                  </div>

                  <div className="h-[300px] rounded border border-tactical-border overflow-hidden">
                    <MapComponent 
                      selectable={true}
                      onSelectCoordinates={(coords) => {
                        setNewIntel({...newIntel, coordinates: `${coords[0].toFixed(6)}, ${coords[1].toFixed(6)}`});
                      }}
                      singleMarker={newIntel.coordinates && newIntel.coordinates.includes(',') ? newIntel.coordinates.split(',').map(c => parseFloat(c.trim())) as [number, number] : null}
                      targetCenter={newIntel.coordinates && newIntel.coordinates.includes(',') ? newIntel.coordinates.split(',').map(c => parseFloat(c.trim())) as [number, number] : [-0.7893, 113.9213]}
                      targetZoom={newIntel.coordinates ? 15 : 5}
                    />
                  </div>

                  <div className="bg-tactical-panel/50 p-4 border border-tactical-border rounded flex items-center gap-3 mt-4">
                    <div className="p-2 bg-tactical-cyan/10 rounded">
                      <Shield className="text-tactical-cyan" size={16} />
                    </div>
                    <p className="text-[10px] font-mono text-tactical-muted uppercase leading-relaxed">
                      Laporan ini akan otomatis ditandai sebagai <span className="text-tactical-cyan font-bold">RAHASIA (CLASSIFIED)</span> dan hanya dapat diakses oleh level komando.
                    </p>
                  </div>

                  <button 
                    onClick={handleAddIntel}
                    disabled={isSubmitting || !newIntel.title || !newIntel.content}
                    className="w-full py-4 bg-tactical-cyan text-black font-black text-sm font-mono rounded hover:bg-tactical-cyan/80 transition-all flex items-center justify-center gap-2 uppercase tracking-widest disabled:opacity-50 shadow-[0_0_20px_rgba(34,211,238,0.2)]"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <FileText size={20} />}
                    KIRIM LAPORAN INTELIJEN
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Intel Map Zoom Modal */}
      <AnimatePresence>
        {selectedIntelMap && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 md:p-10">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedIntelMap(null)}
              className="fixed inset-0 bg-black/95 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full h-full max-w-7xl max-h-[90vh] bg-tactical-bg border-2 border-tactical-cyan/50 rounded-lg overflow-hidden shadow-[0_0_100px_rgba(34,211,238,0.3)] flex flex-col"
            >
              <div className="flex items-center justify-between p-4 bg-tactical-cyan/10 border-b border-tactical-cyan/30">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-tactical-cyan/20 rounded">
                    <MapPin className="text-tactical-cyan" size={20} />
                  </div>
                  <div className="flex items-center gap-3">
                    <div>
                      <h3 className="text-lg font-black text-tactical-text font-mono uppercase tracking-widest leading-none">{selectedIntelMap.title}</h3>
                      <p className="text-[10px] font-mono text-tactical-muted uppercase tracking-tighter mt-1">
                        Geographic Lock: {selectedIntelMap.coordinates} | {selectedIntelMap.location_tag}
                      </p>
                    </div>
                    {(() => {
                        const statusKeyMap: any = {
                          'STABLE': 'STABIL',
                          'GUARDED': 'TERJAGA',
                          'ELEVATED': 'MENINGKAT',
                          'HIGH': 'TINGGI',
                          'SEVERE': 'KRITIS',
                          'STABIL': 'STABIL',
                          'TERJAGA': 'TERJAGA',
                          'MENINGKAT': 'MENINGKAT',
                          'TINGGI': 'TINGGI',
                          'KRITIS': 'KRITIS'
                        };
                        const currentStatus = statusKeyMap[selectedIntelMap.threat_level?.toUpperCase()] || 'STABIL';

                        const colors: any = {
                          'STABIL': 'text-tactical-green border-tactical-green/30 bg-tactical-green/5',
                          'TERJAGA': 'text-tactical-cyan border-tactical-cyan/30 bg-tactical-cyan/5',
                          'MENINGKAT': 'text-tactical-yellow border-tactical-yellow/30 bg-tactical-yellow/5',
                          'TINGGI': 'text-orange-500 border-orange-500/30 bg-orange-500/5',
                          'KRITIS': 'bg-tactical-red text-white border-tactical-red shadow-[0_0_15px_rgba(239,68,68,0.5)] animate-pulse'
                        };
                        
                        return (
                          <span className={`text-[10px] font-black px-3 py-1 rounded border ${colors[currentStatus]} tracking-[0.2em] uppercase`}>
                            {currentStatus}
                          </span>
                        );
                    })()}
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedIntelMap(null)}
                  className="p-2 hover:bg-tactical-red/20 text-tactical-muted hover:text-tactical-red rounded transition-all"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 relative">
                <MapComponent 
                  targetCenter={selectedIntelMap.coordinates.split(',').map((c: string) => parseFloat(c.trim())) as [number, number]}
                  targetZoom={9}
                  showControls={true}
                  singleMarker={selectedIntelMap.coordinates.split(',').map((c: string) => parseFloat(c.trim())) as [number, number]}
                />
                
                {/* Tactical Overlay */}
                <div className="absolute bottom-24 left-6 z-[1000] p-5 tactical-glass border border-tactical-cyan/30 w-full max-w-md shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                   <div className="text-[10px] font-mono text-tactical-cyan font-bold mb-2 uppercase tracking-widest flex items-center gap-2">
                      <div className="w-1 h-1 bg-tactical-cyan animate-pulse"></div> DETAIL INTELIJEN
                   </div>
                   <p className="text-xs font-mono text-tactical-text leading-relaxed italic mb-3">
                     "{selectedIntelMap.content}"
                   </p>
                   {selectedIntelMap.address && (
                     <div className="pt-3 border-t border-tactical-border/30 text-[10px] font-mono text-tactical-muted">
                        <span className="text-tactical-cyan font-bold">LOKASI:</span> {selectedIntelMap.address}
                     </div>
                   )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Intel Detail Modal */}
      <AnimatePresence>
        {showIntelDetailModal && selectedIntelDetail && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowIntelDetailModal(false)}
              className="fixed inset-0 bg-black/95 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-6xl tactical-glass border border-tactical-cyan/50 p-8 shadow-[0_0_50px_rgba(34,211,238,0.2)] flex flex-col md:flex-row gap-8"
            >
              <div className="flex-1 space-y-6">
                <div className="flex items-center justify-between border-b border-tactical-border pb-4 mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-tactical-text font-mono flex items-center gap-3 uppercase">
                      <FileText className="text-tactical-cyan" /> DETAIL LAPORAN INTELIJEN
                    </h3>
                    <p className="text-[10px] font-mono text-tactical-muted uppercase mt-1 tracking-widest">ID LAPORAN: #INTEL-{selectedIntelDetail.id}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-tactical-muted uppercase tracking-widest font-bold">Judul Laporan / Temuan</label>
                    <div className="w-full bg-tactical-bg/50 border border-tactical-border rounded p-3 text-sm text-tactical-text font-mono font-bold uppercase">
                      {selectedIntelDetail.title}
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
                        const currentStatus = statusKeyMap[selectedIntelDetail.threat_level?.toUpperCase()] || 'STABIL';
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
                        {selectedIntelDetail.location_tag}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-tactical-muted uppercase tracking-widest font-bold">Isi Laporan Intelijen</label>
                    <div className="w-full bg-tactical-bg/50 border border-tactical-border rounded p-3 text-xs text-tactical-text font-mono h-32 overflow-y-auto custom-scrollbar leading-relaxed">
                      {selectedIntelDetail.content}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-tactical-muted uppercase tracking-widest font-bold">Alamat Lengkap</label>
                    <div className="w-full bg-tactical-bg/50 border border-tactical-border rounded p-3 text-[11px] text-tactical-muted font-mono h-20 overflow-y-auto custom-scrollbar">
                      {selectedIntelDetail.address || "ALAMAT TIDAK TERSEDIA"}
                    </div>
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
                  <button onClick={() => setShowIntelDetailModal(false)} className="text-tactical-muted hover:text-tactical-red transition-colors">
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-tactical-muted uppercase tracking-widest font-bold">Koordinat Taktis</label>
                    <div className="w-full bg-tactical-bg/50 border border-tactical-cyan/30 rounded p-3 text-sm text-tactical-cyan font-mono flex items-center gap-2">
                       <Crosshair size={14} className="animate-pulse" /> {selectedIntelDetail.coordinates}
                    </div>
                  </div>

                  <div className="h-[300px] rounded border border-tactical-border overflow-hidden">
                    <MapComponent 
                      targetCenter={selectedIntelDetail.coordinates ? selectedIntelDetail.coordinates.split(',').map(Number) as [number, number] : [0, 0]} 
                      targetZoom={9}
                      intelReports={[selectedIntelDetail]}
                    />
                  </div>
                  
                    <div className="flex gap-4 pt-4">
                    <button 
                      onClick={() => {
                        setEditingIntel(selectedIntelDetail);
                        setShowEditIntelModal(true);
                      }}
                      className="flex-1 py-4 bg-tactical-panel border border-tactical-yellow/30 text-tactical-yellow font-black text-sm font-mono rounded hover:bg-tactical-yellow/10 transition-all uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                      <Edit size={18} /> EDIT
                    </button>
                    <button 
                      onClick={() => setIntelDeleteConfirm({ show: true, id: selectedIntelDetail.id, title: selectedIntelDetail.title })}
                      className="flex-1 py-4 bg-tactical-panel border border-tactical-red/30 text-tactical-red font-black text-sm font-mono rounded hover:bg-tactical-red/10 transition-all uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                      <Trash2 size={18} /> HAPUS
                    </button>
                    <button 
                      onClick={() => setShowIntelDetailModal(false)}
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

      {/* Edit Intel Modal */}
      <AnimatePresence>
        {showEditIntelModal && editingIntel && (
          <div className="fixed inset-0 z-[2100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEditIntelModal(false)}
              className="fixed inset-0 bg-black/95 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-6xl tactical-glass border border-tactical-yellow/50 p-8 shadow-[0_0_50px_rgba(253,224,71,0.1)] flex flex-col md:flex-row gap-8"
            >
              <div className="flex-1 space-y-6">
                <div className="flex items-center justify-between border-b border-tactical-border pb-4 mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-tactical-text font-mono flex items-center gap-3 uppercase">
                      <Edit className="text-tactical-yellow" /> EDIT LAPORAN INTELIJEN
                    </h3>
                    <p className="text-[10px] font-mono text-tactical-muted uppercase mt-1 tracking-widest">Memperbarui temuan intelijen #INTEL-{editingIntel.id}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-tactical-muted uppercase tracking-widest font-bold">Judul Laporan / Temuan</label>
                    <input 
                      value={editingIntel.title}
                      onChange={(e) => setEditingIntel({...editingIntel, title: e.target.value})}
                      className="w-full bg-tactical-bg border border-tactical-border rounded p-3 text-sm text-tactical-text focus:border-tactical-yellow outline-none font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-tactical-muted uppercase tracking-widest font-bold">Tingkat Ancaman</label>
                      <select 
                        value={editingIntel.threat_level}
                        onChange={(e) => setEditingIntel({...editingIntel, threat_level: e.target.value})}
                        className="w-full bg-tactical-bg border border-tactical-border rounded p-3 text-sm text-tactical-text focus:border-tactical-yellow outline-none font-mono appearance-none"
                      >
                        <option value="STABIL">STABIL</option>
                        <option value="TERJAGA">TERJAGA</option>
                        <option value="MENINGKAT">MENINGKAT</option>
                        <option value="TINGGI">TINGGI</option>
                        <option value="KRITIS">KRITIS</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-tactical-muted uppercase tracking-widest font-bold">Label Lokasi / Sektor</label>
                      <input 
                        value={editingIntel.location_tag}
                        onChange={(e) => setEditingIntel({...editingIntel, location_tag: e.target.value})}
                        className="w-full bg-tactical-bg border border-tactical-border rounded p-3 text-sm text-tactical-text focus:border-tactical-yellow outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-tactical-muted uppercase tracking-widest font-bold">Isi Laporan Intelijen</label>
                    <textarea 
                      value={editingIntel.content}
                      onChange={(e) => setEditingIntel({...editingIntel, content: e.target.value})}
                      className="w-full bg-tactical-bg border border-tactical-border rounded p-3 text-sm text-tactical-text focus:border-tactical-yellow outline-none font-mono h-32 resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-tactical-muted uppercase tracking-widest font-bold">Alamat Lengkap</label>
                    <textarea 
                      value={editingIntel.address}
                      onChange={(e) => setEditingIntel({...editingIntel, address: e.target.value})}
                      className="w-full bg-tactical-bg border border-tactical-border rounded p-3 text-sm text-tactical-text focus:border-tactical-yellow outline-none font-mono h-20 resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex-1 space-y-6">
                <div className="flex items-center justify-between border-b border-tactical-border pb-4 mb-6">
                   <div>
                    <h3 className="text-xl font-bold text-tactical-text font-mono flex items-center gap-3 uppercase">
                      <MapPin className="text-tactical-red" /> LOCATION ADJUSTMENT
                    </h3>
                    <p className="text-[10px] font-mono text-tactical-muted uppercase mt-1 tracking-widest">Klik pada peta untuk memperbarui koordinat</p>
                  </div>
                  <button onClick={() => setShowEditIntelModal(false)} className="text-tactical-muted hover:text-tactical-red transition-colors">
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-tactical-muted uppercase tracking-widest font-bold">Koordinat (Lat, Lng)</label>
                    <div className="relative">
                      <input 
                        value={editingIntel.coordinates}
                        onChange={(e) => setEditingIntel({...editingIntel, coordinates: e.target.value})}
                        className="w-full bg-tactical-bg border border-tactical-border rounded p-3 text-sm text-tactical-text focus:border-tactical-yellow outline-none font-mono"
                      />
                      <Crosshair className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tactical-yellow animate-pulse" />
                    </div>
                  </div>

                  <div className="h-[300px] rounded border border-tactical-border overflow-hidden">
                    <MapComponent 
                      targetCenter={editingIntel.coordinates ? editingIntel.coordinates.split(',').map(Number) as [number, number] : [0, 0]} 
                      targetZoom={10}
                      selectable={true}
                      onSelectCoordinates={(coords) => setEditingIntel({...editingIntel, coordinates: `${coords[0].toFixed(6)}, ${coords[1].toFixed(6)}`})}
                      intelReports={[editingIntel]}
                    />
                  </div>
                  
                  <div className="flex gap-4 pt-4">
                    <button 
                      onClick={() => setShowEditIntelModal(false)}
                      className="flex-1 py-4 bg-tactical-bg border border-tactical-border text-tactical-muted font-black text-sm font-mono rounded hover:bg-tactical-panel transition-all uppercase tracking-widest"
                    >
                      BATAL
                    </button>
                    <button 
                      onClick={handleUpdateIntel}
                      disabled={isSubmitting}
                      className="flex-1 py-4 bg-tactical-yellow text-black font-black text-sm font-mono rounded hover:bg-tactical-yellow/80 transition-all uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Shield size={20} />}
                      SIMPAN PERUBAHAN
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Intel Delete Confirmation */}
      <AnimatePresence>
        {intelDeleteConfirm && intelDeleteConfirm.show && (
          <div className="fixed inset-0 z-[2200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIntelDeleteConfirm(null)}
              className="fixed inset-0 bg-black/95 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm tactical-glass border border-tactical-red/50 p-8 text-center"
            >
              <div className="w-16 h-16 bg-tactical-red/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-tactical-red/30">
                <Trash2 className="text-tactical-red" size={32} />
              </div>
              <h3 className="text-xl font-bold text-tactical-text uppercase tracking-tighter mb-2">Hapus Laporan</h3>
              <p className="text-sm font-mono text-tactical-muted mb-6 leading-relaxed">
                Apakah Anda yakin ingin menghapus laporan <span className="text-tactical-red font-bold">"{intelDeleteConfirm.title}"</span>?
              </p>
              
              <div className="flex gap-4">
                <button 
                  onClick={() => setIntelDeleteConfirm(null)}
                  className="flex-1 py-3 bg-tactical-bg border border-tactical-border text-tactical-muted font-bold font-mono rounded hover:bg-tactical-panel transition-all uppercase tracking-widest"
                >
                  BATAL
                </button>
                <button 
                  onClick={handleDeleteIntel}
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-tactical-red text-white font-bold font-mono rounded hover:bg-tactical-red/80 transition-all uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                  YA, HAPUS
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
