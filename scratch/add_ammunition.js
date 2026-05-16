const mysql = require('mysql2/promise');

async function addAmmo() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'kpsdata'
  });

  const ammoItems = [
    { name: 'Munisi 5.56x45mm NATO', qty: 25000, unit: 'Butir' },
    { name: 'Munisi 7.62x51mm NATO', qty: 15000, unit: 'Butir' },
    { name: 'Munisi 9x19mm Parabellum', qty: 12000, unit: 'Butir' },
    { name: 'Munisi 12.7x99mm NATO', qty: 5000, unit: 'Butir' },
    { name: 'Munisi .338 Lapua Magnum', qty: 2500, unit: 'Butir' },
    { name: 'Munisi .50 BMG', qty: 3000, unit: 'Butir' },
    { name: 'Munisi 40mm HE (Granat)', qty: 500, unit: 'Butir' },
    { name: 'Munisi Shotgun 12 Gauge', qty: 2000, unit: 'Butir' },
    { name: 'Munisi 5.56mm MU5-TJ', qty: 10000, unit: 'Butir' },
    { name: 'Munisi 7.62mm MU2-TJS', qty: 8000, unit: 'Butir' }
  ];

  try {
    console.log('Adding ammunition to Senjata Jenis category...');
    for (const item of ammoItems) {
      const status = Math.random() > 0.05 ? 'Efektif' : 'Tidak Efektif';
      await connection.execute(
        'INSERT INTO logistics (item_name, category, quantity, unit, condition_status, min_stock_level) VALUES (?, ?, ?, ?, ?, ?)',
        [item.name, 'Senjata Jenis', item.qty, item.unit, status, 1000]
      );
    }
    console.log('Ammunition added successfully.');
  } catch (err) {
    console.error('Failed to add ammo:', err);
  } finally {
    await connection.end();
  }
}

addAmmo();
