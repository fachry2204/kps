const mysql = require('mysql2/promise');

async function checkSchema() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'kpsdata'
  });

  console.log('--- LOGISTICS TABLE ---');
  const [logRows] = await connection.query('DESCRIBE logistics');
  console.log(JSON.stringify(logRows, null, 2));

  await connection.end();
}

checkSchema().catch(console.error);
