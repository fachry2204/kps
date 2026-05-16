"use client";

import { Package, Truck, AlertTriangle, PenTool, Search, Plus, Filter, Image as ImageIcon, Eye, Edit, Trash2, Shield, Target } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { deleteLogistics } from "@/app/actions";

interface LogisticItem {
  id: number;
  item_name: string;
  category: string;
  quantity: number;
  unit: string;
  min_stock_level: number;
  condition_status: string;
  image_url?: string;
  unit_name?: string;
  unit_id?: number | null;
}

interface LogisticsClientProps {
  items: LogisticItem[];
  operationAssetsTotal: number;
}

export default function LogisticsClient({ items, operationAssetsTotal }: LogisticsClientProps) {
  const router = useRouter();

  const handleDelete = async (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus peralatan ini?")) {
      const res = await deleteLogistics(id);
      if (res.success) {
        router.refresh();
      } else {
        alert("Gagal menghapus: " + res.error);
      }
    }
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("SIAP_OPS");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const alutsistaItems = items.filter(i => i.category === 'Rantis' || i.category === 'Senjata Jenis');
  
  // 1. SIAP OPS: Items in logistics with no unit_id
  const alutsistaSiapOperasi = alutsistaItems
    .filter(i => !i.unit_id)
    .reduce((acc, item) => acc + item.quantity, 0);
 
  // 2. DI KESATUAN: Items in logistics with unit_id
  const alutsistaInUnits = alutsistaItems
    .filter(i => i.unit_id)
    .reduce((acc, item) => acc + item.quantity, 0);
    
  // 3. BEROPERASI: In Kesatuan + In Operations (from operation_assets table)
  const alutsistaBeroperasi = alutsistaInUnits + (Number(operationAssetsTotal) || 0);

  // 4. TOTAL: Siap Ops + Beroperasi
  const totalAlutsista = alutsistaSiapOperasi + alutsistaBeroperasi;

  const alutsistaEfektif = alutsistaItems.filter(i => i.condition_status.toLowerCase().includes('efektif') && !i.condition_status.toLowerCase().includes('tidak')).reduce((acc, item) => acc + item.quantity, 0);
  const alutsistaNonEfektif = totalAlutsista - alutsistaEfektif;


  const categories = useMemo(() => {
    const cats = items.map(item => item.category);
    return Array.from(new Set(cats.filter(Boolean)));
  }, [items]);

  const filteredItems = useMemo(() => {
    const baseFiltered = items.filter(item => {
      const matchesSearch = item.item_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            `ITEM-${item.id}`.includes(searchQuery.toUpperCase());
      const matchesCategory = categoryFilter === "ALL" || item.category === categoryFilter;
      
      const itemStatus = (item.condition_status || "").toLowerCase();
      const isEfektif = itemStatus.includes('efektif') && !itemStatus.includes('tidak');
      const isTidakEfektif = itemStatus.includes('tidak');
      
      const matchesStatus = statusFilter === "ALL" || 
                           (statusFilter === "EFEKTIF" && isEfektif) ||
                           (statusFilter === "TIDAK_EFEKTIF" && isTidakEfektif) ||
                           (statusFilter === "SIAP_OPS" && !item.unit_id) ||
                           (statusFilter === "BEROPERASI" && item.unit_id);
                           
      return matchesSearch && matchesCategory && matchesStatus;
    });

    // GROUPING LOGIC: Merge items with same name
    const groupedMap = new Map<string, LogisticItem>();
    
    baseFiltered.forEach(item => {
      if (groupedMap.has(item.item_name)) {
        const existing = groupedMap.get(item.item_name)!;
        existing.quantity += item.quantity;
        // If any part of the group is not 'efektif', reflect that or keep the primary
        if (item.condition_status.toLowerCase().includes('tidak')) {
          existing.condition_status = item.condition_status;
        }
      } else {
        groupedMap.set(item.item_name, { ...item });
      }
    });

    return Array.from(groupedMap.values());
  }, [items, searchQuery, categoryFilter, statusFilter]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(start, start + itemsPerPage);
  }, [filteredItems, currentPage]);

  // Reset to first page when filtering
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-tactical-text flex items-center gap-2">
            <Package className="text-tactical-green" />
            LOGISTIK & PERALATAN
          </h2>
          <p className="text-tactical-muted font-mono text-sm mt-1">RANTAI PASOKAN & PELACAKAN ASET</p>
        </div>
        <Link href="/logistics/add">
          <button className="bg-tactical-green text-tactical-bg px-4 py-2 font-bold font-mono rounded text-sm hover:bg-tactical-green/90 transition-colors flex items-center gap-2">
            <Plus size={16} /> TAMBAH PERALATAN
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* 1. TOTAL ALUTSISTA */}
        <div 
          onClick={() => setStatusFilter("ALL")}
          className={`tactical-glass tactical-border p-4 transition-all cursor-pointer hover:border-tactical-cyan/80 group ${
            statusFilter === "ALL" ? 'bg-tactical-cyan/10 border-tactical-cyan' : 'bg-tactical-bg border-tactical-border'
          }`}
        >
          <div className="flex items-center gap-3 mb-2">
            <Package className={`w-5 h-5 ${statusFilter === "ALL" ? 'text-tactical-cyan' : 'text-tactical-muted'}`} />
            <span className={`text-[10px] font-mono font-bold uppercase ${statusFilter === "ALL" ? 'text-tactical-cyan' : 'text-tactical-muted'}`}>TOTAL ALUTSISTA</span>
          </div>
          <div className="text-2xl font-bold text-tactical-text font-mono">{totalAlutsista.toLocaleString()}</div>
        </div>
        
        {/* 2. SIAP OPS (DEFAULT) */}
        <div 
          onClick={() => setStatusFilter("SIAP_OPS")}
          className={`tactical-glass tactical-border p-4 transition-all cursor-pointer hover:border-tactical-cyan/80 group ${
            statusFilter === "SIAP_OPS" ? 'bg-tactical-cyan/10 border-tactical-cyan' : 'bg-tactical-bg border-tactical-border'
          }`}
        >
          <div className="flex items-center gap-3 mb-2">
            <Target className={`w-5 h-5 ${statusFilter === "SIAP_OPS" ? 'text-tactical-cyan' : 'text-tactical-muted'}`} />
            <span className={`text-[10px] font-mono font-bold uppercase ${statusFilter === "SIAP_OPS" ? 'text-tactical-cyan' : 'text-tactical-muted'}`}>ALUTSISTA SIAP OPS</span>
          </div>
          <div className="text-2xl font-bold text-tactical-cyan font-mono">{alutsistaSiapOperasi.toLocaleString()}</div>
        </div>

        {/* 3. EFEKTIF */}
        <div 
          onClick={() => setStatusFilter("EFEKTIF")}
          className={`tactical-glass tactical-border p-4 transition-all cursor-pointer hover:border-tactical-green/80 group ${
            statusFilter === "EFEKTIF" ? 'bg-tactical-green/10 border-tactical-green' : 'bg-tactical-bg border-tactical-border'
          }`}
        >
          <div className="flex items-center gap-3 mb-2">
            <Shield className={`w-5 h-5 ${statusFilter === "EFEKTIF" ? 'text-tactical-green' : 'text-tactical-muted'}`} />
            <span className={`text-[10px] font-mono font-bold uppercase ${statusFilter === "EFEKTIF" ? 'text-tactical-green' : 'text-tactical-muted'}`}>ALUTSISTA EFEKTIF</span>
          </div>
          <div className="text-2xl font-bold text-tactical-green font-mono">{alutsistaEfektif.toLocaleString()}</div>
        </div>

        {/* 4. NON EFEKTIF */}
        <div 
          onClick={() => setStatusFilter("TIDAK_EFEKTIF")}
          className={`tactical-glass tactical-border p-4 transition-all cursor-pointer hover:border-tactical-red/80 group ${
            statusFilter === "TIDAK_EFEKTIF" ? 'bg-tactical-red/10 border-tactical-red' : 'bg-tactical-bg border-tactical-border'
          }`}
        >
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className={`w-5 h-5 ${statusFilter === "TIDAK_EFEKTIF" ? 'text-tactical-red' : 'text-tactical-muted'}`} />
            <span className={`text-[10px] font-mono font-bold uppercase ${statusFilter === "TIDAK_EFEKTIF" ? 'text-tactical-red' : 'text-tactical-muted'}`}>ALUTSISTA NON EFEKTIF</span>
          </div>
          <div className="text-2xl font-bold text-tactical-red font-mono">{alutsistaNonEfektif.toLocaleString()}</div>
        </div>

        {/* 5. BEROPERASI */}
        <div 
          onClick={() => setStatusFilter("BEROPERASI")}
          className={`tactical-glass tactical-border p-4 transition-all cursor-pointer hover:border-tactical-yellow/80 group ${
            statusFilter === "BEROPERASI" ? 'bg-tactical-yellow/10 border-tactical-yellow' : 'bg-tactical-bg border-tactical-border'
          }`}
        >
          <div className="flex items-center gap-3 mb-2">
            <Truck className={`w-5 h-5 ${statusFilter === "BEROPERASI" ? 'text-tactical-yellow' : 'text-tactical-muted'}`} />
            <span className={`text-[10px] font-mono font-bold uppercase ${statusFilter === "BEROPERASI" ? 'text-tactical-yellow' : 'text-tactical-muted'}`}>ALUTSISTA BEROPERASI</span>
          </div>
          <div className="text-2xl font-bold text-tactical-yellow font-mono">{alutsistaBeroperasi.toLocaleString()}</div>
        </div>
      </div>

      <div className="tactical-glass tactical-border p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-tactical-border pb-4">
          <h3 className="text-tactical-text font-bold font-mono text-sm">
            INVENTARIS UTAMA
          </h3>
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tactical-muted" />
              <input 
                type="text" 
                placeholder="Cari Kode atau Nama Barang..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-64 bg-tactical-bg border border-tactical-border rounded pl-10 pr-4 py-2 text-sm text-tactical-text focus:outline-none focus:border-tactical-green transition-colors"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tactical-muted" />
              <select 
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full md:w-48 bg-tactical-bg border border-tactical-border rounded pl-10 pr-4 py-2 text-sm text-tactical-text focus:outline-none focus:border-tactical-green transition-colors appearance-none"
              >
                <option value="ALL">Semua Kategori</option>
                <option value="Senjata Jenis">Senjata Jenis</option>
                <option value="Alkapsus">Alkapsus</option>
                <option value="Rantis">Rantis</option>
                <option value="Optik">Optik</option>
                <option value="Handak">Handak</option>
                <option value="Lain-Lain">Lain-Lain</option>
              </select>
            </div>
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tactical-muted" />
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full md:w-48 bg-tactical-bg border border-tactical-border rounded pl-10 pr-4 py-2 text-sm text-tactical-text focus:outline-none focus:border-tactical-green transition-colors appearance-none cursor-pointer"
              >
                <option value="ALL">Semua Kondisi</option>
                <option value="SIAP_OPS">ALUTSISTA SIAP OPS</option>
                <option value="EFEKTIF">EFEKTIF</option>
                <option value="TIDAK_EFEKTIF">TIDAK EFEKTIF</option>
                <option value="BEROPERASI">BEROPERASI</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-tactical-border text-xs font-mono text-tactical-muted">
                <th className="py-3 px-4">KODE</th>
                <th className="py-3 px-4">NAMA BARANG</th>
                <th className="py-3 px-4 text-left">KATEGORI</th>
                <th className="py-3 px-4 text-left">STOK</th>
                <th className="py-3 px-4 text-left">KONDISI</th>
                <th className="py-3 px-4 text-right">AKSI</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <AnimatePresence>
                {paginatedItems.map((item, i) => (
                  <motion.tr 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ delay: 0.05 * i }}
                    key={item.id} 
                  className="border-b border-tactical-border/50 hover:bg-tactical-border/30 transition-colors"
                >
                  <td className="py-3 px-4 font-mono text-tactical-muted text-xs">ITEM-{item.id}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      {item.image_url ? (
                        <div className="w-10 h-10 rounded overflow-hidden border border-tactical-border relative shrink-0">
                          <img src={item.image_url} alt={item.item_name} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded bg-tactical-panel border border-tactical-border flex items-center justify-center shrink-0">
                          <ImageIcon className="w-5 h-5 text-tactical-muted" />
                        </div>
                      )}
                      <span className="font-bold text-tactical-text text-sm">{item.item_name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-tactical-muted text-xs">{item.category}</td>
                  <td className="py-3 px-4 font-mono text-xs">{item.quantity} {item.unit}</td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 text-[10px] font-black rounded transition-all uppercase tracking-widest shadow-[0_0_15px_rgba(0,0,0,0.5)] ${
                      (item.condition_status || "").toLowerCase().includes('tidak') 
                        ? 'bg-tactical-red text-white shadow-[0_0_10px_rgba(239,68,68,0.4)]'
                        : (item.condition_status || "").toLowerCase().includes('efektif')
                          ? 'bg-[#22c55e] text-white shadow-[0_0_10px_rgba(34,197,94,0.4)]'
                          : 'bg-tactical-red text-white shadow-[0_0_10px_rgba(239,68,68,0.4)]'
                    }`}>
                      {item.condition_status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/logistics/detail/${item.id}`}>
                        <button className="p-1.5 text-tactical-cyan hover:bg-tactical-cyan/10 rounded transition-colors" title="View">
                          <Eye size={16} />
                        </button>
                      </Link>
                      <Link href={`/logistics/edit/${item.id}`}>
                        <button className="p-1.5 text-tactical-green hover:bg-tactical-green/10 rounded transition-colors" title="Edit">
                          <Edit size={16} />
                        </button>
                      </Link>
                      <button onClick={() => handleDelete(item.id)} className="p-1.5 text-tactical-red hover:bg-tactical-red/10 rounded transition-colors" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-tactical-muted font-mono text-xs uppercase">
                    Tidak ada peralatan yang ditemukan
                  </td>
                </tr>
              )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-6 pt-4 border-t border-tactical-border/50">
            <div className="text-xs text-tactical-muted font-mono">
              MENAMPILKAN <span className="text-tactical-text">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="text-tactical-text">{Math.min(currentPage * itemsPerPage, filteredItems.length)}</span> DARI <span className="text-tactical-text">{filteredItems.length}</span> ASET
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-tactical-panel border border-tactical-border rounded text-xs font-bold text-tactical-text hover:bg-tactical-border/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                PREV
              </button>
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 flex items-center justify-center rounded text-xs font-mono font-bold transition-all ${
                      currentPage === page 
                        ? 'bg-tactical-green text-black shadow-[0_0_10px_rgba(34,197,94,0.3)]' 
                        : 'bg-tactical-panel border border-tactical-border text-tactical-muted hover:text-tactical-text'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-tactical-panel border border-tactical-border rounded text-xs font-bold text-tactical-text hover:bg-tactical-border/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                NEXT
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
