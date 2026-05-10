import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'kpsdata',
});

async function run() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sender_id INT NOT NULL,
        receiver_id INT NOT NULL,
        message_text TEXT NOT NULL,
        status ENUM('sent', 'delivered', 'read') DEFAULT 'sent',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sender_id) REFERENCES personnel(id) ON DELETE CASCADE,
        FOREIGN KEY (receiver_id) REFERENCES personnel(id) ON DELETE CASCADE
      );
    `);
    console.log("messages table created successfully.");
  } catch (err) {
    console.error("Error creating table:", err);
  } finally {
    process.exit();
  }
}

run();
