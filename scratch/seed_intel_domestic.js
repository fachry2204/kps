
const mysql = require('mysql2/promise');

async function seedIntel() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'kpsdata'
    });

    const intelData = [
        // ID 1: SATGAS PAMTAS RI-PNG MOBILE KOOPS TNI (-1.453809, 132.452266)
        { operation_id: 1, operation_type: 'DALAM_NEGERI', title: 'Pemantauan Perbatasan Sektor Utara', threat_level: 'STABIL', content: 'Patroli rutin di sektor utara tidak menemukan aktivitas mencurigakan.', location_tag: 'SEKTOR UTARA', coordinates: '-1.454200, 132.453500', address: 'Papua Barat, Indonesia' },
        { operation_id: 1, operation_type: 'DALAM_NEGERI', title: 'Deteksi Pergerakan Massa Tak Dikenal', threat_level: 'MENINGKAT', content: 'Terdeteksi pergerakan kelompok massa sekitar 10 orang di koordinat tertentu.', location_tag: 'HUTAN LINDUNG A', coordinates: '-1.453000, 132.451000', address: 'Papua Barat, Indonesia' },
        { operation_id: 1, operation_type: 'DALAM_NEGERI', title: 'Kontak Tembak di Titik Alpha', threat_level: 'KRITIS', content: 'Terjadi kontak tembak singkat dengan kelompok separatis saat patroli fajar.', location_tag: 'TITIK ALPHA', coordinates: '-1.455500, 132.450000', address: 'Papua Barat, Indonesia' },

        // ID 2: SATGAS OPS INTELSTAT BKO BAIS TNI (-2.826728, 120.392842)
        { operation_id: 2, operation_type: 'DALAM_NEGERI', title: 'Analisis Sinyal Radio Frekuensi Rendah', threat_level: 'TERJAGA', content: 'Aktivitas transmisi radio meningkat namun masih dalam parameter normal.', location_tag: 'POS PANTAU 2', coordinates: '-2.827500, 120.394000', address: 'Sulawesi Selatan' },
        { operation_id: 2, operation_type: 'DALAM_NEGERI', title: 'Sabotase Infrastruktur Komunikasi', threat_level: 'TINGGI', content: 'Kabel optik di menara BTS utama ditemukan dipotong sengaja.', location_tag: 'MENARA BTS B', coordinates: '-2.826000, 120.391000', address: 'Sulawesi Selatan' },

        // ID 4: SATGAS PRAYUDA MAMTA (-7.529714, 111.048763)
        { operation_id: 4, operation_type: 'DALAM_NEGERI', title: 'Situasi Keamanan Kota Kondusif', threat_level: 'STABIL', content: 'Laporan harian menunjukkan penurunan tingkat kriminalitas di pusat kota.', location_tag: 'PUSAT KOTA', coordinates: '-7.530500, 111.049500', address: 'Jawa Timur' },
        { operation_id: 4, operation_type: 'DALAM_NEGERI', title: 'Provokasi Media Sosial Terdeteksi', threat_level: 'MENINGKAT', content: 'Banyak akun anonim menyebarkan hoaks terkait kebijakan keamanan daerah.', location_tag: 'CYBER SECTOR', coordinates: '-7.528500, 111.047000', address: 'Digital Space' },

        // ID 8: SATGAS SADANG OPS INTELSTA BAIS (-4.439495, 139.073099)
        { operation_id: 8, operation_type: 'DALAM_NEGERI', title: 'Penyusupan Jalur Tikus', threat_level: 'TINGGI', content: 'Tim lapangan menemukan jejak kaki baru di jalur tikus pegunungan.', location_tag: 'JALUR GUNUNG X', coordinates: '-4.440500, 139.074500', address: 'Pegunungan Papua' },
        { operation_id: 8, operation_type: 'DALAM_NEGERI', title: 'Dukungan Logistik Ilegal Terdeteksi', threat_level: 'KRITIS', content: 'Ditemukan gudang makanan darurat yang diduga milik KKB.', location_tag: 'GUDANG TERSEMBUNYI', coordinates: '-4.438500, 139.071500', address: 'Hutan Papua' },

        // ID 11: SATGAS BKO ALKI I (3.201885, 117.178355)
        { operation_id: 11, operation_type: 'DALAM_NEGERI', title: 'Lalu Lintas Laut Normal', threat_level: 'STABIL', content: 'Kapal-kapal komersial melintas sesuai dengan jadwal dan koridor ALKI.', location_tag: 'KORIDOR TENGAH', coordinates: '3.203000, 117.180000', address: 'Selat Makassar' },
        { operation_id: 11, operation_type: 'DALAM_NEGERI', title: 'Kapal Asing Tanpa Izin Terdeteksi', threat_level: 'MENINGKAT', content: 'Kapal tanker tanpa bendera melambat di dekat wilayah sensitif.', location_tag: 'PERAIRAN UTARA', coordinates: '3.200500, 117.176500', address: 'Laut Sulawesi' }
    ];

    try {
        for (const data of intelData) {
            await connection.execute(
                `INSERT INTO intel_reports (title, threat_level, content, location_tag, coordinates, address, operation_id, operation_type, is_classified) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
                [data.title, data.threat_level, data.content, data.location_tag, data.coordinates, data.address, data.operation_id, data.operation_type]
            );
            console.log(`Inserted: ${data.title}`);
        }
        console.log('Seed finished successfully');
    } catch (error) {
        console.error('Error seeding intel:', error);
    } finally {
        await connection.end();
    }
}

seedIntel();
