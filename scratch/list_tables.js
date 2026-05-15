const mysql = require('mysql2/promise');

async function listTables() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'kpsdata'
  });

  try {
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('Tables in kpsdata:');
    tables.forEach(t => console.log(`- ${Object.values(t)[0]}`));

  } catch (error) {
    console.error('Error listing tables:', error);
  } finally {
    await connection.end();
  }
}

listTables();
