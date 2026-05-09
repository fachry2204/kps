import mysql from 'mysql2/promise';

async function setupHistoryTables() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'kpsdata'
  });
  
  try {
    // Unit History Table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS personnel_unit_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        personnel_id INT NOT NULL,
        unit_id INT NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (personnel_id) REFERENCES personnel(id) ON DELETE CASCADE,
        FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE
      )
    `);
    console.log('Created personnel_unit_history table');

    // Operation History Table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS personnel_operation_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        personnel_id INT NOT NULL,
        operation_id INT NOT NULL,
        role VARCHAR(100) DEFAULT 'Anggota',
        start_date DATE NOT NULL,
        end_date DATE NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (personnel_id) REFERENCES personnel(id) ON DELETE CASCADE,
        FOREIGN KEY (operation_id) REFERENCES operations(id) ON DELETE CASCADE
      )
    `);
    console.log('Created personnel_operation_history table');
    
  } catch (err) {
    console.error('Error creating tables:', err);
  } finally {
    connection.end();
  }
}

setupHistoryTables();
