"use client";

import { useState } from "react";
import { Package, Upload, ChevronLeft, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AddLogisticsForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      item_name: formData.get("item_name") as string,
      category: formData.get("category") as string,
      quantity: parseInt(formData.get("quantity") as string),
      unit: formData.get("unit") as string,
      min_stock_level: 0,
      condition_status: formData.get("condition_status") as string,
      imageBase64: imagePreview,
      imageName: imageName
    };

    try {
      const response = await fetch("/api/logistics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      if (result.success) {
        router.push("/logistics");
        router.refresh();
      } else {
        alert("Gagal menyimpan data.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan sistem.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/logistics">
            <button className="p-2 hover:bg-tactical-border rounded-full transition-colors text-tactical-muted hover:text-tactical-text">
              <ChevronLeft size={24} />
            </button>
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-tactical-text uppercase tracking-tight">TAMBAH PERALATAN BARU</h2>
            <p className="text-tactical-muted font-mono text-sm uppercase">ASSET REGISTRATION</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Image Upload Section */}
          <div className="lg:col-span-1">
            <div className="tactical-glass tactical-border p-6 flex flex-col items-center text-center">
              <h3 className="text-sm font-bold text-tactical-text mb-4 font-mono w-full border-b border-tactical-border pb-2 uppercase">Gambar Peralatan</h3>
              <div className="w-full aspect-square bg-tactical-bg border-2 border-dashed border-tactical-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-tactical-green transition-colors mb-4 relative group overflow-hidden">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <Upload className="w-10 h-10 text-tactical-muted group-hover:text-tactical-green transition-colors" />
                    <span className="text-[10px] font-mono text-tactical-muted mt-2">UPLOAD FOTO ASET</span>
                  </>
                )}
                <input 
                  type="file" 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                  accept="image/*" 
                  onChange={handleImageChange}
                />
              </div>
              <p className="text-[10px] text-tactical-muted font-mono uppercase">
                Ratio 1:1 | MAX 2MB
              </p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="lg:col-span-2 space-y-6">
            <div className="tactical-glass tactical-border p-6 space-y-4">
              <h3 className="text-sm font-bold text-tactical-text mb-4 font-mono border-b border-tactical-border pb-2 uppercase tracking-widest">Detail Peralatan</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-mono text-tactical-muted flex items-center gap-2 uppercase">
                    <Package size={12} /> Nama Barang / Peralatan
                  </label>
                  <input 
                    required
                    name="item_name"
                    type="text" 
                    placeholder="Contoh: Senapan Serbu SS2-V4"
                    className="w-full bg-tactical-bg border border-tactical-border rounded px-4 py-2.5 text-sm text-tactical-text focus:outline-none focus:border-tactical-green transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-tactical-muted flex items-center gap-2 uppercase">
                    Kategori
                  </label>
                  <input 
                    required
                    name="category"
                    type="text" 
                    placeholder="Contoh: Senjata, Medis, dll."
                    className="w-full bg-tactical-bg border border-tactical-border rounded px-4 py-2.5 text-sm text-tactical-text focus:outline-none focus:border-tactical-green transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-tactical-muted flex items-center gap-2 uppercase">
                    Kondisi
                  </label>
                  <select 
                    name="condition_status"
                    className="w-full bg-tactical-bg border border-tactical-border rounded px-4 py-2.5 text-sm text-tactical-text focus:outline-none focus:border-tactical-green transition-colors"
                  >
                    <option value="GOOD">BAIK (GOOD)</option>
                    <option value="MAINTENANCE">PERAWATAN (MAINTENANCE)</option>
                    <option value="REPAIR">PERBAIKAN (REPAIR)</option>
                    <option value="BROKEN">RUSAK (BROKEN)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-tactical-muted flex items-center gap-2 uppercase">
                    Stok
                  </label>
                  <input 
                    required
                    name="quantity"
                    type="number" 
                    min="0"
                    placeholder="0"
                    className="w-full bg-tactical-bg border border-tactical-border rounded px-4 py-2.5 text-sm text-tactical-text focus:outline-none focus:border-tactical-green transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-tactical-muted flex items-center gap-2 uppercase">
                    Satuan Unit
                  </label>
                  <input 
                    required
                    name="unit"
                    type="text" 
                    placeholder="Pcs, Unit, Box, dll."
                    className="w-full bg-tactical-bg border border-tactical-border rounded px-4 py-2.5 text-sm text-tactical-text focus:outline-none focus:border-tactical-green transition-colors"
                  />
                </div>

                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-4">
              <Link href="/logistics">
                <button type="button" className="px-6 py-2.5 text-sm font-mono text-tactical-muted hover:text-tactical-text transition-colors uppercase">
                  Batal
                </button>
              </Link>
              <button 
                type="submit"
                disabled={loading}
                className="px-8 py-2.5 bg-tactical-green text-tactical-bg font-bold rounded flex items-center gap-2 hover:bg-tactical-green/90 transition-all disabled:opacity-50 uppercase tracking-widest"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-tactical-bg border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Save size={18} />
                    Simpan Aset
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
