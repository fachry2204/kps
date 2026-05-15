const mysql = require('mysql2/promise');

async function checkOperations() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'kpsdata'
  });

  try {
    const [ops] = await connection.execute('SELECT id, operation_name, operation_type FROM operations');
    console.log(`Found ${ops.length} total operations.`);
    ops.forEach(op => console.log(`- ID: ${op.id} | Name: ${op.operation_name} | Type: ${op.operation_type}`));

  } catch (error) {
    console.error('Error checking operations:', error);
  } finally {
    await connection.end();
  }
}

checkOperations();
