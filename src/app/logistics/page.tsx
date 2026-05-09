"use client";

import { Package, Truck, AlertTriangle, PenTool } from "lucide-react";
import { motion } from "framer-motion";

export default function LogisticsPage() {
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="tactical-glass tactical-border p-4 bg-tactical-green/5 border-tactical-green">
          <div className="flex items-center gap-3 mb-2">
            <Package className="w-5 h-5 text-tactical-green" />
            <span className="text-sm font-bold">TOTAL ASET</span>
          </div>
          <div className="text-2xl font-bold text-tactical-text font-mono">14,204</div>
        </div>
        <div className="tactical-glass tactical-border p-4">
          <div className="flex items-center gap-3 mb-2">
            <Truck className="w-5 h-5 text-tactical-cyan" />
            <span className="text-sm font-bold">DALAM PENGIRIMAN</span>
          </div>
          <div className="text-2xl font-bold text-tactical-cyan font-mono">24</div>
        </div>
        <div className="tactical-glass tactical-border p-4">
          <div className="flex items-center gap-3 mb-2">
            <PenTool className="w-5 h-5 text-yellow-500" />
            <span className="text-sm font-bold">MAINTENANCE</span>
          </div>
          <div className="text-2xl font-bold text-yellow-500 font-mono">156</div>
        </div>
        <div className="tactical-glass tactical-border p-4 bg-tactical-red/5 border-tactical-red">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-5 h-5 text-tactical-red" />
            <span className="text-sm font-bold">LOW STOCK ALERTS</span>
          </div>
          <div className="text-2xl font-bold text-tactical-red font-mono">3</div>
        </div>
      </div>

      <div className="tactical-glass tactical-border p-6">
        <h3 className="text-tactical-text font-bold mb-4 font-mono text-sm border-b border-tactical-border pb-2">
          INVENTARIS UTAMA
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-tactical-border text-xs font-mono text-tactical-muted">
                <th className="py-3 px-4">KODE ITEM</th>
                <th className="py-3 px-4">NAMA BARANG</th>
                <th className="py-3 px-4">KATEGORI</th>
                <th className="py-3 px-4">STOK</th>
                <th className="py-3 px-4">KONDISI</th>
                <th className="py-3 px-4">LOKASI</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {[
                { id: "WP-001-A", name: "SS2-V4", cat: "Senjata", stock: 1200, condition: "Optimal", loc: "Gudang Utama" },
                { id: "WP-002-B", name: "SPR-2", cat: "Senjata", stock: 150, condition: "Optimal", loc: "Gudang Khusus" },
                { id: "VH-001-C", name: "Rantis Komodo", cat: "Kendaraan", stock: 45, condition: "Maintenance", loc: "Garasi Mako" },
                { id: "AM-001-A", name: "Amunisi 5.56mm", cat: "Amunisi", stock: "24.5k", condition: "Low Stock", loc: "Bunker 2" },
              ].map((item, i) => (
                <motion.tr 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i }}
                  key={item.id} 
                  className="border-b border-tactical-border/50 hover:bg-tactical-border/30 transition-colors"
                >
                  <td className="py-3 px-4 font-mono text-tactical-muted">{item.id}</td>
                  <td className="py-3 px-4 font-bold text-tactical-text">{item.name}</td>
                  <td className="py-3 px-4 text-tactical-muted">{item.cat}</td>
                  <td className="py-3 px-4 font-mono">{item.stock}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-[10px] font-bold rounded border ${
                      item.condition === 'Optimal' ? 'bg-tactical-green/10 border-tactical-green text-tactical-green' :
                      item.condition === 'Low Stock' ? 'bg-tactical-red/10 border-tactical-red text-tactical-red' :
                      'bg-yellow-500/10 border-yellow-500 text-yellow-500'
                    }`}>
                      {item.condition.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-tactical-muted text-xs font-mono">{item.loc}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
