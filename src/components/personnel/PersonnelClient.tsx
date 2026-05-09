"use client";

import { Users, Search, Filter, Download, UserPlus, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState, useMemo } from "react";

interface Person {
  id: number;
  nrp: string;
  name: string;
  rank: string;
  unit_name: string;
  specialization: string;
  status: string;
  photo_url?: string;
}

interface PersonnelClientProps {
  personnel: Person[];
}

export default function PersonnelClient({ personnel }: PersonnelClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 24;

  const filteredPersonnel = useMemo(() => {
    return personnel.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.nrp.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.rank.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [personnel, searchQuery]);

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
          <p className="text-tactical-muted font-mono text-sm mt-1">PERSONNEL MANAGEMENT SYSTEM ({filteredPersonnel.length} Records)</p>
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

      <div className="tactical-glass tactical-border p-4">
        <div className="flex gap-4">
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
          <button className="px-4 py-2 flex items-center gap-2 text-sm bg-tactical-bg border border-tactical-border rounded text-tactical-muted hover:text-tactical-text">
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {currentItems.map((person, i) => (
          <div key={person.id} className="tactical-glass tactical-border p-4 hover:border-tactical-green cursor-pointer transition-colors group">
            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 bg-tactical-bg border border-tactical-border rounded overflow-hidden flex-shrink-0">
                {person.photo_url ? (
                  <img src={person.photo_url} alt={person.name} className="w-full h-full object-cover grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all" />
                ) : (
                  <div className="w-full h-full bg-tactical-muted/20 flex items-center justify-center">
                    <Users className="w-6 h-6 text-tactical-muted opacity-50" />
                  </div>
                )}
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-tactical-green bg-tactical-green/10 px-1.5 py-0.5 rounded border border-tactical-green/20 uppercase">
                    {person.rank}
                  </span>
                  <h3 className="text-sm font-bold text-tactical-text truncate group-hover:text-tactical-green">
                    {person.name}
                  </h3>
                </div>
                <p className="text-xs font-mono text-tactical-muted mt-1">NRP. {person.nrp}</p>
                
                <div className="mt-3">
                  <div className="text-[10px] font-mono text-tactical-muted bg-tactical-bg px-2 py-0.5 rounded inline-block border border-tactical-border/50 uppercase tracking-tighter">
                    {person.unit_name || 'TANPA UNIT'}
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-tactical-border flex justify-between items-center">
              <span className={`text-[10px] font-bold px-2 py-1 rounded ${
                person.status === 'ACTIVE' ? 'bg-tactical-green/20 text-tactical-green' : 'bg-yellow-500/20 text-yellow-500'
              }`}>
                {person.status.toUpperCase()}
              </span>
              <Link href={`/personnel/${person.id}`}>
                <button className="text-xs text-tactical-muted hover:text-tactical-text">Detail &rarr;</button>
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
