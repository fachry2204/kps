const mysql = require('mysql2/promise');

async function setupTables() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'kpsdata'
  });

  try {
    console.log('Creating personnel operation tables...');

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS personnel_ops_assignments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        personnel_id INT NOT NULL,
        op_type ENUM('DALAM_NEGERI', 'LUAR_NEGERI') NOT NULL,
        op_id INT NOT NULL,
        role VARCHAR(100) NOT NULL,
        assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY (personnel_id) -- One person can only have ONE active assignment
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS personnel_ops_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        personnel_id INT NOT NULL,
        op_type_text VARCHAR(50),
        op_name VARCHAR(255),
        op_location VARCHAR(255),
        op_role VARCHAR(100),
        specialization VARCHAR(100),
        start_date DATE,
        end_date DATE,
        total_days INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Tables created successfully.');
  } catch (error) {
    console.error('Failed to create tables:', error);
  } finally {
    await connection.end();
  }
}

setupTables();
