import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'kpsdata',
});

async function migrate() {
  try {
    console.log('Creating operation_logistics table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS operation_logistics (
        id INT AUTO_INCREMENT PRIMARY KEY,
        operation_id INT NOT NULL,
        operation_type ENUM('DALAM_NEGERI', 'LUAR_NEGERI') NOT NULL,
        item_name VARCHAR(255) NOT NULL,
        quantity INT NOT NULL,
        unit VARCHAR(50) DEFAULT 'pcs',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Table created successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
