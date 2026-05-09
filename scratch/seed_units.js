const mysql = require('mysql2/promise');

async function seedUnits() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'kpsdata'
  });

  const units = [
    {
      unit_name: 'Markas Komando (Makopassus)',
      unit_type: 'Markas',
      location: 'Cijantung, Jakarta Timur',
      coordinates: '-6.3150,106.8650'
    },
    {
      unit_name: 'Grup Utama Kopassus',
      unit_type: 'Grup',
      location: 'Taktakan, Serang, Banten',
      coordinates: '-6.1150,106.1260'
    },
    {
      unit_name: 'Grup 2/Sandha (Sandi Yudha)',
      unit_type: 'Grup',
      location: 'Kandang Menjangan, Kartasura, Sukoharjo, Jawa Tengah',
      coordinates: '-7.5510,110.7410'
    },
    {
      unit_name: 'Grup 3/Sandha',
      unit_type: 'Grup',
      location: 'Dumai',
      coordinates: '1.6810,101.4470'
    },
    {
      unit_name: 'Grup 4/Tempur',
      unit_type: 'Grup',
      location: 'Desa Loaduri, Kecamatan Loakulu, Kabupaten Kutai Kartanegara (Kukar), Kalimantan Timur',
      coordinates: '-0.5280,116.9800'
    },
    {
      unit_name: 'Grup 5/Khusus',
      unit_type: 'Grup',
      location: 'Konawe Selatan, Sulawesi Tenggara',
      coordinates: '-4.3680,122.2570'
    },
    {
      unit_name: 'Grup 6/Pusdiklat',
      unit_type: 'Pusdiklat',
      location: 'Batujajar, Bandung',
      coordinates: '-6.9020,107.4910'
    },
    {
      unit_name: 'Satuan 71/Sandi Yudha (Sat-71)',
      unit_type: 'Satuan Khusus',
      location: 'Cijantung, Jakarta Timur',
      coordinates: '-6.3160,106.8640'
    },
    {
      unit_name: 'Satuan 81/Penanggulangan Teror (Sat-81)',
      unit_type: 'Satuan Khusus',
      location: 'Cijantung, Jakarta Timur',
      coordinates: '-6.3140,106.8660'
    },
    {
      unit_name: 'Batalyon 13/Thikkaviro Sena Baladhika',
      unit_type: 'Batalyon',
      location: 'Bogor, Jawa Barat',
      coordinates: '-6.5950,106.8160'
    },
    {
      unit_name: 'Batalyon 14/Bhadrika Sena Baladika',
      unit_type: 'Batalyon',
      location: 'Kemang, Bogor, Jawa Barat',
      coordinates: '-6.4950,106.7570'
    }
  ];

  for (const u of units) {
    // Check if it exists
    const [rows] = await connection.execute('SELECT id FROM units WHERE unit_name = ?', [u.unit_name]);
    if (rows.length === 0) {
      await connection.execute(
        'INSERT INTO units (unit_name, unit_type, location, coordinates, status) VALUES (?, ?, ?, ?, "ACTIVE")',
        [u.unit_name, u.unit_type, u.location, u.coordinates]
      );
      console.log(`Inserted: ${u.unit_name}`);
    } else {
      console.log(`Skipped (already exists): ${u.unit_name}`);
    }
  }

  await connection.end();
  console.log('Done!');
}

seedUnits().catch(console.error);
