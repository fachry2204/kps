"use client";

import { ChevronLeft, User, Shield, Crosshair, Clock, Award, FileText, ChevronRight, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { deletePersonnel } from "@/app/actions";

interface PersonnelProfileProps {
  personnel: any;
  unitHistory: any[];
  operationHistory: any[];
}

export default function PersonnelProfile({ personnel, unitHistory, operationHistory }: PersonnelProfileProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (confirm(`Apakah Anda yakin ingin menghapus data ${personnel.name}? Tindakan ini tidak dapat dibatalkan.`)) {
      setIsDeleting(true);
      const result = await deletePersonnel(personnel.id);
      if (result.success) {
        router.push('/personnel');
        router.refresh();
      } else {
        alert("Gagal menghapus data: " + result.error);
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/personnel">
            <button className="p-2 hover:bg-tactical-border rounded-full transition-colors text-tactical-muted hover:text-tactical-text">
              <ChevronLeft size={24} />
            </button>
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-tactical-text uppercase">PROFIL PERSONIL</h2>
            <p className="text-tactical-muted font-mono text-sm uppercase">PERSONNEL INTELLIGENCE RECORD</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Identity Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="tactical-glass tactical-border p-6 flex flex-col items-center">
            <div className="w-32 h-32 bg-tactical-bg border-2 border-tactical-border rounded overflow-hidden mb-4 relative flex items-center justify-center">
              {personnel.photo_url ? (
                <Image src={personnel.photo_url} alt={personnel.name} fill className="object-cover" />
              ) : (
                <User size={48} className="text-tactical-muted" />
              )}
            </div>
            
            <h3 className="text-xl font-bold text-tactical-text uppercase tracking-widest">{personnel.name}</h3>
            <p className="text-tactical-cyan font-mono text-sm mt-1 mb-4">{personnel.rank} - {personnel.nrp}</p>
            
            <div className="w-full space-y-3 mt-4 border-t border-tactical-border pt-4">
              <div className="flex justify-between items-center">
                <span className="text-xs text-tactical-muted font-mono">STATUS</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                  personnel.status === 'ACTIVE' ? 'bg-tactical-green/20 text-tactical-green' : 'bg-yellow-500/20 text-yellow-500'
                }`}>
                  {personnel.status.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-tactical-muted font-mono">KESATUAN SAAT INI</span>
                <span className="text-xs font-mono text-tactical-text">{personnel.unit_name || 'TANPA UNIT'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-tactical-muted font-mono">SPESIALISASI</span>
                <span className="text-xs font-mono text-tactical-text">{personnel.specialization}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-tactical-muted font-mono">TAHUN BERGABUNG</span>
                <span className="text-xs font-mono text-tactical-text">
                  {personnel.joined_date 
                    ? new Date(personnel.joined_date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) 
                    : '-'}
                </span>
              </div>
            </div>

            <div className="w-full flex gap-2 mt-8">
              <Link href={`/personnel/edit/${personnel.id}`} className="flex-1">
                <button className="w-full py-2 bg-tactical-cyan/10 border border-tactical-cyan/30 text-tactical-cyan text-[10px] font-mono rounded flex items-center justify-center gap-2 hover:bg-tactical-cyan hover:text-tactical-bg transition-all uppercase">
                  <Edit size={14} /> Edit Data
                </button>
              </Link>
              <button 
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-tactical-red/10 border border-tactical-red/30 text-tactical-red text-[10px] font-mono rounded flex items-center justify-center gap-2 hover:bg-tactical-red hover:text-tactical-bg transition-all uppercase disabled:opacity-50"
              >
                <Trash2 size={14} /> {isDeleting ? '...' : 'Hapus'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Histories */}
        <div className="lg:col-span-2 space-y-6">
          {/* Unit History */}
          <div className="tactical-glass tactical-border p-6">
            <h3 className="text-sm font-bold text-tactical-text font-mono mb-4 flex items-center gap-2 border-b border-tactical-border pb-2">
              <Shield size={16} className="text-tactical-green" /> RIWAYAT KESATUAN (UNIT HISTORY)
            </h3>
            
            {unitHistory && unitHistory.length > 0 ? (
              <div className="space-y-4">
                {unitHistory.map((history, idx) => (
                  <div key={idx} className="relative pl-6 pb-4 border-l border-tactical-border last:border-0 last:pb-0">
                    <div className="absolute left-[-5px] top-1 w-2.5 h-2.5 rounded-full bg-tactical-green"></div>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-bold text-tactical-text">{history.unit_name}</h4>
                        <p className="text-xs text-tactical-muted font-mono">{history.unit_type}</p>
                      </div>
                      <div className="text-xs font-mono text-tactical-muted flex items-center gap-1">
                        <Clock size={12} /> {history.start_date ? new Date(history.start_date).getFullYear() : '-'} - {history.end_date ? new Date(history.end_date).getFullYear() : 'Sekarang'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center border border-dashed border-tactical-border rounded">
                <p className="text-sm text-tactical-muted font-mono uppercase">Tidak ada data riwayat kesatuan</p>
              </div>
            )}
          </div>

          {/* Operation History */}
          <div className="tactical-glass tactical-border p-6">
            <h3 className="text-sm font-bold text-tactical-text font-mono mb-4 flex items-center gap-2 border-b border-tactical-border pb-2">
              <Crosshair size={16} className="text-tactical-red" /> RIWAYAT PENUGASAN OPERASI (COMBAT DEPLOYMENTS)
            </h3>
            
            {operationHistory && operationHistory.length > 0 ? (
              <div className="space-y-4">
                {operationHistory.map((history, idx) => (
                  <div key={idx} className="bg-tactical-bg border border-tactical-border p-4 rounded hover:border-tactical-red/50 transition-colors">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-sm font-bold text-tactical-text">{history.mission_name}</h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-tactical-red/10 text-tactical-red border border-tactical-red/20 uppercase">
                        {history.mission_type}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-tactical-muted">Peran: <span className="text-tactical-text">{history.role}</span></span>
                      <span className="text-tactical-muted flex items-center gap-1">
                        <Clock size={12} /> {history.start_date ? new Date(history.start_date).getFullYear() : '-'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center border border-dashed border-tactical-border rounded flex flex-col items-center justify-center">
                <Award size={32} className="text-tactical-muted opacity-50 mb-2" />
                <p className="text-sm text-tactical-muted font-mono uppercase">Belum ada riwayat operasi yang tercatat</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
