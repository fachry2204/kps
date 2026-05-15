const mysql = require('mysql2/promise');

async function checkOpsTables() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'kpsdata'
  });

  try {
    const [dalam] = await connection.execute('SELECT id, name FROM ops_dalamnegri');
    console.log(`Found ${dalam.length} Domestic Operations in ops_dalamnegri.`);
    dalam.forEach(op => console.log(`- ${op.name}`));

    const [luar] = await connection.execute('SELECT id, name FROM ops_luarnegri');
    console.log(`\nFound ${luar.length} International Operations in ops_luarnegri.`);
    luar.forEach(op => console.log(`- ${op.name}`));

    // Check columns
    const [cols] = await connection.execute('SHOW COLUMNS FROM ops_dalamnegri');
    console.log('\nColumns in ops_dalamnegri:');
    cols.forEach(c => console.log(`- ${c.Field}`));

  } catch (error) {
    console.error('Error checking ops tables:', error);
  } finally {
    await connection.end();
  }
}

checkOpsTables();
