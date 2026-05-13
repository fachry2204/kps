import mysql from 'mysql2/promise';

async function migrate() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'kpsdata'
  });

  try {
    console.log('Adding coordinates column to ops_dalamnegri...');
    await connection.execute('ALTER TABLE ops_dalamnegri ADD COLUMN coordinates VARCHAR(255) AFTER location');
    
    console.log('Adding coordinates column to ops_luarnegri...');
    await connection.execute('ALTER TABLE ops_luarnegri ADD COLUMN coordinates VARCHAR(255) AFTER location');

    console.log('Database migration completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await connection.end();
  }
}

migrate();
