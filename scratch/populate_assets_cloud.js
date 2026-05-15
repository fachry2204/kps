const mysql = require('mysql2/promise');

async function populateAssets() {
  const pool = mysql.createPool({
    host: 'kps.garudaserver.cloud',
    user: 'kpsdata',
    password: 'Bangbens220488!',
    database: 'kpsdata'
  });

  try {
    console.log("--- TACTICAL ASSET POPULATION INITIATED ---");

    const [opsDN] = await pool.query('SELECT id FROM ops_dalamnegri');
    const [opsLN] = await pool.query('SELECT id FROM ops_luarnegri');

    const assetsPool = [
      { name: 'Panser Anoa 6x6', type: 'ALUTSISTA', qty: 4, desc: 'Armored Personnel Carrier' },
      { name: 'Komodo 4x4', type: 'ALUTSISTA', qty: 2, desc: 'Tactical Vehicle' },
      { name: 'SS2-V4 Sniper', type: 'SENJATA', qty: 12, desc: 'High Precision Rifle' },
      { name: 'Pindad SPR-3', type: 'SENJATA', qty: 4, desc: 'Anti-Materiel Sniper' },
      { name: 'MP5-SD', type: 'SENJATA', qty: 20, desc: 'Suppressed Submachine Gun' },
      { name: 'Leopard 2RI', type: 'ALUTSISTA', qty: 1, desc: 'Main Battle Tank' },
      { name: 'Minimi 5.56mm', type: 'SENJATA', qty: 8, desc: 'Light Machine Gun' }
    ];

    for (const op of opsDN) {
      for (let i = 0; i < 3; i++) {
        const asset = assetsPool[Math.floor(Math.random() * assetsPool.length)];
        await pool.query(
          'INSERT INTO operation_assets (operation_id, operation_type, asset_name, asset_type, quantity, condition_status, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [op.id, 'DALAM_NEGERI', asset.name, asset.type, asset.qty, 'Excellent', asset.desc]
        );
      }
    }

    for (const op of opsLN) {
      for (let i = 0; i < 3; i++) {
        const asset = assetsPool[Math.floor(Math.random() * assetsPool.length)];
        await pool.query(
          'INSERT INTO operation_assets (operation_id, operation_type, asset_name, asset_type, quantity, condition_status, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [op.id, 'LUAR_NEGERI', asset.name, asset.type, asset.qty, 'Excellent', asset.desc]
        );
      }
    }

    console.log("Successfully populated operational assets on cloud.");
    process.exit(0);
  } catch (error) {
    console.error("POPULATION FAILURE:", error);
    process.exit(1);
  }
}

populateAssets();
