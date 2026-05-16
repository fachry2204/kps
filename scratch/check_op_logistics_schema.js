const mysql = require('mysql2/promise');

async function checkSchema() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'kpsdata'
  });

  console.log('--- OPERATION_LOGISTICS TABLE ---');
  try {
    const [logRows] = await connection.query('DESCRIBE operation_logistics');
    console.log(JSON.stringify(logRows, null, 2));
  } catch (e) {
    console.log('operation_logistics table might not exist under this name.');
  }

  await connection.end();
}

checkSchema().catch(console.error);
