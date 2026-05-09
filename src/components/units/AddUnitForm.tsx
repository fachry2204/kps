"use client";

import { useState } from "react";
import { 
  Building2, 
  MapPin, 
  User, 
  Upload, 
  Search, 
  ChevronLeft, 
  Save,
  Crosshair
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { addUnit } from "@/app/actions";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const LocationPicker = dynamic(() => import("./LocationPicker"), { 
  ssr: false,
  loading: () => <div className="h-[300px] bg-tactical-bg flex items-center justify-center text-tactical-green font-mono text-xs">LOADING SATELLITE...</div>
});

interface Person {
  id: number;
  name: string;
  rank: string;
  nrp: string;
}

interface AddUnitFormProps {
  personnel: Person[];
}

export default function AddUnitForm({ personnel }: AddUnitFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCommander, setSelectedCommander] = useState<Person | null>(null);
  const [showCommanderList, setShowCommanderList] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoName, setLogoName] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [coordinates, setCoordinates] = useState("");
  const [address, setAddress] = useState("");
  const [geocoding, setGeocoding] = useState(false);

  const handleGeocode = async () => {
    setShowMap(true);
    if (!address) return;
    
    setGeocoding(true);
    try {
      // Nominatim search
      const searchUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;
      const response = await fetch(searchUrl, {
        headers: {
          'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7'
        }
      });
      const data = await response.json();
      
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        setCoordinates(`${lat}, ${lon}`);
      } else {
        // Fallback: try searching only the city/district if full address fails
        const parts = address.split(',');
        if (parts.length > 2) {
          const fallbackSearch = parts.slice(-2).join(','); // Take last 2 parts (usually City, Province)
          const fallbackResponse = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fallbackSearch)}&limit=1`);
          const fallbackData = await fallbackResponse.json();
          if (fallbackData && fallbackData.length > 0) {
            const { lat, lon } = fallbackData[0];
            setCoordinates(`${lat}, ${lon}`);
          } else {
            alert("Lokasi tidak ditemukan. Silakan tentukan titik secara manual di peta.");
          }
        } else {
          alert("Lokasi tidak ditemukan. Silakan tentukan titik secara manual di peta.");
        }
      }
    } catch (error) {
      console.error("Geocoding failed:", error);
      alert("Gagal menghubungi layanan peta. Silakan tentukan titik secara manual.");
    } finally {
      setGeocoding(false);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredPersonnel = personnel.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.nrp.includes(searchQuery)
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formElement = e.currentTarget;
    const formData = new FormData(formElement);
    
    const data = {
      unit_name: formData.get("unit_name") as string,
      unit_type: formData.get("unit_type") as string,
      location: formData.get("location") as string,
      coordinates: formData.get("coordinates") as string,
      commander_id: selectedCommander?.id.toString(),
      logoBase64: logoPreview,
      logoName: logoName
    };

    try {
      const response = await fetch("/api/units", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        router.push("/units");
        router.refresh();
      } else {
        alert("Gagal menyimpan data: " + result.error);
      }
    } catch (error: any) {
      console.error("Failed to add unit:", error);
      alert("Terjadi kesalahan sistem saat menghubungi server. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/units">
            <button className="p-2 hover:bg-tactical-border rounded-full transition-colors text-tactical-muted hover:text-tactical-text">
              <ChevronLeft size={24} />
            </button>
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-tactical-text">TAMBAHKAN KESATUAN BARU</h2>
            <p className="text-tactical-muted font-mono text-sm">UNIT REGISTRATION SYSTEM</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Logo Upload */}
          <div className="lg:col-span-1">
            <div className="tactical-glass tactical-border p-6 flex flex-col items-center text-center">
              <h3 className="text-sm font-bold text-tactical-text mb-4 font-mono w-full border-b border-tactical-border pb-2">LOGO KESATUAN</h3>
              <div className="w-32 h-32 bg-tactical-bg border-2 border-dashed border-tactical-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-tactical-green transition-colors mb-4 relative group overflow-hidden">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-contain p-2" />
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-tactical-muted group-hover:text-tactical-green transition-colors" />
                    <span className="text-[10px] font-mono text-tactical-muted mt-2">UPLOAD LOGO</span>
                  </>
                )}
                <input 
                  name="logo"
                  type="file" 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                  accept="image/*" 
                  onChange={handleLogoChange}
                />
              </div>
              <p className="text-xs text-tactical-muted font-mono italic">
                Format: PNG, SVG (Max 2MB)
              </p>
            </div>
          </div>

          {/* Right Column: Form Fields */}
          <div className="lg:col-span-2 space-y-6">
            <div className="tactical-glass tactical-border p-6 space-y-4">
              <h3 className="text-sm font-bold text-tactical-text mb-4 font-mono border-b border-tactical-border pb-2">IDENTITAS & LOKASI</h3>
              
              <div className="space-y-2">
                <label className="text-xs font-mono text-tactical-muted flex items-center gap-2">
                  <Building2 size={14} /> NAMA KESATUAN
                </label>
                <input 
                  required
                  name="unit_name"
                  type="text" 
                  placeholder="Contoh: Grup 1 Para Komando"
                  className="w-full bg-tactical-bg border border-tactical-border rounded px-4 py-2.5 text-sm text-tactical-text focus:outline-none focus:border-tactical-green transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono text-tactical-muted flex items-center gap-2">
                  TIPE KESATUAN
                </label>
                <select 
                  name="unit_type"
                  className="w-full bg-tactical-bg border border-tactical-border rounded px-4 py-2.5 text-sm text-tactical-text focus:outline-none focus:border-tactical-green transition-colors"
                >
                  <option value="PARA_KOMANDO">PARA KOMANDO</option>
                  <option value="SPECIAL_FORCE">SPECIAL FORCE (GULTOR)</option>
                  <option value="INTEL">INTELIJEN (SANDI YUDHA)</option>
                  <option value="TRAINING">PUSDIKLAT</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono text-tactical-muted flex items-center gap-2">
                  <MapPin size={14} /> ALAMAT LENGKAP
                </label>
                <textarea 
                  required
                  name="location"
                  placeholder="Alamat Markas Komando..."
                  rows={3}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-tactical-bg border border-tactical-border rounded px-4 py-2.5 text-sm text-tactical-text focus:outline-none focus:border-tactical-green transition-colors resize-none"
                ></textarea>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono text-tactical-muted flex items-center gap-2">
                  <Crosshair size={14} /> KOORDINAT GPS (LAT, LONG)
                </label>
                <div className="flex gap-2">
                  <input 
                    required
                    name="coordinates"
                    type="text" 
                    placeholder="-6.1754, 106.8272"
                    value={coordinates}
                    onChange={(e) => setCoordinates(e.target.value)}
                    className="flex-1 bg-tactical-bg border border-tactical-border rounded px-4 py-2.5 text-sm text-tactical-text focus:outline-none focus:border-tactical-green transition-colors"
                  />
                  <button 
                    type="button" 
                    onClick={handleGeocode}
                    disabled={geocoding}
                    className="p-2.5 bg-tactical-cyan/10 border border-tactical-cyan text-tactical-cyan rounded hover:bg-tactical-cyan/20 transition-colors disabled:opacity-50"
                  >
                    {geocoding ? (
                      <div className="w-5 h-5 border-2 border-tactical-cyan border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Crosshair size={18} />
                    )}
                  </button>
                </div>
              </div>

              {showMap && (
                <div className="pt-2">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-mono text-tactical-muted uppercase">TACTICAL GRID PREVIEW</span>
                    <button 
                      type="button" 
                      onClick={() => setShowMap(false)}
                      className="text-[10px] font-mono text-tactical-red hover:underline"
                    >
                      CLOSE MAP
                    </button>
                  </div>
                  <LocationPicker 
                    initialLocation={coordinates ? (coordinates.split(',').map(Number) as [number, number]) : [-6.1754, 106.8272]} 
                    onLocationSelected={(lat, lng) => setCoordinates(`${lat.toFixed(6)}, ${lng.toFixed(6)}`)}
                    hasLocation={!!coordinates}
                  />
                  <p className="text-[10px] font-mono text-tactical-muted mt-2 uppercase">
                    * KLIK PADA PETA ATAU GESER PIN UNTUK MENENTUKAN LOKASI PERSIS
                  </p>
                </div>
              )}
            </div>

            {/* Commander Selection */}
            <div className="tactical-glass tactical-border p-6 space-y-4">
              <h3 className="text-sm font-bold text-tactical-text mb-4 font-mono border-b border-tactical-border pb-2">KOMANDAN KESATUAN</h3>
              
              <div className="relative">
                <label className="text-xs font-mono text-tactical-muted flex items-center gap-2 mb-2">
                  <User size={14} /> CARI & PILIH Komandan Satuan ( Masukan Nama / NRP )
                </label>
                
                {selectedCommander ? (
                  <div className="flex justify-between items-center p-3 bg-tactical-green/10 border border-tactical-green rounded">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-tactical-bg border border-tactical-border rounded flex items-center justify-center">
                        <User className="text-tactical-green" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-tactical-text">{selectedCommander.name}</div>
                        <div className="text-[10px] font-mono text-tactical-muted">{selectedCommander.rank} - {selectedCommander.nrp}</div>
                      </div>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setSelectedCommander(null)}
                      className="text-xs text-tactical-red hover:underline font-mono"
                    >
                      GANTI
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tactical-muted" />
                    <input 
                      type="text" 
                      placeholder="Masukkan Nama atau NRP..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowCommanderList(true);
                      }}
                      onFocus={() => setShowCommanderList(true)}
                      className="w-full bg-tactical-bg border border-tactical-border rounded pl-10 pr-4 py-2.5 text-sm text-tactical-text focus:outline-none focus:border-tactical-green transition-colors"
                    />
                    
                    {showCommanderList && searchQuery.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 max-h-60 overflow-y-auto bg-tactical-panel border border-tactical-border rounded shadow-xl">
                        {filteredPersonnel.map((person) => (
                          <div 
                            key={person.id}
                            onClick={() => {
                              setSelectedCommander(person);
                              setShowCommanderList(false);
                              setSearchQuery("");
                            }}
                            className="p-3 hover:bg-tactical-border cursor-pointer transition-colors border-b border-tactical-border/50 last:border-0"
                          >
                            <div className="text-sm font-bold text-tactical-text">{person.name}</div>
                            <div className="text-[10px] font-mono text-tactical-muted">{person.rank} - {person.nrp}</div>
                          </div>
                        ))}
                        {filteredPersonnel.length === 0 && (
                          <div className="p-4 text-center text-xs text-tactical-muted font-mono">PERSONEL TIDAK DITEMUKAN</div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-4">
              <Link href="/units">
                <button type="button" className="px-6 py-2.5 text-sm font-mono text-tactical-muted hover:text-tactical-text transition-colors">
                  BATAL
                </button>
              </Link>
              <button 
                type="submit"
                disabled={loading}
                className="px-8 py-2.5 bg-tactical-green text-tactical-bg font-bold rounded flex items-center gap-2 hover:bg-tactical-green/90 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-tactical-bg border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Save size={18} />
                    SIMPAN DATA
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
