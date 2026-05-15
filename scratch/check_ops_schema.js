const mysql = require('mysql2/promise');

async function checkSchema() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'kpsdata'
  });

  try {
    const [columns] = await connection.execute('SHOW COLUMNS FROM operations');
    console.log('Columns in operations table:');
    columns.forEach(c => console.log(`- ${c.Field}`));
    
    const [types] = await connection.execute('SELECT DISTINCT type FROM operations');
    console.log('\nAvailable types:');
    types.forEach(t => console.log(`- ${t.type}`));

  } catch (error) {
    console.error('Error checking schema:', error);
  } finally {
    await connection.end();
  }
}

checkSchema();
