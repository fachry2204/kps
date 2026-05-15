const mysql = require('mysql2/promise');

async function verify() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'kpsdata'
  });

  try {
    const tables = [
      'personnel_education',
      'personnel_mil_education',
      'personnel_awards',
      'personnel_languages',
      'personnel_assignments'
    ];

    console.log('Checking tables...');
    for (const table of tables) {
      const [rows] = await connection.execute(`SHOW TABLES LIKE '${table}'`);
      if (rows.length === 0) {
        console.log(`Table ${table} is MISSING!`);
      } else {
        console.log(`Table ${table} EXISTS.`);
      }
    }

    console.log('\nChecking personnel columns...');
    const [cols] = await connection.execute('DESCRIBE personnel');
    const colNames = cols.map(c => c.Field);
    const expectedCols = [
      'birth_place', 'birth_date', 'tmt_tni', 'category', 'tmt_category', 
      'ethnicity', 'religion', 'blood_type', 'source_pa', 'tmt_pa', 
      'position', 'tmt_position'
    ];

    for (const col of expectedCols) {
      if (!colNames.includes(col)) {
        console.log(`Column personnel.${col} is MISSING!`);
      } else {
        console.log(`Column personnel.${col} EXISTS.`);
      }
    }

  } catch (error) {
    console.error('Verification failed:', error);
  } finally {
    await connection.end();
  }
}

verify();
