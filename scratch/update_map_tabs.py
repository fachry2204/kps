import sys

file_path = r"d:\xampp\htdocs\kopasus\src\components\map\MapComponent.tsx"

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Remove lines 1439 to 1468 (1-indexed)
# 1439 is index 1438
# 1468 is index 1467
start_idx = 1438
end_idx = 1467

new_lines = lines[:start_idx] + lines[end_idx+1:]

# Also add the new tab content after line 1502 (original indexing)
# Since we removed 30 lines, the new position is 1502 - 30 = 1472
# 1502 was index 1501
insert_idx = 1501 - (end_idx - start_idx + 1)

tab_content = """                    ) : opActiveTab === 'Logistik' ? (
                       <div className="space-y-4">
                         <div className="flex justify-between items-center">
                           <h5 className="text-xs font-bold text-tactical-muted uppercase tracking-widest border-l-2 border-tactical-green pl-2">Logistik Terdeploy</h5>
                           <div className="text-[10px] text-tactical-green font-mono">{opAssets.length} ITEM AKTIF</div>
                         </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                           {opAssets.length > 0 ? opAssets.map((item, idx) => (
                             <div 
                               key={idx} 
                               onClick={() => {
                                 setSelectedAsset(item);
                                 setDetailReturnModal('OPERASI_DETAIL');
                                 setActiveModal('LOGISTIK_DETAIL');
                               }}
                               className="flex items-center gap-4 p-4 bg-black/40 border border-tactical-border rounded-lg hover:border-tactical-green/50 transition-all cursor-pointer group"
                             >
                               <div className="w-12 h-12 rounded bg-tactical-dark border border-tactical-border flex items-center justify-center">
                                 <Package className="text-tactical-green w-6 h-6 opacity-50 group-hover:opacity-100" />
                               </div>
                               <div className="flex-1">
                                 <div className="text-xs font-bold text-tactical-text group-hover:text-tactical-green transition-colors uppercase tracking-widest">{item.name || item.item_name}</div>
                                 <div className="text-[9px] text-tactical-muted uppercase font-mono mt-0.5">Kategori: {item.category || item.item_category || 'LOGISTIK'}</div>
                                 <div className="text-[10px] text-tactical-green mt-1 font-black">JUMLAH: {item.qty || item.quantity}</div>
                               </div>
                               <ChevronRight size={16} className="text-tactical-muted group-hover:text-tactical-green transition-all" />
                             </div>
                           )) : (
                             <div className="text-[10px] text-tactical-muted font-mono italic p-4 text-center border border-tactical-border rounded bg-black/20 col-span-full">
                               Belum ada logistik terdeploy untuk operasi ini.
                             </div>
                           )}
                         </div>
                       </div>
"""

final_lines = new_lines[:insert_idx+1] + [tab_content] + new_lines[insert_idx+1:]

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(final_lines)

print("File updated successfully")
