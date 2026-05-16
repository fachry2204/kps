const mysql = require('mysql2/promise');

async function listItems() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'kpsdata'
  });

  const [rows] = await connection.query('SELECT id, item_name, category FROM logistics');
  console.log(JSON.stringify(rows, null, 2));

  await connection.end();
}

listItems().catch(console.error);
