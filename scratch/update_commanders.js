import mysql from 'mysql2/promise';

async function updateCommanders() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'kpsdata'
  });
  
  await connection.execute(`
    UPDATE units u 
    JOIN (
      SELECT p.unit_id, MAX(p.id) as cmd_id 
      FROM personnel p 
      WHERE p.rank LIKE '%Mayor%' OR p.rank LIKE '%Letkol%' OR p.rank LIKE '%Kolonel%' 
      GROUP BY p.unit_id
    ) as sq ON u.id = sq.unit_id 
    SET u.commander_id = sq.cmd_id
  `);
  
  console.log('Updated commanders');
  connection.end();
}

updateCommanders();
