const mysql = require('mysql2/promise');

async function purgeLogistics() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'kpsdata',
  });

  try {
    const [result] = await pool.query('DELETE FROM logistics');
    console.log(`Purged logistics table. Rows affected: ${result.affectedRows}`);
    
    // Also reset auto-increment if possible
    await pool.query('ALTER TABLE logistics AUTO_INCREMENT = 1');
    console.log('Reset auto-increment for logistics table.');
  } catch (error) {
    console.error('Purge failed:', error);
  } finally {
    await pool.end();
  }
}

purgeLogistics();
