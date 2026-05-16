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
  Crosshair,
  UserPlus,
  Trash2,
  X,
  Shield,
  FileText
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
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
  unit_id: number | null;
  unit_name: string | null;
  commanded_unit_name?: string | null;
  unit_role?: string;
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
  const [selectedMembers, setSelectedMembers] = useState<Person[]>([]);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [memberSearchQuery, setMemberSearchQuery] = useState("");
  const [addingRoleFor, setAddingRoleFor] = useState<number | null>(null);
  const [tempRole, setTempRole] = useState("");
  const [assignmentWarning, setAssignmentWarning] = useState<{
    person: Person;
    type: 'COMMANDER' | 'MEMBER';
    role?: string;
  } | null>(null);
  const [commanderWarning, setCommanderWarning] = useState<Person | null>(null);

  const handleGeocode = async () => {
    setShowMap(true);
    if (!address) return;
    
    setGeocoding(true);
    try {
      const searchUrl = `/api/geocode?q=${encodeURIComponent(address)}`;
      const response = await fetch(searchUrl);

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error("Layanan peta sedang sibuk (Terlalu banyak permintaan). Silakan gunakan peta manual.");
        }
        throw new Error(`Network response was not ok (${response.status})`);
      }

      const data = await response.json();
      
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        setCoordinates(`${lat}, ${lon}`);
      } else {
        alert("Alamat tidak ditemukan. Silakan geser pin pada peta secara manual.");
      }
    } catch (error: any) {
      console.error("Geocoding failed:", error);
      alert(`Gagal mengambil data lokasi: ${error.message || "Periksa koneksi internet Anda"}\n\nSaran: Anda dapat mengeklik 'SHOW MAP' dan menggeser pin lokasi secara langsung.`);
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
      members: selectedMembers.map(m => ({ id: m.id, role: m.unit_role || 'Anggota' })),
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
        router.push("/kesatuan");
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
          <Link href="/kesatuan">
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
                    className="px-4 py-2.5 bg-tactical-cyan/10 border border-tactical-cyan text-tactical-cyan text-[10px] font-bold font-mono rounded flex items-center gap-2 hover:bg-tactical-cyan/20 transition-colors disabled:opacity-50"
                  >
                    {geocoding ? (
                      <div className="w-4 h-4 border-2 border-tactical-cyan border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Crosshair size={16} />
                        CARI ALAMAT
                      </>
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
                              if (person.unit_name) {
                                setAssignmentWarning({ person, type: 'COMMANDER' });
                              } else {
                                setSelectedCommander(person);
                              }
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

            {/* Member Selection Section */}
            <div className="tactical-glass tactical-border p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-tactical-border pb-2 mb-4">
                <h3 className="text-sm font-bold text-tactical-text font-mono">ANGGOTA KESATUAN</h3>
                <button 
                  type="button"
                  onClick={() => setShowMemberModal(true)}
                  className="px-3 py-1.5 bg-tactical-cyan/10 border border-tactical-cyan text-tactical-cyan text-[10px] font-bold font-mono rounded flex items-center gap-2 hover:bg-tactical-cyan/20 transition-all"
                >
                  <UserPlus size={14} /> TAMBAHKAN ANGGOTA SATUAN
                </button>
              </div>

              {(selectedMembers.length > 0 || selectedCommander) ? (
                <div className="overflow-hidden border border-tactical-border rounded">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-tactical-panel/80 text-[10px] font-mono text-tactical-muted uppercase border-b border-tactical-border">
                        <th className="px-4 py-3 font-medium w-12">NO</th>
                        <th className="px-4 py-3 font-medium">NAMA</th>
                        <th className="px-4 py-3 font-medium">PANGKAT</th>
                        <th className="px-4 py-3 font-medium">JABATAN / SPESIALISASI</th>
                        <th className="px-4 py-3 font-medium text-right">AKSI</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs">
                      {/* Commander Row (Auto) */}
                      {selectedCommander && (
                        <tr className="border-b border-tactical-border/50 bg-tactical-green/10 group">
                          <td className="px-4 py-3 text-tactical-green font-bold font-mono">HQ</td>
                          <td className="px-4 py-3">
                            <div className="font-bold text-tactical-green">{selectedCommander.name}</div>
                            <div className="text-[10px] font-mono text-tactical-muted">{selectedCommander.nrp}</div>
                          </td>
                          <td className="px-4 py-3 text-tactical-muted font-mono">{selectedCommander.rank}</td>
                          <td className="px-4 py-3">
                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-tactical-green/20 border border-tactical-green/30 text-tactical-green text-[10px] font-bold font-mono uppercase">
                              <Shield size={10} /> KOMANDAN
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="inline-block p-1.5 text-tactical-muted/20 cursor-not-allowed">
                              <Trash2 size={14} />
                            </div>
                          </td>
                        </tr>
                      )}
                      {/* Normal Members (Sorted by Hierarchy) */}
                      {[...selectedMembers]
                        .sort((a, b) => {
                          const roles = {
                            'Wakil Komandan': 1,
                            'Komandan Batalyon': 2,
                            'Komandan Regu': 3,
                            'Anggota Personil': 4
                          };
                          const roleA = (a as any).unit_role || 'Anggota Personil';
                          const roleB = (b as any).unit_role || 'Anggota Personil';
                          return (roles[roleA as keyof typeof roles] || 99) - (roles[roleB as keyof typeof roles] || 99);
                        })
                        .map((member, idx) => (
                          <tr key={member.id} className="border-b border-tactical-border/30 hover:bg-tactical-green/5 transition-colors">
                            <td className="px-4 py-3 font-mono text-tactical-muted">{(idx + 1).toString().padStart(2, '0')}</td>
                            <td className="px-4 py-3">
                              <div className="font-bold text-tactical-text">{member.name}</div>
                              <div className="text-[10px] font-mono text-tactical-muted">{member.nrp}</div>
                            </td>
                            <td className="px-4 py-3 text-tactical-muted font-mono">{member.rank}</td>
                            <td className="px-4 py-3 text-tactical-cyan font-mono">{(member as any).unit_role || 'Anggota Personil'}</td>
                            <td className="px-4 py-3 text-right">
                              <button 
                                type="button"
                                onClick={() => setSelectedMembers(selectedMembers.filter(m => m.id !== member.id))}
                                className="p-1.5 text-tactical-red hover:bg-tactical-red/10 rounded transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-10 border border-dashed border-tactical-border rounded text-center">
                  <p className="text-xs font-mono text-tactical-muted">BELUM ADA ANGGOTA DIPILIH</p>
                </div>
              )}
            </div>

            {/* Documents Section Placeholder */}
            <div className="tactical-glass tactical-border p-6 space-y-4">
              <h3 className="text-sm font-bold text-tactical-text mb-4 font-mono border-b border-tactical-border pb-2 flex items-center gap-2">
                <FileText size={16} className="text-tactical-green" /> LAMPIRAN DOKUMEN
              </h3>
              <div className="p-8 bg-tactical-bg/30 border border-dashed border-tactical-border rounded-lg text-center">
                <p className="text-xs font-mono text-tactical-muted uppercase">
                  SIMPAN DATA KESATUAN TERLEBIH DAHULU UNTUK MENGAKTIFKAN FITUR UPLOAD DOKUMEN TAKTIS.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-4">
              <Link href="/kesatuan">
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

      {/* Commander Warning Modal */}
      <AnimatePresence>
        {commanderWarning && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md tactical-glass border border-tactical-red/50 p-8 flex flex-col items-center text-center space-y-6"
            >
              <div className="w-20 h-20 rounded-full bg-tactical-red/10 border border-tactical-red flex items-center justify-center">
                <Shield size={40} className="text-tactical-red" />
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-tactical-text font-mono uppercase tracking-tighter">PELANGGARAN HIERARKI</h3>
                <p className="text-sm text-tactical-muted font-mono mt-4">
                  Personil <span className="text-tactical-text font-bold">{commanderWarning.name}</span> tidak dapat ditambahkan sebagai anggota karena saat ini menjabat sebagai <span className="text-tactical-red font-bold">KOMANDAN</span> di:
                </p>
                <div className="mt-4 p-3 bg-tactical-bg border border-tactical-red/30 rounded">
                  <span className="text-tactical-red font-bold font-mono uppercase">{commanderWarning.commanded_unit_name}</span>
                </div>
                <p className="text-[10px] font-mono text-tactical-muted mt-6 italic">
                  * Harap lepaskan jabatan Komandan yang bersangkutan terlebih dahulu melalui menu Edit Kesatuan terkait.
                </p>
              </div>

              <button 
                onClick={() => setCommanderWarning(null)}
                className="w-full py-3 bg-tactical-red text-tactical-bg font-bold font-mono rounded hover:bg-tactical-red/90 transition-all uppercase tracking-widest"
              >
                MENGERTI
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Assignment Warning Modal */}
      <AnimatePresence>
        {assignmentWarning && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md tactical-glass border border-yellow-500/50 p-6 text-center"
            >
              <div className="w-16 h-16 bg-yellow-500/10 border border-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-yellow-500" />
              </div>
              <h3 className="text-xl font-bold text-tactical-text mb-2 uppercase tracking-tighter">PERINGATAN PENUGASAN</h3>
              <p className="text-sm text-tactical-muted font-mono mb-6">
                Personil <span className="text-tactical-text font-bold">{assignmentWarning.person.name}</span> saat ini sedang bertugas di satuan <span className="text-yellow-500 font-bold">{assignmentWarning.person.unit_name}</span>.
              </p>
              
              <div className="bg-yellow-500/5 border border-yellow-500/20 p-3 rounded mb-6 text-left">
                <p className="text-[10px] font-mono text-yellow-500 leading-tight">
                  SISTEM MENDETEKSI ADANYA PENUGASAN AKTIF. JIKA ANDA MELANJUTKAN, PERSONIL AKAN DIPINDAHKAN KE SATUAN BARU INI SECARA OTOMATIS.
                </p>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setAssignmentWarning(null)}
                  className="flex-1 py-2 bg-tactical-bg border border-tactical-border text-tactical-muted text-xs font-mono rounded hover:text-tactical-text transition-colors"
                >
                  BATALKAN
                </button>
                <button 
                  onClick={() => {
                    if (assignmentWarning.type === 'COMMANDER') {
                      setSelectedCommander(assignmentWarning.person);
                    } else {
                      setSelectedMembers([...selectedMembers, { ...assignmentWarning.person, unit_role: assignmentWarning.role || 'Anggota' }]);
                    }
                    setAssignmentWarning(null);
                    setShowMemberModal(false);
                  }}
                  className="flex-1 py-2 bg-yellow-500 text-tactical-bg text-xs font-bold font-mono rounded hover:bg-yellow-600 transition-colors"
                >
                  TETAP PINDAHKAN
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Member Addition Modal */}
      <AnimatePresence>
        {showMemberModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMemberModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl tactical-glass tactical-border overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="p-4 border-b border-tactical-border flex justify-between items-center bg-tactical-panel">
                <h3 className="text-sm font-bold text-tactical-text font-mono flex items-center gap-2">
                  <Search size={16} className="text-tactical-cyan" /> CARI DATA ANGGOTA
                </h3>
                <button 
                  onClick={() => setShowMemberModal(false)}
                  className="p-2 hover:bg-tactical-border rounded-full text-tactical-muted hover:text-tactical-red transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-4">
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tactical-muted" />
                  <input 
                    type="text" 
                    placeholder="Masukkan Nama atau NRP untuk mencari..."
                    value={memberSearchQuery}
                    onChange={(e) => setMemberSearchQuery(e.target.value)}
                    autoFocus
                    className="w-full bg-tactical-bg border border-tactical-border rounded pl-10 pr-4 py-2.5 text-sm text-tactical-text focus:outline-none focus:border-tactical-green transition-colors"
                  />
                </div>

                <div className="overflow-y-auto max-h-[50vh] space-y-2">
                  {personnel
                    .filter(p => 
                      !selectedMembers.some(m => m.id === p.id) && 
                      p.id !== selectedCommander?.id &&
                      (p.name.toLowerCase().includes(memberSearchQuery.toLowerCase()) || p.nrp.includes(memberSearchQuery))
                    )
                    .map((person) => (
                      <div 
                        key={person.id}
                        className="p-3 bg-tactical-bg border border-tactical-border rounded flex justify-between items-center hover:border-tactical-green/50 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-tactical-panel border border-tactical-border rounded flex items-center justify-center">
                            <User className="text-tactical-muted group-hover:text-tactical-green transition-colors" />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-tactical-text">{person.name}</div>
                            <div className="text-[10px] font-mono text-tactical-muted uppercase">{person.rank} - {person.nrp}</div>
                          </div>
                        </div>
                        {addingRoleFor === person.id ? (
                          <div className="flex flex-col items-end gap-2">
                            <select
                              autoFocus
                              value={tempRole}
                              onChange={(e) => setTempRole(e.target.value)}
                              className="bg-tactical-panel border border-tactical-border rounded px-2 py-1.5 text-[10px] font-mono text-tactical-text focus:outline-none focus:border-tactical-cyan w-48"
                            >
                              <option value="Anggota Personil">Anggota Personil</option>
                              <option value="Wakil Komandan">Wakil Komandan</option>
                              <option value="Komandan Batalyon">Komandan Batalyon</option>
                              <option value="Komandan Regu">Komandan Regu</option>
                            </select>
                            <div className="flex gap-2">
                              <button
                                type="button"
                              onClick={() => {
                                if (person.commanded_unit_name) {
                                  setCommanderWarning(person);
                                  return;
                                }

                                if (person.unit_name) {
                                  setAssignmentWarning({ person, type: 'MEMBER', role: tempRole || 'Anggota Personil' });
                                } else {
                                  setSelectedMembers([...selectedMembers, { ...person, unit_role: tempRole || 'Anggota Personil' }]);
                                }
                                setAddingRoleFor(null);
                                setTempRole("");
                              }}
                                className="px-3 py-1 bg-tactical-cyan/10 border border-tactical-cyan text-tactical-cyan rounded text-[10px] font-mono hover:bg-tactical-cyan hover:text-tactical-bg"
                              >
                                KONFIRMASI
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setAddingRoleFor(null);
                                  setTempRole("");
                                }}
                                className="px-3 py-1 bg-tactical-red/10 border border-tactical-red text-tactical-red rounded text-[10px] font-mono hover:bg-tactical-red hover:text-tactical-bg"
                              >
                                BATAL
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button 
                            type="button"
                            onClick={() => {
                              if (person.commanded_unit_name) {
                                setCommanderWarning(person);
                                return;
                              }
                              setAddingRoleFor(person.id);
                              setTempRole("Anggota Personil");
                            }}
                            className="px-4 py-1.5 bg-tactical-green/10 border border-tactical-green text-tactical-green text-[10px] font-bold font-mono rounded hover:bg-tactical-green hover:text-tactical-bg transition-all"
                          >
                            TAMBAHKAN
                          </button>
                        )}
                      </div>
                    ))}
                  {memberSearchQuery.length > 0 && personnel.filter(p => !selectedMembers.some(m => m.id === p.id) && (p.name.toLowerCase().includes(memberSearchQuery.toLowerCase()) || p.nrp.includes(memberSearchQuery))).length === 0 && (
                    <div className="py-10 text-center font-mono text-tactical-muted text-xs uppercase">DATA TIDAK DITEMUKAN</div>
                  )}
                  {memberSearchQuery.length === 0 && (
                    <div className="py-10 text-center font-mono text-tactical-muted text-xs uppercase italic">MASUKKAN NAMA ATAU NRP UNTUK MEMULAI PENCARIAN</div>
                  )}
                </div>
              </div>
              
              <div className="p-4 border-t border-tactical-border bg-tactical-panel/30 flex justify-end">
                <button 
                  onClick={() => setShowMemberModal(false)}
                  className="px-6 py-2 bg-tactical-green text-tactical-bg text-xs font-bold font-mono rounded hover:bg-tactical-green/90 transition-colors"
                >
                  SELESAI
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
