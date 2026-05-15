const mysql = require('mysql2/promise');

async function createTable() {
  const pool = mysql.createPool({
    host: 'kps.garudaserver.cloud',
    user: 'kpsdata',
    password: 'Bangbens220488!',
    database: 'kpsdata'
  });

  try {
    console.log("--- CLOUD SCHEMA MIGRATION INITIATED ---");
    console.log("Creating 'operation_assets' table...");

    const sql = `
      CREATE TABLE IF NOT EXISTS operation_assets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        operation_id INT NOT NULL,
        operation_type ENUM('DALAM_NEGERI', 'LUAR_NEGERI') NOT NULL,
        asset_name VARCHAR(255) NOT NULL,
        asset_type ENUM('ALUTSISTA', 'SENJATA') NOT NULL,
        quantity INT DEFAULT 1,
        condition_status VARCHAR(50) DEFAULT 'Good',
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_operation (operation_id, operation_type)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await pool.query(sql);
    console.log("Table 'operation_assets' created successfully on cloud server.");

    // Also add some dummy assets if needed, but let's start with empty table first
    console.log("--- MIGRATION SUCCESS ---");
    process.exit(0);
  } catch (error) {
    console.error("MIGRATION FAILURE:", error);
    process.exit(1);
  }
}

createTable();
