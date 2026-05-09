const mysql = require('mysql2/promise');

async function checkSchema() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'kpsdata'
  });

  const [rows] = await connection.query('DESCRIBE personnel');
  console.log(JSON.stringify(rows, null, 2));
  await connection.end();
}

checkSchema().catch(console.error);
