import mysql from 'mysql2/promise';

async function check() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'kpsdata'
  });
  const [rows] = await connection.execute('DESCRIBE units');
  console.log(rows);
  connection.end();
}
check();
