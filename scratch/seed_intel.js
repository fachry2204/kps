const mysql = require('mysql2/promise');

async function seedIntel() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'kpsdata',
  });

  const operations = [
    { id: 9, name: "Konga XXIII-5", coords: [32.226993, 63.876925] },
    { id: 10, name: "UNIFIL", coords: [38.299338, 56.548844] },
    { id: 11, name: "UNMISS JUBA", coords: [14.823880, 29.957926] },
    { id: 12, name: "INDO RDB MONUSCO", coords: [-3.120845, 14.365641] },
    { id: 13, name: "KIZI TNI KONGA", coords: [6.767036, 21.503270] }
  ];

  const statuses = ["STABIL", "TERJAGA", "MENINGKAT", "TINGGI", "KRITIS"];
  const titles = [
    "Deteksi Pergerakan Massa Mencurigakan",
    "Laporan Penemuan Bunker Ilegal",
    "Gangguan Frekuensi Komunikasi Satelit",
    "Aktivitas Patroli Perbatasan Pihak Ketiga",
    "Peningkatan Ketegangan Lokal di Sektor Barat"
  ];

  try {
    for (const op of operations) {
      for (let i = 0; i < 3; i++) {
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const title = titles[Math.floor(Math.random() * titles.length)];
        // Add small random offset to coords
        const lat = op.coords[0] + (Math.random() - 0.5) * 0.1;
        const lng = op.coords[1] + (Math.random() - 0.5) * 0.1;
        const coordsStr = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        
        await pool.query(`
          INSERT INTO intel_reports (
            operation_id, operation_type, title, content, threat_level, 
            location_tag, coordinates, is_classified, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `, [
          op.id, 
          'LUAR_NEGERI', 
          `${title} - ${op.name}`, 
          `Laporan intelijen lapangan mendeteksi adanya ${title.toLowerCase()} di sekitar titik koordinat ${coordsStr}. Perlu pemantauan intensif dan koordinasi dengan unit terkait.`, 
          status, 
          op.name, 
          coordsStr, 
          1
        ]);
      }
    }
    console.log("Seed Intel Berhasil!");
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

seedIntel();
