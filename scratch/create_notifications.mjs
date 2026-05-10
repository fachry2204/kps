import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'kpsdata',
});

async function run() {
  try {
    await pool.query('DROP TABLE IF EXISTS notifications;');
    await pool.query(`
      CREATE TABLE notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        type VARCHAR(50) DEFAULT 'system',
        title VARCHAR(100) NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES personnel(id) ON DELETE CASCADE
      );
    `);
    
    // Insert a dummy notification for user 1 just to test
    await pool.query(`
      INSERT INTO notifications (user_id, type, title, message) 
      VALUES (1, 'system', 'Sistem Online', 'Selamat datang kembali, Jendral. Enkripsi E2E aktif.')
    `);
    
    console.log("notifications table created successfully.");
  } catch (err) {
    console.error("Error creating table:", err);
  } finally {
    process.exit();
  }
}

run();
