"use client";

import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  MapPin, 
  Users, 
  Target, 
  Shield, 
  Calendar, 
  Activity, 
  Flag,
  AlertTriangle,
  History,
  FileText,
  Edit,
  Trash2,
  User,
  ExternalLink,
  Loader2,
  Crosshair
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { deleteOpDalamNegeri, deleteOpLuarNegeri } from "@/app/actions";
import Link from "next/link";
import dynamic from "next/dynamic";

const MapComponent = dynamic(() => import("../map/MapComponent"), { 
  ssr: false,
  loading: () => <div className="h-[300px] bg-tactical-bg flex items-center justify-center text-tactical-green font-mono text-xs uppercase">Connecting to Satellite...</div>
});

export default function OperationDetailClient({ id, initialData }: { id: string, initialData: any }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const details = {
    name: initialData?.operation_name || initialData?.name || (id !== "undefined" ? `SATGAS OPS ${id}` : "SATGAS OPS"),
    code: `OPS-TAC-${id !== "undefined" ? String(id).padStart(3, '0') : "000"}`,
    location: initialData?.location || "Area of Responsibility",
    coordinates: initialData?.coordinates || null,
    status: initialData?.status || "ACTIVE",
    priority: "HIGH",
    deploymentDate: "12 Jan 2026",
    personnel: (initialData?.commander ? 1 : 0) + (initialData?.members?.length || 0),
    type: initialData?.type || "Special Operations",
    commander: initialData?.commander || null,
    members: initialData?.members || [],
    objectives: initialData?.mission_objectives || "Mission objectives have not been explicitly defined in the tactical plan.",
    intelSummary: "Recent surveillance indicates increased movement in the northern sector. Tactical teams are on high alert.",
    timeline: [
      { date: "10 May 2026", event: "Routine patrol completed. No anomalies detected." },
      { date: "08 May 2026", event: "Personnel rotation successful. Fresh troops deployed." },
      { date: "05 May 2026", event: "Strategic meeting with local leadership held." }
    ]
  };

  const handleDelete = async () => {
    if (!confirm("Apakah Anda yakin ingin menghapus operasi ini?")) return;
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
              <p className="text-tactical-muted font-mono text-xs tracking-widest">{details.code} | {details.location}</p>
              {details.coordinates && (
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-tactical-cyan/10 border border-tactical-cyan/30 rounded text-[9px] font-mono text-tactical-cyan">
                  <Crosshair size={10} /> {details.coordinates}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex gap-3">
          <Link 
            href={editLink}
            className="px-4 py-2 bg-tactical-cyan/10 border border-tactical-cyan/30 rounded text-xs font-mono text-tactical-cyan font-bold hover:bg-tactical-cyan hover:text-black transition-all flex items-center gap-2"
          >
            <Edit size={14} /> EDIT DATA
          </Link>
          <button 
            onClick={handleDelete}
            disabled={isSubmitting}
            className="px-4 py-2 bg-tactical-red/10 border border-tactical-red/30 rounded text-xs font-mono text-tactical-red font-bold hover:bg-tactical-red hover:text-white transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />} DELETE
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
              <div className="text-2xl font-bold text-tactical-text">{details.personnel} <span className="text-xs font-normal text-tactical-muted font-mono">PX</span></div>
              <div className="text-[9px] font-mono text-tactical-cyan uppercase mt-1">{details.type}</div>
            </div>
            
            <div className="tactical-glass tactical-border p-4 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                <Calendar size={48} className="text-tactical-yellow" />
              </div>
              <div className="text-[10px] font-mono text-tactical-muted mb-2 uppercase">Mission Duration</div>
              <div className="text-2xl font-bold text-tactical-text">120 <span className="text-xs font-normal text-tactical-muted font-mono">DAYS</span></div>
              <div className="text-[9px] font-mono text-tactical-muted uppercase mt-1">ESTABLISHED: {details.deploymentDate}</div>
            </div>

            <div className="tactical-glass tactical-border p-4 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                <Shield size={48} className="text-tactical-red" />
              </div>
              <div className="text-[10px] font-mono text-tactical-muted mb-2 uppercase">Operational Command</div>
              <div className="text-2xl font-bold text-tactical-text">{details.priority}</div>
              <div className="text-[9px] font-mono text-tactical-red uppercase mt-1 tracking-tighter">Level 5 Clearance Active</div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="tactical-glass tactical-border p-6">
              <h3 className="text-sm font-bold text-tactical-text font-mono border-b border-tactical-border pb-3 mb-4 flex items-center gap-2 uppercase">
                <Shield size={16} className="text-tactical-yellow" /> Komandan Bertugas
              </h3>
              {details.commander ? (
                <div className="flex items-center gap-4 p-4 bg-tactical-panel/50 border border-tactical-yellow/30 rounded-lg group">
                  <div className="w-16 h-16 bg-tactical-bg border border-tactical-border rounded-full flex items-center justify-center text-tactical-muted relative overflow-hidden">
                    <User size={32} />
                  </div>
                  <div className="flex-1">
                    <div className="text-lg font-bold text-tactical-text uppercase tracking-tighter">{details.commander.name}</div>
                    <div className="text-xs font-mono text-tactical-yellow uppercase mb-1">{details.commander.rank}</div>
                    <div className="text-[10px] font-mono text-tactical-muted">NRP: {details.commander.nrp}</div>
                  </div>
                  <Link href={`/personnel/${details.commander.id}`} className="p-2 hover:bg-tactical-yellow/10 rounded text-tactical-yellow transition-all">
                    <ExternalLink size={18} />
                  </Link>
                </div>
              ) : (
                <div className="py-8 text-center text-xs font-mono text-tactical-muted italic border border-dashed border-tactical-border rounded">
                  No commander assigned to this mission.
                </div>
              )}
            </div>

            <div className="tactical-glass tactical-border p-6">
              <h3 className="text-sm font-bold text-tactical-text font-mono border-b border-tactical-border pb-3 mb-4 flex items-center gap-2 uppercase">
                <Users size={16} className="text-tactical-cyan" /> Anggota Bertugas ({details.members.length})
              </h3>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {details.members.length > 0 ? (
                  details.members.map((member: any) => (
                    <div key={member.id} className="flex items-center gap-3 p-2 bg-tactical-panel/30 border border-tactical-border rounded hover:border-tactical-cyan/50 transition-all group">
                      <div className="w-10 h-10 bg-tactical-bg border border-tactical-border rounded-full flex items-center justify-center text-tactical-muted">
                        <User size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-tactical-text truncate">{member.name}</div>
                        <div className="text-[9px] font-mono text-tactical-muted uppercase">{member.rank} | {member.nrp}</div>
                      </div>
                      <Link href={`/personnel/${member.id}`} className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-tactical-cyan/10 rounded text-tactical-cyan transition-all">
                        <ExternalLink size={14} />
                      </Link>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-xs font-mono text-tactical-muted italic border border-dashed border-tactical-border rounded">
                    No members assigned.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="tactical-glass tactical-border p-6">
            <h3 className="text-sm font-bold text-tactical-text font-mono border-b border-tactical-border pb-3 mb-4 flex items-center gap-2 uppercase">
              <Flag size={16} className="text-tactical-cyan" /> Mission Objectives
            </h3>
            <div className="bg-tactical-bg/50 border border-tactical-border rounded-lg p-4 font-mono text-sm text-tactical-muted leading-relaxed whitespace-pre-wrap">
              {details.objectives}
            </div>
          </div>

          <div className="tactical-glass tactical-border p-6 relative group">
            <h3 className="text-sm font-bold text-tactical-text font-mono border-b border-tactical-border pb-3 mb-4 flex justify-between items-center uppercase">
              <span className="flex items-center gap-2"><MapPin size={16} className="text-tactical-red" /> Tactical Map View</span>
              <span className="text-[10px] font-mono text-tactical-cyan uppercase">
                {details.coordinates ? `Grid: ${details.coordinates}` : "NO COORDINATES SET"}
              </span>
            </h3>
            
            <div className="relative h-[400px] rounded-lg overflow-hidden border border-tactical-border/50">
              {(() => {
                const coords = details.coordinates && details.coordinates.includes(',') 
                  ? details.coordinates.split(',').map((p: string) => parseFloat(p.trim())) as [number, number]
                  : null;
                const isValidCoords = coords && !isNaN(coords[0]) && !isNaN(coords[1]);
                
                return (
                  <>
                    <MapComponent 
                      targetCenter={isValidCoords ? coords : [-0.7893, 113.9213]} 
                      targetZoom={isValidCoords ? 14 : 5}
                      singleMarker={isValidCoords ? coords : null}
                    />
                    
                    {/* Clickable Overlay */}
                    <Link 
                      href={isValidCoords ? `/map?lat=${coords[0]}&lng=${coords[1]}&zoom=15` : "/map"} 
                      className="absolute inset-0 z-[401] bg-transparent hover:bg-tactical-cyan/5 transition-colors flex items-center justify-center group/map"
                    >
                      <div className="bg-tactical-bg/80 border border-tactical-cyan p-3 rounded-full opacity-0 group-hover/map:opacity-100 transition-opacity transform scale-90 group-hover/map:scale-100 shadow-[0_0_20px_rgba(34,211,238,0.5)]">
                        <ExternalLink className="text-tactical-cyan w-6 h-6" />
                      </div>
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-tactical-bg/90 border border-tactical-border px-3 py-1 rounded text-[10px] font-mono text-tactical-text opacity-0 group-hover/map:opacity-100 transition-opacity whitespace-nowrap">
                        CLICK TO VIEW ON FULL TACTICAL MAP
                      </div>
                    </Link>
                  </>
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
    </div>
  );
}
