const mysql = require('mysql2/promise');

async function updateSchema() {
  const pool = mysql.createPool('mysql://root:@localhost:3306/kpsdata');
  try {
    console.log('Updating personnel table schema...');
    // Drop columns if they exist to avoid error on retry
    const cols = ['address', 'gps_coordinates', 'phone_number', 'emergency_contact', 'email'];
    for (const col of cols) {
      try {
        await pool.query(`ALTER TABLE personnel ADD COLUMN ${col} TEXT`);
      } catch (e) {
        console.log(`Column ${col} might already exist, skipping...`);
      }
    }
    console.log('Schema updated successfully.');
  } catch (error) {
    console.error('Error updating schema:', error);
  } finally {
    await pool.end();
  }
}

updateSchema();
