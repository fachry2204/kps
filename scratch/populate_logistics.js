const mysql = require('mysql2/promise');

async function populate() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'kpsdata'
  });

  const categories = [
    { name: 'Senjata Jenis', items: ['SS2-V1', 'SS2-V4', 'Pindad G2', 'Pindad PM2', 'Pindad SM2', 'Sniper SPR-2', 'Sniper SPR-3', 'Pindad PM3', 'Shotgun M1014', 'Steyr AUG'] },
    { name: 'Alkapsus', items: ['Helm Balistik', 'Rompi Anti Peluru Lvl IV', 'Kacamata Google Tactical', 'Sepatu Boot Parako', 'Tas Ransel 72h', 'Kompas Suunto', 'Radio HT Motorola', 'GPS Garmin Montana', 'Peralatan Masak Lapangan', 'Tenda Peleton'] },
    { name: 'Rantis', items: ['P6 ATAV', 'Komodo 4x4', 'Anoa 6x6', 'Bus Operasional', 'Truk Reo', 'Jeep Jimmny', 'Motor Trail 250cc', 'Ural Sidecar', 'Sherpa Light', 'Land Rover Defender'] },
    { name: 'Optik', items: ['Teropong Malam (NVG)', 'Thermal Scope', 'Red Dot Sight', 'Magnifier 3x', 'Rangefinder Laser', 'Teropong Binocular 10x50', 'Drone Surveillance', 'Kamera Intelijen', 'Senter Taktis 1000lm', 'Laser Designator'] },
    { name: 'Handak', items: ['Granat Tangan M67', 'C4 Explosive', 'Claymore Mine', 'Detonator Elektrik', 'Flashbang', 'Smoke Grenade', 'TNT Block', 'Sumbu Peledak', 'Rocket RPG-7', 'Mortar 60mm'] },
    { name: 'Lain-Lain', items: ['Peta Topografi', 'Kit Medis Lapangan', 'Sembako Pasukan', 'Bahan Bakar Solar', 'Oli Mesin Rantis', 'Suku Cadang SS2', 'Baterai Radio', 'Air Minum Galon', 'Seragam PDL', 'Atribut Satuan'] }
  ];

  try {
    console.log('Cleaning old logistics data...');
    await connection.execute('DELETE FROM logistics');

    console.log('Populating logistics data...');
    for (const cat of categories) {
      for (let i = 0; i < 10; i++) {
        const itemName = cat.items[i];
        const qty = Math.floor(Math.random() * 50) + 10;
        const status = Math.random() > 0.2 ? 'Efektif' : 'Tidak Efektif';
        const unit = cat.name === 'Senjata Jenis' ? 'Pucuk' : (cat.name === 'Rantis' ? 'Unit' : 'Buah');
        
        await connection.execute(
          'INSERT INTO logistics (item_name, category, quantity, unit, condition_status, min_stock_level) VALUES (?, ?, ?, ?, ?, ?)',
          [itemName, cat.name, qty, unit, status, 5]
        );
      }
    }
    console.log('Population completed successfully.');
  } catch (err) {
    console.error('Population failed:', err);
  } finally {
    await connection.end();
  }
}

populate();
