const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'kpsdata'
};

const categories = [
  "IDEOLOGI", "POLITIK", "EKONOMI", "SOSIAL", "BUDAYA", "MILITER", "KEAMANAN"
];

const statuses = ["STABLE", "ELEVATED", "HIGH READY", "ACTIVE", "WATCH", "STANDBY"];

const randomNews = {
  "IDEOLOGI": [
    "Penguatan doktrin ketahanan nasional melalui kurikulum bela negara terbaru.",
    "Sosialisasi nilai-nilai ideologi negara di wilayah perbatasan berjalan kondusif.",
    "Analisis ancaman infiltrasi ideologi asing menunjukkan penurunan tren di kalangan pemuda.",
    "Seminar nasional tentang integrasi nilai tradisional dalam ideologi modern."
  ],
  "POLITIK": [
    "Konsolidasi partai politik menjelang pilkada serentak di 38 provinsi.",
    "Diplomasi luar negeri terkait stabilitas kawasan Asia Tenggara semakin intens.",
    "RUU Keamanan Nasional sedang dalam tahap finalisasi pembahasan di DPR.",
    "Peningkatan koordinasi antar lembaga pemerintah dalam menjaga stabilitas politik."
  ],
  "EKONOMI": [
    "Pertumbuhan ekonomi sektor riil di wilayah timur Indonesia meningkat 5.4%.",
    "Stok pangan strategis nasional dinyatakan cukup untuk 6 bulan ke depan.",
    "Fluktuasi nilai tukar rupiah terhadap dolar masih dalam batas pemantauan ketat.",
    "Laporan audit penggunaan anggaran pertahanan menunjukkan efisiensi sebesar 12%."
  ],
  "SOSIAL": [
    "Program bantuan sosial terpadu berhasil menjangkau 98% target sasaran.",
    "Indeks kerukunan beragama di Indonesia mencapai rekor tertinggi tahun ini.",
    "Pemantauan dinamika media sosial menunjukkan tren positif terkait persatuan bangsa.",
    "Kegiatan bakti sosial TNI di wilayah terpencil mendapat apresiasi tinggi dari masyarakat."
  ],
  "BUDAYA": [
    "Festival kebudayaan nasional di Jakarta memperkuat ikatan antar suku bangsa.",
    "Upaya preservasi cagar budaya di wilayah konflik berhasil diamankan tim khusus.",
    "Peningkatan minat generasi Z terhadap seni tradisional melalui platform digital.",
    "Pengakuan UNESCO atas warisan budaya baru asal Indonesia menjadi tonggak sejarah."
  ],
  "MILITER": [
    "Latihan gabungan antar matra di Natuna menunjukkan kesiapan tempur optimal.",
    "Penerimaan alutsista baru generasi 4.5 memperkuat pertahanan udara nasional.",
    "Modernisasi sistem radar pesisir telah mencapai cakupan 95% wilayah laut.",
    "Uji coba taktis satuan intelijen tempur di medan ekstrem berjalan sukses."
  ],
  "KEAMANAN": [
    "Operasi pemberantasan sindikat siber internasional berhasil mengamankan 12 tersangka.",
    "Penurunan angka kriminalitas di wilayah perkotaan berkat implementasi smart city.",
    "Sistem deteksi dini ancaman terorisme mendeteksi aktivitas mencurigakan di sektor utara.",
    "Peningkatan patroli gabungan di wilayah rawan penyelundupan lintas batas."
  ]
};

async function init() {
  let connection;
  try {
    console.log('Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    
    // Create table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS situational_monitoring (
        id INT AUTO_INCREMENT PRIMARY KEY,
        category VARCHAR(50) NOT NULL,
        status VARCHAR(20) NOT NULL,
        readiness INT NOT NULL,
        news_summary TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('Table situational_monitoring created or already exists.');

    // Clear existing data
    await connection.execute('DELETE FROM situational_monitoring');

    // Insert random data
    for (const cat of categories) {
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const readiness = Math.floor(Math.random() * 41) + 60; // 60 - 100
      const newsList = randomNews[cat];
      const news = newsList[Math.floor(Math.random() * newsList.length)];
      
      await connection.execute(
        'INSERT INTO situational_monitoring (category, status, readiness, news_summary) VALUES (?, ?, ?, ?)',
        [cat, status, readiness, news]
      );
    }
    
    console.log('Random monitoring data inserted successfully.');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    if (connection) await connection.end();
  }
}

init();
