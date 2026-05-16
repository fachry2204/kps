const mysql = require('mysql2/promise');

async function check() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'kpsdata'
  });

  try {
    const [rows] = await connection.query('SELECT * FROM logistics WHERE item_name LIKE "Munisi 7.62mm%"');
    console.log(rows);
  } finally {
    await connection.end();
  }
}

check();
