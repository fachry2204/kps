import mysql from 'mysql2/promise';

async function test() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'kpsdata'
  });
  
  const unitId = 7;
  const member_ids = [2, 3]; // Assuming these are valid personnel ids
  
  try {
    const [result] = await connection.query('UPDATE personnel SET unit_id = ? WHERE id IN (?)', [unitId, member_ids]);
    console.log("Success:", result);
  } catch(e) {
    console.error("Error:", e);
  }
  
  connection.end();
}
test();
