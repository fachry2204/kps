const mysql = require('mysql2/promise');

async function migrate() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'kpsdata'
  });

  try {
    console.log('Creating tables...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS ops_dalamnegri (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          location VARCHAR(100),
          personnel INT DEFAULT 0,
          status VARCHAR(50),
          readiness INT DEFAULT 0,
          type VARCHAR(100),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS ops_luarnegri (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          location VARCHAR(100),
          personnel INT DEFAULT 0,
          status VARCHAR(50),
          readiness INT DEFAULT 0,
          type VARCHAR(100),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Populating ops_dalamnegri...');
    const dalamNegeri = [
      ['SATGAS PAPUA', 'Timika, Papua', 450, 'ACTIVE', 98, 'Counter Insurgency'],
      ['SATGAS OPS PAPUA', 'Puncak Jaya, Papua', 320, 'ACTIVE', 95, 'Special Operations'],
      ['SATGAS ELANG', 'Intan Jaya, Papua', 180, 'STANDBY', 100, 'Intelligence & Recon'],
      ['SATGAS PRABU', 'Poso, Sulawesi Tengah', 250, 'ACTIVE', 92, 'Counter Terrorism'],
      ['SATGAS RATU', 'Natuna, Kepulauan Riau', 150, 'MONITORING', 96, 'Border Security'],
      ['SATGAS PK', 'Ambon, Maluku', 200, 'ACTIVE', 94, 'Peacekeeping'],
      ['SATGAS SA', 'Sabang, Aceh', 120, 'ACTIVE', 97, 'Coastal Defense'],
      ['SATGAS TIM', 'Merauke, Papua', 280, 'ACTIVE', 93, 'Territorial Integrity'],
      ['SATGAS MA', 'Manado, Sulawesi Utara', 190, 'STANDBY', 99, 'Maritime Ops'],
      ['SATGAS BK', 'Batam, Kepulauan Riau', 220, 'ACTIVE', 95, 'Anti Smuggling']
    ];

    for (const data of dalamNegeri) {
      await connection.execute(
        'INSERT INTO ops_dalamnegri (name, location, personnel, status, readiness, type) VALUES (?, ?, ?, ?, ?, ?)',
        data
      );
    }

    console.log('Populating ops_luarnegri...');
    const luarNegeri = [
      ['SATGAS KONGA UNIFIL', 'Lebanon', 850, 'ACTIVE', 98, 'Peacekeeping / Maritime'],
      ['SATGAS KONGA MONUSCO', 'Republik Demokratik Kongo', 450, 'ACTIVE', 94, 'Stabilization / RDB'],
      ['SATGAS KONGA MINUSCA', 'Republik Afrika Tengah', 200, 'ACTIVE', 92, 'Engineering / Civilians Protection'],
      ['SATGAS KONGA MINUSMA', 'Mali', 140, 'ON_ROTATION', 85, 'Logistic / Maintenance'],
      ['SATGAS KONGA UNISFA', 'Abyei (Sudan/Sudan Selatan)', 120, 'ACTIVE', 96, 'Border Security'],
      ['SATGAS KONGA UNMISS', 'Sudan Selatan', 180, 'ACTIVE', 95, 'Humanitarian / Support'],
      ['SATGAS KONGA UNMHA', 'Yaman', 50, 'MONITORING', 99, 'Observers / Verification'],
      ['SATGAS KONGA MINURSO', 'Sahara Barat', 40, 'ACTIVE', 97, 'Military Observers']
    ];

    for (const data of luarNegeri) {
      await connection.execute(
        'INSERT INTO ops_luarnegri (name, location, personnel, status, readiness, type) VALUES (?, ?, ?, ?, ?, ?)',
        data
      );
    }

    console.log('Migration completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await connection.end();
  }
}

migrate();
