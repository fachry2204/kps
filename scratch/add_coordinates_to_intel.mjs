import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'kpsdata',
});

async function run() {
  try {
    console.log("Adding coordinates column to intel_reports...");
    await pool.query(`
      ALTER TABLE intel_reports 
      ADD COLUMN IF NOT EXISTS coordinates VARCHAR(255) AFTER location_tag;
    `);
    console.log("Database migration successful.");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await pool.end();
  }
}

run();
