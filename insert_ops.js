const mysql = require('mysql2/promise');

async function insertOps() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'kpsdata'
  });

  try {
    console.log('Inserting new operations...');
    const ops = [
      'SATGAS PAMTAS RI-PNG MOBILE KOOPS TNI',
      'SATGAS OPS INTELSTAT BKO BAIS TNI',
      'SATGAS ELANG V BIN',
      'SATGAS PRAYUDA MAMTA',
      'SATGAS RAJAWALI IV',
      'SATGAS RAJAWALI V',
      'SATGAS PKH',
      'SATGAS SADANG OPS INTELSTA BAIS',
      'SATGAS TIMSUS BKO BIN',
      'SATGAS MANDALA VI',
      'SATGAS BKO ALKI I'
    ];

    // Clear existing data to avoid duplicates/demo data confusion
    await connection.execute('DELETE FROM ops_dalamnegri');

    for (const name of ops) {
      await connection.execute(
        'INSERT INTO ops_dalamnegri (name, location, personnel, status, readiness, type) VALUES (?, ?, ?, ?, ?, ?)',
        [name, 'Area Penugasan Taktis', Math.floor(Math.random() * 300) + 50, 'ACTIVE', 100, 'Special Operations']
      );
    }

    console.log('Insert completed successfully.');
  } catch (error) {
    console.error('Insert failed:', error);
  } finally {
    await connection.end();
  }
}

insertOps();
