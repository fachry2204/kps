"use client";

import { Users, Search, Filter, Download, UserPlus, ChevronLeft, ChevronRight, ChevronDown, MessageSquare, Video, Navigation, Calendar, Phone } from "lucide-react";
import Link from "next/link";
import { useState, useMemo } from "react";

interface Person {
  id: number;
  nrp: string;
  name: string;
  rank: string;
  unit_id: number;
  unit_name: string;
  specialization: string;
  status: string;
  photo_url?: string;
  current_op_name?: string;
  current_op_id?: number;
  phone_number?: string;
}

interface PersonnelClientProps {
  personnel: Person[];
  units: { id: number, name: string }[];
  operations: { id: number, name: string, type: string }[];
}

export default function PersonnelClient({ personnel, units, operations }: PersonnelClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUnit, setSelectedUnit] = useState<string>("ALL");
  const [selectedOp, setSelectedOp] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedSpec, setSelectedSpec] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 24;

  const filteredPersonnel = useMemo(() => {
    return personnel.filter(p => {
      const matchesSearch = 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.nrp.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.rank.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesUnit = selectedUnit === "ALL" || p.unit_id === parseInt(selectedUnit);
      const matchesOp = selectedOp === "ALL" || p.current_op_name === selectedOp;
      const matchesStatus = selectedStatus === "ALL" || p.status === selectedStatus;
      const matchesSpec = selectedSpec === "ALL" || (p.specialization && p.specialization.split(", ").includes(selectedSpec));

      return matchesSearch && matchesUnit && matchesOp && matchesStatus && matchesSpec;
    });
  }, [personnel, searchQuery, selectedUnit, selectedOp, selectedStatus, selectedSpec]);

  const totalPages = Math.ceil(filteredPersonnel.length / itemsPerPage);
  
  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredPersonnel.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredPersonnel, currentPage]);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-tactical-text flex items-center gap-2">
            <Users className="text-tactical-green" />
            DATABASE PERSONIL
          </h2>
          <p className="text-tactical-muted font-mono text-sm mt-1">Personil Perwira Managemen Sistem ({filteredPersonnel.length} Records)</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 flex items-center gap-2 text-xs font-mono bg-tactical-bg text-tactical-muted border border-tactical-border rounded hover:text-tactical-text transition-colors">
            <Download className="w-4 h-4" />
            EXPORT
          </button>
          <Link href="/personnel/add">
            <button className="px-4 py-2 flex items-center gap-2 text-xs font-mono bg-tactical-green/10 text-tactical-green border border-tactical-green rounded hover:bg-tactical-green/20 transition-colors">
              <UserPlus className="w-4 h-4" />
              TAMBAH DATA
            </button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="tactical-glass tactical-border p-4 flex items-center justify-between group hover:border-tactical-green transition-all">
          <div>
            <p className="text-[10px] font-mono text-tactical-muted uppercase tracking-widest">Personil Aktif</p>
            <h3 className="text-3xl font-bold text-tactical-green font-mono">{personnel.filter(p => p.status === 'ACTIVE').length}</h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-tactical-green/10 flex items-center justify-center text-tactical-green group-hover:scale-110 transition-transform">
            <Users size={24} />
          </div>
        </div>
        <div className="tactical-glass tactical-border p-4 flex items-center justify-between group hover:border-tactical-cyan transition-all">
          <div>
            <p className="text-[10px] font-mono text-tactical-muted uppercase tracking-widest">Tugas Luar (Satgas)</p>
            <h3 className="text-3xl font-bold text-tactical-cyan font-mono">{personnel.filter(p => p.status === 'ON_MISSION').length}</h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-tactical-cyan/10 flex items-center justify-center text-tactical-cyan group-hover:scale-110 transition-transform">
            <Navigation size={24} />
          </div>
        </div>
        <div className="tactical-glass tactical-border p-4 flex items-center justify-between group hover:border-yellow-500 transition-all">
          <div>
            <p className="text-[10px] font-mono text-tactical-muted uppercase tracking-widest">Cuti / Off Duty</p>
            <h3 className="text-3xl font-bold text-yellow-500 font-mono">{personnel.filter(p => p.status === 'OFF_DUTY' || p.status === 'ON_LEAVE').length}</h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500 group-hover:scale-110 transition-transform">
            <Calendar size={24} />
          </div>
        </div>
      </div>

      <div className="tactical-glass tactical-border p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tactical-muted" />
            <input 
              type="text" 
              placeholder="Cari NRP, Nama, atau Pangkat..." 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-tactical-bg border border-tactical-border rounded pl-10 pr-4 py-2 text-sm text-tactical-text focus:outline-none focus:border-tactical-green"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <select 
                value={selectedUnit}
                onChange={(e) => {
                  setSelectedUnit(e.target.value);
                  setCurrentPage(1);
                }}
                className="appearance-none bg-tactical-bg border border-tactical-border rounded pl-4 pr-10 py-2 text-base text-tactical-text focus:outline-none focus:border-tactical-green min-w-[140px]"
              >
                <option value="ALL">KESATUAN: SEMUA</option>
                {units.map(u => (
                  <option key={u.id} value={u.id}>{u.name.toUpperCase()}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tactical-muted pointer-events-none" />
            </div>

            <div className="relative">
              <select 
                value={selectedOp}
                onChange={(e) => {
                  setSelectedOp(e.target.value);
                  setCurrentPage(1);
                }}
                className="appearance-none bg-tactical-bg border border-tactical-border rounded pl-4 pr-10 py-2 text-base text-tactical-text focus:outline-none focus:border-tactical-green min-w-[140px]"
              >
                <option value="ALL">SATGAS: SEMUA</option>
                {operations.map((op, idx) => (
                  <option key={`${op.type}-${op.id}`} value={op.name}>{op.name.toUpperCase()}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tactical-muted pointer-events-none" />
            </div>

            <div className="relative">
              <select 
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="appearance-none bg-tactical-bg border border-tactical-border rounded pl-4 pr-10 py-2 text-base text-tactical-text focus:outline-none focus:border-tactical-green min-w-[140px]"
              >
                <option value="ALL">STATUS: SEMUA</option>
                <option value="ACTIVE">AKTIF</option>
                <option value="ON_LEAVE">CUTI</option>
                <option value="ON_MISSION">TUGAS LUAR</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tactical-muted pointer-events-none" />
            </div>

            <div className="relative">
              <select 
                value={selectedSpec}
                onChange={(e) => {
                  setSelectedSpec(e.target.value);
                  setCurrentPage(1);
                }}
                className="appearance-none bg-tactical-bg border border-tactical-border rounded pl-4 pr-10 py-2 text-base text-tactical-text focus:outline-none focus:border-tactical-green min-w-[140px]"
              >
                <option value="ALL">SPESIALISASI: SEMUA</option>
                <option value="PARAKO">PARAKO</option>
                <option value="SANDHA">SANDHA</option>
                <option value="GULTOR">GULTOR</option>
                <option value="DEMOLISI">DEMOLISI</option>
                <option value="BAKDUK">BAKDUK</option>
                <option value="BAHASA">BAHASA</option>
                <option value="Lainnya">LAINNYA</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tactical-muted pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {currentItems.map((person, i) => (
          <div key={person.id} className="tactical-glass tactical-border p-4 hover:border-tactical-green cursor-pointer transition-colors group">
            <Link href={`/personnel/${person.id}`}>
              <div className="flex gap-4 items-start">
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <div className="w-12 h-12 bg-tactical-bg border border-tactical-border rounded overflow-hidden">
                    {person.photo_url ? (
                      <img src={person.photo_url} alt={person.name} className="w-full h-full object-cover invert grayscale contrast-125 brightness-110 opacity-80 hover:opacity-100 transition-all duration-500" />
                    ) : (
                      <div className="w-full h-full bg-tactical-muted/20 flex items-center justify-center">
                        <Users className="w-6 h-6 text-tactical-muted opacity-50" />
                      </div>
                    )}
                  </div>
                  <div className="w-12 flex justify-center">
                    <span className={`text-[10px] font-bold px-1 py-0.5 rounded uppercase tracking-tighter whitespace-nowrap ${
                      person.status === 'ACTIVE' ? 'bg-tactical-green/20 text-tactical-green' : 
                      person.status === 'ON_MISSION' ? 'bg-tactical-cyan/20 text-tactical-cyan' :
                      'bg-yellow-500/20 text-yellow-500'
                    }`}>
                      {person.status === 'ACTIVE' ? 'Aktif' : 
                       person.status === 'ON_MISSION' ? 'Tugas' :
                       person.status === 'ON_LEAVE' ? 'Cuti' : person.status}
                    </span>
                  </div>
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-mono text-tactical-green bg-tactical-green/10 px-2 py-0.5 rounded border border-tactical-green/20 uppercase font-bold">
                        {person.rank}
                      </span>
                      <h3 className="text-lg font-bold text-tactical-text truncate group-hover:text-tactical-green tracking-tight">
                        {person.name}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-mono text-tactical-muted tracking-tighter">NRP. {person.nrp}</span>
                      {person.phone_number && (
                        <div className="flex items-center gap-1.5 ml-2">
                          <span className="text-sm font-mono text-tactical-muted opacity-60">| {person.phone_number}</span>
                          <a 
                            href={`https://wa.me/${person.phone_number.replace(/\D/g, '')}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-1 bg-green-500/10 border border-green-500/30 text-green-500 rounded hover:bg-green-500 hover:text-white transition-all flex items-center gap-1"
                            title="Direct WhatsApp"
                          >
                            <Phone size={10} />
                            <span className="text-[8px] font-bold">WA</span>
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Unit & Specialization Tactical Panel */}
                  <div className="mt-4 p-3 bg-tactical-bg/30 border border-tactical-border/50 rounded-lg space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <div className="text-[14px] font-mono text-tactical-muted bg-tactical-bg px-2.5 py-1 rounded inline-block border border-tactical-border/50 uppercase tracking-tight font-bold">
                        {person.unit_name || 'TANPA UNIT'}
                      </div>
                      {person.current_op_name && (
                        <span className="px-2 py-1 bg-tactical-cyan/10 text-tactical-cyan border border-tactical-cyan/30 text-[12px] font-mono rounded-sm uppercase font-bold tracking-tight">
                          {person.current_op_name}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-1.5 items-center">
                      <span className="text-[12px] font-mono text-tactical-muted uppercase tracking-widest mr-1 font-bold">Spesialis:</span>
                      {person.specialization ? person.specialization.split(", ").map((spec: string, idx: number) => (
                        <span key={idx} className="px-2 py-1 bg-tactical-green/5 text-tactical-green border border-tactical-green/20 text-[13px] font-mono rounded uppercase font-bold tracking-tight">
                          {spec}
                        </span>
                      )) : (
                        <span className="px-2 py-1 bg-tactical-panel text-tactical-muted border border-tactical-border text-[13px] font-mono rounded uppercase font-bold tracking-tight">
                          UMUM
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
            <div className="mt-4 pt-3 border-t border-tactical-border flex justify-between items-center">
              <div className="flex gap-4">
                <Link href={`/komunikasi/chat?id=${person.id}`}>
                  <button className="flex items-center gap-2 px-3 py-1.5 bg-tactical-green/10 border border-tactical-green/30 text-tactical-green rounded hover:bg-tactical-green hover:text-tactical-bg transition-all" title="Secure Chat">
                    <MessageSquare size={14} />
                    <span className="text-[10px] font-mono font-bold uppercase">Chat Personil</span>
                  </button>
                </Link>
                <Link href={`/komunikasi/vcon?id=${person.id}`}>
                  <button className="flex items-center gap-2 px-3 py-1.5 bg-tactical-cyan/10 border border-tactical-cyan/30 text-tactical-cyan rounded hover:bg-tactical-cyan hover:text-tactical-bg transition-all" title="Video Conference">
                    <Video size={14} />
                    <span className="text-[10px] font-mono font-bold uppercase">Vcon Personil</span>
                  </button>
                </Link>
              </div>
              <Link href={`/personnel/${person.id}`}>
                <button className="px-6 py-1.5 bg-tactical-panel border border-tactical-border text-tactical-text text-[10px] font-mono font-bold rounded uppercase hover:bg-tactical-green hover:text-tactical-bg hover:border-tactical-green transition-all shadow-[0_0_10px_rgba(57,255,20,0.1)]">
                  Lihat Data Personil
                </button>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8 pb-10">
          <button 
            disabled={currentPage === 1}
            onClick={() => goToPage(currentPage - 1)}
            className="p-2 tactical-glass border border-tactical-border rounded disabled:opacity-30 disabled:cursor-not-allowed hover:border-tactical-green transition-colors"
          >
            <ChevronLeft size={16} className="text-tactical-green" />
          </button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else {
                if (currentPage <= 3) pageNum = i + 1;
                else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                else pageNum = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => goToPage(pageNum)}
                  className={`w-8 h-8 rounded font-mono text-xs border transition-all ${
                    currentPage === pageNum 
                      ? 'bg-tactical-green/20 border-tactical-green text-tactical-green' 
                      : 'border-tactical-border text-tactical-muted hover:border-tactical-green'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button 
            disabled={currentPage === totalPages}
            onClick={() => goToPage(currentPage + 1)}
            className="p-2 tactical-glass border border-tactical-border rounded disabled:opacity-30 disabled:cursor-not-allowed hover:border-tactical-green transition-colors"
          >
            <ChevronRight size={16} className="text-tactical-green" />
          </button>
          
          <span className="text-[10px] font-mono text-tactical-muted ml-4 uppercase tracking-tighter">
            Halaman {currentPage} dari {totalPages}
          </span>
        </div>
      )}
    </div>
  );
}
