"use client";

import { Package, Truck, AlertTriangle, PenTool, Search, Plus, Filter, Image as ImageIcon, Eye, Edit, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState, useMemo } from "react";

interface LogisticItem {
  id: number;
  item_name: string;
  category: string;
  quantity: number;
  unit: string;
  min_stock_level: number;
  condition_status: string;
  image_url?: string;
}

interface LogisticsClientProps {
  items: LogisticItem[];
}

export default function LogisticsClient({ items }: LogisticsClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const lowStock = items.filter(item => item.quantity < item.min_stock_level).length;
  const maintenance = items.filter(item => item.condition_status === 'MAINTENANCE' || item.condition_status === 'REPAIR').length;

  const categories = useMemo(() => {
    const cats = items.map(item => item.category);
    return Array.from(new Set(cats.filter(Boolean)));
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = item.item_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            `ITEM-${item.id}`.includes(searchQuery.toUpperCase());
      const matchesCategory = categoryFilter === "ALL" || item.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [items, searchQuery, categoryFilter]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-tactical-text flex items-center gap-2">
            <Package className="text-tactical-green" />
            LOGISTIK & PERALATAN
          </h2>
          <p className="text-tactical-muted font-mono text-sm mt-1">SUPPLY CHAIN & ASSET TRACKING</p>
        </div>
        <Link href="/logistics/add">
          <button className="bg-tactical-green text-tactical-bg px-4 py-2 font-bold font-mono rounded text-sm hover:bg-tactical-green/90 transition-colors flex items-center gap-2">
            <Plus size={16} /> TAMBAH PERALATAN
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="tactical-glass tactical-border p-4 bg-tactical-green/5 border-tactical-green">
          <div className="flex items-center gap-3 mb-2">
            <Package className="w-5 h-5 text-tactical-green" />
            <span className="text-sm font-bold">TOTAL ASET</span>
          </div>
          <div className="text-2xl font-bold text-tactical-text font-mono">{totalItems.toLocaleString()}</div>
        </div>
        <div className="tactical-glass tactical-border p-4">
          <div className="flex items-center gap-3 mb-2">
            <Truck className="w-5 h-5 text-tactical-cyan" />
            <span className="text-sm font-bold">STOK TERSEDIA</span>
          </div>
          <div className="text-2xl font-bold text-tactical-cyan font-mono">{items.length}</div>
        </div>
        <div className="tactical-glass tactical-border p-4">
          <div className="flex items-center gap-3 mb-2">
            <PenTool className="w-5 h-5 text-yellow-500" />
            <span className="text-sm font-bold">MAINTENANCE</span>
          </div>
          <div className="text-2xl font-bold text-yellow-500 font-mono">{maintenance}</div>
        </div>
        <div className="tactical-glass tactical-border p-4 bg-tactical-red/5 border-tactical-red">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-5 h-5 text-tactical-red" />
            <span className="text-sm font-bold">LOW STOCK ALERTS</span>
          </div>
          <div className="text-2xl font-bold text-tactical-red font-mono">{lowStock}</div>
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
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
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
                <th className="py-3 px-4">KATEGORI</th>
                <th className="py-3 px-4">STOK</th>
                <th className="py-3 px-4">KONDISI</th>
                <th className="py-3 px-4 text-right">AKSI</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <AnimatePresence>
                {filteredItems.map((item, i) => (
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
                    <span className={`px-2 py-1 text-[10px] font-bold rounded border ${
                      item.condition_status === 'GOOD' ? 'bg-tactical-green/10 border-tactical-green text-tactical-green' :
                      item.quantity < item.min_stock_level ? 'bg-tactical-red/10 border-tactical-red text-tactical-red' :
                      'bg-yellow-500/10 border-yellow-500 text-yellow-500'
                    }`}>
                      {item.condition_status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-1.5 text-tactical-cyan hover:bg-tactical-cyan/10 rounded transition-colors" title="View">
                        <Eye size={16} />
                      </button>
                      <button className="p-1.5 text-tactical-green hover:bg-tactical-green/10 rounded transition-colors" title="Edit">
                        <Edit size={16} />
                      </button>
                      <button className="p-1.5 text-tactical-red hover:bg-tactical-red/10 rounded transition-colors" title="Delete">
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
      </div>
    </div>
  );
}
