const mysql = require('mysql2/promise');
const fs = require('fs');

async function run() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'kpsdata'
  });
  
  const sql = `
    CREATE TABLE IF NOT EXISTS documents (
      id INT AUTO_INCREMENT PRIMARY KEY,
      related_id INT NOT NULL,
      category ENUM('UNIT', 'INTEL', 'OPS_DN', 'OPS_LN') NOT NULL,
      filename VARCHAR(255) NOT NULL,
      original_name VARCHAR(255) NOT NULL,
      file_type VARCHAR(50) NOT NULL,
      file_size BIGINT NOT NULL,
      upload_path VARCHAR(255) NOT NULL,
      uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `;
  
  try {
    await conn.query(sql);
    console.log('Migration Success: documents table created/verified.');
  } catch (err) {
    console.error('Migration Failed:', err);
  } finally {
    await conn.end();
  }
}

run();
