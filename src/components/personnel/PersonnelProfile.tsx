"use client";

import { 
  ChevronLeft, User, Shield, Crosshair, Clock, Award, 
  FileText, GraduationCap, Globe, Landmark, Edit, Trash2,
  Calendar, MapPin, Hash, Briefcase, Activity, Heart, BookOpen
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { deletePersonnel } from "@/app/actions";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface PersonnelProfileProps {
  personnel: any;
  unitHistory: any[];
  operationHistory: any[];
  education: any[];
  milEducation: any[];
  awards: any[];
  languages: any[];
  assignments: any[];
}

export default function PersonnelProfile({ 
  personnel, 
  unitHistory, 
  operationHistory,
  education,
  milEducation,
  awards,
  languages,
  assignments
}: PersonnelProfileProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), "dd MMMM yyyy", { locale: id });
    } catch (e) {
      return dateString;
    }
  };

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

  const InfoRow = ({ label, value, icon: Icon }: { label: string, value: any, icon?: any }) => (
    <div className="flex items-center py-3 border-b border-tactical-border/30 last:border-0 group gap-4">
      <div className="flex items-center gap-3 w-48 shrink-0">
        {Icon && <Icon size={16} className="text-tactical-muted group-hover:text-tactical-cyan transition-colors" />}
        <span className="text-[10px] text-tactical-muted font-mono uppercase tracking-[0.2em]">{label}</span>
      </div>
      <span className="text-tactical-muted font-mono shrink-0">:</span>
      <span className="text-base font-bold text-tactical-text uppercase tracking-tight">{value || "-"}</span>
    </div>
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      {/* Navigation & Header */}
      <div className="flex justify-between items-center bg-tactical-panel/50 p-4 border border-tactical-border rounded-lg backdrop-blur shadow-xl">
        <div className="flex items-center gap-5">
          <Link href="/personnel">
            <button className="p-3 bg-tactical-bg border border-tactical-border rounded-full transition-all text-tactical-muted hover:text-tactical-green hover:border-tactical-green shadow-lg shadow-black/20">
              <ChevronLeft size={20} />
            </button>
          </Link>
          <div>
            <h2 className="text-xl font-black text-tactical-text tracking-tighter uppercase flex items-center gap-2 leading-none">
              PROFIL PERSONIL <span className="text-tactical-green opacity-50">/</span> {personnel.name}
            </h2>
            <p className="text-tactical-muted font-mono text-[10px] uppercase tracking-[0.2em] mt-1">Personnel Intelligence & Service Record</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Link href={`/personnel/edit/${personnel.id}`}>
            <button className="px-5 py-2.5 bg-tactical-cyan/10 border border-tactical-cyan/30 text-tactical-cyan text-[10px] font-mono rounded-lg flex items-center justify-center gap-2 hover:bg-tactical-cyan hover:text-tactical-bg transition-all uppercase font-black">
              <Edit size={14} /> Edit Data
            </button>
          </Link>
          <button 
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-5 py-2.5 bg-tactical-red/10 border border-tactical-red/30 text-tactical-red text-[10px] font-mono rounded-lg flex items-center justify-center gap-2 hover:bg-tactical-red hover:text-tactical-bg transition-all uppercase font-black disabled:opacity-50"
          >
            <Trash2 size={14} /> {isDeleting ? '...' : 'Hapus Record'}
          </button>
        </div>
      </div>

      {/* 0. IDENTITY SUMMARY */}
      <div className="tactical-glass tactical-border p-8 flex flex-col md:flex-row items-center gap-10 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-tactical-green/5 blur-[100px] rounded-full -mr-32 -mt-32"></div>
        
        <div className="relative group z-10">
          <div className="absolute -inset-2 bg-gradient-to-r from-tactical-green to-tactical-cyan rounded-lg opacity-20 group-hover:opacity-40 transition-all blur-lg"></div>
          <div className="w-44 h-56 bg-tactical-bg border-2 border-tactical-border rounded-lg overflow-hidden relative flex items-center justify-center shadow-2xl">
            {personnel.photo_url ? (
              <Image src={personnel.photo_url} alt={personnel.name} fill className="object-cover grayscale hover:grayscale-0 transition-all duration-700" />
            ) : (
              <User size={80} className="text-tactical-muted opacity-30" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
            <div className="absolute bottom-3 left-3 right-3">
               <div className="text-[10px] font-mono text-tactical-green font-bold text-center bg-black/60 py-1.5 rounded-md backdrop-blur border border-tactical-green/20 uppercase tracking-widest">
                 {personnel.rank}
               </div>
            </div>
          </div>
        </div>
        
        <div className="flex-1 space-y-6 z-10">
          <div className="text-center md:text-left">
            <div className="flex flex-wrap items-center gap-4 mb-1">
              <h3 className="text-2xl font-black text-tactical-text uppercase tracking-tight drop-shadow-sm leading-none">{personnel.name}</h3>
              <span className={`text-[9px] font-bold px-3 py-1 rounded border leading-none uppercase ${
                personnel.status === 'ACTIVE' ? 'bg-tactical-green/10 border-tactical-green/50 text-tactical-green' : 
                personnel.status === 'ON_MISSION' ? 'bg-tactical-cyan/10 border-tactical-cyan/50 text-tactical-cyan' :
                'bg-yellow-500/10 border-yellow-500/50 text-yellow-500'
              }`}>
                {personnel.status === 'ACTIVE' ? 'Aktif' : 
                 personnel.status === 'ON_MISSION' ? 'Tugas Luar' :
                 personnel.status === 'ON_LEAVE' ? 'Cuti' : personnel.status}
              </span>
            </div>
            <p className="text-tactical-cyan font-mono text-base tracking-[0.2em] bg-tactical-cyan/5 inline-block px-3 py-0.5 rounded border border-tactical-cyan/20">{personnel.nrp}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Top Left: Kesatuan */}
            <div className="flex items-center gap-3 p-3 bg-tactical-panel/40 rounded-lg border border-tactical-border/50">
              <div className="p-2 bg-tactical-bg rounded border border-tactical-border">
                <Landmark size={16} className="text-tactical-muted" />
              </div>
              <div>
                <div className="text-[10px] font-mono text-tactical-muted uppercase tracking-widest mb-0.5">Kesatuan</div>
                <div className="text-xs font-bold text-tactical-text uppercase leading-none">{personnel.unit_name || 'TANPA UNIT'}</div>
              </div>
            </div>
            
            {/* Top Right: Satgas */}
            <div className="flex items-center gap-3 p-3 bg-tactical-panel/40 rounded-lg border border-tactical-border/50">
              <div className="p-2 bg-tactical-bg rounded border border-tactical-border">
                <Shield size={16} className="text-tactical-muted" />
              </div>
              <div>
                <div className="text-[10px] font-mono text-tactical-muted uppercase tracking-widest mb-0.5">Satgas (Gelar Operasi)</div>
                <div className="text-xs font-bold text-tactical-text uppercase leading-none">{personnel.satgas_name || '-'}</div>
              </div>
            </div>

            {/* Bottom Left: Spesialisasi */}
            <div className="flex items-center gap-3 p-3 bg-tactical-panel/40 rounded-lg border border-tactical-border/50">
              <div className="p-2 bg-tactical-bg rounded border border-tactical-border">
                <Activity size={16} className="text-tactical-muted" />
              </div>
              <div>
                <div className="text-[10px] font-mono text-tactical-muted uppercase tracking-widest mb-0.5">Spesialisasi</div>
                <div className="text-xs font-bold text-tactical-text uppercase leading-none">{personnel.specialization || 'N/A'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Sections - ALL 1 COLUMN */}
      <div className="space-y-8">
        {/* 1. BIODATA */}
        <div className="tactical-glass tactical-border overflow-hidden shadow-xl">
          <div className="bg-tactical-panel/60 px-8 py-4 border-b border-tactical-border flex items-center justify-between">
            <h3 className="text-sm font-black text-tactical-text font-mono flex items-center gap-3">
              <FileText size={20} className="text-tactical-green" /> 1. BIODATA PERSONIL
            </h3>
            <div className="text-[8px] font-mono text-tactical-muted tracking-[0.3em] uppercase opacity-60">Full Intelligence Record</div>
          </div>
          <div className="p-8 space-y-1">
            <InfoRow label="Nama Lengkap" value={personnel.name} icon={User} />
            <InfoRow label="Pangkat" value={personnel.rank} icon={Award} />
            <InfoRow label="NRP / NIP" value={personnel.nrp} icon={Hash} />
            <InfoRow label="Tempat / Tgl Lahir" value={`${personnel.birth_place || '-'} / ${formatDate(personnel.birth_date)}`} icon={Calendar} />
            <InfoRow label="TMT TNI" value={formatDate(personnel.tmt_tni)} icon={Clock} />
            <InfoRow label="Kategori" value={personnel.category} icon={Activity} />
            <InfoRow label="TMT Kategori" value={formatDate(personnel.tmt_category)} icon={Clock} />
            <InfoRow label="Suku Bangsa" value={personnel.ethnicity} icon={Globe} />
            <InfoRow label="Agama" value={personnel.religion} icon={Landmark} />
            <InfoRow label="Golongan Darah" value={personnel.blood_type} icon={Heart} />
            <InfoRow label="Sumber PA" value={personnel.source_pa} icon={Landmark} />
            <InfoRow label="TMT PA" value={formatDate(personnel.tmt_pa)} icon={Clock} />
            <InfoRow label="Jabatan" value={personnel.position} icon={Briefcase} />
            <InfoRow label="TMT Jabatan" value={formatDate(personnel.tmt_position)} icon={Clock} />
            <InfoRow label="Satuan" value={personnel.unit_name} icon={Landmark} />
          </div>
        </div>

        {/* 2. PENDIDIKAN UMUM */}
        <div className="tactical-glass tactical-border shadow-xl">
          <div className="bg-tactical-panel/60 px-8 py-4 border-b border-tactical-border">
            <h3 className="text-sm font-black text-tactical-text font-mono flex items-center gap-3 uppercase">
              <GraduationCap size={20} className="text-tactical-cyan" /> 2. Pendidikan Umum
            </h3>
          </div>
          <div className="p-8">
            {education && education.length > 0 ? (
              <div className="space-y-6">
                {education.map((edu, i) => (
                  <div key={i} className="border-l-2 border-tactical-cyan pl-6 py-3 bg-tactical-bg/30 rounded-r-xl border-y border-r border-tactical-border/50">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="text-base font-bold text-tactical-text uppercase tracking-tight">{edu.edu_type}</h4>
                      <span className="text-xs font-mono text-tactical-cyan bg-tactical-cyan/10 px-3 py-0.5 rounded border border-tactical-cyan/30">{edu.year}</span>
                    </div>
                    <p className="text-xs text-tactical-muted font-mono uppercase">{edu.major}</p>
                    {edu.achievement && (
                      <div className="mt-3 flex items-center gap-2 text-tactical-green bg-tactical-green/10 px-3 py-1.5 rounded-md border border-tactical-green/20 w-fit">
                        <Award size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Prestasi: {edu.achievement}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : <div className="text-center py-10 text-xs text-tactical-muted font-mono italic opacity-40">Belum ada data pendidikan umum</div>}
          </div>
        </div>

        {/* 3. PENDIDIKAN MILITER */}
        <div className="tactical-glass tactical-border shadow-xl">
          <div className="bg-tactical-panel/60 px-8 py-4 border-b border-tactical-border">
            <h3 className="text-sm font-black text-tactical-text font-mono flex items-center gap-3 uppercase">
              <Shield size={20} className="text-tactical-green" /> 3. Pendidikan Militer
            </h3>
          </div>
          <div className="p-8">
            {milEducation && milEducation.length > 0 ? (
              <div className="space-y-6">
                {milEducation.map((edu, i) => (
                  <div key={i} className="border-l-2 border-tactical-green pl-6 py-3 bg-tactical-bg/30 rounded-r-xl border-y border-r border-tactical-border/50">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="text-base font-bold text-tactical-text uppercase tracking-tight">{edu.name}</h4>
                      <span className="text-xs font-mono text-tactical-green bg-tactical-green/10 px-3 py-0.5 rounded border border-tactical-green/30">{edu.year}</span>
                    </div>
                    <p className="text-[10px] font-mono text-tactical-muted uppercase tracking-[0.2em] mb-3">{edu.category}</p>
                    {edu.achievement && (
                      <div className="mt-2 flex items-center gap-2 text-tactical-green bg-tactical-green/10 px-3 py-1.5 rounded-md border border-tactical-green/20 w-fit">
                        <Award size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Prestasi: {edu.achievement}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : <div className="text-center py-10 text-xs text-tactical-muted font-mono italic opacity-40">Belum ada data pendidikan militer</div>}
          </div>
        </div>

        {/* 4. PENUGASAN OPERASI */}
        <div className="tactical-glass tactical-border shadow-xl">
          <div className="bg-tactical-panel/60 px-8 py-4 border-b border-tactical-border">
            <h3 className="text-sm font-black text-tactical-text font-mono flex items-center gap-3 uppercase">
              <Crosshair size={20} className="text-tactical-red" /> 4. Penugasan Operasi
            </h3>
          </div>
          <div className="p-8">
            {operationHistory && operationHistory.length > 0 ? (
              <div className="space-y-6">
                {operationHistory.map((op, i) => (
                  <div key={i} className="bg-tactical-panel/40 border border-tactical-border p-6 rounded-xl relative overflow-hidden group hover:border-tactical-red/50 transition-all">
                    <div className="absolute top-0 right-0 w-1.5 h-full bg-tactical-red opacity-30 group-hover:opacity-100 transition-all"></div>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
                      <div>
                        <h4 className="text-lg font-bold text-tactical-text uppercase tracking-tight">{op.mission_name}</h4>
                        <p className="text-[10px] font-mono text-tactical-muted uppercase tracking-[0.3em] mt-1">{op.mission_type}</p>
                      </div>
                      <span className="text-sm font-mono text-tactical-red bg-tactical-red/10 px-4 py-1 rounded-lg border border-tactical-red/30">
                        {op.start_date ? new Date(op.start_date).getFullYear() : '-'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-3 mb-4">
                       <div className="flex items-center gap-2 bg-tactical-bg px-3 py-1.5 rounded-md border border-tactical-border">
                         <User size={12} className="text-tactical-muted" />
                         <span className="text-[10px] font-bold text-tactical-text uppercase">{op.role}</span>
                       </div>
                    </div>
                    {op.achievement && (
                      <div className="text-xs text-tactical-green font-mono flex items-center gap-3 bg-tactical-green/5 p-3 rounded-lg border border-tactical-green/20">
                        <Award size={16} /> <span className="uppercase font-bold tracking-widest">{op.achievement}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : <div className="text-center py-10 text-xs text-tactical-muted font-mono italic opacity-40 border-2 border-dashed border-tactical-border rounded-xl">Belum ada catatan penugasan operasi</div>}
          </div>
        </div>

        {/* 5. TANDA KEHORMATAN */}
        <div className="tactical-glass tactical-border shadow-xl">
          <div className="bg-tactical-panel/60 px-8 py-4 border-b border-tactical-border">
            <h3 className="text-sm font-black text-tactical-text font-mono flex items-center gap-3 uppercase">
              <Award size={20} className="text-yellow-500" /> 5. Tanda Kehormatan
            </h3>
          </div>
          <div className="p-8">
            {awards && awards.length > 0 ? (
              <div className="space-y-4">
                {awards.map((award, i) => (
                  <div key={i} className="flex gap-4 items-center p-4 hover:bg-tactical-panel/50 rounded-xl transition-all border border-transparent hover:border-tactical-border">
                    <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                      <Landmark size={18} className="text-yellow-500" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-tactical-text uppercase tracking-tight mb-1">{award.award_name}</h4>
                      <div className="flex flex-col md:flex-row gap-4">
                        <p className="text-[10px] text-tactical-muted font-mono uppercase tracking-widest flex items-center gap-2">
                          <FileText size={12} /> No. Sertifikat: <span className="text-tactical-text font-bold">{award.cert_number}</span>
                        </p>
                        <p className="text-[10px] text-tactical-muted font-mono uppercase tracking-widest flex items-center gap-2">
                          <Calendar size={12} /> Tahun: <span className="text-tactical-text font-bold">{award.year}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : <div className="text-center py-10 text-xs text-tactical-muted font-mono italic opacity-40">Belum ada tanda kehormatan tercatat</div>}
          </div>
        </div>

        {/* 6. KEMAMPUAN BAHASA */}
        <div className="tactical-glass tactical-border shadow-xl">
          <div className="bg-tactical-panel/60 px-8 py-4 border-b border-tactical-border">
            <h3 className="text-sm font-black text-tactical-text font-mono flex items-center gap-3 uppercase">
              <BookOpen size={20} className="text-tactical-cyan" /> 6. Kemampuan Bahasa
            </h3>
          </div>
          <div className="p-8 space-y-8">
            <div>
              <h4 className="text-[10px] font-mono text-tactical-cyan uppercase mb-4 tracking-[0.3em] border-b border-tactical-cyan/30 pb-1">A. Bahasa Daerah</h4>
              <div className="space-y-2">
                {languages.filter(l => l.lang_type === 'DAERAH').length > 0 ? (
                  languages.filter(l => l.lang_type === 'DAERAH').map((l, i) => (
                    <div key={i} className="flex justify-between items-center bg-tactical-panel/30 p-4 rounded-lg border border-tactical-border/50">
                      <span className="text-sm font-bold text-tactical-text uppercase tracking-tight">{l.language_name}</span>
                      <span className={`text-[10px] font-bold px-4 py-1 rounded-md border uppercase tracking-widest ${l.proficiency === 'AKTIF' ? 'bg-tactical-green/10 border-tactical-green/50 text-tactical-green' : 'bg-tactical-muted/10 border-tactical-border text-tactical-muted'}`}>
                        {l.proficiency}
                      </span>
                    </div>
                  ))
                ) : <span className="text-xs text-tactical-muted font-mono italic opacity-40">Data bahasa daerah belum tersedia</span>}
              </div>
            </div>
            
            <div>
              <h4 className="text-[10px] font-mono text-tactical-cyan uppercase mb-4 tracking-[0.3em] border-b border-tactical-cyan/30 pb-1">B. Bahasa Asing</h4>
              <div className="space-y-2">
                {languages.filter(l => l.lang_type === 'ASING').length > 0 ? (
                  languages.filter(l => l.lang_type === 'ASING').map((l, i) => (
                    <div key={i} className="flex justify-between items-center bg-tactical-panel/30 p-4 rounded-lg border border-tactical-border/50">
                      <span className="text-sm font-bold text-tactical-text uppercase tracking-tight">{l.language_name}</span>
                      <span className={`text-[10px] font-bold px-4 py-1 rounded-md border uppercase tracking-widest ${l.proficiency === 'AKTIF' ? 'bg-tactical-green/10 border-tactical-green/50 text-tactical-green' : 'bg-tactical-muted/10 border-tactical-border text-tactical-muted'}`}>
                        {l.proficiency}
                      </span>
                    </div>
                  ))
                ) : <span className="text-xs text-tactical-muted font-mono italic opacity-40">Data bahasa asing belum tersedia</span>}
              </div>
            </div>
          </div>
        </div>

        {/* 7. PENUGASAN INTERNASIONAL */}
        <div className="tactical-glass tactical-border shadow-xl">
          <div className="bg-tactical-panel/60 px-8 py-4 border-b border-tactical-border">
            <h3 className="text-sm font-black text-tactical-text font-mono flex items-center gap-3 uppercase">
              <Globe size={20} className="text-tactical-cyan" /> 7. Penugasan Internasional
            </h3>
          </div>
          <div className="p-8">
            {assignments && assignments.length > 0 ? (
              <div className="space-y-4">
                {assignments.map((task, i) => (
                  <div key={i} className="flex gap-6 items-center p-6 bg-tactical-panel/30 rounded-xl border border-tactical-border relative overflow-hidden group shadow-lg">
                    <div className="w-16 h-16 bg-tactical-bg border border-tactical-border rounded-xl flex flex-col items-center justify-center font-mono">
                      <span className="text-sm font-black text-tactical-cyan">{task.year}</span>
                      <Landmark size={18} className="text-tactical-muted mt-1" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-base font-bold text-tactical-text uppercase tracking-tight leading-none">{task.task_type}</h4>
                        <span className="text-[10px] font-mono text-tactical-cyan bg-tactical-cyan/10 px-3 py-0.5 rounded-md border border-tactical-cyan/40 uppercase tracking-widest">{task.country}</span>
                      </div>
                      {task.achievement && (
                        <div className="text-xs text-tactical-green font-mono mt-2 flex items-center gap-2 bg-tactical-green/5 p-2 rounded-lg border border-tactical-green/20 w-fit">
                           <Award size={16} /> <span className="uppercase font-bold tracking-wider">{task.achievement}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : <div className="text-center py-10 text-xs text-tactical-muted font-mono italic opacity-40">Belum ada catatan penugasan internasional</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
