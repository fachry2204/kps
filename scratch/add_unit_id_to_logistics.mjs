import mysql from 'mysql2/promise';

async function migrate() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'kpsdata'
    });

    try {
        console.log('Adding unit_id to logistics table...');
        await connection.query('ALTER TABLE logistics ADD COLUMN unit_id INT(11) NULL AFTER id');
        await connection.query('ALTER TABLE logistics ADD FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE SET NULL');
        console.log('Migration successful.');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await connection.end();
    }
}

migrate();
