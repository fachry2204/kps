
import sys
import re

file_path = r'd:\xampp\htdocs\kopasus\src\components\map\MapComponent.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Replace marker icon
if 'border-b-[24px] border-b-tactical-red' not in content:
    marker_pattern = re.compile(r'html: `<div class="w-12 h-12 rounded-full bg-tactical-red/20 border-2 border-tactical-red flex items-center justify-center animate-bounce shadow-\[0_0_30px_rgba\(255,51,51,0.6\)\]">.*?</div>`', re.DOTALL)
    new_marker = 'html: `<div class="w-10 h-10 flex items-center justify-center animate-bounce">\\n                              <div class="w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-b-[24px] border-b-tactical-red drop-shadow-[0_0_10px_rgba(255,51,51,0.8)] relative">\\n                                <div class="absolute top-[8px] left-[-4px] w-2 h-2 rounded-full bg-white opacity-40"></div>\\n                              </div>\\n                            </div>`'
    content = marker_pattern.sub(new_marker, content)

# 2. Add buttons
if 'DATA KESATUAN' not in content:
    categories = [
        ('KESATUAN', 'DATA KESATUAN', 'tactical-muted', 'KESATUAN'),
        ('OPS DALAM NEGERI', 'DATA OPERASI DL', 'blue-500', 'OPS_DN'),
        ('OPS LUAR NEGERI', 'DATA OPERASI LN', 'cyan-400', 'OPS_LN')
    ]

    for label, btn_text, color, tab in categories:
        pattern = re.compile(re.escape(label) + r'</div>.*?<button.*?LIHAT DI MAP\s+</button>', re.DOTALL)
        match = pattern.search(content)
        if match:
            old_block = match.group(0)
            btn_html = '\\n                              <button \\n                                onClick={() => {\\n                                  setActiveDistributionTab("' + tab + '");\\n                                  setActiveModal("LOGISTIK_USAGE");\\n                                }}\\n                                className="w-full py-2 bg-' + color + '/10 border border-' + color + '/30 rounded text-[9px] font-bold text-' + color + ' hover:bg-' + color + ' hover:text-white transition-all uppercase flex items-center justify-center gap-2 mt-2"\\n                              >\\n                                 <Database size={12} /> ' + btn_text + '\\n                              </button>'
            content = content.replace(old_block, old_block + btn_html)

