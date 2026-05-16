const mysql = require('mysql2/promise');

async function updateSchema() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'kpsdata'
  });

  console.log('Updating logistics schema...');
  // Check if columns exist and update enum
  await connection.execute(`
    ALTER TABLE logistics 
    MODIFY COLUMN condition_status VARCHAR(50) DEFAULT 'Efektif'
  `);
  
  console.log('Schema updated successfully.');
  await connection.end();
}

updateSchema().catch(console.error);
