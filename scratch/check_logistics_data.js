const mysql = require('mysql2/promise');

async function checkData() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'kpsdata'
  });

  console.log('--- LOGISTICS DATA SAMPLE ---');
  const [rows] = await connection.query('SELECT DISTINCT condition_status FROM logistics');
  console.log(JSON.stringify(rows, null, 2));

  await connection.end();
}

checkData().catch(console.error);