# 3. Add LOGISTIK_USAGE modal
if 'activeModal === \'LOGISTIK_USAGE\'' not in content:
    modal_content = """                 ) : activeModal === 'LOGISTIK_USAGE' && selectedAsset ? (
                   <div className="space-y-6 pb-4">
                     <div className="flex items-center justify-between border-b border-tactical-border pb-4">
                        <div className="flex items-center gap-3">
                           <div className={cn(
                             "w-10 h-10 rounded border flex items-center justify-center bg-black/40",
                             activeDistributionTab === 'KESATUAN' ? "border-tactical-red/30 text-tactical-red" :
                             activeDistributionTab === 'OPS_DN' ? "border-blue-500/30 text-blue-500" :
                             "border-cyan-400/30 text-cyan-400"
                           )}>
                              <Database size={20} />
                           </div>
                           <div>
                              <div className="text-[10px] text-tactical-muted uppercase font-mono tracking-widest">DATA PEMAKAI LOGISTIK</div>
                              <h4 className="text-xl font-black text-tactical-text uppercase tracking-tight">
                                {activeDistributionTab === 'KESATUAN' ? 'KESATUAN / SATUAN' :
                                 activeDistributionTab === 'OPS_DN' ? 'OPERASI DALAM NEGERI' :
                                 'OPERASI LUAR NEGERI'}
                              </h4>
                           </div>
                        </div>
                        <div className="text-right">
                           <div className="text-[10px] text-tactical-muted uppercase">TOTAL ASSET</div>
                           <div className={cn(
                             "text-2xl font-black",
                             activeDistributionTab === 'KESATUAN' ? "text-tactical-red" :
                             activeDistributionTab === 'OPS_DN' ? "text-blue-500" :
                             "text-cyan-400"
                           )}>
                             {activeDistributionTab === 'KESATUAN' ? logisticsDistribution.kesatuan :
                              activeDistributionTab === 'OPS_DN' ? logisticsDistribution.ops_dn :
                              logisticsDistribution.ops_ln} Unit
                           </div>
                        </div>
                     </div>

                     <div className="overflow-x-auto border border-tactical-border rounded-lg bg-black/40">
                        <table className="w-full text-left border-collapse">
                           <thead>
                              <tr className={cn(
                                "border-b border-tactical-border",
                                activeDistributionTab === 'KESATUAN' ? "bg-tactical-red/10" :
                                activeDistributionTab === 'OPS_DN' ? "bg-blue-500/10" :
                                "bg-cyan-400/10"
                              )}>
                                 <th className={cn(
                                   "p-3 text-[10px] font-black uppercase tracking-widest",
                                   activeDistributionTab === 'KESATUAN' ? "text-tactical-red" :
                                   activeDistributionTab === 'OPS_DN' ? "text-blue-500" :
                                   "text-cyan-400"
                                 )}>No</th>
                                 <th className={cn(
                                   "p-3 text-[10px] font-black uppercase tracking-widest",
                                   activeDistributionTab === 'KESATUAN' ? "text-tactical-red" :
                                   activeDistributionTab === 'OPS_DN' ? "text-blue-500" :
                                   "text-cyan-400"
                                 )}>Nama Unit / Operasi</th>
                                 <th className={cn(
                                   "p-3 text-[10px] font-black uppercase tracking-widest text-center",
                                   activeDistributionTab === 'KESATUAN' ? "text-tactical-red" :
                                   activeDistributionTab === 'OPS_DN' ? "text-blue-500" :
                                   "text-cyan-400"
                                 )}>Status</th>
                                 <th className={cn(
                                   "p-3 text-[10px] font-black uppercase tracking-widest text-center",
                                   activeDistributionTab === 'KESATUAN' ? "text-tactical-red" :
                                   activeDistributionTab === 'OPS_DN' ? "text-blue-500" :
                                   "text-cyan-400"
                                 )}>Jumlah</th>
                                 <th className={cn(
                                   "p-3 text-[10px] font-black uppercase tracking-widest text-right",
                                   activeDistributionTab === 'KESATUAN' ? "text-tactical-red" :
                                   activeDistributionTab === 'OPS_DN' ? "text-blue-500" :
                                   "text-cyan-400"
                                 )}>Aksi</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-tactical-border/30">
                              {(activeDistributionTab === 'KESATUAN' ? distributionDetails.units :
                                activeDistributionTab === 'OPS_DN' ? distributionDetails.ops_dn :
                                distributionDetails.ops_ln).length > 0 ? (
                                (activeDistributionTab === 'KESATUAN' ? distributionDetails.units :
                                 activeDistributionTab === 'OPS_DN' ? distributionDetails.ops_dn :
                                 distributionDetails.ops_ln).map((usage, idx) => (
                                  <tr key={idx} className="hover:bg-tactical-cyan/5 transition-colors group">
                                     <td className="p-3 text-[11px] font-mono text-tactical-muted">{idx + 1}</td>
                                     <td className="p-3 text-[11px] font-bold text-tactical-text uppercase">{usage.name}</td>
                                     <td className="p-3 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                           <div className={cn(
                                             "w-1.5 h-1.5 rounded-full animate-pulse",
                                             activeDistributionTab === 'KESATUAN' ? "bg-tactical-red" :
                                             activeDistributionTab === 'OPS_DN' ? "bg-blue-500" :
                                             "bg-cyan-400"
                                           )}></div>
                                           <span className="text-[9px] font-bold text-tactical-text uppercase tracking-wider">AKTIF</span>
                                        </div>
                                     </td>
                                     <td className={cn(
                                       "p-3 text-center text-[11px] font-black",
                                       activeDistributionTab === 'KESATUAN' ? "text-tactical-red" :
                                       activeDistributionTab === 'OPS_DN' ? "text-blue-500" :
                                       "text-cyan-400"
                                     )}>
                                        {usage.quantity} Unit
                                     </td>
                                     <td className="p-3 text-right">
                                        <button 
                                          onClick={() => {
                                            if (usage.coordinates) {
                                              const coords = usage.coordinates.split(',');
                                              if (onMarkerClick) onMarkerClick([parseFloat(coords[0]), parseFloat(coords[1])], 15);
                                              setActiveModal(null);
                                            }
                                          }}
                                          className={cn(
                                            "p-1.5 rounded-md transition-all",
                                            activeDistributionTab === 'KESATUAN' ? "hover:bg-tactical-red/20 text-tactical-red" :
                                            activeDistributionTab === 'OPS_DN' ? "hover:bg-blue-500/20 text-blue-500" :
                                            "hover:bg-cyan-400/20 text-cyan-400"
                                          )}
                                        >
                                           <MapPin size={14} />
                                        </button>
                                     </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                   <td colSpan={5} className="p-10 text-center text-tactical-muted text-[10px] uppercase font-mono italic">
                                      Data penggunaan aset tidak ditemukan untuk kategori ini.
                                   </td>
                                </tr>
                              )}
                           </tbody>
                        </table>
                     </div>

                     <button 
                       onClick={() => {
                         setActiveModal('LOGISTIK_DETAIL');
                       }}
                       className="text-xs font-bold flex items-center gap-2 mt-6 pt-4 border-t border-tactical-border text-tactical-muted hover:text-tactical-green transition-all"
                     >
                       &larr; KEMBALI KE DETAIL LOGISTIK
                     </button>
                   </div>
"""
    # Replace the back button logic in LOGISTIK_DETAIL to handle returning from usage
    old_back = re.compile(r'(&larr; KEMBALI KE \{)(detailReturnModal \|\| \'DAFTAR LOGISTIK\'\})(\})', re.DOTALL)
    content = old_back.sub(r"&larr; KEMBALI KE {detailReturnModal === 'LOGISTIK_USAGE' ? 'MODAL PEMAKAI' : (detailReturnModal || 'DAFTAR LOGISTIK')}", content)
    
    # Insert the new modal before the last null check
    content = content.replace(') : null}', modal_content + '                 ) : null}')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement complete")
