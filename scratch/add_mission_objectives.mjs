import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'kpsdata',
});

async function migrate() {
  try {
    console.log("Adding mission_objectives to ops_dalamnegri...");
    await pool.query('ALTER TABLE ops_dalamnegri ADD COLUMN mission_objectives TEXT AFTER type');
    console.log("Adding mission_objectives to ops_luarnegri...");
    await pool.query('ALTER TABLE ops_luarnegri ADD COLUMN mission_objectives TEXT AFTER type');
    console.log("Migration complete.");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await pool.end();
  }
}

migrate();
