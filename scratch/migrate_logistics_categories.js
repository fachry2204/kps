
const mysql = require('mysql2/promise');

async function migrate() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'kpsdata'
  });

  try {
    console.log('Starting logistics category migration...');

    // Define mappings from old to new or just update common ones
    // Categoris: Senjata Jenis, Alkapsus, Rantis, Optik, Handak, Lain-Lain

    // Example mappings:
    // 'Senjata' -> 'Senjata Jenis'
    // 'Kendaraan' -> 'Rantis'
    // 'Amunisi' -> 'Handak' (maybe?)
    // 'Perlengkapan' -> 'Alkapsus'

    await connection.execute("UPDATE logistics SET category = 'Senjata Jenis' WHERE category = 'Senjata' OR category = 'SENJATA'");
    await connection.execute("UPDATE logistics SET category = 'Rantis' WHERE category = 'Kendaraan' OR category = 'KENDARAAN'");
    await connection.execute("UPDATE logistics SET category = 'Alkapsus' WHERE category = 'Perlengkapan' OR category = 'PERLENGKAPAN' OR category = 'ALAT'");
    await connection.execute("UPDATE logistics SET category = 'Handak' WHERE category = 'Amunisi' OR category = 'AMUNISI' OR category = 'Bahan Peledak'");
    
    // Set anything else that doesn't match the new categories to 'Lain-Lain'? 
    // Maybe better to just keep them but allow the user to change them manually.
    
    console.log('Migration completed successfully.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await connection.end();
  }
}

migrate();
