import mysql from 'mysql2/promise';

async function simulateUpdateUnit() {
  const pool = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'kpsdata'
  });
  
  const id = 7;
  const commander_id = '1';
  const member_ids = [2, 3];
  
  try {
    await pool.query('UPDATE personnel SET unit_id = NULL WHERE unit_id = ?', [id]);
    console.log("Cleared members");
    
    if (commander_id) {
      await pool.query('UPDATE personnel SET unit_id = ? WHERE id = ?', [id, commander_id]);
      console.log("Set commander");
    }

    if (member_ids && member_ids.length > 0) {
      const [updateResult] = await pool.query('UPDATE personnel SET unit_id = ? WHERE id IN (?)', [id, member_ids]);
      console.log("Update members result:", updateResult);
    }
  } catch(e) {
    console.error("Error:", e);
  }
  
  pool.end();
}
simulateUpdateUnit();
