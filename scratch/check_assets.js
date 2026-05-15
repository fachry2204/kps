const mysql = require('mysql2/promise');

async function checkAssetTables() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'kpsdata'
  });

  try {
    const [logisticsCols] = await connection.execute('SHOW COLUMNS FROM logistics');
    console.log('Columns in logistics:');
    logisticsCols.forEach(c => console.log(`- ${c.Field}`));

    const [opLogisticsCols] = await connection.execute('SHOW COLUMNS FROM operation_logistics');
    console.log('\nColumns in operation_logistics:');
    opLogisticsCols.forEach(c => console.log(`- ${c.Field}`));

    // Check if specialized asset tables exist
    const [tables] = await connection.execute('SHOW TABLES LIKE "operation_assets%"');
    console.log('\nAsset-related tables:', tables.map(t => Object.values(t)[0]));

  } catch (error) {
    console.error('Error checking assets:', error);
  } finally {
    await connection.end();
  }
}

checkAssetTables();
