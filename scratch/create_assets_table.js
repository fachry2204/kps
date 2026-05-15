const mysql = require('mysql2/promise');

async function createAssetTable() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'kpsdata'
  });

  try {
    console.log('Establishing Operation Assets infrastructure...');

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS operation_assets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        operation_id INT NOT NULL,
        operation_type VARCHAR(50) NOT NULL,
        asset_name VARCHAR(255) NOT NULL,
        asset_type ENUM('ALUTSISTA', 'SENJATA') NOT NULL,
        quantity INT DEFAULT 1,
        condition_status VARCHAR(50) DEFAULT 'READY',
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('- Table operation_assets created/verified.');

    // Optional: Seed some dummy data for the active ops to demonstrate
    const [ops] = await connection.execute('SELECT id FROM ops_dalamnegri LIMIT 1');
    if (ops.length > 0) {
      const opId = ops[0].id;
      await connection.execute(`
        INSERT INTO operation_assets (operation_id, operation_type, asset_name, asset_type, quantity, description)
        VALUES 
        (?, 'DALAM_NEGERI', 'P6 ATAV V3', 'ALUTSISTA', 2, 'Light Strike Vehicle with mounted machine gun'),
        (?, 'DALAM_NEGERI', 'SS2-V5 A1', 'SENJATA', 12, 'Assault rifle for tactical teams')
      `, [opId, opId]);
      console.log(`- Seeded demo assets for Operation ID ${opId}.`);
    }

  } catch (error) {
    console.error('Migration Failure:', error);
  } finally {
    await connection.end();
  }
}

createAssetTable();
