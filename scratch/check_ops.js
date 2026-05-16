const mysql = require('mysql2/promise');

async function checkOps() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'kpsdata',
  });

  try {
    const [rows] = await pool.query('SELECT * FROM ops_luarnegri');
    console.log(JSON.stringify(rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

checkOps();
