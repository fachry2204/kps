const mysql = require('mysql2/promise');

async function migrateSpecializations() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'kpsdata',
  });

  const SPEC_OPTIONS = ["PARAKO", "SANDHA", "GULTOR", "DEMOLISI", "BAKDUK", "BAHASA"];

  try {
    const [personnel] = await pool.query('SELECT id FROM personnel');
    console.log(`Found ${personnel.length} personnel to update.`);

    for (const person of personnel) {
      // Randomly select 2 to 4 specializations
      const count = Math.floor(Math.random() * 3) + 2; 
      const shuffled = [...SPEC_OPTIONS].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, count);
      const specString = selected.join(", ");

      await pool.query('UPDATE personnel SET specialization = ? WHERE id = ?', [specString, person.id]);
      console.log(`Updated ID ${person.id} with specs: ${specString}`);
    }

    console.log('Migration complete successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await pool.end();
  }
}

migrateSpecializations();
