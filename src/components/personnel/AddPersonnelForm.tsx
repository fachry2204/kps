"use client";

import { useState } from "react";
import { 
  User, 
  Upload, 
  ChevronLeft, 
  Save,
  Briefcase,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Heart,
  Navigation,
  Search,
  Plus,
  X
} from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { addPersonnel } from "@/app/actions";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const LocationPicker = dynamic(() => import("../units/LocationPicker"), { 
  ssr: false,
  loading: () => <div className="h-[300px] bg-tactical-bg flex items-center justify-center text-tactical-green font-mono text-xs uppercase">Initializing Tactical Grid...</div>
});

export default function AddPersonnelForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState<string | null>(null);
  const [gpsCoords, setGpsCoords] = useState<[number, number]>([-6.2088, 106.8456]); // Default Jakarta
  const [hasLocation, setHasLocation] = useState(false);
  const [address, setAddress] = useState("");
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>([]);
  const [otherSpec, setOtherSpec] = useState("");
  const [isOtherSelected, setIsOtherSelected] = useState(false);

  const SPEC_OPTIONS = [
    "PARAKO", "SANDHA", "GULTOR", "DEMOLISI", "BAKDUK", "BAHASA"
  ];

  const toggleSpec = (spec: string) => {
    setSelectedSpecs(prev => 
      prev.includes(spec) ? prev.filter(s => s !== spec) : [...prev, spec]
    );
  };

  const addManualSpec = () => {
    if (otherSpec.trim()) {
      const trimmed = otherSpec.trim().toUpperCase();
      if (!selectedSpecs.includes(trimmed)) {
        setSelectedSpecs(prev => [...prev, trimmed]);
      }
      setOtherSpec("");
    }
  };

  const handleOtherSpecKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addManualSpec();
    }
  };

  const handleSearchAddress = async () => {
    if (!address || address.length < 5) return;
    
    setIsGeocoding(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
      const data = await response.json();
      
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        setGpsCoords([lat, lon]);
        setHasLocation(true);
      }
    } catch (error) {
      console.error("Geocoding failed:", error);
    } finally {
      setIsGeocoding(false);
    }
  };

  const RANKS = [
    "Prada", "Pratu", "Praka", "Kopda", "Koptu", "Kopka",
    "Serda", "Sertu", "Serka", "Serma", "Pelda", "Peltu",
    "Letda", "Lettu", "Kapten", "Mayor", "Letkol", "Kolonel",
    "Brigjen", "Mayjen", "Letjen", "Jendral"
  ];

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    
    const finalSpecs = [...selectedSpecs];
    
    const data = {
      name: formData.get("name") as string,
      nrp: formData.get("nrp") as string,
      rank: formData.get("rank") as string,
      unit_id: parseInt(formData.get("unit_id") as string),
      specialization: finalSpecs.join(", "),
      status: "ACTIVE", // Default status
      joined_date: formData.get("joined_date") as string,
      address: formData.get("address") as string,
      gps_coordinates: hasLocation ? `${gpsCoords[0]}, ${gpsCoords[1]}` : "",
      phone_number: formData.get("phone_number") as string,
      emergency_contact: formData.get("emergency_contact") as string,
      email: formData.get("email") as string,
      photoBase64: photoPreview,
      photoName: photoName
    };

    try {
      const result = await addPersonnel(data);
      if (result.success) {
        router.push("/personnel");
        router.refresh();
      } else {
        alert("Gagal menyimpan: " + result.error);
      }
    } catch (error) {
      console.error("Submit failed:", error);
      alert("Terjadi kesalahan sistem.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/personnel">
            <button className="p-2 hover:bg-tactical-border rounded-full transition-colors text-tactical-muted hover:text-tactical-text">
              <ChevronLeft size={24} />
            </button>
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-tactical-text uppercase tracking-tight">REGISTRASI PERSONIL BARU</h2>
            <p className="text-tactical-muted font-mono text-sm uppercase">Personnel Enlistment System</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Photo Upload Section */}
          <div className="lg:col-span-1">
            <div className="tactical-glass tactical-border p-6 flex flex-col items-center text-center">
              <h3 className="text-sm font-bold text-tactical-text mb-4 font-mono w-full border-b border-tactical-border pb-2 uppercase">Foto Personil</h3>
              <div className="w-48 h-64 bg-tactical-bg border-2 border-dashed border-tactical-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-tactical-green transition-colors mb-4 relative group overflow-hidden">
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <Upload className="w-10 h-10 text-tactical-muted group-hover:text-tactical-green transition-colors" />
                    <span className="text-[10px] font-mono text-tactical-muted mt-2">UPLOAD PAS FOTO</span>
                  </>
                )}
                <input 
                  type="file" 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                  accept="image/*" 
                  onChange={handlePhotoChange}
                />
              </div>
              <p className="text-[10px] text-tactical-muted font-mono uppercase">
                Ratio 3:4 | MAX 2MB
              </p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="lg:col-span-2 space-y-6">
            <div className="tactical-glass tactical-border p-6 space-y-4">
              <h3 className="text-sm font-bold text-tactical-text mb-4 font-mono border-b border-tactical-border pb-2 uppercase tracking-widest">Identitas Prajurit</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-tactical-muted flex items-center gap-2 uppercase">
                    <User size={12} /> Nama Lengkap
                  </label>
                  <input 
                    required
                    name="name"
                    type="text" 
                    placeholder="Nama Lengkap Tanpa Gelar..."
                    className="w-full bg-tactical-bg border border-tactical-border rounded px-4 py-2.5 text-sm text-tactical-text focus:outline-none focus:border-tactical-green transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-tactical-muted flex items-center gap-2 uppercase">
                    NRP
                  </label>
                  <input 
                    required
                    name="nrp"
                    type="text" 
                    placeholder="Nomor Registrasi Pokok..."
                    className="w-full bg-tactical-bg border border-tactical-border rounded px-4 py-2.5 text-sm text-tactical-text focus:outline-none focus:border-tactical-green transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-tactical-muted flex items-center gap-2 uppercase">
                    Pangkat
                  </label>
                  <select 
                    name="rank"
                    className="w-full bg-tactical-bg border border-tactical-border rounded px-4 py-2.5 text-sm text-tactical-text focus:outline-none focus:border-tactical-green transition-colors"
                  >
                    {RANKS.map(rank => <option key={rank} value={rank}>{rank}</option>)}
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-mono text-tactical-muted flex items-center gap-2 uppercase">
                    <Briefcase size={12} /> Spesialisasi (Pilih Satu atau Lebih)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {SPEC_OPTIONS.map(spec => (
                      <button
                        key={spec}
                        type="button"
                        onClick={() => toggleSpec(spec)}
                        className={`px-3 py-2 text-[10px] font-mono font-bold rounded border transition-all uppercase text-left ${
                          selectedSpecs.includes(spec)
                            ? 'bg-tactical-green text-tactical-bg border-tactical-green'
                            : 'bg-tactical-bg text-tactical-muted border-tactical-border hover:border-tactical-green/50'
                        }`}
                      >
                        {spec}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setIsOtherSelected(!isOtherSelected)}
                      className={`px-3 py-2 text-[10px] font-mono font-bold rounded border transition-all uppercase text-left ${
                        isOtherSelected
                          ? 'bg-tactical-cyan text-tactical-bg border-tactical-cyan'
                          : 'bg-tactical-bg text-tactical-muted border-tactical-border hover:border-tactical-cyan/50'
                      }`}
                    >
                      LAINNYA
                    </button>
                  </div>
                  
                  {isOtherSelected && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 flex gap-2"
                    >
                      <input 
                        type="text"
                        placeholder="KETIK & TEKAN ENTER UNTUK MENAMBAH..."
                        value={otherSpec}
                        onChange={(e) => setOtherSpec(e.target.value)}
                        onKeyDown={handleOtherSpecKeyDown}
                        className="flex-1 bg-tactical-bg border border-tactical-cyan/30 rounded px-4 py-2 text-[10px] font-mono text-tactical-cyan focus:outline-none focus:border-tactical-cyan transition-colors"
                      />
                      <button 
                        type="button"
                        onClick={addManualSpec}
                        className="px-4 py-2 bg-tactical-cyan/10 border border-tactical-cyan text-tactical-cyan rounded text-[10px] font-mono hover:bg-tactical-cyan hover:text-tactical-bg transition-all"
                      >
                        TAMBAH
                      </button>
                    </motion.div>
                  )}
                  
                  {selectedSpecs.length > 0 ? (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {selectedSpecs.map(s => (
                        <span key={s} className="px-1.5 py-0.5 bg-tactical-green/10 text-tactical-green border border-tactical-green/30 text-[8px] font-mono font-bold rounded flex items-center gap-1">
                          {s} <X size={8} className="cursor-pointer" onClick={() => toggleSpec(s)} />
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-tactical-muted flex items-center gap-2 uppercase">
                    <Calendar size={12} /> Tanggal Bergabung
                  </label>
                  <input 
                    required
                    name="joined_date"
                    type="date" 
                    className="w-full bg-tactical-bg border border-tactical-border rounded px-4 py-2.5 text-sm text-tactical-text focus:outline-none focus:border-tactical-green transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Contact & Location Section */}
            <div className="tactical-glass tactical-border p-6 space-y-4">
              <h3 className="text-sm font-bold text-tactical-text mb-4 font-mono border-b border-tactical-border pb-2 uppercase tracking-widest">Informasi Kontak & Lokasi</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-tactical-muted flex items-center gap-2 uppercase">
                      <MapPin size={12} /> Alamat Lengkap
                    </label>
                    <div className="relative">
                      <textarea 
                        name="address"
                        rows={3}
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Masukkan alamat lengkap domisili..."
                        className="w-full bg-tactical-bg border border-tactical-border rounded px-4 py-2.5 text-sm text-tactical-text focus:outline-none focus:border-tactical-green transition-colors resize-none pr-24"
                      ></textarea>
                      <button 
                        type="button"
                        onClick={handleSearchAddress}
                        disabled={isGeocoding || address.length < 5}
                        className="absolute bottom-3 right-3 px-3 py-1 bg-tactical-cyan/10 border border-tactical-cyan/30 rounded text-[10px] font-mono text-tactical-cyan hover:bg-tactical-cyan hover:text-tactical-bg transition-all disabled:opacity-30 flex items-center gap-1"
                      >
                        {isGeocoding ? <div className="w-2 h-2 border border-tactical-cyan border-t-transparent rounded-full animate-spin"></div> : <Search size={10} />}
                        CARI LOKASI
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-tactical-muted flex items-center gap-2 uppercase">
                        <Phone size={12} /> Nomor Handphone
                      </label>
                      <input 
                        name="phone_number"
                        type="tel" 
                        placeholder="+62..."
                        className="w-full bg-tactical-bg border border-tactical-border rounded px-4 py-2.5 text-sm text-tactical-text focus:outline-none focus:border-tactical-green transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-tactical-muted flex items-center gap-2 uppercase">
                        <Mail size={12} /> Email
                      </label>
                      <input 
                        name="email"
                        type="email" 
                        placeholder="nama@email.com"
                        className="w-full bg-tactical-bg border border-tactical-border rounded px-4 py-2.5 text-sm text-tactical-text focus:outline-none focus:border-tactical-green transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-tactical-muted flex items-center gap-2 uppercase">
                      <Heart size={12} /> Kontak Darurat (Nama & No. HP)
                    </label>
                    <input 
                      name="emergency_contact"
                      type="text" 
                      placeholder="Contoh: Istri - 0812..."
                      className="w-full bg-tactical-bg border border-tactical-border rounded px-4 py-2.5 text-sm text-tactical-text focus:outline-none focus:border-tactical-green transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-tactical-muted flex items-center gap-2 uppercase">
                      <Navigation size={12} /> Koordinat GPS
                    </label>
                    <div className="flex gap-2">
                      <input 
                        readOnly
                        value={hasLocation ? `${gpsCoords[0].toFixed(6)}, ${gpsCoords[1].toFixed(6)}` : "Belum ditentukan"}
                        className="w-full bg-tactical-bg/50 border border-tactical-border rounded px-4 py-2.5 text-sm text-tactical-muted focus:outline-none cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-tactical-muted flex items-center gap-2 uppercase">
                    <MapPin size={12} /> PIN MAP LOKASI
                  </label>
                  <div className="h-[250px] md:h-full min-h-[250px]">
                    <LocationPicker 
                      initialLocation={gpsCoords}
                      onLocationSelected={(lat, lng) => {
                        setGpsCoords([lat, lng]);
                        setHasLocation(true);
                      }}
                      hasLocation={hasLocation}
                    />
                    <p className="text-[9px] font-mono text-tactical-muted mt-2 uppercase">Geser pin untuk menentukan koordinat domisili yang tepat</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-4">
              <Link href="/personnel">
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
                    Simpan Data
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
